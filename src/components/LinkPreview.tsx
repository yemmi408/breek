import { ExternalLink } from 'lucide-react';
import { useState } from 'react';

interface LinkPreviewProps {
  url: string;
  preview: {
    title: string;
    description: string;
    image: string;
  };
}

export function LinkPreview({ url, preview }: LinkPreviewProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      {preview.image && (
        <div className="aspect-video relative">
          <img 
            src={preview.image} 
            alt={preview.title || "Link preview"} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold">{preview.title}</h3>
        <p className="text-sm text-gray-600">{preview.description}</p>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
          {url}
        </a>
      </div>
    </div>
  );
}
