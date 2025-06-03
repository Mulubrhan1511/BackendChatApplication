import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import { getReceiverSocketId, io } from "../config/socket.js";


export const handleIceCandidate = async (req, res) => {
  try {
    const candidate = req.body.offer;
    const from = req.user._id.toString();
    const to = req.params.id;

    console.log("req.body", req.body);
    console.log("candidate:", candidate);
    
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
        console.log("Sending ICE candidate to receiver:", receiverSocketId);
      io.to(receiverSocketId).emit("incoming-call", { from, candidate });
    }

    res.status(200).json({ message: "ICE candidate sent successfully" });
  } catch (error) {
    console.error("Error in handleIceCandidate:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const handleAnswerCall = async (req, res) => {
  try {
    const { answer } = req.body;
    const from = req.user._id.toString();
    const to = req.params.id;

    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      console.log("Sending answer to receiver:", receiverSocketId);
      io.to(receiverSocketId).emit("call-answered", { from, answer });
    }

    res.status(200).json({ message: "Call answered successfully" });
  } catch (error) {
    console.error("Error in handleAnswerCall:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
}

export const handleEndCall = async (req, res) => {
  try {
    const from = req.user._id.toString();
    const to = req.params.id;

    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call-ended", { from });
    }

    res.status(200).json({ message: "Call ended event sent" });
  } catch (error) {
    console.error("Error in handleEndCall:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


