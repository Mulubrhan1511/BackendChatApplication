import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../config/cloudinary.js";


export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUser = req.user._id;
        const filteredUsers = await User.find({ _id: { $ne: loggedInUser } }).select('-password');
        res.json(filteredUsers);

    } catch (error) {
        console.log("Error in getUsersForSidebar: ", error);
        res.status(500).send('Server error');
    }
}

export const getMessages = async (req, res) => {
    try {
        const { id:userToChatId } = req.params;
        const loggedInUserId = req.user._id;
        const messages = await Message.find({
            $or:[
                {senderId:loggedInUserId, receiverId:userToChatId},
                {senderId: userToChatId, receiverId:loggedInUserId}
            ]
        }).sort({ createdAt: 1 });
        res.json(messages);

    } catch (error) {
        console.log("Error in getMessages: ", error);
        res.status(500).send('Server error');
    }
}

export const sendMessages = async (req, res) => {
    try {
        const {text, image} = req.body;
        const {id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;

        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadedResponse.secure_url;
        }

    const newMessage = new Message({
        senderId,
        receiverId,
        text,
        image:imageUrl
    })

    await newMessage.save();

    //todo: realtime functionalty goes here => socket.io

    res.status(201).json(newMessage)
    } catch (error){
        console.log("Error in sendMessage Controller:", error.message)
        res.status(500).send('Server error');
    }
}