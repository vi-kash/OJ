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
import executeRoute from "./routes/executeRoute.js";
import passport from "passport";
import session from "express-session";
import "./config/passportConfig.js";

const app = express();
const PORT = process.env.PORT || 8000;

const corsOptions = {
    origin: "https://www.online-judge.site",
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(cookieParser());
app.use(auth);
app.use(problemRoute);
app.use(contestRoute);
app.use(userRoute);
app.use(executeRoute);

DBConnection();

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
