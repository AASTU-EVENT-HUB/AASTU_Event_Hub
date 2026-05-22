# Deploying this project to Render

This document guides you through deploying both the frontend and backend on Render, and setting up a managed MySQL (recommended) to use as the production database.

Summary (recommended):

- Use a managed MySQL provider (PlanetScale is a popular free option). Set `DB_TYPE=mysql` and the MySQL connection env vars in Render.
- Create a Render Web Service for the `backend/` folder (Node service).
- Create a Render Static Site for the `frontend/` folder (Vite build output).

1. Prepare the repository

- The repository root contains scripts that run the frontend commands from `frontend/` (see `package.json`).
- I added `render.yaml` (template). You can use it or configure the services via the Render UI.

2. Choose a production DB

Option A (recommended): Managed MySQL (PlanetScale / ClearDB / Amazon RDS MySQL)

- Create the database in your provider and note host, user, password, database name.
- Run `backend/schema.sql` (or the SQL file in `backend/` if present) against the new DB to create tables.

Option B: SQLite

- Set `DB_TYPE=sqlite` in Render. SQLite uses a local file: `backend/data/database.sqlite`.
- Note: Render service filesystems are ephemeral across deploys and may not persist data reliably. Use only for quick tests, not production.

3. Backend (Render Web Service)

- Create a new Web Service in Render and connect your GitHub repo.
- Set the branch to `azeb` (or whichever branch you're deploying).
- Build command: `cd backend && npm install`
- Start command: `cd backend && npm start`
- Runtime: `Node` (Render selects Node automatically when `env: node`).
- Environment variables (set as secrets in Render dashboard) — example names used in code:
  - `DB_TYPE` = `mysql` or `sqlite`
  - `DB_HOST` (for MySQL)
  - `DB_USER` (for MySQL)
  - `DB_PASSWORD` (for MySQL)
  - `DB_NAME` (for MySQL)
  - `JWT_SECRET` (your JWT secret)
  - `PORT` (optional; Render provides one automatically; server.js uses `process.env.PORT` if available)

- After creating the service, open its URL (e.g., `https://aastu-backend.onrender.com`). Test the health endpoints.

4. Frontend (Render Static Site)

- Create a new Static Site in Render and connect your GitHub repo.
- Branch: `azeb`.
- Root directory: leave empty (repo root), but set the build command below.
- Build command: `npm install && npm run build` (Render runs commands in the repo root; the root `build` script runs `cd frontend && vite build`).
- Publish directory: `frontend/dist`
- Environment variables (optional):
  - `VITE_API_BASE_URL` = `https://<your-backend-service>.onrender.com/api`

5. Running DB migrations / applying `schema.sql`

- If you used managed MySQL, run the SQL in `backend/schema.sql` (or the `schema.sql` file found in repo root / `backend`) against the database.
- Example using `mysql` CLI:

  mysql -h <DB_HOST> -u <DB_USER> -p <DB_NAME> < backend/schema.sql

  (Enter password when prompted.)

Or use a web-based DB admin (Adminer, phpMyAdmin) or provider console to run the SQL.

6. Common troubleshooting

- If the frontend cannot reach the backend: ensure `VITE_API_BASE_URL` matches the backend URL and that CORS is allowed in the backend (the backend uses `cors` by default).
- For persistent storage use managed DB, not SQLite.

7. Quick checklist for you to complete on Render

- [ ] Create MySQL database (PlanetScale or provider).
- [ ] Create Render Web Service for backend; set env vars and link DB.
- [ ] Create Render Static Site for frontend; set `VITE_API_BASE_URL` to backend URL.
- [ ] Run `backend/schema.sql` against your managed DB.

If you'd like, I can:

- Create a minimal script to run the SQL against a provider using CLI credentials.
- Create a small database seed script and Wire up a Render managed database resource if you prefer Postgres and are willing to migrate code.

---

If you're ready, tell me which DB provider you want (PlanetScale, ClearDB, Amazon RDS, or use SQLite). I can then:

- Add exact env var names to `render.yaml` and pre-fill a few Render env placeholders, and
- Provide the one-click instructions you paste into Render to create services and secrets.
