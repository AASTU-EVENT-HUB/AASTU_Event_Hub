# AASTU Event Hub — Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Frontend–Backend Communication](#4-frontend-backend-communication)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Reference](#6-api-reference)
   - [Auth API](#61-auth-api)
   - [Events API](#62-events-api)
   - [Registrations API](#63-registrations-api)
   - [Notifications API](#64-notifications-api)
   - [Proposals API](#65-proposals-api)
7. [Database Schema](#7-database-schema)
8. [Frontend Routing](#8-frontend-routing)
9. [Setup & Running](#9-setup--running)
10. [Environment Variables](#10-environment-variables)

---

## 1. Project Overview

AASTU Event Hub is a full-stack web application for managing campus events at Addis Ababa Science & Technology University. It supports event discovery, registration with QR code tickets, waitlisting, team-based events, and role-based dashboards for students, organizers, and admins.

**Key Features:**

- Browse and filter events (category, department, search)
- User registration & JWT-based authentication
- Event registration with auto-generated QR code tickets
- Waitlist management when events reach capacity
- Team event registration with team codes
- Role-based dashboards (Student, Admin)
- Event proposal submission & approval workflow
- Admin check-in via QR scanning
- In-app notifications (in-memory)
- Analytics / charts (registration trends, category breakdowns)

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 8, React Router 7 |
| **HTTP Client** | Axios |
| **Charts** | Recharts |
| **QR Codes** | qrcode.react, html5-qrcode |
| **Backend** | Node.js, Express 4 |
| **Database** | SQLite (default) or MySQL 8 |
| **Auth** | JWT (jsonwebtoken) + bcryptjs |
| **Security** | Helmet, CORS |
| **Logging** | Morgan |

---

## 3. Project Structure

```
AASTU_Event_Hub/
├── package.json                 # Root orchestration (monorepo-style)
├── frontend/                    # React SPA
│   ├── .env                     # VITE_API_URL=http://localhost:5000/api
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx             # React entry, StrictMode + App
│       ├── App.jsx              # All route definitions
│       ├── services/
│       │   └── api.js           # Axios client, all API wrappers
│       ├── context/
│       │   ├── AuthContext.jsx   # Auth state, login/signup/logout
│       │   ├── NotificationContext.jsx
│       │   └── ToastContext.jsx
│       ├── components/          # Shared UI components
│       │   ├── layout/          # ProtectedRoute, Navbar, Sidebar, etc.
│       │   ├── EventCard.jsx
│       │   ├── QRCodeCard.jsx
│       │   └── ...
│       ├── pages/               # Page components
│       │   ├── HomePage.jsx
│       │   ├── EventsPage.jsx
│       │   ├── EventDetailPage.jsx
│       │   ├── RegistrationPage.jsx
│       │   ├── auth/            # Login, Signup, ForgotPassword
│       │   ├── dashboard/       # Student & Organizer dashboards
│       │   └── admin/           # Admin dashboards
│       └── data/
│           └── mockData.js      # Fallback mock data + DEV_MODE flag
│
└── backend/                     # Express REST API
    ├── .env                     # Server config
    ├── server.js                # Express app entry, middleware, route mounting
    ├── schema.sql               # MySQL schema (reference)
    ├── config/
    │   └── db.js                # Database client (SQLite / MySQL adapter)
    ├── routes/
    │   ├── auth.routes.js
    │   ├── events.routes.js
    │   ├── registration.routes.js
    │   ├── notifications.routes.js
    │   └── proposals.routes.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── events.controller.js
    │   ├── registration.controller.js
    │   ├── notifications.controller.js
    │   └── proposals.controller.js
    ├── middleware/
    │   ├── auth.js               # JWT verification
    │   ├── adminOnly.js          # Admin role check
    │   └── errorHandler.js       # Global error handler
    └── utils/
        ├── generateQR.js         # QR code generation (qrcode package)
        └── generateTeamCode.js   # Random 6-char team code
```

---

## 4. Frontend–Backend Communication

### 4.1 Architecture Overview

```
Browser (React SPA)
       │
       │  Axios HTTP (JSON)
       │
       ▼
  ┌─────────────────────┐
  │  localhost:5173      │  ← Vite dev server (frontend)
  │  (no proxy)          │
  └─────────┬───────────┘
            │
            │  Direct API calls
            │  http://localhost:5000/api/*
            │
            ▼
  ┌─────────────────────┐
  │  localhost:5000      │  ← Express server (backend)
  │  /api/*              │
  └─────────────────────┘
```

The frontend calls the backend **directly** (no Vite proxy). The API base URL is configured in `frontend/.env`:

```
VITE_API_URL=http://localhost:5000/api
```

### 4.2 Axios Client (`frontend/src/services/api.js`)

All API calls go through a single Axios instance:

```js
const apiClient = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Auto-inject JWT token from localStorage into every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('aastu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Key points:**
- Token is stored in `localStorage` under key `aastu_token`
- User object is stored in `localStorage` under key `aastu_user`
- Every request automatically gets the `Authorization: Bearer <token>` header
- Response interceptor is **not** configured (401 handling is done per-component)

### 4.3 CORS

Backend uses `app.use(cors())` — open to all origins in development.

### 4.4 API Response Format

All endpoints follow a consistent JSON response envelope:

**Success:**
```json
{
  "success": true,
  // ... data fields
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

### 4.5 Fallback / Mock Data

When API calls fail, some pages gracefully fall back to mock data defined in `frontend/src/data/mockData.js`. The `DEV_MODE` flag controls whether mock auth users are available (default: `false`).

---

## 5. Authentication & Authorization

### 5.1 Auth Flow

```
┌──────────┐         ┌──────────┐         ┌──────────┐
│  Browser │         │  Express │         │ Database │
└────┬─────┘         └────┬─────┘         └────┬─────┘
     │                    │                    │
     │  POST /api/auth/   │                    │
     │  register          │                    │
     │  {name, email,     │                    │
     │   studentId,       │  INSERT user       │
     │   department,      │──────────────────►│
     │   password}        │                    │
     │                    │  return user + JWT │
     │  ← 201 {token,    │◄───────────────────│
     │      user}         │                    │
     │                    │                    │
     │  POST /api/auth/   │                    │
     │  login             │                    │
     │  {email, password} │  SELECT user       │
     │                    │──────────────────►│
     │                    │  bcrypt.compare    │
     │  ← 200 {token,    │◄───────────────────│
     │      user}         │                    │
     │                    │                    │
     │  Store token in    │                    │
     │  localStorage      │                    │
     │  (aastu_token)     │                    │
     │                    │                    │
     │  GET /api/auth/me  │                    │
     │  Authorization:    │  Verify JWT        │
     │  Bearer <token>    │  → decoded {id,    │
     │                    │     role, name}    │
     │  ← 200 {user}     │                    │
```

### 5.2 JWT Token

- **Payload:** `{ id, role, name }`
- **Secret:** `JWT_SECRET` env variable
- **Expiry:** `JWT_EXPIRE` (default `7d`)
- **Storage:** `localStorage` key `aastu_token`
- **Transmission:** `Authorization: Bearer <token>` header

### 5.3 Auth Middleware (`backend/middleware/auth.js`)

- Extracts token from `Authorization` header
- Verifies with `jwt.verify()`
- Attaches decoded payload to `req.user`
- Returns `401` if token is missing or invalid

### 5.4 Admin Middleware (`backend/middleware/adminOnly.js`)

- Requires `req.user.role === 'admin'`
- Must be used **after** the `auth` middleware

### 5.5 Frontend Route Guards

| Guard Component | File | Logic |
|---|---|---|
| `ProtectedRoute` | `components/layout/ProtectedRoute.jsx` | Redirects to `/login` if no user in context |
| `StudentRoute` | `components/layout/ProtectedRoute.jsx` | Requires student role + onboarding |
| `AdminRoute` | `components/layout/ProtectedRoute.jsx` | Requires admin role |

Auth state is managed by `AuthContext` (`context/AuthContext.jsx`), which persists/restores user session from `localStorage`.

---

## 6. API Reference

All endpoints are prefixed with `http://localhost:5000/api`.

### 6.1 Auth API

#### `POST /api/auth/register`

Create a new user account (default role: `student`).

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@aastu.edu.et",
  "studentId": "AASTU/1234/15",
  "department": "Software Engineering",
  "password": "securepass123"
}
```

**Response `201`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@aastu.edu.et",
    "role": "student",
    "department": "Software Engineering",
    "isFirstLogin": true
  }
}
```

**Errors:** `400` (missing fields), `409` (email exists).

---

#### `POST /api/auth/login`

Authenticate with email and password.

**Request:**
```json
{
  "email": "john@aastu.edu.et",
  "password": "securepass123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@aastu.edu.et",
    "role": "student",
    "department": "Software Engineering",
    "isFirstLogin": true
  }
}
```

**Errors:** `400` (missing fields), `401` (invalid credentials).

---

#### `GET /api/auth/me`

Get the currently authenticated user's data. Requires JWT.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@aastu.edu.et",
    "role": "student",
    "department": "Software Engineering",
    "isFirstLogin": true
  }
}
```

**Errors:** `401` (no token / invalid token).

---

### 6.2 Events API

#### `GET /api/events`

List events with optional filtering and pagination. Public.

**Query Parameters:**
| Param | Type | Default | Description |
|---|---|---|---|
| `category` | string | — | Filter by category |
| `department` | string | — | Filter by department |
| `search` | string | — | Search by title (LIKE) |
| `page` | number | 1 | Page number |
| `limit` | number | 12 | Results per page |

**Response `200`:**
```json
{
  "success": true,
  "events": [
    {
      "id": 1,
      "title": "AASTU Grand Hackathon",
      "description": "48-hour coding competition...",
      "category": "Hackathons",
      "department": "Software Engineering",
      "start_date": "2024-11-15 09:00:00",
      "end_date": "2024-11-17 17:00:00",
      "location": "Innovation Hub",
      "capacity": 200,
      "banner_image": "https://...",
      "is_team_event": 1,
      "tags": "[\"AI\", \"Web\", \"Mobile\"]",
      "created_by": 1,
      "registration_count": 45
    }
  ]
}
```

---

#### `GET /api/events/:id`

Get a single event by ID. Public.

**Response `200`:**
```json
{
  "success": true,
  "event": { /* same shape as above */ }
}
```

**Errors:** `404` (event not found).

---

#### `POST /api/events`

Create a new event. Requires admin JWT.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "title": "New Event",
  "description": "Event description",
  "category": "Workshops",
  "department": "Computer Science",
  "startDate": "2024-12-01T09:00:00",
  "endDate": "2024-12-01T17:00:00",
  "location": "Room 101",
  "capacity": 100,
  "bannerImage": "https://...",
  "isTeamEvent": false,
  "tags": ["Tech", "AI"]
}
```

**Response `201`:**
```json
{
  "success": true,
  "eventId": 2,
  "event": { /* the created event */ }
}
```

---

#### `PUT /api/events/:id`

Update an existing event. Requires admin JWT.

**Headers:** `Authorization: Bearer <token>`

**Request body:** Same shape as create.

**Response `200`:**
```json
{
  "success": true,
  "event": { /* updated event */ }
}
```

**Errors:** `404` (event not found).

---

#### `DELETE /api/events/:id`

Delete an event and its registrations. Requires admin JWT.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "message": "Event deleted"
}
```

---

### 6.3 Registrations API

#### `POST /api/registrations/:eventId`

Register the authenticated user for an event. Requires JWT.

**Headers:** `Authorization: Bearer <token>`

**Response `201`:**
```json
{
  "success": true,
  "registration": {
    "id": 10,
    "eventId": "1",
    "studentId": 1,
    "qrCode": "data:image/png;base64,iVBOR...",
    "status": "confirmed"
  }
}
```

**Errors:** `404` (event not found), `400` (event full), `409` (already registered).

---

#### `GET /api/registrations`

Get all registrations for the authenticated user. Requires JWT.

**Headers:** `Authorization: Bearer <token>`

**Response `200`:**
```json
{
  "success": true,
  "registrations": [
    {
      "registrationId": 10,
      "status": "confirmed",
      "qrCode": "data:image/png;base64,...",
      "registeredAt": "2024-11-10 14:30:00",
      "event": {
        "id": 1,
        "title": "AASTU Grand Hackathon",
        "category": "Hackathons",
        "department": "Software Engineering",
        "startDate": "2024-11-15 09:00:00",
        "endDate": "2024-11-17 17:00:00",
        "location": "Innovation Hub",
        "capacity": 200,
        "banner": "https://...",
        "isTeamEvent": false,
        "tags": "[\"AI\"]",
        "registered": 45
      }
    }
  ]
}
```

---

### 6.4 Notifications API

> **Note:** Notifications are stored **in-memory** only — they reset on server restart.

#### `GET /api/notifications`

Get all notifications.

**Response `200`:**
```json
{
  "success": true,
  "notifications": [
    {
      "id": 1,
      "type": "registration",
      "title": "Registration Confirmed",
      "message": "You're registered for AASTU Grand Hackathon 2024",
      "time": "Just now",
      "read": false,
      "icon": "🎟"
    }
  ]
}
```

---

#### `POST /api/notifications`

Create a new notification.

**Request:**
```json
{
  "type": "registration",
  "title": "New Notification",
  "message": "Notification message",
  "icon": "🎟",
  "event": {},
  "sentAt": "Nov 10, 2:30 PM"
}
```

**Response `201`:**
```json
{
  "success": true,
  "notification": { /* created notification */ }
}
```

---

#### `PUT /api/notifications/:id/read`

Mark a notification as read.

**Response `200`:**
```json
{ "success": true }
```

---

#### `DELETE /api/notifications/:id`

Delete a notification.

**Response `200`:**
```json
{ "success": true }
```

---

### 6.5 Proposals API

> **Note:** Proposals are stored **in-memory** only — they reset on server restart.

#### `GET /api/proposals`

Get all event proposals.

**Response `200`:**
```json
{
  "success": true,
  "proposals": [
    {
      "id": "p1",
      "title": "AI & Machine Learning Bootcamp",
      "category": "Workshops",
      "organizer": "Dr. Abebe Bekele",
      "dept": "Computer Science",
      "venue": "Lab Building, Room 302",
      "date": "Nov 20, 2024",
      "time": "9:00 AM",
      "expectedAttendance": 80,
      "status": "under_review",
      "description": "...",
      "submittedAt": "May 12, 10:45 AM",
      "banner": "https://...",
      "tags": ["AI", "ML", "Workshop"]
    }
  ]
}
```

---

#### `POST /api/proposals`

Submit a new event proposal.

**Request:** Any proposal fields. Status defaults to `"submitted"`.

**Response `201`:**
```json
{
  "success": true,
  "proposal": { /* created proposal with auto-generated id */ }
}
```

---

#### `PUT /api/proposals/:id`

Update a proposal (e.g., change status).

**Request:**
```json
{
  "status": "approved"
}
```

**Response `200`:**
```json
{
  "success": true,
  "proposal": { /* updated proposal */ }
}
```

---

#### `DELETE /api/proposals/:id`

Delete a proposal.

**Response `200`:**
```json
{ "success": true }
```

---

## 7. Database Schema

The application supports two database backends, configured via `DB_TYPE`:

### 7.1 Users Table

```sql
CREATE TABLE users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,  -- INT for MySQL
  name          TEXT,                               -- VARCHAR(100)
  email         TEXT UNIQUE,                        -- VARCHAR(100) UNIQUE
  student_id    TEXT UNIQUE,                        -- VARCHAR(100) UNIQUE
  department    TEXT,                               -- VARCHAR(100)
  password      TEXT,                               -- bcrypt hash
  role          TEXT DEFAULT 'student',             -- ENUM('student','admin')
  is_first_login INTEGER DEFAULT 1                  -- BOOLEAN
);
```

### 7.2 Events Table

```sql
CREATE TABLE events (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  title             TEXT,
  description       TEXT,
  category          TEXT,
  department        TEXT,
  start_date        TEXT,                           -- DATETIME
  end_date          TEXT,
  location          TEXT,
  capacity          INTEGER,
  banner_image      TEXT,
  is_team_event     INTEGER DEFAULT 0,              -- BOOLEAN
  tags              TEXT,                           -- JSON (stored as TEXT in SQLite)
  created_by        INTEGER,
  registration_count INTEGER DEFAULT 0,
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

### 7.3 Registrations Table

```sql
CREATE TABLE registrations (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id    INTEGER NOT NULL,
  event_id      INTEGER NOT NULL,
  qr_code       TEXT,                               -- Base64 data URI
  status        TEXT DEFAULT 'confirmed',            -- ENUM('confirmed','waitlist','checked_in')
  registered_at TEXT DEFAULT (datetime('now')),      -- TIMESTAMP
  UNIQUE (student_id, event_id),
  FOREIGN KEY (student_id) REFERENCES users(id),
  FOREIGN KEY (event_id) REFERENCES events(id)
);
```

---

## 8. Frontend Routing

All routes defined in `frontend/src/App.jsx`:

| Path | Component | Access |
|---|---|---|
| `/` | HomePage | Public |
| `/events` | EventsPage | Public |
| `/events/:id` | EventDetailPage | Public |
| `/events/:id/register` | RegistrationPage | Auth required |
| `/events/:id/confirmation` | RegistrationConfirmationPage | Auth required |
| `/events/:id/waitlist-confirmation` | WaitlistConfirmationPage | Auth required |
| `/events/:id/team` | TeamRegistrationPage | Auth required |
| `/propose-event` | ProposeEventPage | Student only |
| `/help` | HelpPage | Public |
| `/privacy` | PrivacyPage | Public |
| `/terms` | TermsPage | Public |
| `/login` | LoginPage | Public |
| `/signup` | SignupPage | Public |
| `/forgot-password` | ForgotPasswordPage | Public |
| `/onboarding` | OnboardingPage | Auth required |
| `/dashboard` | StudentDashboard | Student only |
| `/dashboard/tickets` | StudentTicketsPage | Student only |
| `/dashboard/analytics` | StudentAnalyticsPage | Student only |
| `/dashboard/settings` | StudentSettingsPage | Student only |
| `/admin` | AdminDashboard | Admin only |
| `/admin/events` | AdminEventsPage | Admin only |
| `/admin/events/create` | AdminEventsPage (create) | Admin only |
| `/admin/events/:id/edit` | AdminEventsPage (edit) | Admin only |
| `/admin/tickets` | AdminTicketsPage | Admin only |
| `/admin/analytics` | AdminAnalyticsPage | Admin only |
| `/admin/checkin/:eventId` | AdminCheckinPage | Admin only |
| `/admin/scanner/:eventId` | AdminScannerPage | Admin only |
| `/admin/notifications` | AdminNotificationsPage | Admin only |
| `/admin/team` | AdminTeamPage | Admin only |
| `/admin/settings` | AdminSettingsPage | Admin only |
| `/admin/approval` | AdminApprovalPage | Admin only |
| `/admin/users` | AdminUsersPage | Admin only |
| `/admin/audit` | AdminAuditPage | Admin only |
| `*` | NotFoundPage | Public |

**Access control components** (in `components/layout/ProtectedRoute.jsx`):
- `ProtectedRoute` — redirects to `/login` if not authenticated
- `StudentRoute` — requires `student` role + onboarding
- `AdminRoute` — requires `admin` role

---

## 9. Setup & Running

### Prerequisites

- Node.js v16+
- npm

### Quick Start

```bash
# 1. Install all dependencies (root + frontend + backend)
npm run setup

# 2. Start backend (Terminal 1)
npm run dev:backend
# → http://localhost:5000

# 3. Start frontend (Terminal 2)
npm run dev
# → http://localhost:5173
```

### Database Configuration

**SQLite** (default — no setup required):
- Auto-creates `backend/data/database.sqlite` on first start
- Tables auto-created in `config/db.js`

**MySQL** (optional):
1. Set `DB_TYPE=mysql` in `backend/.env`
2. Configure `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
3. Run `backend/schema.sql` to create tables

### Build for Production

```bash
npm run build          # Builds frontend → frontend/dist/
cd backend && npm start  # Serves on port 5000
```

---

## 10. Environment Variables

### Frontend (`frontend/.env`)

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5000/api` | Backend API base URL |

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Server port |
| `NODE_ENV` | `development` | Environment mode |
| `DB_TYPE` | `sqlite` | Database type (`sqlite` or `mysql`) |
| `DB_HOST` | `localhost` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `aastu_events` | MySQL database name |
| `DB_USER` | `root` | MySQL user |
| `DB_PASSWORD` | — | MySQL password |
| `JWT_SECRET` | `your_jwt_secret_key_here` | Secret for JWT signing |
| `JWT_EXPIRE` | `7d` | JWT expiration duration |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `FRONTEND_URL` | `http://localhost:5173` | Frontend URL |

---

## Important Notes

- **Notifications & Proposals are in-memory only** — data resets on server restart. These controllers use arrays, not the database.
- **No frontend `package.json`** — frontend dependencies are hoisted to the root `node_modules/` via the root `package.json`.
- **CORS is wide open** — `app.use(cors())` with no origin restrictions. The `CORS_ORIGIN` env variable is defined but not enforced.
- **The Vite proxy is not configured** — frontend calls the backend directly via the full URL.
- **Mock data fallback** — when the API is unreachable, some pages gracefully fall back to mock data from `frontend/src/data/mockData.js`.
