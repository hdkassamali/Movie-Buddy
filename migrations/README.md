# Database Migrations

This directory contains SQL migration files for the Movie Tracker application.

## How to Run Migrations

### 1. Access Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Click on **New query** to create a new SQL script

### 2. Execute the Initial Schema Migration

1. Copy the contents of `001_initial_schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** to execute the migration

### 3. Verify the Migration

After running the migration, verify that all tables were created successfully:

```sql
-- Check that all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');

-- Check indexes
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'lists', 'list_items', 'ratings', 'watch_status');
```

## Schema Overview

### Tables Created

1. **users** - User profiles and preferences
2. **lists** - User-created watchlists
3. **list_items** - Movies/TV shows in lists
4. **ratings** - User ratings and reviews
5. **watch_status** - Viewing progress tracking

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **Comprehensive indexes** for performance
- **Data validation** through check constraints
- **Automatic timestamps** with triggers
- **Referential integrity** with foreign keys

### Security

All tables have RLS policies that ensure:
- Users can only access their own data
- Public lists are viewable by all authenticated users
- Ratings are viewable by all but manageable only by owners

## Testing the Schema

After migration, you can test the schema with sample data:

```sql
-- Insert a test user (this should match your auth.uid())
INSERT INTO users (email, username) VALUES ('test@example.com', 'testuser');

-- Create a test list
INSERT INTO lists (user_id, name, description) 
VALUES (auth.uid(), 'My Favorites', 'My favorite movies');

-- Add a movie to the list
INSERT INTO list_items (list_id, tmdb_id, media_type) 
VALUES ((SELECT id FROM lists WHERE name = 'My Favorites'), 550, 'movie');

-- Add a rating
INSERT INTO ratings (user_id, tmdb_id, media_type, rating, review) 
VALUES (auth.uid(), 550, 'movie', 5, 'Amazing movie!');

-- Track watch status
INSERT INTO watch_status (user_id, tmdb_id, media_type, status) 
VALUES (auth.uid(), 550, 'movie', 'watched');
```

## Next Steps

1. Update your TypeScript types to match the new schema
2. Test the database connection from your Next.js application
3. Implement the application logic using these tables 