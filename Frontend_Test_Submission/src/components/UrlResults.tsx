import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Chip,
  Stack,
  Tooltip,
  Divider,
  Link,
  Grid
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  QrCode as QrCodeIcon,
  Schedule as ScheduleIcon,
  Link as LinkIcon
} from '@mui/icons-material';

// Types and Utils
import { UrlFormData } from '../types';
import { 
  copyToClipboard, 
  formatTimeRemaining, 
  formatUrlForDisplay, 
  generateQRCodeUrl,
  isUrlExpired 
} from '../utils/urlHelpers';
import { logUserAction, logUrlClick } from '../utils/logger';

interface UrlResultsProps {
  urlForms: UrlFormData[];
  onNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const UrlResults: React.FC<UrlResultsProps> = ({
  urlForms,
  onNotification
}) => {
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());

  const resultsWithData = urlForms.filter(form => form.result);

  const handleCopyUrl = async (shortUrl: string, formId: string) => {
    const success = await copyToClipboard(shortUrl);
    
    if (success) {
      setCopiedUrls(prev => new Set(prev).add(formId));
      onNotification('Short URL copied to clipboard!', 'success');
      logUserAction('copy_short_url', { shortUrl, formId });
      
      // Reset the copied state after 3 seconds
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(formId);
          return newSet;
        });
      }, 3000);
    } else {
      onNotification('Failed to copy URL to clipboard', 'error');
    }
  };

  const handleOpenUrl = (shortUrl: string, originalUrl: string) => {
    window.open(shortUrl, '_blank');
    logUrlClick(shortUrl.split('/').pop() || '', originalUrl);
    logUserAction('open_short_url', { shortUrl, originalUrl });
  };

  const handleShowQRCode = (shortUrl: string) => {
    const qrUrl = generateQRCodeUrl(shortUrl);
    window.open(qrUrl, '_blank');
    logUserAction('view_qr_code', { shortUrl });
  };

  if (resultsWithData.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <LinkIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No URLs Generated Yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Complete the form above to see your shortened URLs here
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Results Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" color="success.dark">
          {resultsWithData.length} URL{resultsWithData.length !== 1 ? 's' : ''} Generated
        </Typography>
        <Chip 
          label={`${resultsWithData.length} Success`} 
          color="success" 
          size="small" 
        />
      </Box>

      {/* Results List */}
      {resultsWithData.map((form) => {
        const result = form.result!;
        const isExpired = isUrlExpired(result.expiresAt);
        const timeRemaining = formatTimeRemaining(result.expiresAt);
        const isCopied = copiedUrls.has(form.id);

        return (
          <Card 
            key={form.id} 
            elevation={2}
            sx={{ 
              border: isExpired ? '2px solid' : '1px solid',
              borderColor: isExpired ? 'error.main' : 'success.main',
              bgcolor: isExpired ? 'error.light' : 'background.paper'
            }}
          >
            <CardContent>
              {/* Original URL */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Original URL:
                </Typography>
                <Link 
                  href={result.originalUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  sx={{ 
                    wordBreak: 'break-all',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {formatUrlForDisplay(result.originalUrl, 80)}
                </Link>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Short URL */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Short URL:
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  p: 1.5,
                  bgcolor: 'grey.50',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'grey.300'
                }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      color: isExpired ? 'error.main' : 'primary.main',
                      flexGrow: 1,
                      wordBreak: 'break-all'
                    }}
                  >
                    {result.shortUrl}
                  </Typography>
                  
                  <Tooltip title={isCopied ? 'Copied!' : 'Copy URL'}>
                    <IconButton 
                      size="small"
                      onClick={() => handleCopyUrl(result.shortUrl, form.id)}
                      color={isCopied ? 'success' : 'primary'}
                      disabled={isExpired}
                    >
                      <CopyIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* URL Details */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      <strong>Status:</strong> {isExpired ? 'Expired' : timeRemaining}
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Short Code:</strong> {result.shortCode}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Created:</strong> {result.createdAt.toLocaleString()}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography variant="body2">
                    <strong>Expires:</strong> {result.expiresAt.toLocaleString()}
                  </Typography>
                </Grid>

                {result.customShortcode && (
                  <Grid item xs={12}>
                    <Typography variant="body2">
                      <strong>Custom Shortcode:</strong> Yes ({result.customShortcode})
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {/* Action Buttons */}
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopyUrl(result.shortUrl, form.id)}
                  disabled={isExpired}
                  color={isCopied ? 'success' : 'primary'}
                >
                  {isCopied ? 'Copied!' : 'Copy URL'}
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<OpenIcon />}
                  onClick={() => handleOpenUrl(result.shortUrl, result.originalUrl)}
                  disabled={isExpired}
                >
                  Test Link
                </Button>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<QrCodeIcon />}
                  onClick={() => handleShowQRCode(result.shortUrl)}
                  disabled={isExpired}
                >
                  QR Code
                </Button>
              </Stack>

              {/* Expiry Warning */}
              {isExpired && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'error.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="error.dark">
                    ⚠️ This short URL has expired and is no longer functional.
                  </Typography>
                </Box>
              )}

              {/* Validity Warning */}
              {!isExpired && result.validityPeriod <= 60 && (
                <Box sx={{ mt: 2, p: 1, bgcolor: 'warning.light', borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.dark">
                    ⏰ This URL expires soon: {timeRemaining}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          💡 <strong>Tip:</strong> Click "Test Link" to verify your short URLs work correctly. 
          Use "QR Code" to generate a QR code for easy sharing on mobile devices.
        </Typography>
      </Box>
    </Stack>
  );
};

export default UrlResults; 