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

        transaction_id VARCHAR(100),

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

    /* =========================
       TEAMS TABLE
    =========================
       
       Stores the team itself.

       A team must have:
       - unique team_id
       - team name
       - creation timestamp

       The actual members are stored
       separately in team_members.
    */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,

        team_id VARCHAR(50)
          UNIQUE NOT NULL,

        team_name VARCHAR(150)
          NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP
      );
    `);

    /* =========================
       TEAM MEMBERS TABLE
    =========================

       Every member is connected to an
       existing registration.

       UNIQUE(team_id, registration_id)
       prevents the same person from
       being added twice to one team.

       UNIQUE(registration_id)
       prevents one registration from
       belonging to multiple teams.
    */

    await pool.query(`
      CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY,

        team_id INTEGER
          NOT NULL,

        registration_id VARCHAR(50)
          NOT NULL,

        created_at TIMESTAMP
          DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_team
          FOREIGN KEY (team_id)
          REFERENCES teams(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_registration
          FOREIGN KEY (registration_id)
          REFERENCES registrations(registration_id)
          ON DELETE CASCADE,

        CONSTRAINT unique_team_member
          UNIQUE (team_id, registration_id),

        CONSTRAINT unique_registration_team
          UNIQUE (registration_id)
      );
    `);

    /* =========================
       TEAM MEMBER COUNT INDEX
    ========================= */

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_team_members_team_id
      ON team_members(team_id);
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS
      idx_team_members_registration_id
      ON team_members(registration_id);
    `);

    console.log(
      "PostgreSQL tables initialized successfully."
    );

    console.log(
      "Transaction ID support enabled."
    );

    console.log(
      "Team registration support enabled."
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

/* =========================
   HEALTH CHECK
========================= */

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

/* =========================
   REGISTRATION ROUTES
========================= */

app.use(
  "/api/registrations",
  registrationRoutes(pool)
);

/* =========================
   QUERY ROUTES
========================= */

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