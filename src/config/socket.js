import { Server } from "socket.io";
import http from "http";
import express from "express";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "https://react-chat-application-p17j.vercel.app"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("call-user", ({ to, from, signal }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      console.log(`📞 Calling user ${to} from ${from}`);
      io.to(receiverSocketId).emit("incoming-call", { from, signal });
    } else {
      console.warn(`⚠️ User ${to} is offline or not found.`);
    }
  });

  socket.on("answer-call", ({ to, signal }) => {
    const callerSocketId = getReceiverSocketId(to);
    if (callerSocketId) {
      console.log(`✅ Call answered by ${userId} for ${to}`);
      io.to(callerSocketId).emit("call-answered", { signal });
    } else {
      console.warn(`⚠️ Caller ${to} not found.`);
    }
  });

  socket.on("ice-candidate", ({candidate, to  }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      console.log(`❄️ Sending ICE candidate from ${userId} to ${to}`);
      io.to(receiverSocketId).emit("ice-candidate", { candidate, from: userId });
    } else {
      console.warn(`⚠️ ICE candidate receiver ${to} not found.`);
    }
  });

  socket.on("end-call", ({ to }) => {
    const receiverSocketId = getReceiverSocketId(to);
    if (receiverSocketId) {
      console.log(`🚫 Call ended by ${userId} for ${to}`);
      io.to(receiverSocketId).emit("call-ended");
    } else {
      console.warn(`⚠️ Cannot end call, user ${to} not found.`);
    }
  });



  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };