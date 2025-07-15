import React from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Refresh as RefreshIcon,
  Info as InfoIcon
} from '@mui/icons-material';

// Types and Utils
import { UrlFormData } from '../types';
import { validateUrl, validateShortcode, normalizeUrl } from '../utils/urlHelpers';
import { logUserAction, logFormValidation } from '../utils/logger';

interface UrlFormProps {
  urlForms: UrlFormData[];
  onAddForm: () => void;
  onRemoveForm: (id: string) => void;
  onUpdateForm: (id: string, updates: Partial<UrlFormData>) => void;
  onSubmitAll: () => void;
  onResetAll: () => void;
  onResetForm: (id: string) => void;
  isProcessing: boolean;
  maxForms: number;
}

const UrlForm: React.FC<UrlFormProps> = ({
  urlForms,
  onAddForm,
  onRemoveForm,
  onUpdateForm,
  onSubmitAll,
  onResetAll,
  onResetForm,
  isProcessing,
  maxForms
}) => {

  const handleUrlChange = (id: string, url: string) => {
    const normalizedUrl = normalizeUrl(url);
    onUpdateForm(id, { originalUrl: normalizedUrl });
    
    // Real-time validation
    if (normalizedUrl && !validateUrl(normalizedUrl)) {
      logFormValidation('url_input', false, ['Invalid URL format']);
    } else if (normalizedUrl) {
      logFormValidation('url_input', true);
    }
  };

  const handleValidityChange = (id: string, validity: number) => {
    onUpdateForm(id, { validityPeriod: validity });
    logUserAction('change_validity_period', { formId: id, validity });
  };

  const handleShortcodeChange = (id: string, shortcode: string) => {
    onUpdateForm(id, { customShortcode: shortcode });
    
    // Real-time validation
    if (shortcode.trim()) {
      const validation = validateShortcode(shortcode);
      logFormValidation('shortcode_input', validation.isValid, validation.errors);
    }
  };

  const getValidForms = () => {
    return urlForms.filter(form => 
      form.originalUrl.trim() && 
      validateUrl(form.originalUrl) &&
      !form.isProcessing &&
      !form.result
    );
  };

  const hasValidFormsToSubmit = getValidForms().length > 0;

  return (
    <Box>
      {/* Form Controls Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip 
            label={`${urlForms.length}/${maxForms} Forms`} 
            color={urlForms.length === maxForms ? 'warning' : 'default'}
            size="small"
          />
          {hasValidFormsToSubmit && (
            <Chip 
              label={`${getValidForms().length} Ready`} 
              color="success" 
              size="small" 
            />
          )}
        </Box>
        
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={onAddForm}
            disabled={urlForms.length >= maxForms || isProcessing}
            size="small"
          >
            Add URL
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onResetAll}
            disabled={isProcessing}
            size="small"
            color="secondary"
          >
            Reset All
          </Button>
          
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={onSubmitAll}
            disabled={!hasValidFormsToSubmit || isProcessing}
            size="small"
          >
            {isProcessing ? 'Processing...' : 'Generate All'}
          </Button>
        </Stack>
      </Box>

      {/* URL Forms */}
      <Stack spacing={3}>
        {urlForms.map((form, index) => (
          <Paper 
            key={form.id} 
            elevation={1} 
            sx={{ 
              p: 3, 
              border: form.error ? '2px solid' : '1px solid',
              borderColor: form.error ? 'error.main' : form.result ? 'success.main' : 'divider',
              bgcolor: form.result ? 'success.light' : form.error ? 'error.light' : 'background.paper',
              opacity: form.isProcessing ? 0.7 : 1,
              transition: 'all 0.3s ease'
            }}
          >
            {/* Form Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" color={form.result ? 'success.dark' : form.error ? 'error.dark' : 'text.primary'}>
                URL #{index + 1}
                {form.isProcessing && ' - Processing...'}
                {form.result && ' - ✓ Complete'}
                {form.error && ' - ✗ Error'}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {(form.result || form.error) && (
                  <Tooltip title="Reset this form">
                    <IconButton 
                      size="small" 
                      onClick={() => onResetForm(form.id)}
                      disabled={isProcessing}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                )}
                
                {urlForms.length > 1 && (
                  <Tooltip title="Remove this form">
                    <IconButton 
                      size="small" 
                      color="error" 
                      onClick={() => onRemoveForm(form.id)}
                      disabled={isProcessing}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </Box>

            {/* Form Fields */}
            {!form.result && (
              <Grid container spacing={2}>
                {/* URL Input */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL to Shorten"
                    placeholder="https://example.com/very-long-url"
                    value={form.originalUrl}
                    onChange={(e) => handleUrlChange(form.id, e.target.value)}
                    disabled={form.isProcessing}
                    error={form.originalUrl.trim() !== '' && !validateUrl(form.originalUrl)}
                    helperText={
                      form.originalUrl.trim() !== '' && !validateUrl(form.originalUrl)
                        ? 'Please enter a valid URL (include http:// or https://)'
                        : 'Enter the long URL you want to shorten'
                    }
                    InputProps={{
                      endAdornment: (
                        <Tooltip title="URL must include protocol (http:// or https://)">
                          <InfoIcon color="action" fontSize="small" />
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>

                {/* Validity Period */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Validity Period</InputLabel>
                    <Select
                      value={form.validityPeriod}
                      label="Validity Period"
                      onChange={(e) => handleValidityChange(form.id, e.target.value as number)}
                      disabled={form.isProcessing}
                    >
                      <MenuItem value={5}>5 minutes</MenuItem>
                      <MenuItem value={15}>15 minutes</MenuItem>
                      <MenuItem value={30}>30 minutes</MenuItem>
                      <MenuItem value={60}>1 hour</MenuItem>
                      <MenuItem value={180}>3 hours</MenuItem>
                      <MenuItem value={360}>6 hours</MenuItem>
                      <MenuItem value={720}>12 hours</MenuItem>
                      <MenuItem value={1440}>1 day</MenuItem>
                      <MenuItem value={4320}>3 days</MenuItem>
                      <MenuItem value={10080}>1 week</MenuItem>
                      <MenuItem value={43200}>1 month</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Custom Shortcode */}
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (Optional)"
                    placeholder="my-custom-code"
                    value={form.customShortcode}
                    onChange={(e) => handleShortcodeChange(form.id, e.target.value)}
                    disabled={form.isProcessing}
                    error={form.customShortcode.trim() !== '' && !validateShortcode(form.customShortcode).isValid}
                    helperText={
                      form.customShortcode.trim() !== '' && !validateShortcode(form.customShortcode).isValid
                        ? validateShortcode(form.customShortcode).errors[0]
                        : '3-20 characters, letters, numbers, -, _ only'
                    }
                    InputProps={{
                      startAdornment: <Typography variant="body2" color="text.secondary">localhost:3000/</Typography>,
                      endAdornment: (
                        <Tooltip title="Leave empty for auto-generated shortcode">
                          <InfoIcon color="action" fontSize="small" />
                        </Tooltip>
                      )
                    }}
                  />
                </Grid>
              </Grid>
            )}

            {/* Error Display */}
            {form.error && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="error.main">
                  <strong>Error:</strong> {form.error}
                </Typography>
              </Box>
            )}

            {/* Success Display */}
            {form.result && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="success.dark">
                  <strong>Success!</strong> Short URL created successfully.
                </Typography>
              </Box>
            )}
          </Paper>
        ))}
      </Stack>

      {/* Help Text */}
      {urlForms.length === 1 && !urlForms[0].originalUrl && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="info.dark">
            💡 <strong>Tip:</strong> You can add up to 5 URLs to process simultaneously. 
            Use the "Add URL" button to create additional forms.
          </Typography>
        </Box>
      )}

      {/* Processing Summary */}
      {isProcessing && (
        <Box sx={{ mt: 3, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="body2" color="warning.dark">
            ⏳ Processing {urlForms.filter(f => f.isProcessing).length} URL(s)... 
            Please wait while we generate your short URLs.
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default UrlForm; 