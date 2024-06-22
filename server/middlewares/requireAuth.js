import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware to check if the user is authenticated
export const authenticate = (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
        return res.status(401).send({ error: "Please authenticate." });
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).send({ error: "Invalid token, please authenticate again." });
    }
};

// Middleware to check if the user is an admin
export const authorizeAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).send({ error: "Access denied." });
        }
        next();
    } catch (err) {
        res.status(500).send({ error: "Internal server error." });
    }
};
