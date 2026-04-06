# Backend

This backend sits between the React playground and the n8n webhook.

## Flow

`React UI -> Backend API -> n8n webhook`

## PostgreSQL Storage

- Database connection uses `DATABASE_URL`
- Tables are created automatically on backend startup
- If the database is empty, a small set of demo leads is seeded automatically
- To reset demo data, drop and recreate the database, then restart the backend

## Create The Demo Database

```bash
psql -U postgres -c "CREATE DATABASE lead_intake_demo;"
```

If you prefer opening the Postgres shell first:

```bash
psql -U postgres
CREATE DATABASE lead_intake_demo;
\q
```

## Setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file in `backend` based on `.env.example`:
   ```bash
   PORT=3001
   DATABASE_URL=postgres://postgres:postgres@localhost:5432/lead_intake_demo
   N8N_WEBHOOK_URL=http://localhost:5678/webhook/lead-intake
   FRONTEND_ORIGIN=http://localhost:5173
   ```
3. Start the backend:
   ```bash
   npm run dev
   ```

## Routes

- `GET /api/health`
- `POST /api/lead-intake`
- `GET /api/leads`
- `GET /api/leads/:id`
- `GET /api/stats`
- `GET /api/logs`
- `GET /api/requests`

## Example Request

```json
{
  "transcript": "Call transcript goes here",
  "forceError": false
}
```

## Notes

- The backend validates the incoming request before calling n8n.
- The n8n response is normalized and validated before it is sent back to the frontend.
- CORS is enabled for the Vite frontend origin.
- Each intake request is stored in `lead_requests`.
- Successful extractions are stored in `leads`.
- Structured backend events are stored in `request_logs`.
- Representative filtering uses case-insensitive partial matching with `ILIKE`.
