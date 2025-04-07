import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Comment } from '../types';
import { useAuth } from './AuthContext';
import { usePosts } from './PostContext';
import { generateCommentUrl } from '../utils/urlUtils';

interface CommentContextType {
  comments: Comment[];
  createComment: (postId: string, content: string, parentId?: string) => void;
  deleteComment: (commentId: string) => void;
  editComment: (commentId: string, content: string) => void;
  likeComment: (commentId: string) => void;
  unlikeComment: (commentId: string) => void;
  getPostComments: (postId: string) => Comment[];
  getCommentReplies: (commentId: string) => Comment[];
  getUserComments: (userId: string) => Comment[];
  getUserRepostedComments: (userId: string) => Comment[];
  getComment: (commentId: string) => Comment | undefined;
  getCommentByUrlId: (urlId: string) => Comment | undefined;
}

const CommentContext = createContext<CommentContextType | undefined>(undefined);

const MAX_CHARACTERS = 67;

export function CommentProvider({ children }: { children: ReactNode }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const { currentUser } = useAuth();
  const { createCommentRepost, hasReposted, posts } = usePosts();

  useEffect(() => {
    // Load comments from localStorage
    const savedComments = localStorage.getItem('comments');
    if (savedComments) {
      // Convert old comments structure to new structure if needed
      const parsedComments = JSON.parse(savedComments);
      
      // Check if comments have the new fields and add them if they don't
      const updatedComments = parsedComments.map((comment: any) => ({
        ...comment,
        likes: comment.likes || [],
        isRepost: comment.isRepost || false,
        originalCommentId: comment.originalCommentId || undefined,
        parentId: comment.parentId || undefined
      }));
      
      setComments(updatedComments);
    }
  }, []);

  const saveComments = (updatedComments: Comment[]) => {
    setComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
  };

  const createComment = (postId: string, content: string, parentId?: string) => {
    if (!currentUser) return;
    
    // Validate content length
    if (content.length > MAX_CHARACTERS) {
      throw new Error(`Comment exceeds maximum length of ${MAX_CHARACTERS} characters`);
    }
    
    const newComment: Comment = {
      id: Date.now().toString(),
      content,
      authorId: currentUser.id,
      postId,
      createdAt: new Date().toISOString(),
      likes: [],
      parentId
    };
    
    const updatedComments = [...comments, newComment];
    saveComments(updatedComments);
  };

  const deleteComment = (commentId: string) => {
    if (!currentUser) return;
    
    // Get all child comments (replies to this comment)
    const childComments = comments.filter(comment => comment.parentId === commentId);
    
    // Delete the comment and all its child comments
    const commentIdsToDelete = [commentId, ...childComments.map(c => c.id)];
    
    const updatedComments = comments.filter(comment => 
      !commentIdsToDelete.includes(comment.id) || 
      (commentIdsToDelete.includes(comment.id) && comment.authorId !== currentUser.id)
    );
    
    saveComments(updatedComments);
  };

  const editComment = (commentId: string, content: string) => {
    if (!currentUser) return;
    
    // Validate content length
    if (content.length > MAX_CHARACTERS) {
      throw new Error(`Comment exceeds maximum length of ${MAX_CHARACTERS} characters`);
    }
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId && comment.authorId === currentUser.id) {
        return {
          ...comment,
          content
        };
      }
      return comment;
    });
    
    saveComments(updatedComments);
  };

  const likeComment = (commentId: string) => {
    if (!currentUser) return;
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId && !comment.likes.includes(currentUser.id)) {
        return {
          ...comment,
          likes: [...comment.likes, currentUser.id]
        };
      }
      return comment;
    });
    
    saveComments(updatedComments);
  };

  const unlikeComment = (commentId: string) => {
    if (!currentUser) return;
    
    const updatedComments = comments.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.likes.filter(id => id !== currentUser.id)
        };
      }
      return comment;
    });
    
    saveComments(updatedComments);
  };

  const getPostComments = (postId: string) => {
    // Return only top-level comments (no parentId) for this specific post ID
    return comments
      .filter(comment => comment.postId === postId && !comment.parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getCommentReplies = (commentId: string) => {
    return comments
      .filter(comment => comment.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const getUserComments = (userId: string) => {
    return comments
      .filter(comment => comment.authorId === userId && !comment.isRepost)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getUserRepostedComments = (userId: string) => {
    return comments
      .filter(comment => comment.authorId === userId && comment.isRepost)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const getComment = (commentId: string) => {
    return comments.find(comment => comment.id === commentId);
  };

  // Get a comment by its URL ID
  const getCommentByUrlId = (urlId: string) => {
    for (const comment of comments) {
      if (generateCommentUrl(comment.id) === urlId) {
        return comment;
      }
    }
    return undefined;
  };

  return (
    <CommentContext.Provider value={{ 
      comments, 
      createComment, 
      deleteComment,
      editComment,
      likeComment,
      unlikeComment,
      getPostComments,
      getCommentReplies,
      getUserComments,
      getUserRepostedComments,
      getComment,
      getCommentByUrlId
    }}>
      {children}
    </CommentContext.Provider>
  );
}

export function useComments() {
  const context = useContext(CommentContext);
  if (context === undefined) {
    throw new Error('useComments must be used within a CommentProvider');
  }
  return context;
}
