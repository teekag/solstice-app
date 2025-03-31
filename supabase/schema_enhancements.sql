-- Solstice App - Supabase Schema Enhancements
-- Run this script in the Supabase SQL Editor to enhance the existing schema

-- ✅ Indexes for performance optimization
-- These indexes will significantly improve query performance for common operations
CREATE INDEX IF NOT EXISTS idx_content_objects_user_id ON content_objects(user_id);
CREATE INDEX IF NOT EXISTS idx_content_objects_platform ON content_objects(platform);
CREATE INDEX IF NOT EXISTS idx_content_objects_parsed ON content_objects(parsed);

CREATE INDEX IF NOT EXISTS idx_routines_user_id ON routines(user_id);
CREATE INDEX IF NOT EXISTS idx_routines_is_public ON routines(is_public);
CREATE INDEX IF NOT EXISTS idx_routines_tags ON routines USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_cards_routine_id ON cards(routine_id);
CREATE INDEX IF NOT EXISTS idx_cards_position ON cards(position);
CREATE INDEX IF NOT EXISTS idx_cards_content_object_id ON cards(content_object_id);

CREATE INDEX IF NOT EXISTS idx_cues_card_id ON cues(card_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_user_id ON routine_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_completions_routine_id ON routine_completions(routine_id);

-- ✅ Cues RLS Policies
-- These policies ensure users can only access cues they're authorized to see
CREATE POLICY "Users can view cues of viewable cards" ON cues
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN routines ON cards.routine_id = routines.id
      WHERE cues.card_id = cards.id
      AND (routines.user_id = auth.uid() OR routines.is_public = true)
    )
  );

CREATE POLICY "Users can insert cues to their cards" ON cues
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM cards
      JOIN routines ON cards.routine_id = routines.id
      WHERE cues.card_id = cards.id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update cues in their cards" ON cues
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN routines ON cards.routine_id = routines.id
      WHERE cues.card_id = cards.id
      AND routines.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete cues from their cards" ON cues
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM cards
      JOIN routines ON cards.routine_id = routines.id
      WHERE cues.card_id = cards.id
      AND routines.user_id = auth.uid()
    )
  );

-- ✅ Routine Completions RLS Policies
-- These policies ensure users can only access their own completion records
CREATE POLICY "Users can view their own routine completions" ON routine_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own routine completions" ON routine_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own routine completions" ON routine_completions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own routine completions" ON routine_completions
  FOR DELETE USING (auth.uid() = user_id);

-- ✅ Create profile row on signup
-- This trigger automatically creates a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (
    id, 
    display_name, 
    created_at, 
    updated_at
  ) VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists to avoid errors when re-running
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger to run after a new user is inserted
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ✅ Add updated_at trigger for cues table (if missing)
CREATE TRIGGER update_cues_updated_at
BEFORE UPDATE ON cues
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ✅ Add updated_at trigger for routine_completions table (if missing)
CREATE OR REPLACE FUNCTION update_routine_completions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.completed_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_routine_completions_timestamp
BEFORE UPDATE ON routine_completions
FOR EACH ROW EXECUTE FUNCTION update_routine_completions_updated_at();

-- ✅ Add stats view for user dashboard
CREATE OR REPLACE VIEW user_stats AS
SELECT 
  u.id as user_id,
  COALESCE(p.display_name, u.email) as display_name,
  p.avatar_url,
  COUNT(DISTINCT r.id) as routines_count,
  COUNT(DISTINCT rc.id) as completions_count,
  SUM(rc.duration) as total_duration,
  MAX(rc.completed_at) as last_active
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
LEFT JOIN routines r ON u.id = r.user_id
LEFT JOIN routine_completions rc ON u.id = rc.user_id
GROUP BY u.id, p.display_name, u.email, p.avatar_url;

-- Grant permissions for the view
GRANT SELECT ON user_stats TO authenticated;
