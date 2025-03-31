/**
 * TagRoutineScreen Component
 * Allows users to add tags and metadata to routines
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  ScrollView,
  Alert,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Colors from '../../constants/colors';
import { Tag, TagCategory } from '../../types/tag';

// Pre-defined tags by category
const PREDEFINED_TAGS: Record<TagCategory, Tag[]> = {
  bodyPart: [
    { id: 'bp1', name: 'Arms', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
    { id: 'bp2', name: 'Legs', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
    { id: 'bp3', name: 'Core', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
    { id: 'bp4', name: 'Back', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
    { id: 'bp5', name: 'Chest', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
    { id: 'bp6', name: 'Shoulders', category: 'bodyPart', color: Colors.TAG_COLORS.bodyPart },
  ],
  equipment: [
    { id: 'eq1', name: 'Dumbbells', category: 'equipment', color: Colors.TAG_COLORS.equipment },
    { id: 'eq2', name: 'Resistance Band', category: 'equipment', color: Colors.TAG_COLORS.equipment },
    { id: 'eq3', name: 'Yoga Mat', category: 'equipment', color: Colors.TAG_COLORS.equipment },
    { id: 'eq4', name: 'Kettlebell', category: 'equipment', color: Colors.TAG_COLORS.equipment },
    { id: 'eq5', name: 'None', category: 'equipment', color: Colors.TAG_COLORS.equipment },
  ],
  goal: [
    { id: 'g1', name: 'Strength', category: 'goal', color: Colors.TAG_COLORS.goal },
    { id: 'g2', name: 'Flexibility', category: 'goal', color: Colors.TAG_COLORS.goal },
    { id: 'g3', name: 'Cardio', category: 'goal', color: Colors.TAG_COLORS.goal },
    { id: 'g4', name: 'Recovery', category: 'goal', color: Colors.TAG_COLORS.goal },
    { id: 'g5', name: 'Balance', category: 'goal', color: Colors.TAG_COLORS.goal },
  ],
  difficulty: [
    { id: 'd1', name: 'Beginner', category: 'difficulty', color: Colors.TAG_COLORS.difficulty },
    { id: 'd2', name: 'Intermediate', category: 'difficulty', color: Colors.TAG_COLORS.difficulty },
    { id: 'd3', name: 'Advanced', category: 'difficulty', color: Colors.TAG_COLORS.difficulty },
  ],
  focus: [
    { id: 'f1', name: 'Morning', category: 'focus', color: Colors.TAG_COLORS.focus },
    { id: 'f2', name: 'Evening', category: 'focus', color: Colors.TAG_COLORS.focus },
    { id: 'f3', name: 'Quick', category: 'focus', color: Colors.TAG_COLORS.focus },
    { id: 'f4', name: 'Intense', category: 'focus', color: Colors.TAG_COLORS.focus },
    { id: 'f5', name: 'Relaxing', category: 'focus', color: Colors.TAG_COLORS.focus },
  ],
  custom: [],
};

// Tag pill component
const TagPill = ({ tag, selected, onPress }: { tag: Tag, selected: boolean, onPress: () => void }) => (
  <TouchableOpacity
    style={[
      styles.tagPill,
      { backgroundColor: selected ? tag.color : Colors.BACKGROUND_LIGHT }
    ]}
    onPress={onPress}
  >
    <Text
      style={[
        styles.tagText,
        { color: selected ? Colors.WHITE : Colors.GRAY_DARK }
      ]}
    >
      {tag.name}
    </Text>
  </TouchableOpacity>
);

const TagRoutineScreen = ({ navigation, route }: any) => {
  // State for routine metadata
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [activeCategory, setActiveCategory] = useState<TagCategory>('bodyPart');
  const [customTagInput, setCustomTagInput] = useState('');

  // Toggle a tag selection
  const toggleTag = (tag: Tag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);
    
    if (isSelected) {
      setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Add a custom tag
  const addCustomTag = () => {
    if (!customTagInput.trim()) return;
    
    // Check if the tag already exists
    if (PREDEFINED_TAGS.custom.some(t => t.name.toLowerCase() === customTagInput.trim().toLowerCase())) {
      Alert.alert('Tag Exists', 'This custom tag already exists');
      return;
    }
    
    // Create new custom tag
    const newTag: Tag = {
      id: `custom_${Date.now()}`,
      name: customTagInput.trim(),
      category: 'custom',
      color: Colors.TAG_COLORS.custom,
    };
    
    // Add to predefined list and select it
    PREDEFINED_TAGS.custom.push(newTag);
    setSelectedTags([...selectedTags, newTag]);
    setCustomTagInput('');
  };

  // Save the routine with metadata
  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please enter a title for your routine');
      return;
    }
    
    const routineMetadata = {
      title,
      description,
      isPublic,
      tags: selectedTags,
    };
    
    // In a real app, this would save to context or backend
    console.log('Saving routine metadata:', routineMetadata);
    
    // Navigate to next screen or back to builder
    Alert.alert('Routine Saved', 'Your routine has been saved successfully');
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tag Your Routine</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Basic information section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter routine title"
            maxLength={50}
          />
          
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.textAreaInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe your routine"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          
          <View style={styles.switchContainer}>
            <Text style={styles.switchLabel}>Make Public</Text>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: Colors.GRAY_LIGHT, true: Colors.PRIMARY_LIGHT }}
              thumbColor={isPublic ? Colors.PRIMARY : Colors.WHITE}
            />
          </View>
        </View>

        {/* Tags section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tags</Text>
          <Text style={styles.sectionDescription}>
            Add tags to help others discover your routine
          </Text>
          
          {/* Tag category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={styles.categoryTabsContent}
          >
            {(Object.keys(PREDEFINED_TAGS) as TagCategory[]).map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryTab,
                  activeCategory === category && styles.activeCategoryTab,
                ]}
                onPress={() => setActiveCategory(category)}
              >
                <Text
                  style={[
                    styles.categoryTabText,
                    activeCategory === category && styles.activeCategoryTabText,
                  ]}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          {/* Tag pills */}
          <View style={styles.tagContainer}>
            {PREDEFINED_TAGS[activeCategory].map((tag) => (
              <TagPill
                key={tag.id}
                tag={tag}
                selected={selectedTags.some((t) => t.id === tag.id)}
                onPress={() => toggleTag(tag)}
              />
            ))}
            
            {/* Custom tag input (only shown in custom category) */}
            {activeCategory === 'custom' && (
              <View style={styles.customTagInputContainer}>
                <TextInput
                  style={styles.customTagInput}
                  value={customTagInput}
                  onChangeText={setCustomTagInput}
                  placeholder="Add custom tag"
                  maxLength={20}
                  returnKeyType="done"
                  onSubmitEditing={addCustomTag}
                />
                <TouchableOpacity style={styles.addTagButton} onPress={addCustomTag}>
                  <Text style={styles.addTagButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          
          {/* Selected tags preview */}
          {selectedTags.length > 0 && (
            <View style={styles.selectedTagsContainer}>
              <Text style={styles.selectedTagsTitle}>Selected Tags</Text>
              <View style={styles.selectedTagsList}>
                {selectedTags.map((tag) => (
                  <View key={tag.id} style={[styles.selectedTag, { backgroundColor: tag.color }]}>
                    <Text style={styles.selectedTagText}>{tag.name}</Text>
                    <TouchableOpacity
                      style={styles.removeTagButton}
                      onPress={() => toggleTag(tag)}
                    >
                      <Text style={styles.removeTagButtonText}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom action buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>Save Routine</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  content: {
    flex: 1,
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderRadius: 12,
    shadowColor: Colors.BLACK,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.GRAY_DARK,
    marginBottom: 8,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: Colors.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.BLACK,
  },
  textAreaInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.BLACK,
  },
  categoryTabs: {
    marginVertical: 16,
  },
  categoryTabsContent: {
    paddingRight: 16,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  activeCategoryTab: {
    backgroundColor: Colors.PRIMARY,
  },
  categoryTabText: {
    fontSize: 14,
    color: Colors.GRAY_DARK,
  },
  activeCategoryTabText: {
    color: Colors.WHITE,
    fontWeight: '600',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
    borderWidth: 1,
    borderColor: Colors.BORDER,
  },
  tagText: {
    fontSize: 14,
  },
  customTagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    width: '100%',
  },
  customTagInput: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
  },
  addTagButton: {
    marginLeft: 8,
    backgroundColor: Colors.PRIMARY,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addTagButtonText: {
    color: Colors.WHITE,
    fontSize: 14,
    fontWeight: '600',
  },
  selectedTagsContainer: {
    marginTop: 20,
  },
  selectedTagsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.BLACK,
    marginBottom: 8,
  },
  selectedTagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  selectedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    margin: 4,
  },
  selectedTagText: {
    fontSize: 14,
    color: Colors.WHITE,
    marginRight: 4,
  },
  removeTagButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeTagButtonText: {
    fontSize: 14,
    color: Colors.WHITE,
    fontWeight: '700',
    lineHeight: 18,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.WHITE,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: Colors.GRAY_DARK,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TagRoutineScreen; 