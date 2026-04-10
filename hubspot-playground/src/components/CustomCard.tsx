import React from 'react';
import { Box, Heading, Text, Flex, Button, Badge, Stack, Alert, ProgressBar } from './hubspot-ui';

interface CustomCardProps {
  title: string;
  description: string;
  status: 'info' | 'success' | 'warning' | 'danger';
  statusLabel: string;
  alertMessage?: string;
  progressValue?: number;
  progressLabel?: string;
  isProcessing?: boolean;
  onTrigger: () => void;
  onForceError: () => void;
  webhookData?: any;
}

export const CustomCard: React.FC<CustomCardProps> = ({
  title,
  description,
  status,
  statusLabel,
  alertMessage,
  progressValue = 0,
  progressLabel = 'Last Sync Status',
  isProcessing = false,
  onTrigger,
  onForceError,
  webhookData,
}) => {
  return (
    <Box padding="medium" border>
      <Stack gap="medium">
        <Flex direction="row" gap="medium" align="start">
          <Box style={{ flex: 1 }}>
            <Heading variant="h2" style={{ marginBottom: '4px' }}>{title}</Heading>
            <Text variant="micro" style={{ color: 'var(--hs-grey-500)' }}>{description}</Text>
          </Box>
          <Badge variant={status}>{statusLabel}</Badge>
        </Flex>

        {alertMessage && (
          <Alert variant={status} title="Attention">
            {alertMessage}
          </Alert>
        )}

        {webhookData ? (
          <Box padding="medium" style={{ backgroundColor: 'var(--hs-grey-100)', borderRadius: '8px', border: '1px solid var(--hs-grey-200)' }}>
             <Text variant="caption" style={{ fontWeight: 600, marginBottom: '12px', display: 'block' }}>RECEIVED WEBHOOK DATA</Text>

            <Stack gap="small">
                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Lead Name:</Text>
                  <Text variant="micro">{webhookData.leadName}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Lead Email:</Text>
                  <Text variant="micro">{webhookData.leadEmail}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Representative:</Text>
                  <Text variant="micro">{webhookData.representative}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Budget:</Text>
                  <Text variant="micro">{webhookData.budget}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Guest Count Range:</Text>
                  <Text variant="micro">{webhookData.guestCountRange}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Adults Only:</Text>
                  <Text variant="micro">{String(webhookData.adultsOnly)}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Flights Needed:</Text>
                  <Text variant="micro">{String(webhookData.flightsNeeded)}</Text>
                </Flex>

                <Flex direction="row" justify="between">
                  <Text variant="micro" style={{ fontWeight: 600 }}>Destinations:</Text>
                  <Text variant="micro">
                    {Array.isArray(webhookData.destinations) ? webhookData.destinations.join(', ') : ''}
                  </Text>
                </Flex>
            </Stack>

          </Box>
        ) : null}

        <Box>
           <ProgressBar 
             label={progressLabel} 
             value={progressValue} 
             
             variant={status === 'danger' ? 'danger' : progressValue === 100 ? 'success' : 'info'}
             showPercentage 
             style={{ marginBottom: '16px' }} 
           />
           <Text variant="caption" style={{ fontWeight: 600, marginBottom: '8px', display: 'block' }}>Recent Activity</Text>
           <Stack gap="small">
              <Flex direction="row" gap="small" align="center">
                 <Box style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: status === 'danger' ? 'var(--hs-danger)' : progressValue === 100 ? 'var(--hs-success)' : 'var(--hs-info)' }} />
                 <Text variant="micro">
                    {status === 'danger'
                      ? 'Webhook failed — see error above'
                      : progressValue === 100
                      ? 'Sync completed successfully'
                      : isProcessing
                      ? 'Synchronizing with external service...'
                      : 'System ready for webhook trigger'}                 </Text>
              </Flex>
           </Stack>
        </Box>

        <Flex direction="row" gap="small" style={{ marginTop: '8px', paddingTop: '16px', borderTop: '1px solid var(--hs-grey-200)' }}>
          <Button 
            variant="primary" 
            onClick={onTrigger} 
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing...' : 'Trigger Workflow Webhook Event'}
          </Button>

          <Button
            variant="danger"
            onClick={onForceError}
            disabled={isProcessing}
          >
            Force Error
          </Button>
        </Flex>
      </Stack>
    </Box>
  );
};
