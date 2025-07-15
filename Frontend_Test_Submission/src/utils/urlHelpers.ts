import { logUserAction } from './logger';

/**
 * Validates if a string is a valid URL
 */
export const validateUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Generates a random short code
 */
export const generateShortCode = (usedCodes: string[] = [], length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  let attempts = 0;
  const maxAttempts = 100;

  do {
    result = '';
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    attempts++;
  } while (usedCodes.includes(result) && attempts < maxAttempts);

  if (attempts >= maxAttempts) {
    // If we can't generate a unique code with the current length, try with a longer length
    return generateShortCode(usedCodes, length + 1);
  }

  logUserAction('generate_short_code', { shortCode: result, attempts });
  return result;
};

/**
 * Checks if a URL is expired based on its expiry date
 */
export const isUrlExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};

/**
 * Formats a URL for display (truncates if too long)
 */
export const formatUrlForDisplay = (url: string, maxLength: number = 50): string => {
  if (url.length <= maxLength) {
    return url;
  }
  return url.substring(0, maxLength - 3) + '...';
};

/**
 * Gets the domain from a URL
 */
export const getDomainFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return 'unknown';
  }
};

/**
 * Validates a custom shortcode
 */
export const validateShortcode = (shortcode: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!shortcode.trim()) {
    return { isValid: true, errors: [] }; // Empty shortcode is valid (will be auto-generated)
  }

  const trimmed = shortcode.trim();

  if (trimmed.length < 3) {
    errors.push('Shortcode must be at least 3 characters long');
  }

  if (trimmed.length > 20) {
    errors.push('Shortcode cannot be longer than 20 characters');
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(trimmed)) {
    errors.push('Shortcode can only contain letters, numbers, hyphens, and underscores');
  }

  // Check for reserved words
  const reservedWords = ['api', 'admin', 'www', 'app', 'shortener', 'statistics', 'stats', 'analytics'];
  if (reservedWords.includes(trimmed.toLowerCase())) {
    errors.push('This shortcode is reserved and cannot be used');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Formats time remaining until expiry
 */
export const formatTimeRemaining = (expiresAt: Date): string => {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'Expired';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} remaining`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} remaining`;
  } else {
    return 'Less than 1 minute remaining';
  }
};

/**
 * Copies text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      logUserAction('copy_to_clipboard', { textLength: text.length });
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        logUserAction('copy_to_clipboard_fallback', { textLength: text.length });
      }
      
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Normalizes a URL by ensuring it has a protocol
 */
export const normalizeUrl = (url: string): string => {
  const trimmed = url.trim();
  
  if (!trimmed) {
    return '';
  }

  // If the URL doesn't start with a protocol, add https://
  if (!/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
};

/**
 * Generates a QR code URL for a given short URL
 */
export const generateQRCodeUrl = (shortUrl: string): string => {
  const encodedUrl = encodeURIComponent(shortUrl);
  return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodedUrl}`;
};

/**
 * Parses validity period input and converts to minutes
 */
export const parseValidityPeriod = (input: string, unit: 'minutes' | 'hours' | 'days' = 'minutes'): number => {
  const value = parseInt(input, 10);
  
  if (isNaN(value) || value <= 0) {
    return 30; // Default to 30 minutes
  }

  switch (unit) {
    case 'hours':
      return value * 60;
    case 'days':
      return value * 60 * 24;
    default:
      return value;
  }
}; 