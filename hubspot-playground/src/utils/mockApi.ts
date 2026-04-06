import { TRANSCRIPT } from '../data/transcript';
export interface HubSpotWebhookEvent {
  leadName: string;
  leadEmail: string;
  representative: string;
  budget: 'budget' | 'economy' | 'elevated' | 'luxury';
  destinations: string[];
  guestCountRange: '< 10' | '10-20' | '20-50' | '50-100' | '100+';
  adultsOnly: boolean;
  flightsNeeded: boolean;
}

interface LeadIntakeApiResponse {
  ok: boolean;
  data?: HubSpotWebhookEvent;
  error?: {
    message?: string;
  };
}

export const simulateWorkflowAction = (
  onProgress: (percent: number) => void,
  forceError = false
): Promise<HubSpotWebhookEvent> => {
  return new Promise((resolve, reject) => {
    let progress = 0;
    onProgress(0);

    const interval = setInterval(() => {
      progress += 20;
      onProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);

        setTimeout(async () => {
          try {
            const apiBaseUrl =
              (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:3001';

            const res = await fetch(`${apiBaseUrl}/api/lead-intake`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                transcript: TRANSCRIPT,
                forceError,
              }),
            });

            let json: LeadIntakeApiResponse | null = null;

            try {
              json = (await res.json()) as LeadIntakeApiResponse;
            } catch {
              json = null;
            }

            if (!res.ok || json?.ok === false || !json?.data) {
              const msg = json?.error?.message ?? `Webhook failed (${res.status})`;
              reject(new Error(msg));
              return;
            }

            resolve(json.data);
          } catch (err: any) {
            reject(err);
          }
        }, 500);
      }
    }, 1000);
  });
};
