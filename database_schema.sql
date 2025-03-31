-- Schema for Solstice App Database

-- Enable UUID extension for generating unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  profile_image_url TEXT,
  routines_created INTEGER DEFAULT 0,
  routines_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on tag name and category
CREATE INDEX IF NOT EXISTS idx_tags_name_category ON tags (name, category);

-- Cards table (for exercises, meditation steps, etc.)
CREATE TABLE IF NOT EXISTS cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  source_url TEXT,
  source_type TEXT NOT NULL, -- 'youtube', 'blog', 'custom', 'image', etc.
  thumbnail_url TEXT,
  duration INTEGER, -- in seconds
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for cards
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON cards (user_id);

-- Card tags junction table
CREATE TABLE IF NOT EXISTS card_tags (
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (card_id, tag_id)
);

-- Cues table (for form cues, breathing cues, etc.)
CREATE TABLE IF NOT EXISTS cues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  type TEXT NOT NULL, -- 'form', 'breathing', 'focus', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on card_id for cues
CREATE INDEX IF NOT EXISTS idx_cues_card_id ON cues (card_id);

-- Routines table
CREATE TABLE IF NOT EXISTS routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  total_duration INTEGER, -- in seconds
  difficulty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for routines
CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines (user_id);

-- Routine tags junction table
CREATE TABLE IF NOT EXISTS routine_tags (
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (routine_id, tag_id)
);

-- Junction table for cards in routines (with order)
CREATE TABLE IF NOT EXISTS routine_cards (
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  card_id UUID REFERENCES cards(id) ON DELETE CASCADE,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  PRIMARY KEY (routine_id, card_id)
);

-- Create index on routine_id and order_position
CREATE INDEX IF NOT EXISTS idx_routine_cards_routine_order ON routine_cards (routine_id, order_position);

-- Routine completion records
CREATE TABLE IF NOT EXISTS routine_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  routine_id UUID REFERENCES routines(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  duration INTEGER, -- actual completion duration in seconds
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  notes TEXT
);

-- Create index on user_id and routine_id for completions
CREATE INDEX IF NOT EXISTS idx_routine_completions_user_routine ON routine_completions (user_id, routine_id);

-- File uploads table
CREATE TABLE IF NOT EXISTS file_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index on user_id for file uploads
CREATE INDEX IF NOT EXISTS idx_file_uploads_user_id ON file_uploads (user_id);

-- RLS Policies

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE cues ENABLE ROW LEVEL SECURITY;
ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE routine_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_uploads ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can view their own profile" 
  ON user_profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON user_profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Tags policies (public read, authenticated insert)
CREATE POLICY "Tags are readable by everyone" 
  ON tags FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create tags" 
  ON tags FOR INSERT 
  TO authenticated 
  WITH CHECK (true);

-- Cards policies
CREATE POLICY "Users can view their own cards" 
  ON cards FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create, update, and delete their own cards" 
  ON cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Card tags policies
CREATE POLICY "Users can view tags on their cards" 
  ON card_tags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = card_tags.card_id 
    AND cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can add tags to their cards" 
  ON card_tags FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = card_tags.card_id 
    AND cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove tags from their cards" 
  ON card_tags FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = card_tags.card_id 
    AND cards.user_id = auth.uid()
  ));

-- Cues policies
CREATE POLICY "Users can view cues on their cards" 
  ON cues FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = cues.card_id 
    AND cards.user_id = auth.uid()
  ));

CREATE POLICY "Users can create, update, and delete cues on their cards" 
  ON cues FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = cues.card_id 
    AND cards.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM cards 
    WHERE cards.id = cues.card_id 
    AND cards.user_id = auth.uid()
  ));

-- Routines policies
CREATE POLICY "Users can view their own routines or public routines" 
  ON routines FOR SELECT 
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create, update, and delete their own routines" 
  ON routines FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Routine tags policies
CREATE POLICY "Users can view tags on their routines or public routines" 
  ON routine_tags FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_tags.routine_id 
    AND (routines.user_id = auth.uid() OR routines.is_public = true)
  ));

CREATE POLICY "Users can add tags to their routines" 
  ON routine_tags FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_tags.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove tags from their routines" 
  ON routine_tags FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_tags.routine_id 
    AND routines.user_id = auth.uid()
  ));

-- Routine cards policies
CREATE POLICY "Users can view cards on their routines or public routines" 
  ON routine_cards FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_cards.routine_id 
    AND (routines.user_id = auth.uid() OR routines.is_public = true)
  ));

CREATE POLICY "Users can add cards to their routines" 
  ON routine_cards FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_cards.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can update card order on their routines" 
  ON routine_cards FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_cards.routine_id 
    AND routines.user_id = auth.uid()
  ));

CREATE POLICY "Users can remove cards from their routines" 
  ON routine_cards FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM routines 
    WHERE routines.id = routine_cards.routine_id 
    AND routines.user_id = auth.uid()
  ));

-- Routine completions policies
CREATE POLICY "Users can view their own routine completions" 
  ON routine_completions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own routine completions" 
  ON routine_completions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- File uploads policies
CREATE POLICY "Users can view their own file uploads" 
  ON file_uploads FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload their own files" 
  ON file_uploads FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own file uploads" 
  ON file_uploads FOR DELETE 
  USING (auth.uid() = user_id);

-- Triggers for automatic updates
-- Update the updated_at field whenever a record is modified
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to all relevant tables
CREATE TRIGGER update_cards_modtime
  BEFORE UPDATE ON cards
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_routines_modtime
  BEFORE UPDATE ON routines
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_user_profiles_modtime
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_tags_modtime
  BEFORE UPDATE ON tags
  FOR EACH ROW EXECUTE FUNCTION update_modified_column();

COMMENT ON TABLE cards IS 'Stores all content items used in routines';
COMMENT ON TABLE routines IS 'Collections of cards organized for specific purposes';
COMMENT ON TABLE routine_cards IS 'Junction table linking cards to routines with ordering';
COMMENT ON TABLE tags IS 'Categories and labels for organizing content';
COMMENT ON TABLE content_repository IS 'Raw saved content before processing into cards'; 