import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    // Safely handle missing request body
    const body = req.body ?? {};

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const query =
      typeof body.query === "string"
        ? body.query.trim()
        : "";

    // Validate email
    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !validEmail.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email.",
      });
    }

    // Validate query
    if (query.length < 5) {
      return res.status(400).json({
        success: false,
        message: "Please provide a longer query.",
      });
    }

    // Save to PostgreSQL
    await req.app.locals.db.query(
      `
      INSERT INTO queries (email, query)
      VALUES ($1, $2)
      `,
      [email, query]
    );

    return res.status(201).json({
      success: true,
      message: "Query received.",
    });
  } catch (error) {
    console.error("Query error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error.",
    });
  }
});

export default router;