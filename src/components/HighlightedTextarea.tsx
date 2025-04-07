import React from 'react';

interface HighlightedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

/**
 * A simplified textarea component (previously used to highlight URLs)
 */
export function HighlightedTextarea({
  value,
  onChange,
  placeholder = '',
  rows = 3,
  className = ''
}: HighlightedTextareaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <textarea
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full p-2 resize-none border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-blue-500 focus:border-blue-500 outline-none text-black dark:text-white bg-transparent ${className}`}
    />
  );
}
