-- Seed data for Solstice App

-- Body part tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Legs', 'bodyPart', '#FF5733'),
  ('Arms', 'bodyPart', '#33FF57'),
  ('Chest', 'bodyPart', '#3357FF'),
  ('Back', 'bodyPart', '#F3FF33'),
  ('Core', 'bodyPart', '#FF33F3'),
  ('Full Body', 'bodyPart', '#33FFF3');

-- Equipment tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Bodyweight', 'equipment', '#5733FF'),
  ('Dumbbells', 'equipment', '#33FF8C'),
  ('Resistance Bands', 'equipment', '#FF8C33'),
  ('Yoga Mat', 'equipment', '#8CFF33'),
  ('Kettlebell', 'equipment', '#FF338C'),
  ('None', 'equipment', '#8C33FF');

-- Goal tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Strength', 'goal', '#33FFDA'),
  ('Flexibility', 'goal', '#DAFF33'),
  ('Cardio', 'goal', '#FF33DA'),
  ('Balance', 'goal', '#33DAFF'),
  ('Endurance', 'goal', '#DA33FF'),
  ('Mindfulness', 'goal', '#FFDA33');

-- Difficulty tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Beginner', 'difficulty', '#7FFF33'),
  ('Intermediate', 'difficulty', '#FF7F33'),
  ('Advanced', 'difficulty', '#337FFF');

-- Focus tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Yoga', 'focus', '#33FFAA'),
  ('HIIT', 'focus', '#FF33AA'),
  ('Meditation', 'focus', '#AA33FF'),
  ('Pilates', 'focus', '#AAFF33'),
  ('Stretching', 'focus', '#33AAFF'),
  ('Running', 'focus', '#FFAA33'),
  ('Strength Training', 'focus', '#FF3333'),
  ('Recovery', 'focus', '#33FF33');

-- Custom tags
INSERT INTO tags (name, category, color)
VALUES 
  ('Morning', 'custom', '#E6FF33'),
  ('Evening', 'custom', '#33E6FF'),
  ('Quick', 'custom', '#FF33E6'),
  ('Intense', 'custom', '#E633FF'),
  ('Relaxing', 'custom', '#33FFE6'),
  ('Outdoor', 'custom', '#FFE633');

-- Function to create a sample workout routine when a user signs up
-- This can be called after user creation
CREATE OR REPLACE FUNCTION create_sample_workout_for_user(user_id UUID)
RETURNS UUID AS $$
DECLARE
  routine_id UUID;
  yoga_tag_id UUID;
  beginner_tag_id UUID;
  morning_tag_id UUID;
  card1_id UUID;
  card2_id UUID;
  card3_id UUID;
BEGIN
  -- Get tag IDs
  SELECT id INTO yoga_tag_id FROM tags WHERE name = 'Yoga' AND category = 'focus' LIMIT 1;
  SELECT id INTO beginner_tag_id FROM tags WHERE name = 'Beginner' AND category = 'difficulty' LIMIT 1;
  SELECT id INTO morning_tag_id FROM tags WHERE name = 'Morning' AND category = 'custom' LIMIT 1;
  
  -- Create cards
  INSERT INTO cards (title, description, source_type, duration, user_id)
  VALUES ('Sun Salutation', 'A sequence of yoga poses to warm up the body', 'custom', 180, user_id)
  RETURNING id INTO card1_id;
  
  INSERT INTO cards (title, description, source_type, duration, user_id)
  VALUES ('Standing Poses', 'Basic yoga standing poses for balance and strength', 'custom', 300, user_id)
  RETURNING id INTO card2_id;
  
  INSERT INTO cards (title, description, source_type, duration, user_id)
  VALUES ('Final Relaxation', 'Savasana relaxation pose to end your practice', 'custom', 120, user_id)
  RETURNING id INTO card3_id;
  
  -- Add tags to cards
  INSERT INTO card_tags (card_id, tag_id) VALUES (card1_id, yoga_tag_id);
  INSERT INTO card_tags (card_id, tag_id) VALUES (card1_id, beginner_tag_id);
  INSERT INTO card_tags (card_id, tag_id) VALUES (card2_id, yoga_tag_id);
  INSERT INTO card_tags (card_id, tag_id) VALUES (card2_id, beginner_tag_id);
  INSERT INTO card_tags (card_id, tag_id) VALUES (card3_id, yoga_tag_id);
  
  -- Add cues to cards
  INSERT INTO cues (card_id, text, type)
  VALUES 
    (card1_id, 'Breathe deeply through each position', 'breathing'),
    (card1_id, 'Keep your core engaged', 'form'),
    (card2_id, 'Ground through your feet', 'form'),
    (card3_id, 'Let your body completely relax', 'focus');
  
  -- Create routine
  INSERT INTO routines (title, description, user_id, is_public, total_duration, difficulty)
  VALUES ('Morning Yoga Flow', 'A gentle yoga sequence to start your day', user_id, true, 600, 'beginner')
  RETURNING id INTO routine_id;
  
  -- Add tags to routine
  INSERT INTO routine_tags (routine_id, tag_id) VALUES (routine_id, yoga_tag_id);
  INSERT INTO routine_tags (routine_id, tag_id) VALUES (routine_id, beginner_tag_id);
  INSERT INTO routine_tags (routine_id, tag_id) VALUES (routine_id, morning_tag_id);
  
  -- Add cards to routine
  INSERT INTO routine_cards (routine_id, card_id, order_position) VALUES (routine_id, card1_id, 1);
  INSERT INTO routine_cards (routine_id, card_id, order_position) VALUES (routine_id, card2_id, 2);
  INSERT INTO routine_cards (routine_id, card_id, order_position) VALUES (routine_id, card3_id, 3);
  
  RETURN routine_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger function to initialize user profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create user profile
  INSERT INTO user_profiles (id, username, display_name, created_at)
  VALUES (new.id, new.email, split_part(new.email, '@', 1), now());
  
  -- Create sample workout
  PERFORM create_sample_workout_for_user(new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new user sign-ups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to increment the number of routines created by a user
CREATE OR REPLACE FUNCTION increment_routines_created(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET routines_created = routines_created + 1,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment the number of routines completed by a user
CREATE OR REPLACE FUNCTION increment_routines_completed(user_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET routines_completed = routines_completed + 1,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql; 