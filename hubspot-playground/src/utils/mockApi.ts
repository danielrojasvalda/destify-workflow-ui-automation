import { TRANSCRIPT } from '../data/transcript';
export interface HubSpotWebhookEvent {
  callbackId: string;
  origin: {
    portalId: number;
    actionDefinitionId: string;
    actionDefinitionVersion: number;
  };
  object: {
    objectId: number;
    objectType: string;
    properties: Record<string, any>;
  };
  fields: Record<string, any>;
}

export const mockHubSpotWebhook: HubSpotWebhookEvent = {
  callbackId: 'cb-123456789',
  origin: {
    portalId: 9876543,
    actionDefinitionId: 'custom-automation-action',
    actionDefinitionVersion: 1,
  },
  object: {
    objectId: 101,
    objectType: 'CONTACT',
    properties: {
      firstname: 'Brian',
      lastname: 'Halligan',
      email: 'brian@hubspot.com',
      company: 'HubSpot',
    },
  },
  fields: {
    sync_priority: 'high',
  },
};

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
            const baseUrl = import.meta.env.VITE_N8N_WEBHOOK_URL as string | undefined;

            if (!baseUrl) {
              reject(new Error("Missing VITE_N8N_WEBHOOK_URL (.env.local). Restart dev server after adding it."));
              return;
            }

            const url = forceError
              ? `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}forceError=true`
              : baseUrl;

            const form = new FormData();
            form.append("transcript", TRANSCRIPT);

            const res = await fetch(url, {
              method: "POST",
              body: form,
            });

            let json: any = null;
            let text: string = '';

            try {
              json = await res.json();
            } catch {
              text = await res.text().catch(() => '');
}
            // If your n8n returns { ok:false, error:{message} } treat as failure
            if (!res.ok || json?.ok === false) {
              const msg = json?.error?.message ?? json?.message ?? `Webhook failed (${res.status})`;
              reject(new Error(msg));
              return;
            }

            // If your n8n returns { ok:true, data:{...}} unwrap to match expected event shape
            const event = (json?.data ? json.data : json) as HubSpotWebhookEvent;

            resolve(event);
          } catch (err: any) {
            reject(err);
          }
        }, 500);
      }
    }, 1000);
  });
};