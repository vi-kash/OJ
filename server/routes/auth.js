import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import passport from "passport";
import crypto from 'crypto';
import sendEmail from "../utils/sendEmail.js";
import { authenticate } from "../middlewares/requireAuth.js";

const router = express.Router();

const otpStore = new Map();

router.post('/send-otp', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ success: false, message: "Email already in use." });
    }

    const otp = crypto.randomBytes(3).toString('hex');

    try {
        otpStore.set(email, otp);
        setTimeout(() => otpStore.delete(email), 5 * 60 * 1000);

        // Send OTP via email
        const message = `Your OTP for email validation is ${otp}`;
        await sendEmail({ to: email, subject: 'Email Validation OTP', text: message });

        res.status(200).json({ message: 'OTP sent to email' });
    } catch (error) {
        console.log("Error sending OTP: ", error);
        res.status(500).json({ message: "Error sending OTP" });
    }
});

router.post('/validate-otp', async (req, res) => {
    const { email, otp } = req.body;

    try {
        const storedOtp = otpStore.get(email);
        if (!storedOtp) {
            return res.status(400).json({ message: 'Expired OTP' });
        }
        if (storedOtp !== otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        res.status(200).json({ message: 'OTP verified', email });
    } catch (error) {
        console.log("Error verifying OTP: ", error);
        res.status(500).json({ message: "Error verifying OTP" });
    }
});

router.post("/register", async (req, res) => {
    try {
        const { name, username, email, password } = req.body;

        if (!(name && username && email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).send("User already exists!");
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
            return res.status(409).send("Username already taken, please try another!");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        const token = jwt.sign({ id: user._id, email, username }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        user.token = token;
        user.password = undefined;
        res.status(201).json({ message: "You have successfully registered!", user });
    } catch (error) {
        console.log("Error occurred during registration ", error.message);
        res.status(500).send("An error occurred while registering. Please try again.");
    }
});

router.post("/login", async (req, res) => {
    try {
        //get all the user data
        const { email, password } = req.body;

        // check that all the data should exists
        if (!(email && password)) {
            return res.status(400).send("Please enter all the information");
        }

        //find the user in the database
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).send("User not found!");
        }

        //match the password
        const enteredPassword = await bcrypt.compare(password, user.password);
        if (!enteredPassword) {
            return res.status(401).send("Password is incorrect");
        }

        const token = jwt.sign({ id: user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });
        user.token = token;
        user.password = undefined;

        //store cookies
        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        //send the token
        res.status(200).cookie("token", token, options).json({
            message: "You have successfully logged in!",
            success: true,
            token,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("An error occurred while logging in");
    }
});

router.post("/changePassword", authenticate, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.id;

        if (!(currentPassword && newPassword)) {
            return res.status(400).json({ message: "Please enter all the information" });
        }

        const user = await User.findById(userId);
        const enteredPassword = await bcrypt.compare(currentPassword, user.password);
        if (!enteredPassword) {
            return res.status(400).json({ message: "Password is incorrect" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await User.findByIdAndUpdate(
            userId,
            { $set: { password: hashedPassword } },
            { new: true }
        );

        res.status(200).json({success: true, message: "Password changed successfully."});
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: "An error occured while changing password." });
    }
});

router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).redirect(`https://www.online-judge.site/auth/callback/${token}`);
    }
);

router.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
        const token = jwt.sign({ id: req.user._id }, process.env.SECRET_KEY, {
            expiresIn: "1d",
        });

        const options = {
            expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).redirect(`https://www.online-judge.site/auth/callback/${token}`);
    }
);

router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const user = await User.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    const otp = crypto.randomBytes(3).toString('hex');
    user.resetPasswordToken = otp;
    user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    // Send OTP via email
    const message = `Your OTP for password reset is ${otp}`;
    await sendEmail({ to: email, subject: 'Password Reset OTP', text: message });

    res.status(200).json({ message: 'OTP sent to email' });
});

router.post('/verify-otp', async (req, res) => {
    const { email, otp } = req.body;
    const user = await User.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    res.status(200).json({ message: 'OTP verified', email });
});

router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({
        email,
        resetPasswordToken: otp,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

router.post("/logout", (req, res) => {
    res.clearCookie("token", { httpOnly: true, secure: process.env.NODE_ENV === "production" });
    res.status(200).json({ message: "You have successfully logged out!" });
});

export default router;