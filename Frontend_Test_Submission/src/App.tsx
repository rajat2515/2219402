import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Box,
  Tab,
  Tabs,
  Alert,
  Snackbar
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import BarChartIcon from '@mui/icons-material/BarChart';

// Components
import UrlShortenerPage from './pages/UrlShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';

// Utils and Hooks
import { initializeLogger, logPageLoad, logError } from './utils/logger';
import { useLocalStorage } from './hooks/useLocalStorage';

// Types
import { ShortUrl } from './types';

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);
  const [shortUrls, setShortUrls] = useLocalStorage<ShortUrl[]>('shortUrls', []);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'warning' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'info'
  });

  // Initialize logging
  useEffect(() => {
    const startTime = performance.now();
    
    try {
      initializeLogger();
      const endTime = performance.now();
      logPageLoad('App', endTime - startTime);
    } catch (error) {
      logError(error as Error, 'App initialization');
    }
  }, []);

  // Handle tab changes and navigation
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/shortener') {
      setCurrentTab(0);
    } else if (path === '/statistics') {
      setCurrentTab(1);
    }
  }, [location]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    
    if (newValue === 0) {
      navigate('/');
    } else if (newValue === 1) {
      navigate('/statistics');
    }
  };

  const showNotification = (message: string, severity: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const handleCloseNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const addShortUrl = (newShortUrl: ShortUrl) => {
    setShortUrls(prev => [newShortUrl, ...prev]);
    showNotification('URL shortened successfully!', 'success');
  };

  const updateShortUrl = (updatedUrl: ShortUrl) => {
    setShortUrls(prev => 
      prev.map(url => url.id === updatedUrl.id ? updatedUrl : url)
    );
  };

  // Check if current path is a potential short URL
  const isShortUrlPath = location.pathname.length > 1 && 
    !location.pathname.startsWith('/statistics') && 
    !location.pathname.startsWith('/shortener');

  // Render redirect handler for short URLs
  if (isShortUrlPath) {
    return (
      <RedirectHandler 
        shortCode={location.pathname.substring(1)} 
        shortUrls={shortUrls}
        onUrlClick={updateShortUrl}
      />
    );
  }

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* App Bar */}
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            aria-label="navigation tabs"
          >
            <Tab 
              icon={<LinkIcon />} 
              label="Shorten URLs" 
              iconPosition="start"
              sx={{ minHeight: 64, textTransform: 'none' }}
            />
            <Tab 
              icon={<BarChartIcon />} 
              label="Statistics" 
              iconPosition="start"
              sx={{ minHeight: 64, textTransform: 'none' }}
            />
          </Tabs>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <UrlShortenerPage 
                shortUrls={shortUrls}
                onShortUrlCreated={addShortUrl}
                onNotification={showNotification}
              />
            } 
          />
          <Route 
            path="/shortener" 
            element={
              <UrlShortenerPage 
                shortUrls={shortUrls}
                onShortUrlCreated={addShortUrl}
                onNotification={showNotification}
              />
            } 
          />
          <Route 
            path="/statistics" 
            element={
              <StatisticsPage 
                shortUrls={shortUrls}
                onNotification={showNotification}
              />
            } 
          />
        </Routes>
      </Container>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default App; 