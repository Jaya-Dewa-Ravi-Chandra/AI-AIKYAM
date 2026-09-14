import express from "express";
import crypto from "crypto";

const router = express.Router();

/* =========================================================
   ALLOWED EVENTS
========================================================= */

const ALLOWED_EVENTS = [
  "AI PRADARSHA",
  "AI SANKALP",
  "AI MAHAYUDH",
];

/* =========================================================
   FEE CALCULATION
========================================================= */

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

/* =========================================================
   REGISTRATION ID
========================================================= */

function generateRegistrationId() {
  return `AAIK-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

/* =========================================================
   TEAM ID
========================================================= */

function generateTeamId() {
  return `TEAM-${crypto
    .randomBytes(4)
    .toString("hex")
    .toUpperCase()}`;
}

/* =========================================================
   ROUTES
========================================================= */

export default function registrationRoutes(pool) {

  /* =========================================================
     INDIVIDUAL REGISTRATION

     POST /api/registrations
  ========================================================= */

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

      /* =========================
         REQUIRED FIELDS
      ========================= */

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
          success: false,
          message: "Please fill in all required fields.",
        });
      }

      /* =========================
         EVENT VALIDATION
      ========================= */

      if (
        !Array.isArray(events) ||
        events.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select at least one event.",
        });
      }

      const invalidEvents = events.filter(
        (event) => !ALLOWED_EVENTS.includes(event)
      );

      if (invalidEvents.length > 0) {
        return res.status(400).json({
          success: false,
          message: "One or more selected events are invalid.",
        });
      }

      /* =========================
         REMOVE DUPLICATE EVENTS
      ========================= */

      const uniqueEvents = [...new Set(events)];

      if (uniqueEvents.length > 3) {
        return res.status(400).json({
          success: false,
          message: "A maximum of 3 events can be selected.",
        });
      }

      /* =========================
         CALCULATE AMOUNT
      ========================= */

      const amount = calculateFee(uniqueEvents);

      if (amount === 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid event selection.",
        });
      }

      /* =========================
         EMAIL VALIDATION
      ========================= */

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      /* =========================
         PHONE VALIDATION
      ========================= */

      const cleanedPhone = String(phone).replace(
        /\D/g,
        ""
      );

      if (cleanedPhone.length !== 10) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid 10-digit phone number.",
        });
      }

      /* =========================
         TRANSACTION ID
      ========================= */

      if (
        !transactionId ||
        transactionId.trim().length < 5
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Please enter a valid UPI transaction ID / UTR.",
        });
      }

      const cleanedTransactionId =
        transactionId.trim();

      /* =========================
         DUPLICATE TRANSACTION
      ========================= */

      const existingTransaction =
        await pool.query(
          `
          SELECT registration_id
          FROM registrations
          WHERE transaction_id = $1
          `,
          [cleanedTransactionId]
        );

      if (existingTransaction.rows.length > 0) {
        return res.status(409).json({
          success: false,
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

      /* =========================
         INSERT REGISTRATION
      ========================= */

      const result =
        await pool.query(
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

      /* =========================
         RESPONSE
      ========================= */

      return res.status(201).json({
        success: true,

        message:
          "Registration submitted successfully.",

        registrationId:
          result.rows[0].registration_id,

        amount:
          result.rows[0].amount,

        transactionId:
          result.rows[0].transaction_id,

        paymentStatus:
          result.rows[0].payment_status,

        createdAt:
          result.rows[0].created_at,
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


  /* =========================================================
     REGISTRATION ID LOOKUP

     POST /api/registrations/lookup

     Attendees can recover their Registration ID using the
     email address and phone number used during registration.
  ========================================================= */

  router.post("/lookup", async (req, res) => {
    try {
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.trim().toLowerCase()
          : "";

      const phone =
        typeof req.body?.phone === "string" ||
        typeof req.body?.phone === "number"
          ? String(req.body.phone).replace(/\D/g, "")
          : "";

      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address.",
        });
      }

      if (phone.length !== 10) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid 10-digit phone number.",
        });
      }

      const result = await pool.query(
        `
        SELECT
          registration_id,
          name,
          events
        FROM registrations
        WHERE LOWER(email) = $1
          AND phone = $2
        LIMIT 1
        `,
        [email, phone]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "No registration was found with those details. Please check your email and phone number.",
        });
      }

      const registration = result.rows[0];

      return res.json({
        success: true,
        registration: {
          registrationId: registration.registration_id,
          name: registration.name,
          events: registration.events,
        },
      });
    } catch (error) {
      console.error("Registration ID lookup error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to find your registration. Please try again.",
      });
    }
  });


  /* =========================================================
     CREATE TEAM

     POST /api/registrations/teams

     BODY:

     {
       "teamName": "Team Alpha",
       "event": "AI PRADARSHA",
       "registrationIds": [
         "AAIK-12345678",
         "AAIK-87654321"
       ]
     }

     TEAM SIZE:
     Minimum = 2
     Maximum = 3

     IMPORTANT:
     A registration can belong to ONLY ONE team.
  ========================================================= */

  /* =========================================================
     VALIDATE TEAM MEMBERS FOR EVENT

     POST /api/registrations/teams/validate

     Checks that every supplied registration ID exists and
     is registered for the selected event.
  ========================================================= */

  router.post("/teams/validate", async (req, res) => {
    try {
      const { event, registrationIds } = req.body;

      if (
        !event ||
        typeof event !== "string" ||
        !ALLOWED_EVENTS.includes(event)
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid event.",
        });
      }

      if (!Array.isArray(registrationIds) || registrationIds.length < 2 || registrationIds.length > 3) {
        return res.status(400).json({
          success: false,
          message: "Please provide 2 or 3 registration IDs.",
        });
      }

      const cleanedIds = registrationIds.map((id) =>
        String(id).trim().toUpperCase()
      );
      const uniqueIds = [...new Set(cleanedIds)];

      if (uniqueIds.length !== cleanedIds.length) {
        return res.status(400).json({
          success: false,
          message: "A registration ID cannot be repeated in the same team.",
        });
      }

      const result = await pool.query(
        `
        SELECT registration_id, name, events
        FROM registrations
        WHERE registration_id = ANY($1::varchar[])
        `,
        [uniqueIds]
      );

      const foundIds = result.rows.map((row) =>
        row.registration_id.toUpperCase()
      );

      const missingIds = uniqueIds.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        return res.status(404).json({
          success: false,
          message: "One or more registration IDs were not found.",
          missingRegistrationIds: missingIds,
        });
      }

      const invalidMembers = result.rows.filter(
        (row) => !Array.isArray(row.events) || !row.events.includes(event)
      );

      if (invalidMembers.length > 0) {
        return res.status(409).json({
          success: false,
          message: "One or more participants are not registered for the selected event.",
          event,
          invalidRegistrationIds: invalidMembers.map(
            (row) => row.registration_id
          ),
        });
      }

      return res.json({
        success: true,
        event,
        registrationIds: uniqueIds,
        message: "All participants are registered for the selected event.",
      });
    } catch (error) {
      console.error("Team validation error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to validate team participants.",
      });
    }
  });

  router.post("/teams", async (req, res) => {

    const client = await pool.connect();

    try {

      const {
        teamName,
        event,
        registrationIds,
      } = req.body;

      /* =========================
         TEAM EVENT
      ========================= */

      if (
        !event ||
        typeof event !== "string" ||
        !ALLOWED_EVENTS.includes(event)
      ) {
        return res.status(400).json({
          success: false,
          message: "Please select a valid event for the team.",
        });
      }

      const cleanedEvent = event.trim();

      /* =========================
         TEAM NAME
      ========================= */

      if (
        !teamName ||
        typeof teamName !== "string" ||
        !teamName.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Please enter a team name.",
        });
      }

      const cleanedTeamName =
        teamName.trim();

      /* =========================
         REGISTRATION IDS
      ========================= */

      if (!Array.isArray(registrationIds)) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide the registration IDs.",
        });
      }

      /* =========================
         TEAM SIZE
      ========================= */

      if (registrationIds.length < 2) {
        return res.status(400).json({
          success: false,
          message:
            "A team must contain at least 2 members.",
        });
      }

      if (registrationIds.length > 3) {
        return res.status(400).json({
          success: false,
          message:
            "A team can contain a maximum of 3 members.",
        });
      }

      /* =========================
         CLEAN REGISTRATION IDS
      ========================= */

      const cleanedIds =
        registrationIds.map(
          (id) =>
            String(id)
              .trim()
              .toUpperCase()
        );

      /* =========================
         EMPTY IDS
      ========================= */

      if (
        cleanedIds.some(
          (id) => !id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Registration IDs cannot be empty.",
        });
      }

      /* =========================
         DUPLICATE IDS
      ========================= */

      const uniqueIds =
        [...new Set(cleanedIds)];

      if (
        uniqueIds.length !==
        cleanedIds.length
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A registration ID cannot be repeated in the same team.",
        });
      }

      /* =========================
         BEGIN TRANSACTION
      ========================= */

      await client.query("BEGIN");

      /* =========================
         CHECK REGISTRATIONS EXIST
      ========================= */

      const registrations =
        await client.query(
          `
          SELECT
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
            payment_status,
            created_at
          FROM registrations
          WHERE registration_id =
            ANY($1::varchar[])
          `,
          [uniqueIds]
        );

      if (
        registrations.rows.length !==
        uniqueIds.length
      ) {

        const foundIds =
          registrations.rows.map(
            (row) =>
              row.registration_id
                .toUpperCase()
          );

        const missingIds =
          uniqueIds.filter(
            (id) =>
              !foundIds.includes(id)
          );

        await client.query("ROLLBACK");

        return res.status(404).json({
          success: false,

          message:
            "One or more registration IDs were not found.",

          missingRegistrationIds:
            missingIds,
        });
      }

      /* =====================================================
         CHECK MEMBERS ARE REGISTERED FOR THIS EVENT
      ===================================================== */

      const notRegisteredForEvent =
        registrations.rows.filter(
          (row) => !Array.isArray(row.events) || !row.events.includes(cleanedEvent)
        );

      if (notRegisteredForEvent.length > 0) {
        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,
          message:
            "One or more participants are not registered for the selected event.",
          event: cleanedEvent,
          invalidRegistrationIds: notRegisteredForEvent.map(
            (row) => row.registration_id
          ),
        });
      }

      /* =====================================================
         CHECK WHETHER ANY MEMBER IS ALREADY IN A TEAM

         THIS IS THE IMPORTANT PART.

         team_members has:

         UNIQUE(registration_id)

         so one registration can belong to only one team.
      ===================================================== */

      const existingMembers =
        await client.query(
          `
          SELECT
            tm.registration_id,
            t.team_id,
            t.team_name
          FROM team_members tm
          INNER JOIN teams t
            ON t.id = tm.team_id
          WHERE tm.registration_id =
            ANY($1::varchar[])
          FOR UPDATE
          `,
          [uniqueIds]
        );

      if (
        existingMembers.rows.length > 0
      ) {

        await client.query("ROLLBACK");

        const conflicts =
          existingMembers.rows.map(
            (row) => ({
              registrationId:
                row.registration_id,

              teamId:
                row.team_id,

              teamName:
                row.team_name,
            })
          );

        return res.status(409).json({
          success: false,

          message:
            "One or more registrations are already assigned to a team.",

          conflicts,
        });
      }

      /* =========================
         CHECK DUPLICATE TEAM NAME
      ========================= */

      const existingTeamName =
        await client.query(
          `
          SELECT
            id,
            team_id,
            team_name
          FROM teams
          WHERE LOWER(team_name) =
            LOWER($1)
          `,
          [cleanedTeamName]
        );

      if (
        existingTeamName.rows.length > 0
      ) {

        await client.query("ROLLBACK");

        return res.status(409).json({
          success: false,

          message:
            "A team with this name already exists.",
        });
      }

      /* =========================
         GENERATE TEAM ID
      ========================= */

      let teamId;
      let teamInserted = false;

      while (!teamInserted) {

        teamId =
          generateTeamId();

        const existingTeamId =
          await client.query(
            `
            SELECT id
            FROM teams
            WHERE team_id = $1
            `,
            [teamId]
          );

        if (
          existingTeamId.rows.length === 0
        ) {
          teamInserted = true;
        }
      }

      /* =========================
         CREATE TEAM
      ========================= */

      const teamResult =
        await client.query(
          `
          INSERT INTO teams (
            team_id,
            team_name,
            event
          )
          VALUES (
            $1,
            $2,
            $3
          )
          RETURNING
            id,
            team_id,
            team_name,
            event,
            created_at
          `,
          [
            teamId,
            cleanedTeamName,
            cleanedEvent,
          ]
        );

      const team =
        teamResult.rows[0];

      /* =========================
         INSERT TEAM MEMBERS
      ========================= */

      for (const registrationId of uniqueIds) {

        await client.query(
          `
          INSERT INTO team_members (
            team_id,
            registration_id
          )
          VALUES (
            $1,
            $2
          )
          `,
          [
            team.id,
            registrationId,
          ]
        );
      }

      /* =========================
         COMMIT
      ========================= */

      await client.query("COMMIT");

      /* =========================
         RESPONSE
      ========================= */

      return res.status(201).json({
        success: true,

        message:
          "Team registered successfully.",

        team: {
          id: team.id,

          teamId:
            team.team_id,

          teamName:
            team.team_name,

          event:
            team.event,

          registrationIds:
            uniqueIds,

          createdAt:
            team.created_at,
        },

        members:
          registrations.rows,
      });

    } catch (error) {

      /* =========================
         ROLLBACK ON ERROR
      ========================= */

      try {
        await client.query("ROLLBACK");
      } catch {
        // Ignore rollback errors
      }

      console.error(
        "Team creation error:",
        error
      );

      /* =====================================================
         DATABASE UNIQUE CONSTRAINT

         This catches race conditions where two requests
         attempt to register the same person simultaneously.
      ===================================================== */

      if (error.code === "23505") {

        if (
          error.constraint ===
          "unique_registration_team"
        ) {
          return res.status(409).json({
            success: false,

            message:
              "One or more registrations are already assigned to a team.",
          });
        }

        if (
          error.constraint ===
          "teams_team_id_key"
        ) {
          return res.status(409).json({
            success: false,

            message:
              "Unable to generate a unique team ID. Please try again.",
          });
        }
      }

      return res.status(500).json({
        success: false,

        message:
          "Unable to create team. Please try again.",
      });

    } finally {

      client.release();

    }
  });


  /* =========================================================
     GET ALL TEAMS

     GET /api/registrations/teams
  ========================================================= */

  router.get("/teams", async (req, res) => {

    try {

      const result =
        await pool.query(
          `
          SELECT
            t.id,
            t.team_id,
            t.team_name,
            t.event,
            t.created_at,

            COALESCE(
              json_agg(
                json_build_object(
                  'registrationId',
                  r.registration_id,

                  'name',
                  r.name,

                  'email',
                  r.email,

                  'phone',
                  r.phone,

                  'institution',
                  r.institution,

                  'city',
                  r.city,

                  'department',
                  r.department,

                  'year',
                  r.year_of_study,

                  'events',
                  r.events,

                  'amount',
                  r.amount,

                  'paymentStatus',
                  r.payment_status,

                  'createdAt',
                  r.created_at
                )
                ORDER BY tm.created_at
              )
              FILTER (
                WHERE r.registration_id IS NOT NULL
              ),
              '[]'::json
            ) AS members

          FROM teams t

          LEFT JOIN team_members tm
            ON tm.team_id = t.id

          LEFT JOIN registrations r
            ON r.registration_id =
               tm.registration_id

          GROUP BY
            t.id,
            t.team_id,
            t.team_name,
            t.event,
            t.created_at

          ORDER BY
            t.created_at DESC
          `
        );

      return res.json({
        success: true,
        teams: result.rows,
      });

    } catch (error) {

      console.error(
        "Get teams error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch teams.",
      });
    }
  });


  /* =========================================================
     GET SINGLE TEAM

     GET /api/registrations/teams/:id
  ========================================================= */

  router.get(
    "/teams/:id",
    async (req, res) => {

      try {

        const { id } =
          req.params;

        const result =
          await pool.query(
            `
            SELECT
              t.id,
              t.team_id,
              t.team_name,
              t.event,
              t.created_at,

              COALESCE(
                json_agg(
                  json_build_object(
                    'registrationId',
                    r.registration_id,

                    'name',
                    r.name,

                    'email',
                    r.email,

                    'phone',
                    r.phone,

                    'institution',
                    r.institution,

                    'city',
                    r.city,

                    'department',
                    r.department,

                    'year',
                    r.year_of_study,

                    'events',
                    r.events,

                    'amount',
                    r.amount,

                    'paymentStatus',
                    r.payment_status,

                    'createdAt',
                    r.created_at
                  )
                  ORDER BY tm.created_at
                )
                FILTER (
                  WHERE r.registration_id IS NOT NULL
                ),
                '[]'::json
              ) AS members

            FROM teams t

            LEFT JOIN team_members tm
              ON tm.team_id = t.id

            LEFT JOIN registrations r
              ON r.registration_id =
                 tm.registration_id

            WHERE
              t.id = $1

            GROUP BY
              t.id,
              t.team_id,
              t.team_name,
              t.event,
              t.created_at
            `,
            [id]
          );

        if (
          result.rows.length === 0
        ) {
          return res.status(404).json({
            success: false,
            message:
              "Team not found.",
          });
        }

        return res.json({
          success: true,
          team: result.rows[0],
        });

      } catch (error) {

        console.error(
          "Get team error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to fetch team.",
        });
      }
    }
  );


  /* =========================================================
     CHECK TEAM MEMBERSHIP

     GET /api/registrations/team-member/:registrationId

     Useful if you want the frontend to check whether a
     registration is already assigned to a team before
     submitting the team form.
  ========================================================= */

  router.get(
    "/team-member/:registrationId",
    async (req, res) => {

      try {

        const registrationId =
          String(
            req.params.registrationId
          )
            .trim()
            .toUpperCase();

        const result =
          await pool.query(
            `
            SELECT
              tm.registration_id,
              t.team_id,
              t.team_name,
              t.created_at
            FROM team_members tm

            INNER JOIN teams t
              ON t.id = tm.team_id

            WHERE
              tm.registration_id = $1
            `,
            [registrationId]
          );

        if (
          result.rows.length === 0
        ) {
          return res.json({
            success: true,
            assigned: false,
            team: null,
          });
        }

        return res.json({
          success: true,

          assigned: true,

          team: {
            teamId:
              result.rows[0].team_id,

            teamName:
              result.rows[0].team_name,

            createdAt:
              result.rows[0].created_at,
          },
        });

      } catch (error) {

        console.error(
          "Team membership check error:",
          error
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to check team membership.",
        });
      }
    }
  );


  return router;
}