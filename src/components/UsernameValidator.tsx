import { useState, useEffect } from 'react';

interface UsernameValidatorProps {
  username: string;
  setIsValid: (isValid: boolean) => void;
  showErrors?: boolean;
}

export function UsernameValidator({ 
  username, 
  setIsValid,
  showErrors = true 
}: UsernameValidatorProps) {
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    const newErrors: string[] = [];
    
    // Check length
    if (username.length < 4) {
      newErrors.push('Username must be at least 4 characters');
    }
    
    if (username.length > 15) {
      newErrors.push('Username must be at most 15 characters');
    }
    
    // Check allowed characters
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.push('Username can only contain letters, numbers, and underscores');
    }
    
    // Check for spaces
    if (username.includes(' ')) {
      newErrors.push('Username cannot contain spaces');
    }
    
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [username, setIsValid]);
  
  if (!showErrors || errors.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-1 text-xs text-red-500">
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export function DisplayNameValidator({ 
  displayName, 
  setIsValid,
  showErrors = true 
}: { 
  displayName: string, 
  setIsValid: (isValid: boolean) => void,
  showErrors?: boolean 
}) {
  const [errors, setErrors] = useState<string[]>([]);
  
  useEffect(() => {
    const newErrors: string[] = [];
    
    // Check length
    if (displayName.length > 50) {
      newErrors.push('Display name must be at most 50 characters');
    }
    
    // Check if empty
    if (displayName.trim().length === 0) {
      newErrors.push('Display name cannot be empty');
    }
    
    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
  }, [displayName, setIsValid]);
  
  if (!showErrors || errors.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-1 text-xs text-red-500">
      <ul className="space-y-1">
        {errors.map((error, index) => (
          <li key={index}>{error}</li>
        ))}
      </ul>
    </div>
  );
}

export function validateUsername(username: string): boolean {
  return username.length >= 4 && 
         username.length <= 15 && 
         /^[a-zA-Z0-9_]+$/.test(username) && 
         !username.includes(' ');
}

export function validateDisplayName(displayName: string): boolean {
  return displayName.trim().length > 0 && displayName.length <= 50;
}
