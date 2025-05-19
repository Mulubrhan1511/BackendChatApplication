import jwt from "jsonwebtoken";

export const generateToken = (userId, res) => {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE,
    });
    res.cookie("token", token, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite:"strict",
        secure: false,
    });
    return token;
};