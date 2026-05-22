# AASTU Event Hub

This repository is organized into separate frontend and backend folders for a clean, professional structure.

## Folder Structure

```
AASTU_Event_Hub/
├── frontend/           # React + Vite application
│   ├── src/
│   │   ├── pages/      # Page components
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # React context (Auth, Notifications, Toast)
│   │   ├── services/   # API service layer (api.js)
│   │   └── data/       # Mock data (fallback)
│   ├── vite.config.js
│   ├── package.json
│   └── .env.example
└── backend/            # Express.js server
    ├── routes/         # API routes
    ├── controllers/    # Route handlers
    ├── middleware/     # Auth, error handling
    ├── config/         # Database config
    ├── server.js
    ├── package.json
    └── .env.example
```

## Key Integration Changes

- **Frontend API Service** (`frontend/src/services/api.js`): Centralized API client with axios interceptors for authentication
- **Backend Disabled**: `DEV_MODE` in `mockData.js` is now `false` — the frontend uses the real backend API
- **Automatic Fallback**: If the backend is unavailable, the app falls back to mock data gracefully
- **Environment Configuration**: Backend URL is configurable via `VITE_API_URL` in frontend `.env`

## Getting Started

### 1. Start the Backend

```bash
cd backend
npm install
npm run seed   # Creates admin + student test users
npm run dev    # Starts on http://localhost:5000
```

### 2. Start the Frontend (from root)

```bash
npm install
npm run dev             # Starts on http://localhost:5173
```

The frontend will automatically connect to the backend API.

## Frontend Commands

From the repository root:

```bash
npm run dev      # Start frontend dev server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Backend Commands

```bash
npm run dev      # Start with nodemon (auto-reload on changes)
npm start        # Start production server
npm run seed     # Seed the database (if available)
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (requires auth)

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin only)
- `DELETE /api/events/:id` - Delete event (admin only)

### Registrations
- `POST /api/registrations/:eventId` - Register for an event
- `GET /api/registrations` - Get my registrations

## Environment Variables

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aastu_events
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

## Migration from Mock Data

The frontend is now configured to use the backend API:

1. ✅ Created API service layer (`frontend/src/services/api.js`)
2. ✅ Disabled `DEV_MODE` in `mockData.js`
3. ✅ Updated `EventsPage`, `HomePage`, and other pages to fetch from the API
4. ✅ Backend `.env` configured with database settings
5. ✅ CORS enabled on backend for frontend requests

Pages using the backend API:
- `HomePage` - fetches live, featured, and upcoming events
- `EventsPage` - fetches all events with filtering
- `AuthContext` - handles login/registration through the API

## Next Steps

- [ ] Set up MySQL database and run migrations
- [ ] Configure backend environment variables
- [ ] Run `npm run seed` to populate test data
- [ ] Test API endpoints with Postman or similar
- [ ] Update other pages to use the API (admin pages, dashboard, etc.)
