import { User, Post, Comment } from '../types';
import { AppError, ErrorCode } from '../utils/errorHandling';

/**
 * Base API service for managing localStorage data with improved error handling and type safety
 */
class ApiService {
  /**
   * Safely retrieve data from localStorage
   */
  protected getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : fallback;
    } catch (error) {
      console.error(`Error retrieving ${key} from localStorage:`, error);
      return fallback;
    }
  }

  /**
   * Safely store data in localStorage
   */
  protected setItem<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error storing ${key} in localStorage:`, error);
      throw new AppError(`Failed to save data to local storage`, ErrorCode.DATA_STORAGE_FAILED);
    }
  }

  /**
   * Generate a unique ID for new records
   */
  protected generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}

/**
 * User-related API services
 */
export class UserService extends ApiService {
  private readonly STORAGE_KEY = 'users';

  /**
   * Get all users
   */
  getUsers(): User[] {
    return this.getItem<User[]>(this.STORAGE_KEY, []);
  }

  /**
   * Get user by ID
   */
  getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.id === id);
  }

  /**
   * Get user by username
   */
  getUserByUsername(username: string): User | undefined {
    const users = this.getUsers();
    return users.find(user => user.username === username);
  }

  /**
   * Update a user's information
   */
  updateUser(id: string, updates: Partial<User>): User {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);

    if (userIndex === -1) {
      throw new AppError('User not found', ErrorCode.DATA_NOT_FOUND);
    }

    // Update the user
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    this.setItem(this.STORAGE_KEY, users);
    return updatedUser;
  }

  /**
   * Follow a user
   */
  followUser(currentUserId: string, targetUserId: string): void {
    const users = this.getUsers();
    const currentUserIndex = users.findIndex(user => user.id === currentUserId);

    if (currentUserIndex === -1) {
      throw new AppError('Current user not found', ErrorCode.DATA_NOT_FOUND);
    }

    if (currentUserId === targetUserId) {
      throw new AppError('Cannot follow yourself', ErrorCode.OPERATION_INVALID);
    }

    // Check if target user exists
    if (!users.some(user => user.id === targetUserId)) {
      throw new AppError('Target user not found', ErrorCode.DATA_NOT_FOUND);
    }

    // Update following list if not already following
    if (!users[currentUserIndex].following.includes(targetUserId)) {
      users[currentUserIndex].following.push(targetUserId);
      this.setItem(this.STORAGE_KEY, users);
    }
  }

  /**
   * Unfollow a user
   */
  unfollowUser(currentUserId: string, targetUserId: string): void {
    const users = this.getUsers();
    const currentUserIndex = users.findIndex(user => user.id === currentUserId);

    if (currentUserIndex === -1) {
      throw new AppError('Current user not found', ErrorCode.DATA_NOT_FOUND);
    }

    // Update following list
    users[currentUserIndex].following = users[currentUserIndex].following.filter(
      id => id !== targetUserId
    );
    this.setItem(this.STORAGE_KEY, users);
  }

  /**
   * Get users who follow a specific user
   */
  getFollowers(userId: string): User[] {
    const users = this.getUsers();
    return users.filter(user => user.following.includes(userId));
  }

  /**
   * Get users followed by a specific user
   */
  getFollowing(userId: string): User[] {
    const users = this.getUsers();
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      throw new AppError('User not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    return user.following
      .map(followedId => users.find(u => u.id === followedId))
      .filter((user): user is User => user !== undefined);
  }
}

/**
 * Post-related API services
 */
export class PostService extends ApiService {
  private readonly STORAGE_KEY = 'posts';
  private readonly MAX_CONTENT_LENGTH = 67;

  /**
   * Get all posts
   */
  getPosts(): Post[] {
    return this.getItem<Post[]>(this.STORAGE_KEY, []);
  }

  /**
   * Get a post by ID
   */
  getPostById(id: string): Post | undefined {
    const posts = this.getPosts();
    return posts.find(post => post.id === id);
  }

  /**
   * Get posts by user ID
   */
  getPostsByUserId(userId: string): Post[] {
    const posts = this.getPosts();
    return posts.filter(post => post.authorId === userId && !post.isRepost);
  }

  /**
   * Get posts from a user's feed (posts from users they follow + own posts)
   */
  getFeedPosts(userId: string, followingIds: string[]): Post[] {
    const posts = this.getPosts();
    return posts.filter(post => 
      post.authorId === userId || followingIds.includes(post.authorId)
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  /**
   * Create a new post
   */
  createPost(content: string, authorId: string): Post {
    if (!content.trim()) {
      throw new AppError('Post content cannot be empty', ErrorCode.DATA_VALIDATION_FAILED);
    }
    
    if (content.length > this.MAX_CONTENT_LENGTH) {
      throw new AppError(
        `Post content cannot exceed ${this.MAX_CONTENT_LENGTH} characters`, 
        ErrorCode.DATA_VALIDATION_FAILED
      );
    }

    const posts = this.getPosts();
    
    const newPost: Post = {
      id: this.generateId(),
      content: content.trim(),
      authorId,
      createdAt: new Date().toISOString(),
      likes: []
    };
    
    this.setItem(this.STORAGE_KEY, [newPost, ...posts]);
    return newPost;
  }

  /**
   * Update a post
   */
  updatePost(id: string, content: string, currentUserId: string): Post {
    if (!content.trim()) {
      throw new AppError('Post content cannot be empty', ErrorCode.DATA_VALIDATION_FAILED);
    }
    
    if (content.length > this.MAX_CONTENT_LENGTH) {
      throw new AppError(
        `Post content cannot exceed ${this.MAX_CONTENT_LENGTH} characters`, 
        ErrorCode.DATA_VALIDATION_FAILED
      );
    }

    const posts = this.getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex === -1) {
      throw new AppError('Post not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (posts[postIndex].authorId !== currentUserId) {
      throw new AppError('You can only edit your own posts', ErrorCode.PERMISSION_DENIED);
    }
    
    posts[postIndex].content = content.trim();
    this.setItem(this.STORAGE_KEY, posts);
    return posts[postIndex];
  }

  /**
   * Delete a post
   */
  deletePost(id: string, currentUserId: string): void {
    const posts = this.getPosts();
    const post = posts.find(post => post.id === id);
    
    if (!post) {
      throw new AppError('Post not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (post.authorId !== currentUserId) {
      throw new AppError('You can only delete your own posts', ErrorCode.PERMISSION_DENIED);
    }
    
    // Remove the post and any reposts of it
    const updatedPosts = posts.filter(post => 
      (post.id !== id && !(post.isRepost && post.originalPostId === id)) ||
      (post.id === id && post.authorId !== currentUserId)
    );
    
    this.setItem(this.STORAGE_KEY, updatedPosts);
  }

  /**
   * Like a post
   */
  likePost(id: string, userId: string): Post {
    const posts = this.getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex === -1) {
      throw new AppError('Post not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (!posts[postIndex].likes.includes(userId)) {
      posts[postIndex].likes.push(userId);
      this.setItem(this.STORAGE_KEY, posts);
    }
    
    return posts[postIndex];
  }

  /**
   * Unlike a post
   */
  unlikePost(id: string, userId: string): Post {
    const posts = this.getPosts();
    const postIndex = posts.findIndex(post => post.id === id);
    
    if (postIndex === -1) {
      throw new AppError('Post not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    posts[postIndex].likes = posts[postIndex].likes.filter(id => id !== userId);
    this.setItem(this.STORAGE_KEY, posts);
    return posts[postIndex];
  }

  /**
   * Repost a post
   */
  repostPost(id: string, currentUserId: string): Post {
    const posts = this.getPosts();
    const originalPost = posts.find(post => post.id === id);
    
    if (!originalPost) {
      throw new AppError('Post not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    // Check if user already reposted this
    const alreadyReposted = posts.some(post => 
      post.isRepost && 
      post.originalPostId === id && 
      post.authorId === currentUserId
    );
    
    if (alreadyReposted) {
      throw new AppError('You have already reposted this', ErrorCode.OPERATION_INVALID);
    }
    
    const originalPostId = originalPost.isRepost ? originalPost.originalPostId : id;
    
    const newRepost: Post = {
      id: this.generateId(),
      content: originalPost.content,
      authorId: currentUserId,
      createdAt: new Date().toISOString(),
      likes: [],
      isRepost: true,
      originalPostId
    };
    
    this.setItem(this.STORAGE_KEY, [newRepost, ...posts]);
    return newRepost;
  }
}

/**
 * Comment-related API services
 */
export class CommentService extends ApiService {
  private readonly STORAGE_KEY = 'comments';
  private readonly MAX_CONTENT_LENGTH = 67;

  /**
   * Get all comments
   */
  getComments(): Comment[] {
    return this.getItem<Comment[]>(this.STORAGE_KEY, []);
  }

  /**
   * Get a comment by ID
   */
  getCommentById(id: string): Comment | undefined {
    const comments = this.getComments();
    return comments.find(comment => comment.id === id);
  }

  /**
   * Get comments for a specific post
   */
  getCommentsByPostId(postId: string): Comment[] {
    const comments = this.getComments();
    return comments
      .filter(comment => comment.postId === postId && !comment.parentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * Get replies to a specific comment
   */
  getCommentReplies(commentId: string): Comment[] {
    const comments = this.getComments();
    return comments
      .filter(comment => comment.parentId === commentId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  /**
   * Get comments by a specific user
   */
  getCommentsByUserId(userId: string): Comment[] {
    const comments = this.getComments();
    return comments
      .filter(comment => comment.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Create a new comment
   */
  createComment(postId: string, content: string, authorId: string, parentId?: string): Comment {
    if (!content.trim()) {
      throw new AppError('Comment content cannot be empty', ErrorCode.DATA_VALIDATION_FAILED);
    }
    
    if (content.length > this.MAX_CONTENT_LENGTH) {
      throw new AppError(
        `Comment content cannot exceed ${this.MAX_CONTENT_LENGTH} characters`, 
        ErrorCode.DATA_VALIDATION_FAILED
      );
    }

    const comments = this.getComments();
    
    const newComment: Comment = {
      id: this.generateId(),
      content: content.trim(),
      authorId,
      postId,
      createdAt: new Date().toISOString(),
      likes: [],
      parentId
    };
    
    this.setItem(this.STORAGE_KEY, [...comments, newComment]);
    return newComment;
  }

  /**
   * Update a comment
   */
  updateComment(id: string, content: string, currentUserId: string): Comment {
    if (!content.trim()) {
      throw new AppError('Comment content cannot be empty', ErrorCode.DATA_VALIDATION_FAILED);
    }
    
    if (content.length > this.MAX_CONTENT_LENGTH) {
      throw new AppError(
        `Comment content cannot exceed ${this.MAX_CONTENT_LENGTH} characters`, 
        ErrorCode.DATA_VALIDATION_FAILED
      );
    }

    const comments = this.getComments();
    const commentIndex = comments.findIndex(comment => comment.id === id);
    
    if (commentIndex === -1) {
      throw new AppError('Comment not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (comments[commentIndex].authorId !== currentUserId) {
      throw new AppError('You can only edit your own comments', ErrorCode.PERMISSION_DENIED);
    }
    
    comments[commentIndex].content = content.trim();
    this.setItem(this.STORAGE_KEY, comments);
    return comments[commentIndex];
  }

  /**
   * Delete a comment
   */
  deleteComment(id: string, currentUserId: string): void {
    const comments = this.getComments();
    const comment = comments.find(comment => comment.id === id);
    
    if (!comment) {
      throw new AppError('Comment not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (comment.authorId !== currentUserId) {
      throw new AppError('You can only delete your own comments', ErrorCode.PERMISSION_DENIED);
    }
    
    // Get all child comments (replies to this comment)
    const childComments = comments.filter(comment => comment.parentId === id);
    
    // Delete the comment and all its child comments
    const commentIdsToDelete = [id, ...childComments.map(c => c.id)];
    
    const updatedComments = comments.filter(comment => 
      !commentIdsToDelete.includes(comment.id) || 
      (commentIdsToDelete.includes(comment.id) && comment.authorId !== currentUserId)
    );
    
    this.setItem(this.STORAGE_KEY, updatedComments);
  }

  /**
   * Like a comment
   */
  likeComment(id: string, userId: string): Comment {
    const comments = this.getComments();
    const commentIndex = comments.findIndex(comment => comment.id === id);
    
    if (commentIndex === -1) {
      throw new AppError('Comment not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    if (!comments[commentIndex].likes.includes(userId)) {
      comments[commentIndex].likes.push(userId);
      this.setItem(this.STORAGE_KEY, comments);
    }
    
    return comments[commentIndex];
  }

  /**
   * Unlike a comment
   */
  unlikeComment(id: string, userId: string): Comment {
    const comments = this.getComments();
    const commentIndex = comments.findIndex(comment => comment.id === id);
    
    if (commentIndex === -1) {
      throw new AppError('Comment not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    comments[commentIndex].likes = comments[commentIndex].likes.filter(id => id !== userId);
    this.setItem(this.STORAGE_KEY, comments);
    return comments[commentIndex];
  }

  /**
   * Repost a comment
   */
  repostComment(id: string, currentUserId: string): Comment {
    const comments = this.getComments();
    const originalComment = comments.find(comment => comment.id === id);
    
    if (!originalComment) {
      throw new AppError('Comment not found', ErrorCode.DATA_NOT_FOUND);
    }
    
    // Check if user already reposted this comment
    const alreadyReposted = comments.some(comment => 
      comment.isRepost && 
      comment.originalCommentId === id && 
      comment.authorId === currentUserId
    );
    
    if (alreadyReposted) {
      throw new AppError('You have already reposted this comment', ErrorCode.OPERATION_INVALID);
    }
    
    const originalCommentId = originalComment.isRepost ? originalComment.originalCommentId : id;
    
    const newRepost: Comment = {
      id: this.generateId(),
      content: originalComment.content,
      authorId: currentUserId,
      postId: originalComment.postId,
      createdAt: new Date().toISOString(),
      likes: [],
      isRepost: true,
      originalCommentId,
      parentId: originalComment.parentId
    };
    
    this.setItem(this.STORAGE_KEY, [...comments, newRepost]);
    return newRepost;
  }
}

// Export singleton instances for global use
export const userService = new UserService();
export const postService = new PostService();
export const commentService = new CommentService();
