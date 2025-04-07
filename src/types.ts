export interface User {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatar: string;
  createdAt: string;
  following: string[]; // Array of user IDs
  email?: string; // Email address (required for Google auth)
  authProvider?: 'google' | 'local'; // Authentication provider
}

export interface Post {
  id: string;
  content: string;
  authorId: string;
  createdAt: string;
  likes: string[]; // Array of user IDs who liked the post
  isRepost?: boolean;
  originalPostId?: string;
  isCommentRepost?: boolean; // Indicates this post is a reposted comment
  originalCommentId?: string; // ID of the original comment if this is a comment repost
  originalAuthorId?: string; // ID of the original author of the content
  isReplyRepost?: boolean; // Indicates if this is a reposted reply
  isQuote?: boolean; // Indicates if this is a quote post
  quoteContent?: string; // The added quote content if this is a quote
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  postId: string;
  createdAt: string;
  likes: string[]; // Array of user IDs who liked the comment
  parentId?: string; // ID of parent comment (for replies)
  isRepost?: boolean;
  originalCommentId?: string;
}
