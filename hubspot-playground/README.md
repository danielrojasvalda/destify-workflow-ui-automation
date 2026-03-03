# HubSpot Custom UI Playground

This is a standalone Vite + React application designed to help developers build and test using the HubSpot Custom UI kit API outside of a HubSpot account.

## Features

- **Component Library**: A collection of React components that mimic the `@hubspot/ui-extensions-react` library.
- **Live Preview**: See your components in action as you tweak their properties.

## Components Included

- `Button` (Primary, Secondary, Tertiary, Danger)
- `Heading` (h1-h6)
- `Text` (Body, Caption, Micro)
- `Flex` & `Stack` (Layout engines)
- `Box` (Container with padding/borders)
- `Input` & `Select` (Form elements)
- `Alert` & `Badge` (Feedback and Data display)

## Getting Started

1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the development server:
   ```bash
   bun run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.


## Destify Technical Assessment Submission - Freddy Rojas

#### Challenge 1 n8n Workflow

Implemented an n8n workflow that:
	•	Accepts transcript input via webhook
	•	Extracts structured lead data using OpenAI
	•	Normalizes and validates output
	•	Supports forced error simulation
	•	Returns { ok: true, data } or { ok: false, error }

###### Files
Workflow export:
```
/n8n-workflow/challenge1-n8n-workflow.json
```

Screenshots:
```
/screenshots/
```
#### Challenge 2 - HubSpot Playground integration

Key updates:
	•	Sends transcript via FormData
	•	Calls webhook using environment variable
	•	Handles success and failure states
	•	Prevents UI crashes with safe JSON parsing
	•	Added “Force Error” button for validation
   •	MAintains original UI architecture.

##### How to Run (Windows / macOS / Linux)

Requirements:
	•	Node 18+
	•	npm 9+

Steps: 
``` bash
cd hubspot-playground
npm install
npm run dev
```

Create a file named .env.local inside hubspot-playground:
``` bash
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/lead-intake
```

Then open 
``` bash
http://localhost:5173
```
###### Cross-Platform Compatibility

•	Uses npm (not bun)
•	No OS-specific scripts
•	Verified with npm run build
•	Environment variables handled via .env.local