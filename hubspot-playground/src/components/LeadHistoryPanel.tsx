import React from 'react';
import { Badge, Box, Button, Flex, Heading, Text } from './hubspot-ui';
import type { LeadHistoryItem } from '../utils/historyApi';

interface LeadHistoryPanelProps {
  leads: LeadHistoryItem[];
  representativeFilter: string;
  budgetFilter: string;
  onRepresentativeFilterChange: (value: string) => void;
  onBudgetFilterChange: (value: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const LeadHistoryPanel: React.FC<LeadHistoryPanelProps> = ({
  leads,
  representativeFilter,
  budgetFilter,
  onRepresentativeFilterChange,
  onBudgetFilterChange,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <section className="dashboard-panel">
      <Flex direction="row" justify="between" align="center" gap="medium" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <Box>
          <Heading variant="h2" style={{ marginBottom: '4px' }}>
            Recent Lead History
          </Heading>
          <Text variant="caption">Saved results from the backend SQLite store.</Text>
        </Box>

        <Button variant="secondary" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </Button>
      </Flex>

      <Flex direction="row" gap="small" style={{ marginBottom: '16px', flexWrap: 'wrap' }}>
        <label className="history-filter">
          <span>Representative</span>
          <input
            value={representativeFilter}
            onChange={(event) => onRepresentativeFilterChange(event.target.value)}
            placeholder="Filter by rep"
          />
        </label>

        <label className="history-filter">
          <span>Budget</span>
          <select value={budgetFilter} onChange={(event) => onBudgetFilterChange(event.target.value)}>
            <option value="">All budgets</option>
            <option value="budget">budget</option>
            <option value="economy">economy</option>
            <option value="elevated">elevated</option>
            <option value="luxury">luxury</option>
          </select>
        </label>
      </Flex>

      <div className="history-list">
        {leads.length === 0 ? (
          <div className="dashboard-surface dashboard-surface--padded">
            <Text>No saved leads match the current filters yet.</Text>
          </div>
        ) : (
          leads.map((lead) => (
            <div key={lead.id} className="dashboard-surface dashboard-surface--padded">
              <Flex direction="row" justify="between" align="start" gap="medium" style={{ flexWrap: 'wrap' }}>
                <Box style={{ flex: 1, minWidth: '220px' }}>
                  <Flex direction="row" align="center" gap="small" style={{ marginBottom: '6px', flexWrap: 'wrap' }}>
                    <Heading variant="h3" style={{ margin: 0 }}>
                      {lead.leadName}
                    </Heading>
                    <Badge variant="info">{lead.budget}</Badge>
                  </Flex>

                  <Text variant="caption" style={{ marginBottom: '4px' }}>
                    {lead.leadEmail}
                  </Text>
                  <Text variant="caption" style={{ marginBottom: '4px' }}>
                    Representative: {lead.representative}
                  </Text>
                  <Text variant="caption">
                    Destinations: {lead.destinations.join(', ')}
                  </Text>
                </Box>

                <Box style={{ minWidth: '160px' }}>
                  <Text variant="micro" style={{ fontWeight: 700, textTransform: 'uppercase', color: 'var(--hs-grey-600)' }}>
                    Processed
                  </Text>
                  <Text variant="caption" style={{ marginBottom: '6px' }}>
                    {new Date(lead.createdAt).toLocaleString()}
                  </Text>
                  <Text variant="caption">Guests: {lead.guestCountRange}</Text>
                  <Text variant="caption">Adults Only: {lead.adultsOnly ? 'Yes' : 'No'}</Text>
                  <Text variant="caption">Flights Needed: {lead.flightsNeeded ? 'Yes' : 'No'}</Text>
                </Box>
              </Flex>
            </div>
          ))
        )}
      </div>
    </section>
  );
};
