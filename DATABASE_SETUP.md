# Database Setup Guide

## Supabase Database Setup

Your ObjectionIQ app requires a properly configured Supabase database. Follow these steps to set up your database:

### 1. Access Your Supabase Dashboard

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project (or create a new one)

### 2. Apply the Database Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **Run** to execute the schema

### 3. Verify the Setup

After running the schema, you should see:
- ✅ All tables created successfully
- ✅ Indexes created for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Policies configured for data access control

### 4. Test the Database

Run the database test to verify everything is working:

```bash
node scripts/test-supabase.js
```

You should see:
```
✅ Connection successful
✅ profiles: Accessible
✅ sessions: Accessible
✅ goals: Accessible
✅ user_preferences: Accessible
✅ performance_metrics: Accessible
✅ Insert successful
```

### 5. Troubleshooting

#### Tables Don't Exist
If you see "relation does not exist" errors:
- Make sure you ran the complete `schema.sql` file
- Check that you're in the correct Supabase project
- Verify your environment variables are correct

#### RLS Policy Errors
If you see permission errors:
- Ensure the schema includes all RLS policies
- Check that the `handle_new_user()` function was created
- Verify the trigger for new user registration

#### Connection Issues
If you can't connect to Supabase:
- Check your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Ensure your project is active and not paused
- Verify your IP is not blocked by any restrictions

### 6. Environment Variables

Make sure your `.env.local` file contains:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 7. API Testing

Once the database is set up, test all APIs:

```bash
npm run test:api
```

This will test:
- ✅ Chat API (Claude integration)
- ✅ Sessions API (database operations)
- ✅ Analytics API (data aggregation)

### 8. Next Steps

After successful database setup:
1. Test the voice training interface
2. Verify session saving works
3. Check that analytics are calculated correctly
4. Test user authentication flow

## Schema Overview

The database includes these tables:

- **profiles**: User profiles and subscription info
- **sessions**: Training session data and conversation history
- **goals**: User-defined training goals
- **user_preferences**: User settings and preferences
- **performance_metrics**: Daily performance tracking

All tables include:
- Row Level Security (RLS) for data protection
- Proper indexes for performance
- Automatic timestamp updates
- Foreign key relationships 