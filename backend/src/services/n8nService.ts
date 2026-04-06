import axios from 'axios';
import { validateLead } from '../utils/validateLead.js';
import type { LeadData } from '../types/lead.js';

const getWebhookUrl = (): string => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Missing N8N_WEBHOOK_URL in backend environment');
  }

  return webhookUrl;
};

const buildWebhookUrl = (forceError: boolean): string => {
  const baseUrl = getWebhookUrl();

  if (!forceError) {
    return baseUrl;
  }

  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}forceError=true`;
};

export const sendTranscriptToN8n = async (
  transcript: string,
  forceError: boolean
): Promise<LeadData> => {
  const webhookUrl = buildWebhookUrl(forceError);
  const formData = new FormData();

  // Keep the field name aligned with the existing n8n workflow.
  formData.append('transcript', transcript);

  console.log('[lead-intake] Forwarding transcript to n8n', {
    webhookUrl,
    forceError,
    transcriptLength: transcript.length,
  });

  try {
    const response = await axios.post(webhookUrl, formData, {
      headers: {
        Accept: 'application/json',
      },
      timeout: 30000,
      validateStatus: () => true,
    });

    console.log('[lead-intake] n8n response received', {
      status: response.status,
      ok: response.data?.ok,
    });

    if (response.status < 200 || response.status >= 300) {
      const message =
        response.data?.error?.message ??
        response.data?.message ??
        `n8n webhook request failed with status ${response.status}`;

      throw new Error(message);
    }

    if (response.data?.ok === false) {
      throw new Error(response.data?.error?.message ?? 'n8n returned an error response');
    }

    return validateLead(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.error?.message ??
        error.response?.data?.message ??
        error.message ??
        'Failed to reach n8n webhook';

      console.error('[lead-intake] n8n request failed', {
        message,
        status: error.response?.status,
      });

      throw new Error(message);
    }

    console.error('[lead-intake] Unexpected n8n service error', error);
    throw error;
  }
};
