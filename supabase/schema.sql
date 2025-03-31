-- Solstice App Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Objects (saved from external sources)
CREATE TABLE content_objects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  platform TEXT NOT NULL, -- 'youtube', 'tiktok', 'instagram', etc.
  url TEXT NOT NULL,
  media_url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp_saved TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  parsed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routines
CREATE TABLE routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards (steps within routines)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  content_object_id UUID REFERENCES content_objects(id),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source_type TEXT,
  media_url TEXT,
  thumbnail_url TEXT,
  start_time INTEGER, -- in seconds
  end_time INTEGER, -- in seconds
  duration INTEGER, -- in seconds
  sets INTEGER,
  reps INTEGER,
  position INTEGER NOT NULL, -- for ordering within routine
  tags TEXT[] DEFAULT '{}',
  created_by TEXT, -- 'user' or 'agent'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cues (instructions within cards)
CREATE TABLE cues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT, -- 'form', 'breathing', 'focus', etc.
  timestamp INTEGER, -- in seconds, relative to card start
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Routine Completions (tracking)
CREATE TABLE routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  routine_id UUID REFERENCES routines(id) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER, -- in seconds
  feedback TEXT,
  rating INTEGER -- 1-5 stars
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Content Objects policies
CREATE POLICY "Users can view their own content objects" ON content_objects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own content objects" ON content_objects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own content objects" ON content_objects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own content objects" ON content_objects
  FOR DELETE USING (auth.uid() = user_id);

-- Routines policies
CREATE POLICY "Users can view their own routines" ON routines
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own routines" ON routines
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routines" ON routines
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routines" ON routines
  FOR DELETE USING (auth.uid() = user_id);

-- Cards policies
CREATE POLICY "Users can view cards of viewable routines" ON cards
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = cards.routine_id
      AND (routines.user_id = auth.uid() OR routines.is_public = true)
    )
  );

CREATE POLICY "Users can insert cards to their routines" ON cards
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = cards.routine_id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cards in their routines" ON cards
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = cards.routine_id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cards from their routines" ON cards
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM routines
      WHERE routines.id = cards.routine_id
      AND routines.user_id = auth.uid()
    )
  );

-- Functions and Triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_objects_updated_at
BEFORE UPDATE ON content_objects
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_routines_updated_at
BEFORE UPDATE ON routines
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
