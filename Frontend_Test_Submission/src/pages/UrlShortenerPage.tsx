import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
  Fade,
  LinearProgress
} from '@mui/material';

// Components
import UrlForm from '../components/UrlForm';
import UrlResults from '../components/UrlResults';

// Utils and Types
import { ShortUrl, UrlFormData } from '../types';
import { logPageLoad, logUserAction, logFormValidation } from '../utils/logger';
import { validateUrl, generateShortCode } from '../utils/urlHelpers';
import { v4 as uuidv4 } from 'uuid';

interface UrlShortenerPageProps {
  shortUrls: ShortUrl[];
  onShortUrlCreated: (shortUrl: ShortUrl) => void;
  onNotification: (message: string, severity?: 'success' | 'error' | 'warning' | 'info') => void;
}

const UrlShortenerPage: React.FC<UrlShortenerPageProps> = ({
  shortUrls,
  onShortUrlCreated,
  onNotification
}) => {
  const [urlForms, setUrlForms] = useState<UrlFormData[]>(() => [
    {
      id: uuidv4(),
      originalUrl: '',
      validityPeriod: 30,
      customShortcode: '',
      isProcessing: false
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const startTime = performance.now();
    logPageLoad('UrlShortenerPage');
    const endTime = performance.now();
    logPageLoad('UrlShortenerPage', endTime - startTime);
  }, []);

  const addUrlForm = () => {
    if (urlForms.length < 5) {
      const newForm: UrlFormData = {
        id: uuidv4(),
        originalUrl: '',
        validityPeriod: 30,
        customShortcode: '',
        isProcessing: false
      };
      setUrlForms(prev => [...prev, newForm]);
      logUserAction('add_url_form', { totalForms: urlForms.length + 1 });
    } else {
      onNotification('Maximum 5 URLs can be processed concurrently', 'warning');
    }
  };

  const removeUrlForm = (id: string) => {
    if (urlForms.length > 1) {
      setUrlForms(prev => prev.filter(form => form.id !== id));
      logUserAction('remove_url_form', { formId: id, remainingForms: urlForms.length - 1 });
    }
  };

  const updateUrlForm = (id: string, updates: Partial<UrlFormData>) => {
    setUrlForms(prev =>
      prev.map(form =>
        form.id === id ? { ...form, ...updates } : form
      )
    );
  };

  const validateForm = (form: UrlFormData): string[] => {
    const errors: string[] = [];

    // Validate URL
    if (!form.originalUrl.trim()) {
      errors.push('URL is required');
    } else if (!validateUrl(form.originalUrl)) {
      errors.push('Please enter a valid URL (include http:// or https://)');
    }

    // Validate validity period
    if (form.validityPeriod < 1) {
      errors.push('Validity period must be at least 1 minute');
    } else if (form.validityPeriod > 525600) { // 1 year in minutes
      errors.push('Validity period cannot exceed 1 year');
    }

    // Validate custom shortcode if provided
    if (form.customShortcode.trim()) {
      const shortcode = form.customShortcode.trim();
      if (!/^[a-zA-Z0-9-_]+$/.test(shortcode)) {
        errors.push('Custom shortcode can only contain letters, numbers, hyphens, and underscores');
      }
      if (shortcode.length < 3 || shortcode.length > 20) {
        errors.push('Custom shortcode must be between 3 and 20 characters');
      }
      // Check if shortcode already exists
      if (shortUrls.some(url => url.shortCode === shortcode)) {
        errors.push('This custom shortcode is already in use');
      }
    }

    return errors;
  };

  const getAllUsedShortCodes = (): string[] => {
    return shortUrls.map(url => url.shortCode);
  };

  const processUrlForm = async (form: UrlFormData): Promise<ShortUrl> => {
    const errors = validateForm(form);
    if (errors.length > 0) {
      logFormValidation('url_shortening', false, errors);
      throw new Error(errors.join(', '));
    }

    logFormValidation('url_shortening', true);

    // Generate short code
    const usedCodes = getAllUsedShortCodes();
    const shortCode = form.customShortcode.trim() || generateShortCode(usedCodes);

    // Create the short URL object
    const now = new Date();
    const expiresAt = new Date(now.getTime() + form.validityPeriod * 60000);

    const shortUrl: ShortUrl = {
      id: uuidv4(),
      originalUrl: form.originalUrl.trim(),
      shortCode,
      shortUrl: `http://localhost:3000/${shortCode}`,
      validityPeriod: form.validityPeriod,
      customShortcode: form.customShortcode.trim() || undefined,
      createdAt: now,
      expiresAt,
      clickCount: 0,
      clicks: []
    };

    return shortUrl;
  };

  const handleSubmitAll = async () => {
    setIsProcessing(true);
    logUserAction('submit_all_urls', { totalUrls: urlForms.length });

    const validForms = urlForms.filter(form => 
      form.originalUrl.trim() && !form.isProcessing && !form.result
    );

    if (validForms.length === 0) {
      onNotification('Please enter at least one valid URL', 'warning');
      setIsProcessing(false);
      return;
    }

    // Process all forms concurrently
    const promises = validForms.map(async (form) => {
      updateUrlForm(form.id, { isProcessing: true, error: undefined });
      
      try {
        const shortUrl = await processUrlForm(form);
        updateUrlForm(form.id, { 
          isProcessing: false, 
          result: shortUrl,
          error: undefined 
        });
        onShortUrlCreated(shortUrl);
        return { success: true, form, shortUrl };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        updateUrlForm(form.id, { 
          isProcessing: false, 
          error: errorMessage 
        });
        return { success: false, form, error: errorMessage };
      }
    });

    try {
      const results = await Promise.all(promises);
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      if (successful > 0 && failed === 0) {
        onNotification(`Successfully created ${successful} short URL${successful > 1 ? 's' : ''}!`, 'success');
      } else if (successful > 0 && failed > 0) {
        onNotification(`Created ${successful} URLs successfully, ${failed} failed`, 'warning');
      } else {
        onNotification('Failed to create any URLs. Please check the errors and try again.', 'error');
      }
    } catch (error) {
      onNotification('An unexpected error occurred while processing URLs', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = (id: string) => {
    updateUrlForm(id, {
      originalUrl: '',
      validityPeriod: 30,
      customShortcode: '',
      isProcessing: false,
      result: undefined,
      error: undefined
    });
    logUserAction('reset_url_form', { formId: id });
  };

  const resetAllForms = () => {
    setUrlForms([{
      id: uuidv4(),
      originalUrl: '',
      validityPeriod: 30,
      customShortcode: '',
      isProcessing: false
    }]);
    logUserAction('reset_all_forms');
  };

  const hasResults = urlForms.some(form => form.result);
  const hasErrors = urlForms.some(form => form.error);
  const processingCount = urlForms.filter(form => form.isProcessing).length;

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 4, mb: 4, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          URL Shortener
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Create up to 5 short URLs simultaneously with custom options
        </Typography>
      </Paper>

      {/* Progress Indicator */}
      {isProcessing && (
        <Fade in={isProcessing}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Processing {processingCount} URL{processingCount !== 1 ? 's' : ''}...
            </Typography>
            <LinearProgress />
          </Box>
        </Fade>
      )}

      <Grid container spacing={4}>
        {/* URL Forms */}
        <Grid item xs={12} lg={hasResults ? 6 : 12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Create Short URLs
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter up to 5 URLs to shorten. Each URL can have a custom validity period and shortcode.
            </Typography>

            <UrlForm
              urlForms={urlForms}
              onAddForm={addUrlForm}
              onRemoveForm={removeUrlForm}
              onUpdateForm={updateUrlForm}
              onSubmitAll={handleSubmitAll}
              onResetAll={resetAllForms}
              onResetForm={resetForm}
              isProcessing={isProcessing}
              maxForms={5}
            />
          </Paper>
        </Grid>

        {/* Results */}
        {hasResults && (
          <Grid item xs={12} lg={6}>
            <Fade in={hasResults}>
              <Paper elevation={2} sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Results
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Your shortened URLs are ready to use. Click to copy or view analytics.
                </Typography>

                <UrlResults
                  urlForms={urlForms}
                  onNotification={onNotification}
                />
              </Paper>
            </Fade>
          </Grid>
        )}
      </Grid>

      {/* Error Summary */}
      {hasErrors && (
        <Box sx={{ mt: 4 }}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              Errors Encountered
            </Typography>
            {urlForms
              .filter(form => form.error)
              .map(form => (
                <Typography key={form.id} variant="body2" sx={{ mb: 1 }}>
                  • {form.originalUrl || 'Empty URL'}: {form.error}
                </Typography>
              ))
            }
          </Paper>
        </Box>
      )}

      {/* Instructions */}
      <Box sx={{ mt: 4 }}>
        <Paper elevation={1} sx={{ p: 3, bgcolor: 'background.default' }}>
          <Typography variant="h6" gutterBottom>
            How to Use
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>1. Enter URLs:</strong> Add up to 5 URLs you want to shorten. Make sure to include http:// or https://.
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>2. Set Validity:</strong> Choose how long the short URL should remain active (default: 30 minutes).
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" paragraph>
                <strong>3. Custom Shortcode:</strong> Optionally provide a custom shortcode (3-20 characters, alphanumeric, -, _).
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>4. Generate:</strong> Click "Generate All Short URLs" to process all URLs simultaneously.
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default UrlShortenerPage; 