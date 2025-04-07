/**
 * Utility function to detect links in text content
 * 
 * @param text The text content to check for links
 * @returns Boolean indicating whether the text contains links
 */
export function detectLinks(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  try {
    // Regular expression to detect URLs
    // This regex matches common URL patterns including:
    // - http/https protocols
    // - www. prefixed domains
    // - Common TLDs (.com, .org, .net, etc.)
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    
    return urlRegex.test(text);
  } catch (error) {
    // Log error and return false to avoid false positives in case of regex failure
    console.error('Error in link detection:', error);
    return false;
  }
}

/**
 * Extract all links from text content
 * 
 * @param text The text content to extract links from
 * @returns Array of links found in the text
 */
export function extractLinks(text: string): string[] {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    
    return text.match(urlRegex) || [];
  } catch (error) {
    console.error('Error extracting links:', error);
    return [];
  }
}
