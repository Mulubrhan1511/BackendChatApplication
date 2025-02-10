import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import dotenv from 'dotenv';
import {connectDB} from './config/db.js';
import cookieParser from 'cookie-parser';


dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 5001;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/messages", messageRoutes);

app.listen(PORT, () => {
    console.log('Server is running on port' + PORT);
    connectDB();
    });