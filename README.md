# FitBid

A competitive fitness & nutrition bidding platform. Clients post their fitness goals, certified trainers and nutritionists submit bids, and a shared collaboration dashboard manages the entire engagement — workouts, meal plans, progress tracking, check-ins, and payments.
ecomsadiq312@gmail.com

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS, TanStack Query, Recharts |
| Backend | Node.js, Express 4, MongoDB, Mongoose |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Real-time | Socket.io |
| File uploads | Multer + Cloudinary |
| Payments | Stripe (wired up, needs your keys) |

---

## Project Structure

```
fitbid/
├── server/              # Express API
│   ├── src/
│   │   ├── config/      # DB connection, Socket.io setup
│   │   ├── middleware/  # JWT auth, file upload
│   │   ├── models/      # All Mongoose models
│   │   ├── routes/      # All API routes
│   │   └── utils/       # JWT helper, notification helper
│   ├── .env.example
│   └── package.json
└── client/              # React frontend
    ├── src/
    │   ├── components/
    │   │   ├── layout/    # Navbar, Sidebar, Layout
    │   │   └── dashboard/ # 6 engagement dashboard tabs
    │   ├── context/       # AuthContext
    │   ├── pages/         # All page components
    │   └── services/      # Axios API client
    ├── .env.example
    └── package.json
```

---

## Prerequisites

- **Node.js** v18 or later — https://nodejs.org
- **MongoDB** — either:
  - Local: https://www.mongodb.com/try/download/community
  - Cloud (recommended): https://www.mongodb.com/atlas (free tier)
- **npm** v9 or later (comes with Node.js)

---

## Local Setup

### 1 — Clone / extract the project

```bash
# If you downloaded a zip, extract it, then:
cd fitbid
```

### 2 — Set up the server

```bash
cd server
npm install
cp .env.example .env
```

Open `server/.env` and fill in at minimum:

```
MONGO_URI=mongodb://localhost:27017/fitbid   # or your Atlas URI
JWT_SECRET=any-long-random-string-here
CLIENT_URL=http://localhost:5173
```

Everything else (Cloudinary, Stripe, email) is optional for local development.

### 3 — Set up the client

```bash
cd ../client
npm install
```

No `.env` changes needed for local dev — the Vite proxy handles API routing.

---

## Running Locally

Open **two terminals**:

**Terminal 1 — API server**
```bash
cd fitbid/server
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 — React client**
```bash
cd fitbid/client
npm run dev
# Runs on http://localhost:5173
```

Open your browser at **http://localhost:5173**.

---

## First Steps After Boot

1. **Register an admin account** — register normally, then manually update the user's `role` to `admin` in MongoDB:
   ```js
   db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } })
   ```

2. **Register a trainer or nutritionist** — they'll be stuck in `pending` verification status until an admin approves them at `/admin`.

3. **Register a client** — post a request, get bids, accept a bid, and the shared engagement dashboard will open.

---

## API Routes Reference

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register (client / trainer / nutritionist) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/posts` | Browse open posts |
| POST | `/api/posts` | Create a post (client) |
| GET | `/api/posts/:id/bids` | View bids on a post (owner) |
| POST | `/api/bids` | Submit a bid (professional) |
| PUT | `/api/bids/:id/accept` | Accept a bid → creates engagement |
| GET | `/api/engagements/:id` | Get engagement + summary |
| POST | `/api/workouts` | Create workout plan (trainer) |
| POST | `/api/workouts/log` | Log a workout (client) |
| POST | `/api/meals` | Create meal plan (nutritionist) |
| POST | `/api/meals/log` | Log a meal (client) |
| POST | `/api/progress` | Log progress entry (client) |
| POST | `/api/checkins` | Create check-in slot (professional) |
| PUT | `/api/checkins/:id/submit` | Submit check-in (client) |
| PUT | `/api/checkins/:id/feedback` | Add feedback (professional) |
| GET | `/api/messages/:engagementId` | Load chat history |
| POST | `/api/reviews` | Leave a review (client) |
| GET | `/api/directory` | Browse professionals |
| GET | `/api/admin/verifications` | Pending verifications (admin) |
| PUT | `/api/admin/verifications/:id` | Approve / reject (admin) |

---

## What's Implemented

- Full authentication system (register, login, JWT, password change)
- Role-based access control (client / trainer / nutritionist / admin)
- Client onboarding with BMI calculation
- Post a request with tags, budget, timeline, visibility
- Professional bidding with budget ceiling enforcement and duplicate prevention
- Bid acceptance → automatic engagement + escrow payment record creation
- Engagement dashboard with 6 tabs: Overview, Workouts, Meal Plan, Progress, Messages, Check-ins
- Real-time group chat via Socket.io
- Progress tracking with Recharts line charts
- Weekly check-ins with professional feedback
- Professional verification queue (admin)
- Review system with star ratings
- Directory of verified professionals with filters
- Notification system (in-app)

## What Needs Your Keys to Fully Work

| Feature | What to set |
|---|---|
| File / photo uploads | `CLOUDINARY_*` in `.env` |
| Stripe payments | `STRIPE_SECRET_KEY` in `.env` |
| Email notifications | `EMAIL_*` in `.env` |

---

## Phase 2 Ideas (from spec)

- Group programs / course model
- Video call integration (Jitsi / Daily.co)
- Wearable sync (Apple Health, Google Fit, Fitbit)
- AI-assisted bid ranking
- Community forum
- Referral program
