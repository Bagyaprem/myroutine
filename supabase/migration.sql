
-- This file is used to add the missing columns to the journal_entries table
-- It's not executed automatically, but can be run manually in the Supabase SQL editor

-- Add type column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'type'
  ) THEN 
    ALTER TABLE journal_entries ADD COLUMN type text DEFAULT 'text'::text;
  END IF;
END $$;

-- Add media_url column if it doesn't exist  
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'media_url'
  ) THEN 
    ALTER TABLE journal_entries ADD COLUMN media_url text;
  END IF;
END $$;

-- Add summary column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'summary'
  ) THEN 
    ALTER TABLE journal_entries ADD COLUMN summary text;
  END IF;
END $$;

-- Add wallpaper column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'journal_entries' 
    AND column_name = 'wallpaper'
  ) THEN 
    ALTER TABLE journal_entries ADD COLUMN wallpaper text DEFAULT 'gradient-blue'::text;
  END IF;
END $$;
