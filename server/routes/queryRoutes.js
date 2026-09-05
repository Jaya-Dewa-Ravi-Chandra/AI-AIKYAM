import express from "express";
import Query from "../models/Query.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { email, query } = req.body || {};
    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !validEmail.test(email)) {
      return res.status(400).json({ message: "Please provide a valid email." });
    }
    if (!query || query.trim().length < 5) {
      return res.status(400).json({ message: "Please provide a longer query." });
    }

    await Query.create({ email, query });
    return res.status(201).json({ message: "Query received." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
});

export default router;
