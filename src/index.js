import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { app, server } from './config/socket.js';

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", "http://172.20.30.10:5173"],
    credentials: true
}));


const PORT = process.env.PORT || 5001;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);

server.listen(PORT, () => {
    console.log('Server is running on port' + PORT);
    connectDB();
    });