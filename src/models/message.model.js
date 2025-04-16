import { text } from "express";
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    text: {
        type: String,
    },
    image:{
        type: String,
    },
    is_read: {
        type: Boolean,
        default: false,
    },
    is_delivered: {
        type: Boolean,
        default: false,
    },
    is_deleted: {
        type: Boolean,
        default: false,
    },
    is_edited: {
        type: Boolean,
        default: false,
    },
    is_reaction: {
        type: Boolean,
        default: false,
    },
},
{ timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);
export default Message;

