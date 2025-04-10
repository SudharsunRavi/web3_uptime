import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const signup = async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) throw new Error("Email already exists");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            email,
            password: hashedPassword,
        });

        await newUser.save();
        res.status(201).json({ status: true, message: "Sign up successfully, Login to continue!" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password: inputPassword } = req.body;

        const existingUser = await User.findOne({ email });
        if (!existingUser) throw new Error("Invalid credentials");

        const verifyPassword = await bcrypt.compare(inputPassword, existingUser.password);
        if (!verifyPassword) throw new Error("Invalid credentials");

        const { password, ...userInfo } = existingUser.toObject();
        const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.cookie("token", token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000, // 1d
        });
        res.status(200).json({ status: true, data: userInfo });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        res.clearCookie("token");
        res.status(200).json({ status: true, message: "Logout successful" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};