/**
 * GeneratorScreen Component
 * Screen for generating routines from text prompts or repository content
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Colors from '../../constants/colors';
import { generateRoutineFromPrompt, generateRoutineFromRepository } from '../../services/routineGeneratorService';
import { useRoutine } from '../../context/RoutineContext';

const GeneratorScreen = ({ navigation }: any) => {
  // State
  const [prompt, setPrompt] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'prompt' | 'repository'>('prompt');
  
  // Get routine context
  const { addCards, clearCards } = useRoutine();
  
  // Generate routine from prompt
  const handleGenerateFromPrompt = async () => {
    if (!prompt.trim()) {
      Alert.alert('Please enter a prompt', 'Describe the routine you want to create');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate routine from prompt
      const generatedRoutine = await generateRoutineFromPrompt(prompt);
      
      // Clear existing cards and add new ones
      clearCards();
      addCards(generatedRoutine.cards);
      
      // Navigate to builder screen with pre-populated cards
      navigation.navigate('Builder', { 
        routineTitle: generatedRoutine.title,
        routineDescription: generatedRoutine.description
      });
      
      // Reset prompt
      setPrompt('');
      
    } catch (error) {
      console.error('Error generating routine:', error);
      Alert.alert('Generation Error', 'Failed to generate routine from prompt');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Generate routine from repository content
  const handleGenerateFromRepository = async () => {
    if (!searchTerm.trim()) {
      Alert.alert('Please enter a search term', 'Enter keywords to find relevant content in your repository');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Generate routine from repository
      const generatedRoutine = await generateRoutineFromRepository(searchTerm);
      
      // Clear existing cards and add new ones
      clearCards();
      addCards(generatedRoutine.cards);
      
      // Navigate to builder screen with pre-populated cards
      navigation.navigate('Builder', { 
        routineTitle: generatedRoutine.title,
        routineDescription: generatedRoutine.description
      });
      
      // Reset search term
      setSearchTerm('');
      
    } catch (error) {
      console.error('Error generating routine from repository:', error);
      Alert.alert('Generation Error', 'Failed to generate routine from repository content');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Render prompt generation UI
  const renderPromptTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.promptLabel}>
        Describe your ideal routine
      </Text>
      <TextInput
        style={styles.promptInput}
        placeholder="E.g., A 20-minute morning yoga flow for beginners"
        value={prompt}
        onChangeText={setPrompt}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!isLoading}
      />
      
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Example Prompts:</Text>
        <TouchableOpacity onPress={() => setPrompt('A 30-minute HIIT workout focusing on core strength')}>
          <Text style={styles.exampleText}>• 30-minute HIIT workout focusing on core strength</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPrompt('A gentle meditation sequence for better sleep')}>
          <Text style={styles.exampleText}>• Gentle meditation sequence for better sleep</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setPrompt('A full-body strength workout using just bodyweight')}>
          <Text style={styles.exampleText}>• Full-body strength workout using just bodyweight</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.generateButton, 
          (!prompt.trim() || isLoading) && styles.disabledButton
        ]}
        onPress={handleGenerateFromPrompt}
        disabled={!prompt.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Generate Routine</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  // Render repository search UI
  const renderRepositoryTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.promptLabel}>
        Search your content repository
      </Text>
      <TextInput
        style={styles.searchInput}
        placeholder="E.g., yoga, meditation, cardio"
        value={searchTerm}
        onChangeText={setSearchTerm}
        editable={!isLoading}
      />
      
      <View style={styles.examplesContainer}>
        <Text style={styles.examplesTitle}>Popular Categories:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
          {['Yoga', 'Strength', 'Cardio', 'Meditation', 'Stretching', 'HIIT', 'Pilates'].map(category => (
            <TouchableOpacity 
              key={category}
              style={styles.categoryChip}
              onPress={() => setSearchTerm(category)}
            >
              <Text style={styles.categoryChipText}>{category}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        <Text style={[styles.examplesTitle, { marginTop: 16 }]}>Need more content?</Text>
        <TouchableOpacity 
          style={styles.repositoryLink}
          onPress={() => navigation.navigate('Repository')}
        >
          <Text style={styles.repositoryLinkText}>Go to your content repository →</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={[
          styles.generateButton, 
          (!searchTerm.trim() || isLoading) && styles.disabledButton
        ]}
        onPress={handleGenerateFromRepository}
        disabled={!searchTerm.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.generateButtonText}>Create From Repository</Text>
        )}
      </TouchableOpacity>
    </View>
  );
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Generate Routine</Text>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'prompt' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('prompt')}
        >
          <Text 
            style={[
              styles.tabButtonText,
              activeTab === 'prompt' && styles.activeTabButtonText
            ]}
          >
            Generate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tabButton, 
            activeTab === 'repository' && styles.activeTabButton
          ]}
          onPress={() => setActiveTab('repository')}
        >
          <Text 
            style={[
              styles.tabButtonText,
              activeTab === 'repository' && styles.activeTabButtonText
            ]}
          >
            From Repository
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {activeTab === 'prompt' ? renderPromptTab() : renderRepositoryTab()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
    backgroundColor: Colors.WHITE,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.BLACK,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: Colors.BACKGROUND_LIGHT,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.GRAY_DARK,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.WHITE,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: Colors.PRIMARY,
  },
  tabButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.GRAY_DARK,
  },
  activeTabButtonText: {
    color: Colors.PRIMARY,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  tabContent: {
    minHeight: 400,
  },
  promptLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.BLACK,
  },
  promptInput: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 22,
    minHeight: 120,
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: Colors.WHITE,
    borderWidth: 1,
    borderColor: Colors.BORDER,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  examplesContainer: {
    marginBottom: 20,
  },
  examplesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.GRAY_DARK,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    color: Colors.PRIMARY,
    marginVertical: 4,
    lineHeight: 20,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categoryChip: {
    backgroundColor: Colors.PRIMARY_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryChipText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  repositoryLink: {
    marginTop: 4,
  },
  repositoryLinkText: {
    color: Colors.PRIMARY,
    fontSize: 14,
    fontWeight: '500',
  },
  generateButton: {
    backgroundColor: Colors.PRIMARY,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  generateButtonText: {
    color: Colors.WHITE,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: Colors.GRAY_LIGHT,
  },
});

export default GeneratorScreen; 