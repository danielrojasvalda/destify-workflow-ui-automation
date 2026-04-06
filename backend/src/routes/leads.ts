import { Router } from 'express';
import { z } from 'zod';
import { getLeadById, getLeadStats, listLeads } from '../repositories/leadRepository.js';

export const leadsRouter = Router();

const leadsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  representative: z.string().trim().min(1).optional(),
  budget: z.string().trim().min(1).optional(),
  search: z.string().trim().min(1).optional(),
});

const leadIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

leadsRouter.get('/', async (req, res) => {
  const query = leadsQuerySchema.safeParse(req.query);

  if (!query.success) {
    res.status(400).json({
      ok: false,
      error: {
        message: query.error.issues[0]?.message ?? 'Invalid leads query',
      },
    });
    return;
  }

  try {
    res.json({
      ok: true,
      data: await listLeads(query.data),
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch leads',
      },
    });
  }
});

leadsRouter.get('/meta/stats', async (_req, res) => {
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

leadsRouter.get('/:id', async (req, res) => {
  const params = leadIdParamsSchema.safeParse(req.params);

  if (!params.success) {
    res.status(400).json({
      ok: false,
      error: {
        message: params.error.issues[0]?.message ?? 'Invalid lead id',
      },
    });
    return;
  }

  try {
    const lead = await getLeadById(params.data.id);

    if (!lead) {
      res.status(404).json({
        ok: false,
        error: {
          message: 'Lead not found',
        },
      });
      return;
    }

    res.json({
      ok: true,
      data: lead,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: {
        message: error instanceof Error ? error.message : 'Failed to fetch lead',
      },
    });
  }
});
