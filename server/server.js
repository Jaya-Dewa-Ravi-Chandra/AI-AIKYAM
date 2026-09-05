import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import queryRoutes from "./routes/queryRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

app.use(cors({
  origin: CLIENT_URL,
  methods: ["GET", "POST"],
  credentials: false
}));
app.use(express.json({ limit: "20kb" }));

const queryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests. Please try again later." }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "AI AIKYAM API" });
});

app.use("/api/queries", queryLimiter, queryRoutes);

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Create server/.env from .env.example.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`AI AIKYAM API running on http://localhost:${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
