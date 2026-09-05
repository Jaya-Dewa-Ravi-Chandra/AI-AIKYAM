import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const body = req.body || {};

    const email = body.email;
    const query = body.query;

    const validEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !validEmail.test(email)) {
      return res.status(400).json({
        message: "Please provide a valid email.",
      });
    }

    if (
      !query ||
      typeof query !== "string" ||
      query.trim().length < 5
    ) {
      return res.status(400).json({
        message: "Please provide a longer query.",
      });
    }

    await req.app.locals.db.query(
      `
      INSERT INTO queries (email, query)
      VALUES ($1, $2)
      `,
      [
        email.trim().toLowerCase(),
        query.trim(),
      ]
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