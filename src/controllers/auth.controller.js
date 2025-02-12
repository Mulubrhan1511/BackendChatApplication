import { generateToken } from "../config/utils.js";
import User from "../models/user.model.js";
import bcrypt from 'bcryptjs';
import cloudinary from '../config/cloudinary.js';

export const signup = async (req, res) => {
    const { email, fullName, password } = req.body;
    try {
        if (!email || !fullName || !password) {
            return res.status(400).send('Please enter all fields');
        }

        if (password.length < 6) {
            return res.status(400).send('Password must be at least 6 characters');
        }

        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).send('User already exists');
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({
            email,
            fullName,
            password: hashedPassword,
        });

        if (newUser) {
            generateToken(newUser._id, res);
            await newUser.save();
            res.json({
                _id: newUser._id,
                email: newUser.email,
                fullName: newUser.fullName,
                profilePic: newUser.profilePic,
            });
        } else {
            res.status(400).send('Invalid user data');
        }

    } catch (error) {
        console.log("Error in signup: ", error);
        res.status(500).send('Server error');
    }
}

export const login = async (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send('Please enter all fields');
    }

    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Use await

        if (!user) {
            return res.status(400).send('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password); // Use await

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        generateToken(user._id, res);
        res.json({
            _id: user._id,
            email: user.email,
            fullName: user.fullName,
            profilePic: user.profilePic,
        });
    } catch (error) {
        console.log("Error in login: ", error);
        res.status(500).send('Server error');
    }
};


export const logout = (req, res) => {
    try {
        res.cookie("token", "", {maxAge:0})
        res.json({ message: 'Logged out' });
    } catch (error) {
        console.log("Error in logout: ", error);
        res.status(500).send('Server error');
    }
}


export const updateProfile = async (req, res) => {
    try {
        if (!req.body.profilePic) {
            return res.status(400).send('Please enter all fields');
        }

        const { profilePic } = req.body;
        const userId = req.user._id;

        const uploadedResponse = await cloudinary.uploader.upload(profilePic);
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadedResponse.secure_url }, { new: true });

        res.status(200).json({
            updatedUser,
        })
    } catch (error) {
        console.log("Error in updateProfile: ", error);
        res.status(500).send('Server error');
    }
};


export const checkAuth = async (req, res) => {
    try {
        
        const user = req.user;
        res.status(200).json({
            user,
        });
    } catch (error) {
        console.log("Error in checkAuth: ", error);
        res.status(500).send('Server error');
    }
};
