import { getDatabase } from '../db/index.js';
import type {
  LeadRequestRecord,
  LeadsQuery,
  RequestStatus,
  StoredLeadRecord,
} from '../types/database.js';
import type { LeadData } from '../types/lead.js';

const mapLeadRow = (row: {
  id: number;
  request_id: number;
  lead_name: string;
  lead_email: string;
  representative: string;
  budget: StoredLeadRecord['budget'];
  destinations_json: string[] | string;
  guest_count_range: StoredLeadRecord['guestCountRange'];
  adults_only: boolean;
  flights_needed: boolean;
  created_at: string;
}): StoredLeadRecord => ({
  id: row.id,
  requestId: row.request_id,
  leadName: row.lead_name,
  leadEmail: row.lead_email,
  representative: row.representative,
  budget: row.budget,
  destinations: Array.isArray(row.destinations_json) ? row.destinations_json : JSON.parse(row.destinations_json),
  guestCountRange: row.guest_count_range,
  adultsOnly: row.adults_only,
  flightsNeeded: row.flights_needed,
  createdAt: row.created_at,
});

export const createLeadRequest = async (transcript: string, forceError: boolean): Promise<number> => {
  const db = getDatabase();
  const result = await db.query<{ id: number }>(
    `
      INSERT INTO lead_requests (transcript, force_error, status, error_message, created_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `,
    [transcript, forceError, 'pending', null, new Date().toISOString()]
  );

  return result.rows[0].id;
};

export const updateLeadRequestStatus = async (
  requestId: number,
  status: RequestStatus,
  errorMessage: string | null = null
) => {
  const db = getDatabase();
  await db.query(
    `
      UPDATE lead_requests
      SET status = $1, error_message = $2
      WHERE id = $3
    `,
    [status, errorMessage, requestId]
  );
};

export const createLead = async (requestId: number, lead: LeadData): Promise<number> => {
  const db = getDatabase();
  const result = await db.query<{ id: number }>(
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
      RETURNING id
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

  return result.rows[0].id;
};

export const listLeads = async ({
  limit,
  representative,
  budget,
  search,
}: LeadsQuery): Promise<StoredLeadRecord[]> => {
  const db = getDatabase();
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (representative) {
    values.push(`%${representative}%`);
    conditions.push(`representative ILIKE $${values.length}`);
  }

  if (budget) {
    values.push(budget);
    conditions.push(`budget = $${values.length}`);
  }

  if (search) {
    values.push(`%${search}%`);
    const searchIndex = values.length;
    conditions.push(`(lead_name ILIKE $${searchIndex} OR lead_email ILIKE $${searchIndex})`);
  }

  values.push(limit);
  const limitIndex = values.length;
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query<{
    id: number;
    request_id: number;
    lead_name: string;
    lead_email: string;
    representative: string;
    budget: StoredLeadRecord['budget'];
    destinations_json: string[] | string;
    guest_count_range: StoredLeadRecord['guestCountRange'];
    adults_only: boolean;
    flights_needed: boolean;
    created_at: string;
  }>(
    `
      SELECT
        id,
        request_id,
        lead_name,
        lead_email,
        representative,
        budget,
        destinations_json,
        guest_count_range,
        adults_only,
        flights_needed,
        created_at
      FROM leads
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${limitIndex}
    `,
    values
  );

  return result.rows.map(mapLeadRow);
};

export const getLeadById = async (id: number): Promise<StoredLeadRecord | null> => {
  const db = getDatabase();
  const result = await db.query<{
    id: number;
    request_id: number;
    lead_name: string;
    lead_email: string;
    representative: string;
    budget: StoredLeadRecord['budget'];
    destinations_json: string[] | string;
    guest_count_range: StoredLeadRecord['guestCountRange'];
    adults_only: boolean;
    flights_needed: boolean;
    created_at: string;
  }>(
    `
      SELECT
        id,
        request_id,
        lead_name,
        lead_email,
        representative,
        budget,
        destinations_json,
        guest_count_range,
        adults_only,
        flights_needed,
        created_at
      FROM leads
      WHERE id = $1
    `,
    [id]
  );

  return result.rows[0] ? mapLeadRow(result.rows[0]) : null;
};

export const listLeadRequests = async (limit: number): Promise<LeadRequestRecord[]> => {
  const db = getDatabase();
  const result = await db.query<{
    id: number;
    transcript: string;
    force_error: boolean;
    status: RequestStatus;
    error_message: string | null;
    created_at: string;
  }>(
    `
      SELECT id, transcript, force_error, status, error_message, created_at
      FROM lead_requests
      ORDER BY created_at DESC, id DESC
      LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    transcript: row.transcript,
    forceError: row.force_error,
    status: row.status,
    errorMessage: row.error_message,
    createdAt: row.created_at,
  }));
};

export const getLeadStats = async () => {
  const db = getDatabase();
  const countsResult = await db.query<{
    total_requests: string;
    successful_requests: string | null;
    failed_requests: string | null;
  }>(
    `
      SELECT
        COUNT(*)::text as total_requests,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END)::text as successful_requests,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END)::text as failed_requests
      FROM lead_requests
    `
  );

  const leadCountResult = await db.query<{ total_leads: string }>(
    'SELECT COUNT(*)::text as total_leads FROM leads'
  );

  const topBudgetsResult = await db.query<{ budget: string; count: string }>(
    `
      SELECT budget, COUNT(*)::text as count
      FROM leads
      GROUP BY budget
      ORDER BY COUNT(*) DESC, budget ASC
      LIMIT 5
    `
  );

  return {
    totalRequests: Number(countsResult.rows[0]?.total_requests ?? 0),
    successfulRequests: Number(countsResult.rows[0]?.successful_requests ?? 0),
    failedRequests: Number(countsResult.rows[0]?.failed_requests ?? 0),
    totalLeads: Number(leadCountResult.rows[0]?.total_leads ?? 0),
    topBudgets: topBudgetsResult.rows.map((row) => ({
      budget: row.budget,
      count: Number(row.count),
    })),
  };
};
