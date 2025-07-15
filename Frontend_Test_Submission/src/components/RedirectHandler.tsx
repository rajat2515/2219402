import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack
} from '@mui/material';
import {
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  OpenInNew as OpenIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Types and Utils
import { ShortUrl, ClickData } from '../types';
import { isUrlExpired, formatTimeRemaining } from '../utils/urlHelpers';
import { logUrlClick, logError, logUserAction } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

interface RedirectHandlerProps {
  shortCode: string;
  shortUrls: ShortUrl[];
  onUrlClick: (updatedUrl: ShortUrl) => void;
}

const RedirectHandler: React.FC<RedirectHandlerProps> = ({
  shortCode,
  shortUrls,
  onUrlClick
}) => {
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [foundUrl, setFoundUrl] = useState<ShortUrl | null>(null);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleRedirect = async () => {
      try {
        logUserAction('access_short_url', { shortCode });

        // Find the URL by short code
        const url = shortUrls.find(u => u.shortCode === shortCode);
        
        if (!url) {
          setError('Short URL not found. This link may have been removed or is invalid.');
          setIsRedirecting(false);
          logError(new Error('Short URL not found'), `RedirectHandler for code: ${shortCode}`);
          return;
        }

        setFoundUrl(url);

        // Check if URL is expired
        if (isUrlExpired(url.expiresAt)) {
          setError('This short URL has expired and is no longer available.');
          setIsRedirecting(false);
          logUserAction('access_expired_url', { shortCode, expiresAt: url.expiresAt });
          return;
        }

        // Create click data
        const clickData: ClickData = {
          id: uuidv4(),
          timestamp: new Date(),
          source: 'direct', // Could be enhanced to detect referrer
          location: 'Unknown', // Could be enhanced with geolocation
          userAgent: navigator.userAgent,
          ipAddress: 'Unknown' // Would need backend integration for real IP
        };

        // Update the URL with new click data
        const updatedUrl: ShortUrl = {
          ...url,
          clickCount: url.clickCount + 1,
          clicks: [...url.clicks, clickData]
        };

        // Log the click
        logUrlClick(shortCode, url.originalUrl);
        
        // Update the URL in storage
        onUrlClick(updatedUrl);

        // Start countdown for redirect
        let timeLeft = 3;
        const timer = setInterval(() => {
          timeLeft--;
          setCountdown(timeLeft);
          
          if (timeLeft <= 0) {
            clearInterval(timer);
            window.location.href = url.originalUrl;
          }
        }, 1000);

        // Cleanup timer if component unmounts
        return () => clearInterval(timer);

      } catch (error) {
        setError('An unexpected error occurred while processing the redirect.');
        setIsRedirecting(false);
        logError(error as Error, 'RedirectHandler processing');
      }
    };

    handleRedirect();
  }, [shortCode, shortUrls, onUrlClick]);

  const handleManualRedirect = () => {
    if (foundUrl) {
      logUserAction('manual_redirect', { shortCode, originalUrl: foundUrl.originalUrl });
      window.location.href = foundUrl.originalUrl;
    }
  };

  const handleGoHome = () => {
    navigate('/');
    logUserAction('navigate_home_from_redirect');
  };

  // Error state
  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Paper 
          elevation={4} 
          sx={{ 
            p: 4, 
            maxWidth: 600, 
            textAlign: 'center',
            border: '2px solid',
            borderColor: 'error.main'
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          
          <Typography variant="h4" gutterBottom color="error.main">
            Link Not Available
          </Typography>
          
          <Typography variant="body1" paragraph color="text.secondary">
            {error}
          </Typography>

          {foundUrl && (
            <Box sx={{ mt: 3, mb: 3 }}>
              <Alert severity="info" sx={{ textAlign: 'left' }}>
                <Typography variant="body2">
                  <strong>Short Code:</strong> {shortCode}<br/>
                  <strong>Original URL:</strong> {foundUrl.originalUrl}<br/>
                  <strong>Created:</strong> {foundUrl.createdAt.toLocaleString()}<br/>
                  <strong>Expired:</strong> {foundUrl.expiresAt.toLocaleString()}
                </Typography>
              </Alert>
            </Box>
          )}

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<HomeIcon />}
              onClick={handleGoHome}
              size="large"
            >
              Go to Home
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // Loading/Redirecting state
  return (
    <Box 
      sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3
      }}
    >
      <Paper elevation={4} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
        {isRedirecting ? (
          <>
            <CircularProgress size={64} sx={{ mb: 3 }} />
            
            <Typography variant="h4" gutterBottom>
              Redirecting...
            </Typography>
            
            <Typography variant="body1" paragraph color="text.secondary">
              You will be redirected in {countdown} second{countdown !== 1 ? 's' : ''}
            </Typography>

            {foundUrl && (
              <Box sx={{ mt: 3, mb: 3 }}>
                <Alert severity="success" sx={{ textAlign: 'left' }}>
                  <Typography variant="body2">
                    <strong>Destination:</strong> {foundUrl.originalUrl}<br/>
                    <strong>Short Code:</strong> {shortCode}<br/>
                    <strong>Valid Until:</strong> {formatTimeRemaining(foundUrl.expiresAt)}
                  </Typography>
                </Alert>
              </Box>
            )}

            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<OpenIcon />}
                onClick={handleManualRedirect}
                size="large"
              >
                Go Now
              </Button>
              
              <Button
                variant="outlined"
                startIcon={<HomeIcon />}
                onClick={handleGoHome}
                size="large"
              >
                Cancel
              </Button>
            </Stack>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>
              Processing...
            </Typography>
            <CircularProgress size={40} />
          </>
        )}

        {/* URL Info Chips */}
        {foundUrl && (
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
            <Chip 
              icon={<ScheduleIcon />}
              label={`Clicks: ${foundUrl.clickCount}`} 
              size="small" 
              variant="outlined"
            />
            <Chip 
              label={`Created: ${foundUrl.createdAt.toLocaleDateString()}`} 
              size="small" 
              variant="outlined"
            />
            {foundUrl.customShortcode && (
              <Chip 
                label="Custom Code" 
                size="small" 
                variant="outlined" 
                color="primary"
              />
            )}
          </Box>
        )}

        {/* Safety Notice */}
        <Box sx={{ mt: 4, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            🔒 <strong>Safety Notice:</strong> You are being redirected to an external website. 
            Please ensure you trust the destination before proceeding.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default RedirectHandler; 