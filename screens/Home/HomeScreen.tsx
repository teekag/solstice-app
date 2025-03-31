/**
 * HomeScreen Component
 * Main dashboard screen with navigation to key app features
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
  Image,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Colors from '../../constants/colors';
import { useAuth } from '../../contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const featuredRoutines = [
  {
    id: '1',
    title: 'Morning Yoga Flow',
    description: 'Start your day with mindfulness and movement',
    duration: '20 min',
    difficulty: 'Beginner',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '2',
    title: 'HIIT Cardio Blast',
    description: 'High intensity interval training to boost metabolism',
    duration: '30 min',
    difficulty: 'Intermediate',
    image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
  {
    id: '3',
    title: 'Mindful Meditation',
    description: 'Reduce stress and improve focus',
    duration: '15 min',
    difficulty: 'All Levels',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  },
];

type RoutineCardProps = {
  title: string;
  description: string;
  duration: string;
  difficulty: string;
  image: string;
  onPress: () => void;
};

const RoutineCard: React.FC<RoutineCardProps> = ({
  title,
  description,
  duration,
  difficulty,
  image,
  onPress
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Image source={{ uri: image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>{description}</Text>
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{duration}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="fitness-outline" size={14} color="#666" />
            <Text style={styles.metaText}>{difficulty}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({ navigation }: any) => {
  const { user, signOut } = useAuth();

  const handleRoutinePress = (routineId: string) => {
    // In a real app, navigate to routine details or perform screen
    console.log(`Routine pressed: ${routineId}`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.profile?.display_name || 'there'}!</Text>
        <Text style={styles.subGreeting}>What wellness activity would you like today?</Text>
      </View>

      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Routines</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={featuredRoutines}
          renderItem={({ item }) => (
            <RoutineCard
              title={item.title}
              description={item.description}
              duration={item.duration}
              difficulty={item.difficulty}
              image={item.image}
              onPress={() => handleRoutinePress(item.id)}
            />
          )}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.routinesList}
        />
      </View>

      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={styles.quickActionButton} onPress={() => navigation.navigate('Builder')}>
            <Ionicons name="construct" size={24} color="#FF6B6B" />
            <Text style={styles.quickActionText}>Build Routine</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton} 
            onPress={() => navigation.navigate('SavedContent')}
          >
            <Ionicons name="bookmark" size={24} color="#FF6B6B" />
            <Text style={styles.quickActionText}>Saved Content</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton}>
            <Ionicons name="search" size={24} color="#FF6B6B" />
            <Text style={styles.quickActionText}>Browse</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={() => signOut()}>
            <Ionicons name="log-out" size={24} color="#FF6B6B" />
            <Text style={styles.quickActionText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Content Button */}
      <View style={styles.floatingButtonContainer}>
        <TouchableOpacity 
          style={styles.floatingButton}
          onPress={() => Alert.alert(
            'Save Content', 
            'Enter a URL to save content from YouTube, Instagram, TikTok, or an article:',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text: 'Save',
                onPress: () => {
                  // In a real app, this would save the content and then navigate
                  navigation.navigate('SavedContent');
                }
              }
            ],
            { cancelable: true }
          )}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  subGreeting: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  featuredSection: {
    marginTop: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  routinesList: {
    paddingHorizontal: 12,
  },
  card: {
    width: 280,
    marginHorizontal: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  cardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  quickActionsSection: {
    padding: 16,
    marginTop: 8,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  quickActionButton: {
    width: '48%',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },
  floatingButtonContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default HomeScreen;