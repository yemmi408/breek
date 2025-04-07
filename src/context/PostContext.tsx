import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from 'react';
import { Post } from '../types';
import { useAuth } from './AuthContext';
import { generatePostUrl } from '../utils/urlUtils';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface PostContextType {
  posts: Post[];
  createPost: (content: string) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, content: string) => void;
  likePost: (postId: string) => void;
  unlikePost: (postId: string) => void;
  repostPost: (postId: string) => void;
  unrepostPost: (postId: string) => void;
  unquotePost: (postId: string) => void;
  createCommentRepost: (commentId: string, content: string, authorId: string, originalAuthorId: string, isReply: boolean) => void;
  createQuoteRepost: (postId: string, quoteContent: string) => void;
  getUserPosts: (userId: string) => Post[];
  getLikedPosts: (userId: string) => Post[];
  getRepostedPosts: (userId: string) => Post[];
  getFeedPosts: () => Post[];
  getPost: (postId: string) => Post | null;
  getPostByUrlId: (urlId: string) => Post | null;
  hasReposted: (contentId: string, isComment?: boolean) => boolean;
  hasQuoted: (contentId: string) => boolean;
  getUserQuoteOfPost: (postId: string) => Post | null;
  isUserOwnRepost: (postId: string) => boolean;
  isUserOwnQuote: (postId: string) => boolean;
}

const PostContext = createContext<PostContextType | undefined>(undefined);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useLocalStorage<Post[]>('posts', []);
  const { currentUser } = useAuth();

  // Create a new post
  const createPost = useCallback((content: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to create a post');
    }
    
    const newPost: Post = {
      id: Date.now().toString(),
      content: content.trim(),
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: [],
    };
    
    setPosts(prevPosts => [newPost, ...prevPosts]);
  }, [currentUser, setPosts]);

  // Delete a post
  const deletePost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to delete a post');
    }
    
    setPosts(prevPosts => {
      const postToDelete = prevPosts.find(post => post.id === postId);
      if (!postToDelete) {
        throw new Error('Post not found');
      }
      
      if (postToDelete.authorId !== currentUser.id) {
        throw new Error('You can only delete your own posts');
      }
      
      // Delete the original post and any reposts of it
      return prevPosts.filter(post => 
        (post.id !== postId && !(post.isRepost && post.originalPostId === postId)) || 
        (post.id === postId && post.authorId !== currentUser.id)
      );
    });
  }, [currentUser, setPosts]);

  // Edit a post
  const editPost = useCallback((postId: string, content: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to edit a post');
    }
    
    setPosts(prevPosts => {
      const postToEdit = prevPosts.find(post => post.id === postId);
      if (!postToEdit) {
        throw new Error('Post not found');
      }
      
      if (postToEdit.authorId !== currentUser.id) {
        throw new Error('You can only edit your own posts');
      }
      
      // Check if content exceeds character limit
      if (content.length > 67) {
        throw new Error('Post content exceeds maximum length (67 characters)');
      }
      
      return prevPosts.map(post => {
        if (post.id === postId && post.authorId === currentUser.id) {
          return {
            ...post,
            content: content.trim(),
          };
        }
        return post;
      });
    });
  }, [currentUser, setPosts]);

  // Like a post
  const likePost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to like a post');
    }
    
    setPosts(prevPosts => {
      const postToLike = prevPosts.find(post => post.id === postId);
      if (!postToLike) {
        throw new Error('Post not found');
      }
      
      // Don't add duplicate like
      if (postToLike.likes.includes(currentUser.id)) {
        return prevPosts;
      }
      
      return prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: [...post.likes, currentUser.id],
          };
        }
        return post;
      });
    });
  }, [currentUser, setPosts]);

  // Unlike a post
  const unlikePost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to unlike a post');
    }
    
    setPosts(prevPosts => {
      const postToUnlike = prevPosts.find(post => post.id === postId);
      if (!postToUnlike) {
        throw new Error('Post not found');
      }
      
      // Only remove like if it exists
      if (!postToUnlike.likes.includes(currentUser.id)) {
        return prevPosts;
      }
      
      return prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes: post.likes.filter(id => id !== currentUser.id),
          };
        }
        return post;
      });
    });
  }, [currentUser, setPosts]);

  // Check if the current user has already reposted a specific post or comment
  const hasReposted = useCallback((contentId: string, isComment: boolean = false) => {
    if (!currentUser) return false;
    
    return posts.some(post => {
      if (isComment) {
        return post.isRepost && 
               post.originalCommentId === contentId && 
               post.authorId === currentUser.id;
      } else {
        return post.isRepost && 
               !post.isQuote &&
               post.originalPostId === contentId && 
               post.authorId === currentUser.id;
      }
    });
  }, [currentUser, posts]);

  // Check if the current user has already quoted a specific post
  const hasQuoted = useCallback((contentId: string) => {
    if (!currentUser) return false;
    
    return posts.some(post => 
      post.isQuote && 
      post.originalPostId === contentId && 
      post.authorId === currentUser.id
    );
  }, [currentUser, posts]);

  // Get the user's quote of a specific post
  const getUserQuoteOfPost = useCallback((postId: string) => {
    if (!currentUser) return null;
    
    const userQuote = posts.find(post => 
      post.isQuote && 
      post.originalPostId === postId && 
      post.authorId === currentUser.id
    );
    
    return userQuote || null;
  }, [currentUser, posts]);

  // Find the user's repost of a specific post
  const findUserRepost = useCallback((originalPostId: string) => {
    if (!currentUser) return null;
    
    return posts.find(post => 
      post.isRepost && 
      post.originalPostId === originalPostId && 
      post.authorId === currentUser.id
    );
  }, [currentUser, posts]);

  // Check if a post is the user's own repost
  const isUserOwnRepost = useCallback((postId: string): boolean => {
    if (!currentUser) return false;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    
    // Check if this is a repost made by the current user
    return Boolean(post.isRepost && post.authorId === currentUser.id);
  }, [currentUser, posts]);

  // Check if a post is the user's own quote
  const isUserOwnQuote = useCallback((postId: string): boolean => {
    if (!currentUser) return false;
    
    const post = posts.find(p => p.id === postId);
    if (!post) return false;
    
    // Check if this is a quote made by the current user
    return Boolean(post.isQuote && post.authorId === currentUser.id);
  }, [currentUser, posts]);

  // Undo a repost
  const unrepostPost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to undo a repost');
    }
    
    setPosts(prevPosts => {
      const post = prevPosts.find(p => p.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      let targetPostId: string;
      
      if (post.isRepost) {
        // If this is a repost, remove this specific repost
        if (post.authorId !== currentUser.id) {
          throw new Error('You can only undo your own reposts');
        }
        targetPostId = post.id;
      } else {
        // If this is an original post, find and remove the user's repost of it
        const userRepost = prevPosts.find(p => 
          p.isRepost && 
          p.originalPostId === postId && 
          p.authorId === currentUser.id
        );
        
        if (!userRepost) {
          throw new Error('You have not reposted this post');
        }
        
        targetPostId = userRepost.id;
      }
      
      // Remove the repost
      return prevPosts.filter(p => p.id !== targetPostId);
    });
  }, [currentUser, setPosts]);

  // Undo a quote (remove the quote post)
  const unquotePost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to unquote');
    }
    
    setPosts(prevPosts => {
      const post = prevPosts.find(p => p.id === postId);
      const userQuote = post && !post.isQuote 
        ? getUserQuoteOfPost(postId) 
        : (post?.isQuote && post.authorId === currentUser.id) ? post : null;

      if (!userQuote) {
        throw new Error('No quote found to remove');
      }
      
      // Check if user owns this quote
      if (userQuote.authorId !== currentUser.id) {
        throw new Error('You can only unquote your own quotes');
      }
      
      // Remove the quote post
      return prevPosts.filter(p => p.id !== userQuote.id);
    });
  }, [currentUser, setPosts, getUserQuoteOfPost]);

  // Repost a post
  const repostPost = useCallback((postId: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to repost');
    }
    
    setPosts(prevPosts => {
      const post = prevPosts.find(p => p.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Check if user already reposted this
      const alreadyReposted = prevPosts.some(p => 
        p.isRepost && 
        !p.isQuote &&
        p.originalPostId === postId && 
        p.authorId === currentUser.id
      );
      
      if (alreadyReposted) {
        throw new Error('You have already reposted this');
      }
      
      // Check if they're trying to repost their own repost
      if (post.isRepost && post.authorId === currentUser.id) {
        throw new Error("You can't repost your own repost");
      }
      
      // Determine the actual original post ID to prevent chains of reposts
      // If it's a repost, use the original post ID instead of creating a repost of a repost
      const originalPostId = post.isRepost ? post.originalPostId : postId;
      
      // Check if user has already reposted the original content
      const repostedOriginal = prevPosts.some(p => 
        p.isRepost && 
        !p.isQuote &&
        p.originalPostId === originalPostId && 
        p.authorId === currentUser.id
      );
      
      if (repostedOriginal) {
        throw new Error('You have already reposted the original content');
      }
      
      const newRepost: Post = {
        id: Date.now().toString(),
        content: post.content,
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        likes: [],
        isRepost: true,
        originalPostId,
      };
      
      return [newRepost, ...prevPosts];
    });
  }, [currentUser, setPosts]);

  // Create a quote repost
  const createQuoteRepost = useCallback((postId: string, quoteContent: string) => {
    if (!currentUser) {
      throw new Error('You must be logged in to quote a post');
    }
    
    setPosts(prevPosts => {
      const post = prevPosts.find(p => p.id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      // Don't allow quoting a quote post
      if (post.isQuote) {
        throw new Error("You can't quote a quote post");
      }
      
      // Determine the actual original post ID
      const originalPostId = post.isRepost ? post.originalPostId : postId;
      
      // Check if user already quoted this post
      const existingQuote = prevPosts.find(p => 
        p.isQuote &&
        p.originalPostId === originalPostId && 
        p.authorId === currentUser.id
      );
      
      if (existingQuote) {
        throw new Error("You've already quoted this post");
      }
      
      const newQuote: Post = {
        id: Date.now().toString(),
        content: post.content,
        quoteContent: quoteContent.trim(),
        authorId: currentUser.id,
        createdAt: new Date().toISOString(),
        likes: [],
        isRepost: true,
        isQuote: true,
        originalPostId,
      };
      
      return [newQuote, ...prevPosts];
    });
  }, [currentUser, setPosts]);

  // Create a repost for a comment (appears as a post)
  const createCommentRepost = useCallback((
    commentId: string, 
    content: string, 
    authorId: string, 
    originalAuthorId: string,
    isReply: boolean
  ) => {
    if (!currentUser) {
      throw new Error('You must be logged in to repost');
    }
    
    // Check if user already reposted this comment
    const alreadyReposted = posts.some(post => 
      post.isRepost && 
      post.isCommentRepost &&
      post.originalCommentId === commentId && 
      post.authorId === currentUser.id
    );
    
    if (alreadyReposted) {
      throw new Error('You have already reposted this comment');
    }
    
    // Check if they're trying to repost their own repost
    const existingRepost = posts.find(post => 
      post.isRepost && 
      post.isCommentRepost &&
      post.originalCommentId === commentId &&
      post.authorId === currentUser.id
    );
    
    if (existingRepost) {
      throw new Error("You can't repost your own repost");
    }
    
    const newRepost: Post = {
      id: Date.now().toString(),
      content: content,
      authorId: currentUser.id,
      createdAt: new Date().toISOString(),
      likes: [],
      isRepost: true,
      isCommentRepost: true,
      originalCommentId: commentId,
      originalAuthorId: originalAuthorId,
      isReplyRepost: isReply
    };
    
    setPosts(prevPosts => [newRepost, ...prevPosts]);
    return newRepost;
  }, [currentUser, setPosts, posts]);

  // Get posts by a specific user
  const getUserPosts = useCallback((userId: string) => {
    if (!userId) return [];
    
    return posts
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  // Get posts liked by a specific user
  const getLikedPosts = useCallback((userId: string) => {
    if (!userId) return [];
    
    return posts
      .filter(post => post.likes.includes(userId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  // Get posts reposted by a specific user
  const getRepostedPosts = useCallback((userId: string) => {
    if (!userId) return [];
    
    return posts
      .filter(post => post.authorId === userId && post.isRepost)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts]);

  // Get feed posts for the current user
  const getFeedPosts = useCallback(() => {
    if (!currentUser) return [];
    
    // Get posts from users the current user follows and their own posts
    return posts
      .filter(post => 
        post.authorId === currentUser.id || 
        currentUser.following.includes(post.authorId)
      )
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [currentUser, posts]);

  // Get a specific post by ID
  const getPost = useCallback((postId: string) => {
    if (!postId) return null;
    return posts.find(post => post.id === postId) || null;
  }, [posts]);

  // Get a post by its URL ID
  const getPostByUrlId = useCallback((urlId: string) => {
    if (!urlId) return null;
    
    for (const post of posts) {
      if (generatePostUrl(post.id) === urlId) {
        return post;
      }
    }
    return null;
  }, [posts]);

  // Create a memoized value for the context to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    posts,
    createPost,
    deletePost,
    editPost,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    unquotePost,
    createCommentRepost,
    createQuoteRepost,
    getUserPosts,
    getLikedPosts,
    getRepostedPosts,
    getFeedPosts,
    getPost,
    getPostByUrlId,
    hasReposted,
    hasQuoted,
    getUserQuoteOfPost,
    isUserOwnRepost,
    isUserOwnQuote,
  }), [
    posts,
    createPost,
    deletePost,
    editPost,
    likePost,
    unlikePost,
    repostPost,
    unrepostPost,
    unquotePost,
    createCommentRepost,
    createQuoteRepost,
    getUserPosts,
    getLikedPosts,
    getRepostedPosts,
    getFeedPosts,
    getPost,
    getPostByUrlId,
    hasReposted,
    hasQuoted,
    getUserQuoteOfPost,
    isUserOwnRepost,
    isUserOwnQuote,
  ]);

  return (
    <PostContext.Provider value={contextValue}>
      {children}
    </PostContext.Provider>
  );
}

export function usePosts() {
  const context = useContext(PostContext);
  if (context === undefined) {
    throw new Error('usePosts must be used within a PostProvider');
  }
  return context;
}
