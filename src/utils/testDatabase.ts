import { supabase } from './supabase';

export async function testDatabase() {
  console.log('Starting database tests...');

  try {
    // Test 1: Create a test user
    console.log('\nTest 1: Creating test user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          username: 'testuser',
          display_name: 'Test User'
        }
      }
    });

    if (authError) throw authError;
    console.log('Test user created successfully:', authData.user?.id);

    // Test 2: Create a test post
    console.log('\nTest 2: Creating test post...');
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert({
        author_id: authData.user?.id,
        content: 'This is a test post',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (postError) throw postError;
    console.log('Test post created successfully:', postData.id);

    // Test 3: Create a test comment
    console.log('\nTest 3: Creating test comment...');
    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postData.id,
        author_id: authData.user?.id,
        content: 'This is a test comment',
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commentError) throw commentError;
    console.log('Test comment created successfully:', commentData.id);

    // Test 4: Like the post
    console.log('\nTest 4: Liking the post...');
    const { error: likeError } = await supabase
      .from('likes')
      .insert({
        post_id: postData.id,
        user_id: authData.user?.id,
        created_at: new Date().toISOString()
      });

    if (likeError) throw likeError;
    console.log('Post liked successfully');

    // Test 5: Like the comment
    console.log('\nTest 5: Liking the comment...');
    const { error: commentLikeError } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentData.id,
        user_id: authData.user?.id,
        created_at: new Date().toISOString()
      });

    if (commentLikeError) throw commentLikeError;
    console.log('Comment liked successfully');

    // Test 6: Create a follow relationship
    console.log('\nTest 6: Creating follow relationship...');
    const { error: followError } = await supabase
      .from('follows')
      .insert({
        follower_id: authData.user?.id,
        following_id: authData.user?.id, // Following self for testing
        created_at: new Date().toISOString()
      });

    if (followError) throw followError;
    console.log('Follow relationship created successfully');

    // Test 7: Query all created data
    console.log('\nTest 7: Querying all created data...');
    const { data: userData, error: userQueryError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user?.id)
      .single();

    if (userQueryError) throw userQueryError;
    console.log('User data:', userData);

    const { data: postsData, error: postsQueryError } = await supabase
      .from('posts')
      .select('*')
      .eq('author_id', authData.user?.id);

    if (postsQueryError) throw postsQueryError;
    console.log('Posts data:', postsData);

    const { data: commentsData, error: commentsQueryError } = await supabase
      .from('comments')
      .select('*')
      .eq('author_id', authData.user?.id);

    if (commentsQueryError) throw commentsQueryError;
    console.log('Comments data:', commentsData);

    console.log('\nAll database tests completed successfully!');
    return true;
  } catch (error) {
    console.error('Error during database tests:', error);
    return false;
  }
} 