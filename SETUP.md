# Project Setup Guide

## Prerequisites

- Node.js (v16+)
- npm or yarn
- MySQL Server running locally or remotely

## Complete Setup Instructions

### Step 1: Clone and Install Dependencies

```bash
# From project root
npm run setup
```

This will install dependencies for:
- Root project
- `frontend/` (React + Vite)
- `backend/` (Express.js)

### Step 2: Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aastu_events
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=generate_a_strong_secret_key_here
NODE_ENV=development
```

### Step 3: Set Up Database

```bash
# Run database migrations (if available)
npm run seed
```

Or manually create the database:

```sql
CREATE DATABASE aastu_events;
```

Then import `schema.sql`:

```bash
mysql -u root -p aastu_events < schema.sql
```

### Step 4: Configure Frontend Environment

```bash
cd ../frontend
cp .env.example .env
```

The default `.env` should work for local development:

```env
VITE_API_URL=http://localhost:5000/api
```

### Step 5: Start Backend

Open a new terminal:

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Server running on port 5000
```

### Step 6: Start Frontend

Open another terminal from the project root:

```bash
npm run dev
```

Frontend will be available at: http://localhost:5173

## Verify Integration

1. Open http://localhost:5173 in your browser
2. Navigate to `/events` page
3. You should see events fetched from the backend (or mock data as fallback)
4. Try logging in with:
   - Test student account (create via `/signup`)
   - Test admin account (if seeded in database)

## Troubleshooting

### Backend connection errors

- Ensure backend is running on port 5000: `npm run dev:backend`
- Check `backend/.env` is properly configured
- Verify MySQL is running and credentials are correct

### Database errors

- Ensure MySQL server is running
- Check database name and credentials in `.env`
- Run schema.sql migrations

### Frontend shows mock data instead of backend data

- Check browser console for API errors (F12 → Console tab)
- Verify `VITE_API_URL` in `frontend/.env`
- Ensure backend is running and responding to `GET http://localhost:5000/api/events`

## Project Structure After Setup

```
AASTU_Event_Hub/
├── frontend/
│   ├── src/
│   │   ├── services/api.js      ← API client
│   │   ├── pages/EventsPage.jsx ← Uses API
│   │   └── context/AuthContext.jsx ← Uses API
│   ├── node_modules/
│   └── .env
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── node_modules/
│   └── .env
├── node_modules/
└── package.json
```

## Development Workflow

### To work on Frontend

```bash
npm run dev
```

### To work on Backend

```bash
npm run dev:backend
```

### To run both (optional)

You can use `concurrently` or open two terminals and run the above commands separately.

## Common Development Tasks

### Add a new backend API endpoint

1. Create controller in `backend/controllers/`
2. Create route in `backend/routes/`
3. Import and register route in `backend/server.js`
4. Add API method to `frontend/src/services/api.js`
5. Use in frontend component

### Update frontend to use new API

1. Add method to `frontend/src/services/api.js`
2. Use in component:
   ```jsx
   import { eventsAPI } from '../services/api';
   
   useEffect(() => {
     eventsAPI.getAll().then(res => {
       setEvents(res.data);
     });
   }, []);
   ```

## Production Deployment

### Frontend (build)

```bash
npm run build
```

Output: `frontend/dist/` (ready for static hosting)

### Backend (production)

```bash
cd backend
NODE_ENV=production npm start
```

Ensure backend `.env` has:
- `NODE_ENV=production`
- Proper database credentials
- Secure `JWT_SECRET`
- Correct `CORS_ORIGIN` (frontend domain)

## Support

For issues or questions, refer to:
- Frontend docs: `frontend/README.md`
- Backend docs: `backend/README.md`
- Root docs: `README.md`
