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
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open [http://localhost:5173](http://localhost:5173) in your browser.


#### n8n Workflow

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
#### HubSpot Playground integration

Key updates:
	•	Sends transcript to the backend API
	•	Uses a Vite environment variable for the backend base URL
	•	Handles success and failure states
	•	Includes a compact history and stats dashboard
	•	Added “Force Error” button for validation
   •	Maintains the original UI architecture.

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
VITE_API_BASE_URL=http://localhost:3001
```

Then open 
``` bash
http://localhost:5173
```
###### Cross-Platform Compatibility

•	Uses npm (not bun)
•	No OS-specific scripts
•	Works with the Express + Postgres backend
•	Environment variables handled via .env.local
