# Setting Up Supabase for Solstice App

This guide walks you through setting up the Supabase backend for the Solstice wellness routine builder app.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project" and provide the necessary information:
   - **Project name**: Solstice (or your preferred name)
   - **Database password**: Create a secure password
   - **Region**: Choose the region closest to your users
3. Click "Create new project" and wait for it to be created (this may take a few minutes)

## 2. Get Your Supabase Credentials

1. Once your project is created, go to the project dashboard
2. Navigate to Settings > API 
3. Under "Project API keys", copy the following values:
   - **URL**: The URL for your Supabase project
   - **anon public key**: The anonymous key for public operations

You'll need these values for your app's environment variables.

## 3. Set Up the Database Schema

1. In your Supabase project, go to the SQL Editor
2. Create a new query and paste the contents of `database_schema.sql` from the Solstice app repository
3. Run the query to create all necessary tables and set up Row Level Security policies

## 4. Seed the Database with Initial Data

1. In the SQL Editor, create another new query
2. Paste the contents of `database_seed.sql` from the repository
3. Run the query to populate the database with initial tag data and create helper functions

## 5. Configure Storage

1. Go to the Storage section in your Supabase dashboard
2. Create a new bucket called `files` for storing user uploads
3. Set the privacy level to "Private" to secure uploaded files
4. Create access policies for the bucket:
   - Allow users to upload files to their own folder
   - Allow users to read from their own folder
   - Restrict deletion to the file's owner

Example policy for uploads:
```sql
((bucket_id = 'files'::text) AND (auth.uid() = (storage.foldername(name))[1]::uuid))
```

## 6. Configure Authentication

1. Go to the Authentication section in your Supabase dashboard
2. Under "Providers", ensure that Email is enabled
3. Optionally, configure additional providers like Google, Facebook, etc.
4. Under "URL Configuration", set the Site URL to your app's domain or localhost for development

## 7. Update Your App Configuration

1. In your Solstice app repository, create a `.env` file in the root directory with the following:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

2. Alternatively, update the `app.json` file with your Supabase credentials in the `extra` section:
   ```json
   "extra": {
     "SUPABASE_URL": "your_supabase_url",
     "SUPABASE_KEY": "your_supabase_anon_key"
   }
   ```

## 8. Test the Connection

1. Start your app with `npm start` or `expo start`
2. Try to register a new user to confirm that authentication is working
3. After signing in, the trigger should automatically create a user profile and sample routine

## Troubleshooting

### Common Issues

1. **RLS Policies**: If you're getting permission errors, ensure that the Row Level Security policies are correctly set up
2. **Auth Configuration**: Make sure the site URL is properly configured for authentication redirects
3. **Database Errors**: Check the SQL logs in Supabase for any errors during schema or seed execution

### Getting Help

If you encounter issues setting up Supabase for the Solstice app:

1. Check the [Supabase documentation](https://supabase.com/docs)
2. Visit the [Supabase GitHub repository](https://github.com/supabase/supabase) for more resources
3. Join the [Supabase Discord community](https://discord.supabase.com) for help 