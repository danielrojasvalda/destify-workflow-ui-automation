import { Router } from 'express';
import { ZodError } from 'zod';
import { createLead, createLeadRequest, updateLeadRequestStatus } from '../repositories/leadRepository.js';
import { logAndPrint } from '../repositories/requestLogRepository.js';
import { sendTranscriptToN8n } from '../services/n8nService.js';
import { leadIntakeRequestSchema } from '../types/lead.js';

export const leadIntakeRouter = Router();

leadIntakeRouter.post('/', async (req, res) => {
  let requestId: number | null = null;

  try {
    const { transcript, forceError } = leadIntakeRequestSchema.parse(req.body);
    requestId = await createLeadRequest(transcript, forceError);

    await logAndPrint('info', 'Lead intake request received', {
      forceError,
      transcriptLength: transcript.length,
    }, requestId);

    await logAndPrint('info', 'Sending transcript to n8n', {
      forceError,
    }, requestId);

    const data = await sendTranscriptToN8n(transcript, forceError);
    await logAndPrint('info', 'Received response from n8n', {
      leadEmail: data.leadEmail,
      representative: data.representative,
    }, requestId);

    const leadId = await createLead(requestId, data);
    await updateLeadRequestStatus(requestId, 'success');

    await logAndPrint('info', 'Validated lead response successfully', {
      leadId,
      leadEmail: data.leadEmail,
    }, requestId);

    res.json({
      ok: true,
      data,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? 'Invalid request payload';

      await logAndPrint('warn', 'Lead intake request validation failed', {
        message,
      }, requestId);

      res.status(400).json({
        ok: false,
        error: {
          message,
        },
      });
      return;
    }

    const message = error instanceof Error ? error.message : 'Lead intake request failed';
    if (requestId !== null) {
      await updateLeadRequestStatus(requestId, 'error', message);
    }

    await logAndPrint('error', 'Lead intake request failed', {
      message,
    }, requestId);

    res.status(502).json({
      ok: false,
      error: {
        message,
      },
    });
  }
});
