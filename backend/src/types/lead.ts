import { z } from 'zod';

export const budgetOptions = ['budget', 'economy', 'elevated', 'luxury'] as const;
export const guestCountRangeOptions = ['< 10', '10-20', '20-50', '50-100', '100+'] as const;

export const leadDataSchema = z.object({
  leadName: z.string().trim().min(1, 'Lead name is required'),
  leadEmail: z.string().trim().email('Lead email must be a valid email address'),
  representative: z.string().trim().min(1, 'Representative is required'),
  budget: z.enum(budgetOptions),
  destinations: z.array(z.string().trim().min(1, 'Destination cannot be empty')),
  guestCountRange: z.enum(guestCountRangeOptions),
  adultsOnly: z.boolean(),
  flightsNeeded: z.boolean(),
});

export const leadIntakeRequestSchema = z.object({
  transcript: z.string().trim().min(1, 'Transcript is required'),
  forceError: z.boolean().optional().default(false),
});

export type LeadData = z.infer<typeof leadDataSchema>;
export type LeadIntakeRequest = z.infer<typeof leadIntakeRequestSchema>;

export interface ApiSuccessResponse {
  ok: true;
  data: LeadData;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    message: string;
  };
}

export type LeadIntakeApiResponse = ApiSuccessResponse | ApiErrorResponse;
