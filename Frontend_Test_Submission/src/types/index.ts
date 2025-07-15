// URL Shortener Types
export interface ShortUrl {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  validityPeriod: number; // in minutes
  customShortcode?: string;
  createdAt: Date;
  expiresAt: Date;
  clickCount: number;
  clicks: ClickData[];
}

export interface ClickData {
  id: string;
  timestamp: Date;
  source: string;
  location: string; // geographical location
  userAgent?: string;
  ipAddress?: string;
}

export interface CreateShortUrlRequest {
  originalUrl: string;
  validityPeriod?: number;
  customShortcode?: string;
}

export interface CreateShortUrlResponse {
  shortUrl: ShortUrl;
  message: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState {
  urls: UrlFormData[];
  isLoading: boolean;
  errors: ValidationError[];
}

export interface UrlFormData {
  id: string;
  originalUrl: string;
  validityPeriod: number;
  customShortcode: string;
  isProcessing: boolean;
  result?: ShortUrl;
  error?: string;
}

// Analytics and Statistics Types
export interface UrlStatistics {
  totalUrls: number;
  totalClicks: number;
  topUrls: ShortUrl[];
  recentActivity: ClickData[];
  clicksByTimeRange: TimeRangeData[];
  clicksByLocation: LocationData[];
  clicksBySource: SourceData[];
}

export interface TimeRangeData {
  period: string;
  clicks: number;
  timestamp: Date;
}

export interface LocationData {
  location: string;
  clicks: number;
  percentage: number;
}

export interface SourceData {
  source: string;
  clicks: number;
  percentage: number;
}

// Application State Types
export interface AppState {
  shortUrls: ShortUrl[];
  statistics: UrlStatistics | null;
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
}

// Route Parameters
export interface RouteParams {
  shortCode: string;
}

// Storage Types
export interface StorageData {
  shortUrls: ShortUrl[];
  lastUpdated: Date;
  version: string;
} 