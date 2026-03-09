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
Webhook Request
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
```
## Architecture diagram
┌───────────────┐
│ React UI      │
│ (HubSpot Card)│
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
```
