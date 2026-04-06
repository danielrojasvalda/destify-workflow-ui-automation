export interface LeadHistoryItem {
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

export interface LeadStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalLeads: number;
  topBudgets: Array<{
    budget: string;
    count: number;
  }>;
}

interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: {
    message?: string;
  };
}

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3001';

const fetchJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${path}`);
  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || json.ok === false || json.data === undefined) {
    throw new Error(json.error?.message ?? `Request failed (${response.status})`);
  }

  return json.data;
};

export const fetchLeadHistory = async (filters?: {
  limit?: number;
  representative?: string;
  budget?: string;
  search?: string;
}) => {
  const params = new URLSearchParams();

  if (filters?.limit) {
    params.set('limit', String(filters.limit));
  }

  const representative = filters?.representative?.trim();
  const budget = filters?.budget?.trim();
  const search = filters?.search?.trim();

  if (representative) {
    params.set('representative', representative);
  }

  if (budget) {
    params.set('budget', budget);
  }

  if (search) {
    params.set('search', search);
  }

  const query = params.toString();
  return fetchJson<LeadHistoryItem[]>(`/api/leads${query ? `?${query}` : ''}`);
};

export const fetchLeadStats = async () => fetchJson<LeadStats>('/api/stats');
