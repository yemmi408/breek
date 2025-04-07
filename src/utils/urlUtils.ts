/**
 * Utility functions for handling post and comment URLs
 */

/**
 * Converts a post ID to a URL-friendly format
 * @param postId The original post ID
 * @returns A URL-friendly ID in the format 0x67{alphanumeric}
 */
export function generatePostUrl(postId: string): string {
  // Use the original ID to create a deterministic URL-friendly ID
  // This ensures the same post always gets the same URL
  const idHash = postId.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0);
  
  // Convert to hexadecimal and take a portion to create the alphanumeric part
  const hexString = Math.abs(idHash).toString(16).substring(0, 8);
  
  return `0x67${hexString}`;
}

/**
 * Converts a comment ID to a URL-friendly format
 * @param commentId The original comment ID
 * @returns A URL-friendly ID in the format 0x67{alphanumeric}
 */
export function generateCommentUrl(commentId: string): string {
  // Use the original ID to create a deterministic URL-friendly ID
  // Similar to generatePostUrl but with a different seed to avoid collisions
  const idHash = commentId.split('').reduce((hash, char) => {
    return ((hash << 5) - hash) + char.charCodeAt(0) | 0;
  }, 0) ^ 0xc0de; // XOR with a magic number to create different patterns from post URLs
  
  // Convert to hexadecimal and take a portion to create the alphanumeric part
  const hexString = Math.abs(idHash).toString(16).substring(0, 8);
  
  return `0x67${hexString}`;
}

/**
 * Retrieves the original post ID from a URL parameter
 * @param urlParam The URL parameter (0x67{alphanumeric})
 * @param posts Array of posts to search
 * @returns The original post ID or null if not found
 */
export function getPostIdFromUrl(urlParam: string, posts: any[]): string | null {
  // Validate format
  if (!urlParam || !urlParam.startsWith('0x67') || urlParam.length < 10) {
    return null;
  }
  
  // Find the post with this URL
  for (const post of posts) {
    if (generatePostUrl(post.id) === urlParam) {
      return post.id;
    }
  }
  
  return null;
}

/**
 * Retrieves the original comment ID from a URL parameter
 * @param urlParam The URL parameter (0x67{alphanumeric})
 * @param comments Array of comments to search
 * @returns The original comment ID or null if not found
 */
export function getCommentIdFromUrl(urlParam: string, comments: any[]): string | null {
  // Validate format
  if (!urlParam || !urlParam.startsWith('0x67') || urlParam.length < 10) {
    return null;
  }
  
  // Find the comment with this URL
  for (const comment of comments) {
    if (generateCommentUrl(comment.id) === urlParam) {
      return comment.id;
    }
  }
  
  return null;
}
