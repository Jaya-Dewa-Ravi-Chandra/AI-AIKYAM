import express from "express";
import crypto from "crypto";

const router = express.Router();

const ALLOWED_EVENTS = [
  "AI PRADARSHA",
  "AI SANKALP",
  "AI MAHAYUDH",
];

function calculateFee(events) {
  switch (events.length) {
    case 1:
      return 250;

    case 2:
      return 500;

    case 3:
      return 650;

    default:
      return 0;
  }
}

function generateRegistrationId() {
  return `AAIK-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

export default function registrationRoutes(pool) {
  router.post("/", async (req, res) => {
    try {
      const {
        name,
        email,
        phone,
        institution,
        city,
        department,
        year,
        events,
        transactionId,
      } = req.body;

      // Required fields
      if (
        !name ||
        !email ||
        !phone ||
        !institution ||
        !city ||
        !department ||
        !year
      ) {
        return res.status(400).json({
          message:
            "Please fill in all required fields.",
        });
      }

      // Event validation
      if (
        !Array.isArray(events) ||
        events.length === 0
      ) {
        return res.status(400).json({
          message:
            "Please select at least one event.",
        });
      }

      const invalidEvents = events.filter(
        (event) =>
          !ALLOWED_EVENTS.includes(event)
      );

      if (invalidEvents.length > 0) {
        return res.status(400).json({
          message:
            "One or more selected events are invalid.",
        });
      }

      // Remove duplicate events
      const uniqueEvents = [
        ...new Set(events),
      ];

      if (uniqueEvents.length > 3) {
        return res.status(400).json({
          message:
            "A maximum of 3 events can be selected.",
        });
      }

      // Calculate amount on server
      const amount =
        calculateFee(uniqueEvents);

      if (amount === 0) {
        return res.status(400).json({
          message:
            "Invalid event selection.",
        });
      }

      // Email validation
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address.",
        });
      }

      // Phone validation
      const cleanedPhone = String(phone).replace(
        /\D/g,
        ""
      );

      if (cleanedPhone.length !== 10) {
        return res.status(400).json({
          message:
            "Please enter a valid 10-digit phone number.",
        });
      }

      // Transaction ID validation
      if (
        !transactionId ||
        transactionId.trim().length < 5
      ) {
        return res.status(400).json({
          message:
            "Please enter a valid UPI transaction ID / UTR.",
        });
      }

const cleanedTransactionId =
  transactionId.trim();

/* =========================
   CHECK DUPLICATE TRANSACTION ID
========================= */

const existingTransaction = await pool.query(
  `
  SELECT registration_id
  FROM registrations
  WHERE transaction_id = $1
  `,
  [cleanedTransactionId]
);

if (existingTransaction.rows.length > 0) {
  return res.status(409).json({
    message:
      "This transaction ID has already been submitted.",
  });
}

/* =========================
   GENERATE REGISTRATION ID
========================= */

let registrationId;
let inserted = false;

      while (!inserted) {
        registrationId =
          generateRegistrationId();

        const existing =
          await pool.query(
            `
            SELECT id
            FROM registrations
            WHERE registration_id = $1
            `,
            [registrationId]
          );

        if (existing.rows.length === 0) {
          inserted = true;
        }
      }

      // Insert registration
      const result = await pool.query(
        `
        INSERT INTO registrations (
          registration_id,
          name,
          email,
          phone,
          institution,
          city,
          department,
          year_of_study,
          events,
          amount,
          transaction_id,
          payment_status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12
        )
        RETURNING
          registration_id,
          amount,
          transaction_id,
          payment_status,
          created_at
        `,
        [
          registrationId,
          name.trim(),
          email.trim().toLowerCase(),
          cleanedPhone,
          institution.trim(),
          city.trim(),
          department.trim(),
          year,
          uniqueEvents,
          amount,
          cleanedTransactionId,
          "pending",
        ]
      );

      return res.status(201).json({
        success: true,

        message:
          "Registration submitted successfully.",

        registrationId:
          result.rows[0]
            .registration_id,

        amount:
          result.rows[0].amount,

        transactionId:
          result.rows[0]
            .transaction_id,

        paymentStatus:
          result.rows[0]
            .payment_status,

        createdAt:
          result.rows[0]
            .created_at,
      });
    } catch (error) {
      console.error(
        "Registration error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          "Unable to process registration. Please try again.",
      });
    }
  });

  return router;
}