import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pg from "pg";

import registrationRoutes from "./routes/registrationRoutes.js";
import queryRoutes from "./routes/queryRoutes.js";

dotenv.config();

const { Pool } = pg;

const app = express();
const PORT = process.env.PORT || 5000;

/* =========================
   DATABASE
========================= */

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

app.locals.db = pool;

/* =========================
   MIDDLEWARE
========================= */

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ai-aikyam-u7zk.onrender.com",
    ],

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(express.json());

/* =========================
   DATABASE INITIALIZATION
========================= */

async function initializeDatabase() {
  try {
    /* =========================
       REGISTRATIONS TABLE
    ========================= */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,

        registration_id VARCHAR(50)
          UNIQUE NOT NULL,

        name VARCHAR(150)
          NOT NULL,

        email VARCHAR(255)
          NOT NULL,

        phone VARCHAR(20)
          NOT NULL,

        institution VARCHAR(255)
          NOT NULL,

        city VARCHAR(100)
          NOT NULL,

        department VARCHAR(150)
          NOT NULL,

        year_of_study VARCHAR(50)
          NOT NULL,

        events TEXT[]
          NOT NULL,

        amount INTEGER
          NOT NULL,

        transaction_id VARCHAR(100)
          UNIQUE,

        payment_status VARCHAR(30)
          DEFAULT 'pending',

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* =========================
       ADD TRANSACTION ID
       TO EXISTING TABLES
    ========================= */

    await pool.query(`
      ALTER TABLE registrations
      ADD COLUMN IF NOT EXISTS transaction_id
      VARCHAR(100);
    `);

    /* =========================
       UNIQUE TRANSACTION ID
    ========================= */

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS
      registrations_transaction_id_unique
      ON registrations(transaction_id)
      WHERE transaction_id IS NOT NULL;
    `);

    /* =========================
       QUERIES TABLE
    ========================= */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS queries (
        id SERIAL PRIMARY KEY,

        email VARCHAR(255)
          NOT NULL,

        query TEXT
          NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log(
      "PostgreSQL tables initialized successfully."
    );

    console.log(
      "Transaction ID support enabled."
    );
  } catch (error) {
    console.error(
      "Database initialization failed:",
      error.message
    );

    process.exit(1);
  }
}

/* =========================
   ROUTES
========================= */

app.get("/", (req, res) => {
  res.json({
    message: "AI AIKYAM API is running",
    status: "online",
  });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT NOW()");

    res.json({
      status: "healthy",
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
    });
  }
});

app.use(
  "/api/registrations",
  registrationRoutes(pool)
);

app.use(
  "/api/queries",
  queryRoutes
);

/* =========================
   ERROR HANDLER
========================= */

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    message: "Internal server error",
  });
});

/* =========================
   START SERVER
========================= */

async function startServer() {
  await initializeDatabase();

  app.listen(PORT, () => {
    console.log(
      `AI AIKYAM server running on port ${PORT}`
    );
  });
}

startServer();