import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";

const DBConnection = async () => {
    const MONGO_URI = process.env.MONGO_URI;

    try {
        await mongoose.connect(MONGO_URI, { useNewUrlParser: true });
        console.log("Connected to MongoDB");
    } catch (error) {
        console.log("Error while connecting to the databse, ", error.message);
    }
}

export default DBConnection;
