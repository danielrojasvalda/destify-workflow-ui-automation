import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Pool } from 'pg';
import type { LeadData } from '../types/lead.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const schemaPath = path.join(__dirname, 'schema.sql');
let pool: Pool | null = null;

const demoLeads: LeadData[] = [
  {
    leadName: 'Maria Alvarez',
    leadEmail: 'maria.alvarez@example.com',
    representative: 'Jordan Lee',
    budget: 'elevated',
    destinations: ['Aruba', 'Dominican Republic'],
    guestCountRange: '10-20',
    adultsOnly: true,
    flightsNeeded: true,
  },
  {
    leadName: 'Cameron Brooks',
    leadEmail: 'cameron.brooks@example.com',
    representative: 'Robin Everman',
    budget: 'luxury',
    destinations: ['Riviera Maya', 'Tulum'],
    guestCountRange: '20-50',
    adultsOnly: false,
    flightsNeeded: false,
  },
];

const getRequiredDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('Missing DATABASE_URL in backend environment');
  }

  return databaseUrl;
};

const seedDatabase = async () => {
  const database = getDatabase();
  const existingLeadCountResult = await database.query<{ count: string }>('SELECT COUNT(*)::text as count FROM leads');
  const existingLeadCount = Number(existingLeadCountResult.rows[0]?.count ?? 0);

  if (existingLeadCount > 0) {
    return;
  }

  for (const lead of demoLeads) {
    const client = await database.connect();

    try {
      await client.query('BEGIN');

      const requestResult = await client.query<{ id: number }>(
        `
          INSERT INTO lead_requests (transcript, force_error, status, error_message, created_at)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
        [`Seeded demo transcript for ${lead.leadName}`, false, 'success', null, new Date().toISOString()]
      );

      const requestId = requestResult.rows[0].id;

      await client.query(
        `
          INSERT INTO leads (
            request_id,
            lead_name,
            lead_email,
            representative,
            budget,
            destinations_json,
            guest_count_range,
            adults_only,
            flights_needed,
            raw_response_json,
            created_at
          )
          VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9, $10::jsonb, $11)
        `,
        [
          requestId,
          lead.leadName,
          lead.leadEmail,
          lead.representative,
          lead.budget,
          JSON.stringify(lead.destinations),
          lead.guestCountRange,
          lead.adultsOnly,
          lead.flightsNeeded,
          JSON.stringify(lead),
          new Date().toISOString(),
        ]
      );

      await client.query(
        `
          INSERT INTO request_logs (request_id, level, message, metadata_json, created_at)
          VALUES ($1, $2, $3, $4::jsonb, $5)
        `,
        [requestId, 'info', 'Inserted demo seed lead', JSON.stringify({ leadEmail: lead.leadEmail }), new Date().toISOString()]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  console.log('[database] Seeded demo leads for first-run experience');
};

export const initializeDatabase = async () => {
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');
  await getDatabase().query(schemaSql);
  await seedDatabase();
  console.log('[database] PostgreSQL schema ready');
};

export const getDatabase = () => {
  if (!pool) {
    pool = new Pool({
      connectionString: getRequiredDatabaseUrl(),
    });
  }

  return pool;
};

export const getDatabaseUrl = () => getRequiredDatabaseUrl();
