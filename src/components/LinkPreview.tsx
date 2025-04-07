import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface LinkPreviewProps {
  url: string;
  preview: {
    title: string;
    description?: string;
    image: string;
    domain: string;
  };
}

export function LinkPreview({ url, preview }: LinkPreviewProps) {
  const [imageError, setImageError] = useState(false);
  
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      onClick={(e) => e.stopPropagation()}
      className="block mt-2 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:bg-gray-50 dark:hover:bg-gray-800 transition"
    >
      <div className="w-full h-40 overflow-hidden">
        <img 
          src={preview.image} 
          alt={preview.title || "Link preview"} 
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      </div>
      
      <div className="p-3">
        <h3 className="text-sm font-medium text-black dark:text-white line-clamp-2 mb-1">
          {preview.title}
        </h3>
        
        <div className="flex items-center text-gray-500 text-xs">
          <span>Learn more from {preview.domain}</span>
          <ExternalLink size={12} className="ml-1" />
        </div>
      </div>
    </a>
  );
}
