import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import callRoutes from './routes/call.route.js';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './config/socket.js';

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "https://react-chat-application-p17j.vercel.app"],
    credentials: true
}));


const PORT = process.env.PORT || 5001;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/calls", callRoutes);

server.listen(PORT, () => {
    console.log('Server is running on port' + PORT);
    connectDB();
    });