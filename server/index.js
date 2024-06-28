import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import DBConnection from "./database/db.js";
import cookieParser from "cookie-parser";
import auth from "./routes/auth.js";
import problemRoute from "./routes/problemRoute.js";
import contestRoute from "./routes/contestRoute.js";
import userRoute from "./routes/userRoute.js";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(auth);
app.use(problemRoute);
app.use(contestRoute);
app.use(userRoute);

DBConnection();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
