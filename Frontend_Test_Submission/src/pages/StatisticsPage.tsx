import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Button,
  Stack,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  TrendingUp as TrendingIcon,
  Link as LinkIcon,
  Schedule as ScheduleIcon,
  Visibility as ViewIcon,
  ContentCopy as CopyIcon,
  OpenInNew as OpenIcon,
  BarChart as ChartIcon,
  Timeline as TimelineIcon,
  LocationOn as LocationIcon
} from '@mui/icons-material';

// Types and Utils
import { ShortUrl, UrlStatistics, LocationData, SourceData } from '../types';
import { 
  formatUrlForDisplay, 
  formatTimeRemaining, 
  isUrlExpired,
  copyToClipboard
} from '../utils/urlHelpers';
import { logPageLoad, logUserAction } from '../utils/logger';

interface StatisticsPageProps {
  shortUrls: ShortUrl[];
  onNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const StatisticsPage: React.FC<StatisticsPageProps> = ({
  shortUrls,
  onNotification
}) => {
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set());

  useEffect(() => {
    const startTime = performance.now();
    logPageLoad('StatisticsPage');
    const endTime = performance.now();
    logPageLoad('StatisticsPage', endTime - startTime);
  }, []);

  // Calculate statistics
  const statistics: UrlStatistics = useMemo(() => {
    const allClicks = shortUrls.flatMap(url => url.clicks);
    const totalClicks = allClicks.length;
    
    // Sort URLs by click count
    const topUrls = [...shortUrls]
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 10);

    // Recent activity (last 20 clicks)
    const recentActivity = allClicks
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    // Group clicks by hour for the last 24 hours
    const now = new Date();
    const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const recentClicks = allClicks.filter(click => 
      new Date(click.timestamp) >= last24Hours
    );

    const clicksByHour = Array.from({ length: 24 }, (_, i) => {
      const hour = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourClicks = recentClicks.filter(click => {
        const clickHour = new Date(click.timestamp);
        return clickHour.getHours() === hour.getHours() &&
               clickHour.getDate() === hour.getDate();
      });
      
      return {
        period: hour.toLocaleTimeString([], { hour: '2-digit' }),
        clicks: hourClicks.length,
        timestamp: hour
      };
    }).reverse();

    // Group clicks by location
    const locationCounts = allClicks.reduce((acc, click) => {
      acc[click.location] = (acc[click.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clicksByLocation: LocationData[] = Object.entries(locationCounts)
      .map(([location, clicks]) => ({
        location,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Group clicks by source
    const sourceCounts = allClicks.reduce((acc, click) => {
      acc[click.source] = (acc[click.source] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clicksBySource: SourceData[] = Object.entries(sourceCounts)
      .map(([source, clicks]) => ({
        source,
        clicks,
        percentage: totalClicks > 0 ? (clicks / totalClicks) * 100 : 0
      }))
      .sort((a, b) => b.clicks - a.clicks);

    return {
      totalUrls: shortUrls.length,
      totalClicks,
      topUrls,
      recentActivity,
      clicksByTimeRange: clicksByHour,
      clicksByLocation,
      clicksBySource
    };
  }, [shortUrls]);

  const handleCopyUrl = async (shortUrl: string) => {
    const success = await copyToClipboard(shortUrl);
    
    if (success) {
      setCopiedUrls(prev => new Set(prev).add(shortUrl));
      onNotification('Short URL copied to clipboard!', 'success');
      logUserAction('copy_from_statistics', { shortUrl });
      
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev);
          newSet.delete(shortUrl);
          return newSet;
        });
      }, 3000);
    } else {
      onNotification('Failed to copy URL to clipboard', 'error');
    }
  };

  const handleOpenUrl = (shortUrl: string) => {
    window.open(shortUrl, '_blank');
    logUserAction('open_from_statistics', { shortUrl });
  };

  if (shortUrls.length === 0) {
    return (
      <Box>
        <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h3" component="h1" gutterBottom>
            URL Statistics
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Analytics and insights for your shortened URLs
          </Typography>
        </Paper>

        <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
          <ChartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom color="text.secondary">
            No URLs to Analyze
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Create some short URLs first to see detailed analytics and statistics here.
          </Typography>
          <Button 
            variant="contained" 
            href="/" 
            sx={{ mt: 2 }}
          >
            Create Your First URL
          </Button>
        </Paper>
      </Box>
    );
  }

  const activeUrls = shortUrls.filter(url => !isUrlExpired(url.expiresAt));
  const expiredUrls = shortUrls.filter(url => isUrlExpired(url.expiresAt));

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          URL Statistics
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Comprehensive analytics for your {shortUrls.length} shortened URL{shortUrls.length !== 1 ? 's' : ''}
        </Typography>
      </Paper>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <LinkIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" color="primary.main">
                {statistics.totalUrls}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total URLs Created
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {statistics.totalClicks}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ScheduleIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {activeUrls.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2}>
            <CardContent sx={{ textAlign: 'center' }}>
              <ViewIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {statistics.totalUrls > 0 ? Math.round(statistics.totalClicks / statistics.totalUrls) : 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Avg Clicks per URL
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        {/* Top Performing URLs */}
        <Grid item xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              All Shortened URLs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Complete list of your URLs with click statistics and status
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Short Code</TableCell>
                    <TableCell align="center">Clicks</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shortUrls.map((url) => {
                    const expired = isUrlExpired(url.expiresAt);
                    const isCopied = copiedUrls.has(url.shortUrl);

                    return (
                      <TableRow key={url.id} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {formatUrlForDisplay(url.originalUrl, 40)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Created: {url.createdAt.toLocaleDateString()}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {url.shortCode}
                            </Typography>
                            {url.customShortcode && (
                              <Chip label="Custom" size="small" color="primary" />
                            )}
                          </Box>
                        </TableCell>
                        
                        <TableCell align="center">
                          <Chip 
                            label={url.clickCount} 
                            size="small"
                            color={url.clickCount > 0 ? 'success' : 'default'}
                          />
                        </TableCell>
                        
                        <TableCell align="center">
                          {expired ? (
                            <Chip label="Expired" size="small" color="error" />
                          ) : (
                            <Chip 
                              label={formatTimeRemaining(url.expiresAt)} 
                              size="small" 
                              color="success"
                            />
                          )}
                        </TableCell>
                        
                        <TableCell align="center">
                          <Stack direction="row" spacing={0.5} justifyContent="center">
                            <Tooltip title={isCopied ? 'Copied!' : 'Copy URL'}>
                              <IconButton 
                                size="small"
                                onClick={() => handleCopyUrl(url.shortUrl)}
                                color={isCopied ? 'success' : 'default'}
                                disabled={expired}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            
                            <Tooltip title="Open URL">
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenUrl(url.shortUrl)}
                                disabled={expired}
                              >
                                <OpenIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Analytics Summary */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Click Activity */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Recent Activity
              </Typography>
              
              {statistics.recentActivity.length > 0 ? (
                <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
                  {statistics.recentActivity.slice(0, 10).map((click, index) => (
                    <Box key={click.id} sx={{ py: 1, borderBottom: index < 9 ? '1px solid' : 'none', borderColor: 'divider' }}>
                      <Typography variant="body2">
                        Click from <strong>{click.location}</strong>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(click.timestamp).toLocaleString()}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No click activity yet
                </Typography>
              )}
            </Paper>

            {/* Top Locations */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <LocationIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Click Sources
              </Typography>
              
              {statistics.clicksByLocation.length > 0 ? (
                <Stack spacing={2}>
                  {statistics.clicksByLocation.slice(0, 5).map((location) => (
                    <Box key={location.location}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">
                          {location.location}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {location.clicks} ({location.percentage.toFixed(1)}%)
                        </Typography>
                      </Box>
                      <LinearProgress 
                        variant="determinate" 
                        value={location.percentage} 
                        sx={{ height: 6, borderRadius: 3 }}
                      />
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No location data available
                </Typography>
              )}
            </Paper>

            {/* Status Summary */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                URL Status Overview
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Active URLs</Typography>
                  <Chip label={activeUrls.length} color="success" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Expired URLs</Typography>
                  <Chip label={expiredUrls.length} color="error" size="small" />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">Custom Shortcodes</Typography>
                  <Chip 
                    label={shortUrls.filter(url => url.customShortcode).length} 
                    color="primary" 
                    size="small" 
                  />
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      {/* Expiry Warnings */}
      {expiredUrls.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Alert severity="warning">
            <Typography variant="body2">
              <strong>Expired URLs:</strong> You have {expiredUrls.length} expired URL{expiredUrls.length !== 1 ? 's' : ''} 
              that are no longer functional. Consider creating new ones if needed.
            </Typography>
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default StatisticsPage; 