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
    <Box padding="medium" border style={{ backgroundColor: 'white', boxShadow: 'var(--hs-shadow-md)' }}>
      <Heading variant="h2" style={{ marginBottom: '16px' }}>
        Demo Snapshot
      </Heading>

      <Flex direction="row" gap="medium" style={{ flexWrap: 'wrap' }}>
        {statItems.map((item) => (
          <Box
            key={item.label}
            padding="medium"
            style={{
              flex: '1 1 140px',
              backgroundColor: 'var(--hs-grey-100)',
              border: '1px solid var(--hs-grey-200)',
            }}
          >
            <Text variant="micro" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--hs-grey-600)' }}>
              {item.label}
            </Text>
            <Text style={{ fontSize: '24px', fontWeight: 700, color: 'var(--hs-charcoal)' }}>{item.value}</Text>
          </Box>
        ))}
      </Flex>

      <Box padding="small" style={{ marginTop: '16px', backgroundColor: 'var(--hs-grey-100)' }}>
        <Text variant="caption" style={{ fontWeight: 600, marginBottom: '8px' }}>
          Top Budgets
        </Text>
        <Text variant="caption">
          {stats && stats.topBudgets.length > 0
            ? stats.topBudgets.map((item) => `${item.budget} (${item.count})`).join(', ')
            : 'No lead history yet.'}
        </Text>
      </Box>
    </Box>
  );
};
