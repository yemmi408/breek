import { useState, useEffect } from 'react';

/**
 * A hook for reading and writing to localStorage with type safety and error handling
 * 
 * @param key The localStorage key
 * @param initialValue The default value to use if no value exists in localStorage
 * @returns A stateful value and a function to update it
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Read initial value from localStorage or use provided initialValue
  const readValue = (): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
      
      // Dispatch a custom event so other instances can update
      window.dispatchEvent(new Event('local-storage-change'));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };
    
    // Also respond to our custom event for non-storage changes
    const handleLocalChange = () => {
      setStoredValue(readValue());
    };

    // Listen for storage events and our custom event
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleLocalChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleLocalChange);
    };
  }, [key]);

  return [storedValue, setValue];
}
