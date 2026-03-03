import React, { useState } from 'react';
import { CustomCard } from './CustomCard';
import { simulateWorkflowAction } from '../utils/mockApi';
import type { HubSpotWebhookEvent } from '../utils/mockApi';
import './Playground.css';

export const Playground: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webhookData, setWebhookData] = useState<HubSpotWebhookEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startSimulation = async (forceError = false) => {
    setIsProcessing(true);
    setWebhookData(null);
    setError(null);
    setProgress(0);
    
    try {
      const data = await simulateWorkflowAction((p) => {
        setProgress(p);
    }, forceError);
    
    setWebhookData(data);
    } catch (e: any) {
      setError(e.message ?? 'Simulation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardProps = {
    title: webhookData ? `${webhookData.leadName} — Lead Intake` : 'Lead Intake (Webhook)',
    description: webhookData ? `Representative: ${webhookData.representative}` : 'Extracts lead info from transcript via n8n webhook.',
    status: (error ? 'danger' :progress === 100 ? 'success' : isProcessing ? 'info' : 'warning') as any,
    statusLabel: error ? 'Failed' : progress === 100 ? 'Synced' : isProcessing ? 'Processing...' : 'Pending Sync',
    alertMessage: error ? `Error: ${error}` : progress === 100 ? 'Workflow action completed successfully!' : isProcessing ? 'Synchronizing with HubSpot CRM...' : undefined,
    stats: [
      { label: 'Monthly Revenue', value: webhookData ? '$4,500' : '$0' },
      { label: 'Tickets Open', value: webhookData ? '0' : '-' },
    ],
    progressValue: progress,
    progressLabel: isProcessing ? 'Workflow Action Progress' : 'Last Sync Status',
    isProcessing,
    onTrigger: () => startSimulation(false),
    onForceError: () => startSimulation(true),
    webhookData
  };

  return (
    <div className="playground-container">
      <main className="playground-stage">
        <div className="stage-content">
          <div className="card-wrapper">
             <CustomCard {...cardProps} />
          </div>
        </div>
      </main>
    </div>
  );
};



