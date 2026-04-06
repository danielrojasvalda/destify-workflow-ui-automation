## AI Lead Intake Automation

AI-powered workflow automation that converts unstructured call transcripts into structured CRM lead data.

Built using:
	•	React
	•	n8n
	•	OpenAI
	•	Webhooks

### Demo Architecture
```
React UI
   │
   ▼
Backend API
   │
   ▼
n8n Workflow
   │
   ▼
OpenAI Extraction
   │
   ▼
Validation Layer
   │
   ▼
Structured CRM Lead Data
```

### Updated Request Flow
`React UI -> Backend API -> n8n webhook`

### Phase 2 Demo Upgrade
- Postgres persistence for lead intake requests
- saved lead history for demos
- request and error logging
- simple history and stats dashboard in the frontend

### Features
	•	AI transcript parsing
	•	schema validation
	•	deterministic error handling
	•	workflow automation
	•	UI integration
	•	cross-platform setup



### Example Output
```code
{
  "leadName": "Cindy Gardner",
  "leadEmail": "cindy@example.com",
  "representative": "Robin Everman",
  "budget": "elevated",
  "destinations": ["Caribbean", "Mexico", "Riviera Maya"],
  "guestCountRange": "20-50",
  "adultsOnly": true,
  "flightsNeeded": false
}
```
## Architecture diagram
┌───────────────┐
│ React UI      │
│ (HubSpot Card)│
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Backend API   │
│ /api/lead-    │
│ intake        │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ n8n Webhook   │
│ /lead-intake  │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ OpenAI        │
│ Extraction    │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Validation    │
│ Layer         │
└───────┬───────┘
        │
        ▼
┌───────────────┐
│ Structured    │
│ Lead Data     │
└───────────────┘

## Run Locally

Frontend:
```bash
cd hubspot-playground
npm install
npm run dev
```

Backend:
```bash
cd backend
npm install
npm run dev
```

Frontend env file:
```bash
# hubspot-playground/.env.local
VITE_API_BASE_URL=http://localhost:3001
```

Backend env file:
```bash
# backend/.env
PORT=3001
DATABASE_URL=postgres://postgres:postgres@localhost:5432/lead_intake_demo
N8N_WEBHOOK_URL=http://localhost:5678/webhook/lead-intake
FRONTEND_ORIGIN=http://localhost:5173
```

## PostgreSQL Demo Storage

- Database name: `lead_intake_demo`
- Connection string: `postgres://postgres:postgres@localhost:5432/lead_intake_demo`
- Tables are created automatically when the backend starts
- If the database is empty, the backend seeds a few demo leads automatically
- To reset the demo database, drop and recreate it, then restart the backend

## Create The Database

```bash
psql -U postgres -c "CREATE DATABASE lead_intake_demo;"
```

## Backend Endpoints

- `GET /api/health`
- `POST /api/lead-intake`
- `GET /api/leads`
- `GET /api/leads/:id`
- `GET /api/stats`
- `GET /api/logs`
- `GET /api/requests`
