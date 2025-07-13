#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.log('❌ Missing Supabase environment variables');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🧪 Testing basic connection...');
  
  try {
    // Test basic connection by trying to access a table
    const { data, error } = await supabase
      .from('sessions')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Connection failed');
      console.log('   Error:', error.message);
      
      if (error.message.includes('relation "sessions" does not exist')) {
        console.log('\n📝 Database tables not set up yet');
        console.log('   Run the schema.sql file in your Supabase dashboard');
        console.log('   Or use the Supabase CLI to apply the schema');
      }
    } else {
      console.log('✅ Connection successful');
      console.log('   Sessions table accessible');
    }
  } catch (error) {
    console.log('❌ Connection error');
    console.log('   Error:', error.message);
  }
}

async function testTables() {
  console.log('\n🧪 Testing database tables...');
  
  const tables = ['profiles', 'sessions', 'goals', 'user_preferences', 'performance_metrics'];
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.log(`❌ ${table}: ${error.message}`);
      } else {
        console.log(`✅ ${table}: Accessible`);
      }
    } catch (error) {
      console.log(`❌ ${table}: ${error.message}`);
    }
  }
}

async function testInsert() {
  console.log('\n🧪 Testing data insertion...');
  
  try {
    const testSession = {
      user_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID format
      persona_id: 'test-persona',
      persona_name: 'Test Persona',
      persona_type: 'test',
      duration: 60,
      objections_handled: 1,
      confidence_score: 0.8,
      conversation_history: [],
      notes: 'Test session'
    };
    
    const { data, error } = await supabase
      .from('sessions')
      .insert(testSession)
      .select();
    
    if (error) {
      console.log('❌ Insert failed');
      console.log('   Error:', error.message);
    } else {
      console.log('✅ Insert successful');
      console.log('   Session ID:', data[0].id);
      
      // Clean up test data
      await supabase
        .from('sessions')
        .delete()
        .eq('id', data[0].id);
      
      console.log('   Test data cleaned up');
    }
  } catch (error) {
    console.log('❌ Insert error');
    console.log('   Error:', error.message);
  }
}

async function runTests() {
  await testConnection();
  await testTables();
  await testInsert();
  
  console.log('\n✨ Supabase tests completed!');
  console.log('\n📝 Next steps:');
  console.log('1. If connection fails, check your Supabase URL and keys');
  console.log('2. If tables are missing, run supabase/schema.sql in your dashboard');
  console.log('3. If RLS policies fail, ensure the schema includes proper policies');
}

runTests().catch(console.error); 