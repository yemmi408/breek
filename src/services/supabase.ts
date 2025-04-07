import { supabase } from '../utils/supabase';
import { User, Post, Comment } from '../types';

export class SupabaseService {
  // User operations
  async getUser(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();

    if (error) throw error;
    return data;
  }

  async createUser(user: Omit<User, 'id'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Post operations
  async getPost(postId: string): Promise<Post | null> {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:users(*)
      `)
      .eq('id', postId)
      .single();

    if (error) throw error;
    return data;
  }

  async getPosts(userId?: string): Promise<Post[]> {
    let query = supabase
      .from('posts')
      .select(`
        *,
        author:users(*)
      `)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('author_id', userId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  async createPost(post: Omit<Post, 'id'>): Promise<Post> {
    const { data, error } = await supabase
      .from('posts')
      .insert([post])
      .select(`
        *,
        author:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deletePost(postId: string): Promise<void> {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', postId);

    if (error) throw error;
  }

  // Comment operations
  async getComments(postId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(*)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async createComment(comment: Omit<Comment, 'id'>): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select(`
        *,
        author:users(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async deleteComment(commentId: string): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) throw error;
  }

  // Like operations
  async likePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .insert([{ post_id: postId, user_id: userId }]);

    if (error) throw error;
  }

  async unlikePost(postId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async isPostLiked(postId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  // Follow operations
  async followUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .insert([{ follower_id: followerId, following_id: followingId }]);

    if (error) throw error;
  }

  async unfollowUser(followerId: string, followingId: string): Promise<void> {
    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);

    if (error) throw error;
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  async getFollowers(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        follower:users(*)
      `)
      .eq('following_id', userId);

    if (error) throw error;
    return data.map(follow => follow.follower);
  }

  async getFollowing(userId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('follows')
      .select(`
        following:users(*)
      `)
      .eq('follower_id', userId);

    if (error) throw error;
    return data.map(follow => follow.following);
  }
}

export const supabaseService = new SupabaseService(); 