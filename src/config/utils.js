import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
        httpOnly: true,                 // Prevent access via JavaScript
        sameSite: "none",               // Required for cross-site cookies
        secure: true,                   // Only over HTTPS
    });
    return token;
};