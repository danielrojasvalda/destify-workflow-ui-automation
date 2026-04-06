import { ZodError } from 'zod';
import { leadDataSchema, type LeadData } from '../types/lead.js';

const asRecord = (value: unknown): Record<string, unknown> | null => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
};

const extractCandidatePayload = (input: unknown): unknown => {
  const root = asRecord(input);

  if (!root) {
    return input;
  }

  if (Array.isArray(root.data) && root.data.length > 0) {
    return root.data[0];
  }

  if ('data' in root) {
    return root.data;
  }

  return input;
};

export const validateLead = (input: unknown): LeadData => {
  const candidate = extractCandidatePayload(input);

  try {
    return leadDataSchema.parse(candidate);
  } catch (error) {
    if (error instanceof ZodError) {
      const details = error.issues.map((issue) => issue.message).join('; ');
      throw new Error(`n8n returned invalid lead data: ${details}`);
    }

    throw error;
  }
};
