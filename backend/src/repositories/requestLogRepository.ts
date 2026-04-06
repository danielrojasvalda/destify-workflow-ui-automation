import type { LogLevel, RequestLogRecord } from '../types/database.js';
import { getDatabase } from '../db/index.js';

interface CreateLogInput {
  requestId?: number | null;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown> | null;
}

interface ListLogsInput {
  limit: number;
  level?: LogLevel;
  requestId?: number;
}

export const createRequestLog = async ({
  requestId = null,
  level,
  message,
  metadata = null,
}: CreateLogInput): Promise<number> => {
  const db = getDatabase();
  const result = await db.query<{ id: number }>(
    `
      INSERT INTO request_logs (request_id, level, message, metadata_json, created_at)
      VALUES ($1, $2, $3, $4::jsonb, $5)
      RETURNING id
    `,
    [requestId, level, message, metadata ? JSON.stringify(metadata) : null, new Date().toISOString()]
  );

  return result.rows[0].id;
};

export const listRequestLogs = async ({
  limit,
  level,
  requestId,
}: ListLogsInput): Promise<RequestLogRecord[]> => {
  const db = getDatabase();
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (level) {
    values.push(level);
    conditions.push(`level = $${values.length}`);
  }

  if (requestId !== undefined) {
    values.push(requestId);
    conditions.push(`request_id = $${values.length}`);
  }

  values.push(limit);
  const limitIndex = values.length;
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await db.query<{
    id: number;
    request_id: number | null;
    level: LogLevel;
    message: string;
    metadata_json: Record<string, unknown> | null;
    created_at: string;
  }>(
    `
      SELECT id, request_id, level, message, metadata_json, created_at
      FROM request_logs
      ${whereClause}
      ORDER BY created_at DESC, id DESC
      LIMIT $${limitIndex}
    `,
    values
  );

  return result.rows.map((row) => ({
    id: row.id,
    requestId: row.request_id,
    level: row.level,
    message: row.message,
    metadata: row.metadata_json,
    createdAt: row.created_at,
  }));
};

export const logAndPrint = async (
  level: LogLevel,
  message: string,
  metadata?: Record<string, unknown> | null,
  requestId?: number | null
) => {
  const consoleMethod =
    level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;

  consoleMethod(`[backend:${level}] ${message}`, metadata ?? {});

  try {
    await createRequestLog({
      requestId,
      level,
      message,
      metadata: metadata ?? null,
    });
  } catch (error) {
    console.error('[backend:error] Failed to persist log entry', {
      message,
      requestId,
      error: error instanceof Error ? error.message : 'Unknown log persistence error',
    });
  }
};
