# URL Shortener Application with Logging Middleware

A comprehensive URL shortener application built with React and TypeScript, featuring a custom logging middleware for extensive monitoring and analytics.

## 📁 Project Structure

```
2219369/
├── Logging_Middleware/          # Custom logging middleware package
│   ├── src/                     # TypeScript source files
│   ├── dist/                    # Compiled JavaScript output
│   ├── package.json             # Package configuration
│   └── tsconfig.json           # TypeScript configuration
└── Frontend_Test_Submission/    # React URL shortener application
    ├── src/                     # React application source
    ├── public/                  # Static assets
    ├── package.json             # React app dependencies
    └── tsconfig.json           # TypeScript configuration
```

## 🔧 Technologies Used

### Frontend
- **React 18** with TypeScript
- **Material-UI 5** for modern, responsive UI components
- **React Router** for client-side routing and redirection
- **Local Storage** for client-side data persistence
- **Custom Hooks** for state management and utilities

### Logging Middleware
- **TypeScript** for type safety
- **Axios** for HTTP requests to logging API
- **Retry Logic** with exponential backoff
- **Console Logging** for development debugging

## 🚀 Features

### URL Shortener Application
- **Concurrent Processing**: Create up to 5 short URLs simultaneously
- **Custom Shortcodes**: Optional user-defined shortcodes (3-20 characters)
- **Validity Management**: Configurable expiry periods (5 minutes to 1 month)
- **Real-time Validation**: Client-side URL and shortcode validation
- **Click Tracking**: Comprehensive analytics with timestamps and metadata
- **Responsive Design**: Mobile and desktop optimized interface
- **Error Handling**: User-friendly error messages and recovery

### Statistics & Analytics
- **Comprehensive Dashboard**: Overview of all shortened URLs
- **Click Analytics**: Total clicks, recent activity, location data
- **Status Monitoring**: Active vs expired URLs tracking
- **Performance Metrics**: Average clicks per URL, top performing links
- **Export Capabilities**: Copy URLs, generate QR codes

### Logging Integration
- **Extensive Logging**: All user actions, API calls, and errors logged
- **Categorized Messages**: Organized by package type (api, component, page, etc.)
- **Error Tracking**: Automatic error capture with context
- **Performance Monitoring**: Page load times and user interaction metrics

## 🛠️ Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone and navigate to the project:**
   ```bash
   cd 2219402
   ```

2. **Build the Logging Middleware:**
   ```bash
   cd Logging_Middleware
   npm install
   npm run build
   cd ..
   ```

3. **Setup the React Application:**
   ```bash
   cd Frontend_Test_Submission
   npm install
   npm start
   ```

4. **Access the application:**
   - Open http://localhost:3000 in your browser
   - The application will be running with full logging integration

## 📋 Application Usage

### Creating Short URLs

1. **Navigate to the URL Shortener page** (default homepage)
2. **Enter URLs**: Add up to 5 URLs you want to shorten
3. **Configure Options**:
   - Set validity period (5 minutes to 1 month)
   - Optional custom shortcode (3-20 characters)
4. **Generate URLs**: Click "Generate All Short URLs" for concurrent processing
5. **Copy & Share**: Use the generated short URLs immediately

### Accessing Short URLs

- **Direct Access**: Visit `http://localhost:3000/{shortcode}`
- **Automatic Redirect**: 3-second countdown with manual override option
- **Click Tracking**: Each access is logged with timestamp and metadata
- **Expiry Handling**: Expired URLs show appropriate error messages

### Viewing Analytics

1. **Navigate to Statistics page**
2. **Overview Dashboard**: View total URLs, clicks, and performance metrics
3. **Detailed Analytics**: 
   - Recent click activity
   - Geographic distribution (simulated)
   - URL status and performance
4. **URL Management**: Copy, open, or generate QR codes for active URLs

## 🔐 Security Features

- **Client-side Validation**: Input sanitization and validation
- **Expiry Management**: Automatic URL expiration handling
- **Reserved Words**: Prevention of system shortcode conflicts
- **Safe Redirects**: User warning before external redirects
- **Error Boundaries**: Graceful error handling and recovery

## 📊 Logging Implementation

### Custom Logging Middleware

The application uses a custom-built logging middleware that:

- **Sends logs to test server**: http://20.244.56.144/evaluation-service/logs
- **Categorizes by package**: api, component, page, state, utils, auth, config, middleware
- **Includes retry logic**: 3 attempts with exponential backoff
- **Provides type safety**: Full TypeScript support with interfaces
- **Supports multiple stacks**: Frontend and backend logging

### Logging Categories

- **API Calls**: All HTTP requests and responses
- **User Actions**: Button clicks, form submissions, navigation
- **Page Events**: Load times, component mounting
- **Errors**: Caught exceptions with context
- **State Changes**: Data updates and storage operations
- **Performance**: Timing metrics and optimization data

## 🎯 Key Implementation Details

### URL Shortening Logic

```typescript
// Unique shortcode generation with collision prevention
const generateShortCode = (usedCodes: string[] = [], length: number = 6): string => {
  // Implementation with retry logic for uniqueness
};

// URL expiry validation
const isUrlExpired = (expiresAt: Date): boolean => {
  return new Date() > new Date(expiresAt);
};
```

### Client-side Routing

```typescript
// Dynamic route handling for short URLs
const isShortUrlPath = location.pathname.length > 1 && 
  !location.pathname.startsWith('/statistics') && 
  !location.pathname.startsWith('/shortener');
```

### Data Persistence

```typescript
// Custom localStorage hook with cross-tab synchronization
const [shortUrls, setShortUrls] = useLocalStorage<ShortUrl[]>('shortUrls', []);
```

## 🧪 Testing the Application

### Manual Testing Scenarios

1. **URL Creation**: Test with various URL formats and validity periods
2. **Concurrent Processing**: Create multiple URLs simultaneously
3. **Custom Shortcodes**: Test valid and invalid shortcode patterns
4. **Expiry Handling**: Create short-lived URLs and test expiration
5. **Click Tracking**: Access short URLs and verify analytics
6. **Error Scenarios**: Test invalid URLs, expired links, and network issues

### Validation Features

- **Real-time URL validation**: Immediate feedback on URL format
- **Shortcode validation**: Character restrictions and uniqueness checks
- **Form validation**: Required fields and format checking
- **Error boundaries**: Graceful handling of unexpected errors

## 📈 Performance Considerations

- **Concurrent Processing**: Up to 5 URLs processed simultaneously
- **Client-side Storage**: Efficient localStorage with serialization
- **Lazy Loading**: Components loaded on demand
- **Optimized Re-renders**: React memo and callback optimization
- **Debounced Validation**: Reduced API calls during input

## 🔮 Future Enhancements

- **Backend Integration**: Real API server for URL storage
- **User Authentication**: Account-based URL management
- **Advanced Analytics**: Geographic data, device information
- **Custom Domains**: Support for branded short URLs
- **Bulk Operations**: CSV import/export functionality
- **URL Preview**: Safe preview before redirect

## 📄 License

This project is part of an evaluation submission and is intended for educational and assessment purposes only.

---

**Note**: This application runs entirely on the client-side using localStorage for data persistence. All shortened URLs are stored locally in the browser and will persist across sessions until manually cleared. 