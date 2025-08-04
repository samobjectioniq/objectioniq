# Supabase Setup for ObjectionIQ

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose your organization and project name
3. Set a secure database password
4. Choose your region

## 2. Environment Variables

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Anthropic API (for AI chat functionality)
OPENAI_API_KEY=your_openai_api_key
```

You can find your Supabase URL and anon key in your project settings under "API".

## 3. Database Schema Setup

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Run the SQL to create all tables, indexes, and policies

## 4. Authentication Setup

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Add any additional redirect URLs as needed
4. Configure email templates if desired

## 5. Row Level Security (RLS)

The schema includes RLS policies that ensure users can only access their own data. These are automatically created when you run the schema SQL.

## 6. Testing the Setup

1. Start your development server: `npm run dev`
2. Navigate to the homepage
3. Try signing up for a new account
4. Verify that the user profile is created automatically
5. Test the dashboard functionality

## 7. Database Tables

The following tables are created:

- **profiles**: User profile information and subscription details
- **sessions**: Training session data with conversation history
- **goals**: User-defined training goals
- **user_preferences**: User settings and preferences
- **performance_metrics**: Daily aggregated performance data

## 8. Features Included

- ✅ User authentication (sign up, sign in, sign out)
- ✅ User profiles with subscription management
- ✅ Session storage with full conversation history
- ✅ Performance metrics tracking
- ✅ Goal setting and progress tracking
- ✅ User preferences and settings
- ✅ Row Level Security for data protection
- ✅ Automatic profile creation on signup
- ✅ Performance metrics aggregation

## 9. Subscription Tiers

The system supports three subscription tiers:
- **Free**: Basic training features
- **Pro**: Advanced analytics and unlimited sessions
- **Enterprise**: Team management and advanced features

## 10. Troubleshooting

### Common Issues:

1. **Authentication not working**: Check your environment variables and site URL configuration
2. **Database errors**: Ensure the schema has been applied correctly
3. **RLS errors**: Verify that the RLS policies are in place
4. **Type errors**: Make sure all dependencies are installed

### Getting Help:

- Check the Supabase documentation: [docs.supabase.com](https://docs.supabase.com)
- Review the console for any error messages
- Verify your environment variables are correctly set 