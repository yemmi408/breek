import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

/**
 * A component for lazily loading images with fallback and placeholder
 */
export function LazyImage({
  src,
  alt,
  fallbackSrc = 'https://mocha-cdn.com/0195fd7e-1b9e-7cbc-a8e0-71cf7ffa78e8/-.png',
  className = '',
  placeholderClassName = '',
  onLoad,
  onError
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);
  const imageRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    setImageSrc(src);
  }, [src]);

  useEffect(() => {
    const currentImageRef = imageRef.current;
    
    if (!currentImageRef) return;

    // Create intersection observer to load image when it enters viewport
    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        // Start loading the real image
        const img = new Image();
        img.src = src;
        
        img.onload = () => {
          setIsLoaded(true);
          if (onLoad) onLoad();
        };
        
        img.onerror = () => {
          setError(true);
          setImageSrc(fallbackSrc);
          if (onError) onError();
        };
        
        // Disconnect observer after image starts loading
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    }, {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    });

    observerRef.current.observe(currentImageRef);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, fallbackSrc, onLoad, onError]);

  return (
    <>
      {/* Show placeholder during loading */}
      {!isLoaded && (
        <div className={`${placeholderClassName || className} bg-gray-200 dark:bg-gray-700 animate-pulse`}></div>
      )}
      
      {/* The actual image */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt={alt}
        className={`${className} ${isLoaded ? 'block' : 'hidden'}`}
        onError={() => {
          if (!error) {
            setError(true);
            setImageSrc(fallbackSrc);
            if (onError) onError();
          }
        }}
      />
    </>
  );
}
