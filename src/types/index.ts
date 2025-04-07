export interface Post {
  id: string;
  authorId: string;
  content: string;
  mediaUrl?: string;
  createdAt: string;
  likes: string[];
  comments?: Comment[];
  isRepost?: boolean;
  originalPostId?: string;
  isQuote?: boolean;
  quoteContent?: string;
  isCommentRepost?: boolean;
  originalCommentId?: string;
  originalAuthorId?: string;
  isReplyRepost?: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likes: string[];
}

export interface User {
  id: string;
  username: string;
  displayName: string;
  bio?: string;
  avatar?: string;
  email: string;
  createdAt: string;
  following: string[];
} 