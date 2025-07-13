const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('Service Key:', supabaseServiceKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  try {
    // Test basic connection
    console.log('\n1. Testing basic connection...');
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('Connection error:', error);
    } else {
      console.log('✅ Connection successful');
    }

    // Test sessions table
    console.log('\n2. Testing sessions table...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
    
    if (sessionsError) {
      console.error('Sessions table error:', sessionsError);
    } else {
      console.log('✅ Sessions table accessible');
      console.log('Sessions count:', sessions?.length || 0);
    }

    // Test with mock user
    console.log('\n3. Testing with mock user...');
    const mockUserId = '123e4567-e89b-12d3-a456-426614174000'; // Valid UUID
    const { data: mockSessions, error: mockError } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', mockUserId);
    
    if (mockError) {
      console.error('Mock user query error:', mockError);
    } else {
      console.log('✅ Mock user query successful');
      console.log('Mock user sessions:', mockSessions?.length || 0);
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testConnection(); 