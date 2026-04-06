import { Router } from 'express';
import { z } from 'zod';
import { getLeadStats, listLeadRequests } from '../repositories/leadRepository.js';
import { listRequestLogs } from '../repositories/requestLogRepository.js';
import { logLevelSchema } from '../types/database.js';

export const logsRouter = Router();

const logsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional().default(20),
  level: logLevelSchema.optional(),
  requestId: z.coerce.number().int().positive().optional(),
});

const requestsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});

logsRouter.get('/logs', async (req, res) => {
  const query = logsQuerySchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({
      ok: false,
      error: {
        message: query.error.issues[0]?.message ?? 'Invalid logs query',
      },
    });
    return;
  }

  try {
    res.json({
      ok: true,
      data: await listRequestLogs(query.data),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch logs',
      },
    });
  }
});

logsRouter.get('/requests', async (req, res) => {
  const query = requestsQuerySchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({
      ok: false,
      error: {
        message: query.error.issues[0]?.message ?? 'Invalid requests query',
      },
    });
    return;
  }

  try {
    const requests = await listLeadRequests(query.data.limit);
    const data = requests.map((request) => ({
      id: request.id,
      status: request.status,
      forceError: request.forceError,
      errorMessage: request.errorMessage,
      createdAt: request.createdAt,
    }));

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch requests',
      },
    });
  }
});

logsRouter.get('/stats', async (_req, res) => {
  try {
    res.json({
      ok: true,
      data: await getLeadStats(),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch stats',
      },
    });
  }
});
