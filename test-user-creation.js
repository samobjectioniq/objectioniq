const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing user creation...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testUserCreation() {
  try {
    // Test 1: Check if profiles table exists and is accessible
    console.log('\n1. Testing profiles table access...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
      return;
    } else {
      console.log('✅ Profiles table accessible');
      console.log('Existing profiles:', profiles?.length || 0);
    }

    // Test 2: Try to create a test profile manually
    console.log('\n2. Testing manual profile creation...');
    const testUserId = '123e4567-e89b-12d3-a456-426614174001';
    const testProfile = {
      id: testUserId,
      email: 'test@example.com',
      full_name: 'Test User',
      subscription_tier: 'free',
      subscription_status: 'active'
    };

    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .select()
      .single();

    if (createError) {
      console.error('Profile creation error:', createError);
    } else {
      console.log('✅ Profile creation successful');
      console.log('Created profile:', newProfile);
    }

    // Test 3: Check if the handle_new_user function exists
    console.log('\n3. Testing handle_new_user function...');
    const { data: functions, error: funcError } = await supabase
      .rpc('handle_new_user', { 
        NEW: {
          id: '123e4567-e89b-12d3-a456-426614174002',
          email: 'test2@example.com',
          raw_user_meta_data: { full_name: 'Test User 2' }
        }
      });

    if (funcError) {
      console.error('handle_new_user function error:', funcError);
      console.log('This suggests the database trigger may not be set up correctly');
    } else {
      console.log('✅ handle_new_user function exists');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testUserCreation(); 