// Simple test to verify logging functionality
import { initializeLogger, logUserAction, logPageLoad } from '../utils/logger';

// Initialize the logger
const logger = initializeLogger();

// Test basic logging functionality
console.log('Testing logging functionality...');

// Test page load logging
logPageLoad('TestPage', 123);

// Test user action logging
logUserAction('test_action', { testData: 'success' });

// Test direct logger methods
logger.info('component', 'Direct logger test - info level');
logger.error('api', 'Direct logger test - error level');
logger.debug('utils', 'Direct logger test - debug level');

console.log('Logging tests completed. Check network tab for API calls to the logging server.'); 