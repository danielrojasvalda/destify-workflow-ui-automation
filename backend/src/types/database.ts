import { z } from 'zod';

export const logLevelSchema = z.enum(['info', 'warn', 'error']);
export const requestStatusSchema = z.enum(['pending', 'success', 'error']);

export type LogLevel = z.infer<typeof logLevelSchema>;
export type RequestStatus = z.infer<typeof requestStatusSchema>;

export interface LeadRequestRecord {
  id: number;
  transcript: string;
  forceError: boolean;
  status: RequestStatus;
  errorMessage: string | null;
  createdAt: string;
}

export interface StoredLeadRecord {
  id: number;
  requestId: number;
  leadName: string;
  leadEmail: string;
  representative: string;
  budget: 'budget' | 'economy' | 'elevated' | 'luxury';
  destinations: string[];
  guestCountRange: '< 10' | '10-20' | '20-50' | '50-100' | '100+';
  adultsOnly: boolean;
  flightsNeeded: boolean;
  createdAt: string;
}

export interface RequestLogRecord {
  id: number;
  requestId: number | null;
  level: LogLevel;
  message: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

export interface LeadsQuery {
  limit: number;
  representative?: string;
  budget?: string;
  search?: string;
}
