import { useState, useEffect } from 'react';
import { logStorageOperation, logError } from '../utils/logger';

/**
 * Custom hook for managing localStorage with React state synchronization
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        logStorageOperation('read', key, true);
        return parsed;
      } else {
        logStorageOperation('read', key, false);
        return initialValue;
      }
    } catch (error) {
      logError(error as Error, `useLocalStorage read for key: ${key}`);
      logStorageOperation('read', key, false);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        logStorageOperation('write', key, true);
      }
    } catch (error) {
      logError(error as Error, `useLocalStorage write for key: ${key}`);
      logStorageOperation('write', key, false);
    }
  };

  // Listen for changes in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue);
          setStoredValue(newValue);
          logStorageOperation('sync', key, true);
        } catch (error) {
          logError(error as Error, `useLocalStorage sync for key: ${key}`);
          logStorageOperation('sync', key, false);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

/**
 * Hook for managing localStorage without React state (one-time operations)
 */
export function useLocalStorageOperations() {
  const getItem = <T>(key: string, defaultValue?: T): T | null => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        const parsed = JSON.parse(item);
        logStorageOperation('read', key, true);
        return parsed;
      }
      logStorageOperation('read', key, false);
      return defaultValue || null;
    } catch (error) {
      logError(error as Error, `localStorage getItem for key: ${key}`);
      logStorageOperation('read', key, false);
      return defaultValue || null;
    }
  };

  const setItem = <T>(key: string, value: T): boolean => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      logStorageOperation('write', key, true);
      return true;
    } catch (error) {
      logError(error as Error, `localStorage setItem for key: ${key}`);
      logStorageOperation('write', key, false);
      return false;
    }
  };

  const removeItem = (key: string): boolean => {
    try {
      window.localStorage.removeItem(key);
      logStorageOperation('delete', key, true);
      return true;
    } catch (error) {
      logError(error as Error, `localStorage removeItem for key: ${key}`);
      logStorageOperation('delete', key, false);
      return false;
    }
  };

  const clear = (): boolean => {
    try {
      window.localStorage.clear();
      logStorageOperation('clear', 'all', true);
      return true;
    } catch (error) {
      logError(error as Error, 'localStorage clear');
      logStorageOperation('clear', 'all', false);
      return false;
    }
  };

  return {
    getItem,
    setItem,
    removeItem,
    clear
  };
} 