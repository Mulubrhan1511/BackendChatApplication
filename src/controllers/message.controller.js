import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../config/cloudinary.js";
import { getReceiverSocketId, io } from "../config/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

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



