import React, { useEffect, useState } from 'react';
import { CustomCard } from './CustomCard';
import { simulateWorkflowAction } from '../utils/mockApi';
import type { HubSpotWebhookEvent } from '../utils/mockApi';
import { fetchLeadHistory, fetchLeadStats, type LeadHistoryItem, type LeadStats } from '../utils/historyApi';
import { LeadHistoryPanel } from './LeadHistoryPanel';
import { StatsPanel } from './StatsPanel';
import { TRANSCRIPT } from '../data/transcript';
import './Playground.css';

const fetchDashboardSnapshot = async (representative?: string, budget?: string) => {
  const [leadHistory, leadStats] = await Promise.all([
    fetchLeadHistory({
      limit: 8,
      representative: representative || undefined,
      budget: budget || undefined,
    }),
    fetchLeadStats(),
  ]);

  return { leadHistory, leadStats };
};

export const Playground: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [webhookData, setWebhookData] = useState<HubSpotWebhookEvent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<LeadHistoryItem[]>([]);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [representativeFilter, setRepresentativeFilter] = useState('');
  const [budgetFilter, setBudgetFilter] = useState('');
  const [transcript, setTranscript] = useState(TRANSCRIPT);

  const loadDashboardData = async ({
    showLoading = true,
    representative = representativeFilter,
    budget = budgetFilter,
  }: {
    showLoading?: boolean;
    representative?: string;
    budget?: string;
  } = {}) => {
    if (showLoading) {
      setIsRefreshing(true);
    }

    try {
      const { leadHistory, leadStats } = await fetchDashboardSnapshot(representative, budget);

      setHistory(leadHistory);
      setStats(leadStats);
      setHistoryError(null);
    } catch (dashboardError: any) {
      setHistoryError(dashboardError.message ?? 'Failed to load history');
    } finally {
      if (showLoading) {
        setIsRefreshing(false);
      }
    }
  };

  useEffect(() => {
    const run = async () => {
      setIsRefreshing(true);

      try {
        const { leadHistory, leadStats } = await fetchDashboardSnapshot(
          representativeFilter,
          budgetFilter
        );

        setHistory(leadHistory);
        setStats(leadStats);
        setHistoryError(null);
      } catch (dashboardError: any) {
        setHistoryError(dashboardError.message ?? 'Failed to load history');
      } finally {
        setIsRefreshing(false);
      }
    };

    void run();
  }, [representativeFilter, budgetFilter]);

  const startSimulation = async (forceError = false) => {
    const trimmedTranscript = transcript.trim();

    if (!trimmedTranscript) {
      setWebhookData(null);
      setError('Please add a transcript before processing the lead.');
      setProgress(0);
      return;
    }

    setIsProcessing(true);
    setWebhookData(null);
    setError(null);
    setProgress(0);
    
    try {
      const data = await simulateWorkflowAction(trimmedTranscript, (p) => {
        setProgress(p);
    }, forceError);
    
    setWebhookData(data);
    await loadDashboardData({ showLoading: false });
    } catch (e: any) {
      setError(e.message ?? 'Simulation failed');
      await loadDashboardData({ showLoading: false });
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
          <section className="transcript-editor">
            <div className="transcript-editor__header">
              <h2>Transcript Input</h2>
              <p>Paste or edit the lead intake transcript here before sending it to the backend.</p>
            </div>

            <textarea
              className="transcript-editor__textarea"
              value={transcript}
              onChange={(event) => setTranscript(event.target.value)}
              placeholder="Paste the transcript you want to process"
              disabled={isProcessing}
            />
          </section>

          <div className="card-wrapper">
             <CustomCard {...cardProps} />
          </div>

          <div className="dashboard-stack">
            <StatsPanel stats={stats} />
            {historyError ? (
              <div className="dashboard-error">{historyError}</div>
            ) : null}
            <LeadHistoryPanel
              leads={history}
              representativeFilter={representativeFilter}
              budgetFilter={budgetFilter}
              onRepresentativeFilterChange={setRepresentativeFilter}
              onBudgetFilterChange={setBudgetFilter}
              onRefresh={() => {
                void loadDashboardData({ showLoading: true });
              }}
              isRefreshing={isRefreshing}
            />
          </div>
        </div>
      </main>
    </div>
  );
};
