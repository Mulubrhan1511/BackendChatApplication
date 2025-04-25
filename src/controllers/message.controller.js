import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const Users = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    const filteredUsers = await Promise.all(
      Users.map(async (user) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: loggedInUserId, receiverId: user._id },
            { senderId: user._id, receiverId: loggedInUserId },
          ],
        }).sort({ createdAt: -1 });

        const unReadCount = await Message.countDocuments({
          receiverId: loggedInUserId,
          senderId: user._id,
          is_read: false,
        });

        
        return {
          ...user.toObject(),
          lastMessage: lastMessage ? lastMessage.text : null,
          lastMessageTime: lastMessage ? lastMessage.createdAt : null,
          unReadCount: unReadCount,
        };
      })


    );

    // Sort users by last message time in descending order
    filteredUsers.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      }
      if (!a.lastMessageTime && b.lastMessageTime) {
        return 1; // a goes after b
      }
      if (a.lastMessageTime && !b.lastMessageTime) {
        return -1; // a goes before b
      }
      return 0; // both are null
    });
    

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // Upload base64 image to cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const typingUsers = {}; // Stores users typing for each receiver


export const typing = async (req, res) => {
  try {
    const senderIdStr = req.user._id.toString(); // ✅ Convert to string
    const receiverId = req.params.id;

    if (!typingUsers[receiverId]) {
      typingUsers[receiverId] = new Set();
    }

    // ✅ Check using string comparison
    if (!typingUsers[receiverId].has(senderIdStr)) {
      typingUsers[receiverId].add(senderIdStr);
      console.log("Typing users:", typingUsers);
    }

    

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("user-typing", Array.from(typingUsers[receiverId]));
    }

    res.status(200).json({ typingUsers: Array.from(typingUsers[receiverId]) });

  } catch (error) {
    console.error("Error in typing controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};





// Stop Typing Controller
export const stopTyping = async (req, res) => {
  try {
    const senderIdStr = req.user._id.toString(); // Convert to string
    const receiverId = req.params.id;

    if (typingUsers[receiverId]) {
      typingUsers[receiverId].delete(senderIdStr);
      console.log("Updated Typing users:", typingUsers);
      
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        console.log("Emitting user-stopped-typing event", typingUsers);
        io.to(receiverSocketId).emit("user-stopped-typing", Array.from(typingUsers[receiverId]));
      }
      


    }

    res.status(200).json({ typingUsers: Array.from(typingUsers[receiverId] || []) });
  } catch (error) {
    console.error("Error in stop typing controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


// Read the selected User Messages
export const readMessages = async (req, res) => {
  try {
    console.log(req.params)
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    await Message.updateMany(
      { senderId: userToChatId, receiverId: myId, is_read: false },
      { $set: { is_read: true } }
    );

    const receiverSocketId = getReceiverSocketId(userToChatId);
    if (receiverSocketId) {
      console.log("Emitting messages-seen event", receiverSocketId);
      io.to(receiverSocketId).emit("messages-seen", { userId: myId  });
    }

    res.status(200).json({ message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in readMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};



