console.log("ENV CHECK:", process.env.MONGODB_URI);
import express from "express";
import dotenv from "dotenv";
import connectDB from "./db/index.js";


dotenv.config({ path: "./.env" });


const app = express();

connectDB().then(() => {
  app.listen(process.env.PORT || 8000, () => {
    console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
  });
})
.catch((error) => {
  console.error("❌ Failed to start server:", error);
});

