# AI AIKYAM — MERN Event Website

A cinematic, responsive MERN registration site for **AI AIKYAM**, conducted by the **Anurag University — Department of Artificial Intelligence**, on **October 8–9, 2026**.

## Features
- Cinematic dark/cyberpunk landing page
- Live October 8, 2026 countdown
- Animated speaker carousel with hover states
- Four alternating event sections:
  - AI SAMVAD — Panel Discussion
  - AI PRADARSHA — Project Expo
  - AI SANKALP — Idea Pitching
  - AI MAHAYUDH — Grand Challenge
- Four configurable pricing cards
- Google Forms registration embed
- MongoDB-backed floating AI AIKYAM Assistant
- Express API with validation and rate limiting
- Fully responsive UI
- No paid assets required; visuals are generated with CSS

## Requirements
- Node.js 18+
- MongoDB Atlas/local MongoDB

## Setup

### Server
```bash
cd server
npm install
cp .env.example .env
# Fill MONGODB_URI
npm run dev
```

### Client
```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173`.

## Environment

Server `.env`:
```env
PORT=5000
MONGODB_URI=mongodb+srv://YOUR_USER:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/ai_aikyam
CLIENT_URL=http://localhost:5173
```

Client `.env`:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_FORM_URL=https://docs.google.com/forms/d/e/YOUR_FORM_ID/viewform?embedded=true
```

## Customization
Most event content is in `client/src/data/eventData.js`.

Replace speaker placeholders in the same file with real speaker names, roles and image URLs.

Replace the Google Form URL in `client/.env`.

Pricing is also in `eventData.js`.

## Production
Build client:
```bash
cd client
npm run build
```

Deploy the client to Vercel/Netlify and the server to Render/Railway/Fly.io. Use MongoDB Atlas for the database.
