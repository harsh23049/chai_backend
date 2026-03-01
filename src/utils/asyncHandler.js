import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

/* ===================== MIDDLEWARES ===================== */

// CORS config (frontend access allow karne ke liye)
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);

// Body parsers
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));



/* ===================== ROUTES ===================== */

import userRouter from "./routes/user.routes.js";

// Base route for user APIs
app.use("/api/v1/user", userRouter);


app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found",
    });
});


export { app };
