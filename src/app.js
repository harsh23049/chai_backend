import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

/* -------------------- MIDDLEWARES -------------------- */

// CORS config (frontend ko allow karne ke liye)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// ye hamere request body ko parse karne ke liye hai, jise hum json format me bhejte hai, aur urlencoded format me bhi bhej sakte hai
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());



//ye hamere routes ko import karne ke liye hai, jise humne src/routes/user.routes.js me banaya hai
import userRouter from "./routes/user.routes.js";

//routes declaration ke liye base route
app.use("/api/v1/users", userRouter);



export { app };
