import React from 'react';
import { Box, Flex, Heading, Text } from './hubspot-ui';
import type { LeadStats } from '../utils/historyApi';

interface StatsPanelProps {
  stats: LeadStats | null;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const statItems = [
    { label: 'Total Requests', value: stats?.totalRequests ?? 0 },
    { label: 'Successful', value: stats?.successfulRequests ?? 0 },
    { label: 'Failed', value: stats?.failedRequests ?? 0 },
    { label: 'Stored Leads', value: stats?.totalLeads ?? 0 },
  ];

  return (
    <section className="dashboard-panel">
      <Heading variant="h2" style={{ marginBottom: '16px' }}>
        Demo Snapshot
      </Heading>

      <Flex direction="row" gap="medium" style={{ flexWrap: 'wrap' }}>
        {statItems.map((item) => (
          <div key={item.label} className="dashboard-surface dashboard-surface--padded stats-card">
            <Text variant="micro" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--hs-grey-600)' }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hs-charcoal)' }}>{item.value}</Text>
          </div>
        ))}
      </Flex>

      <div className="dashboard-surface dashboard-surface--compact stats-summary">
        <Text variant="caption" style={{ fontWeight: 600, marginBottom: '8px' }}>
          Top Budgets
        </Text>
        <Text variant="caption">
          {stats && stats.topBudgets.length > 0
            ? stats.topBudgets.map((item) => `${item.budget} (${item.count})`).join(', ')
            : 'No lead history yet.'}
        </Text>
      </div>
    </section>
  );
};
