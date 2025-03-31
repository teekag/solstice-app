/**
 * Routine Generator Service
 * Provides functions for AI-powered routine generation
 * 
 * NOTE: This is a mock implementation for testing purposes.
 */
import { Card } from '../types/card';
import { Routine, RoutineCard } from '../types/routine';
import { Tag } from '../types/tag';
import { User } from '../types/user';
import { getUserRepository } from './supabaseService';

// Mock UUID generation
const generateMockId = () => Math.random().toString(36).substring(2, 15);

// Mock user for testing
const mockUser: User = {
  id: 'user1',
  username: 'testuser',
  email: 'test@example.com',
  displayName: 'Test User',
  createdAt: new Date(),
  updatedAt: new Date()
};

/**
 * Generate a routine from a text prompt
 * @param prompt User's description of desired routine
 * @returns A structured routine with cards
 */
export const generateRoutineFromPrompt = async (prompt: string): Promise<Routine> => {
  // In a production app, this would call an AI service (e.g., OpenAI)
  // For development, return mock data based on the prompt
  
  console.log(`Generating routine from prompt: ${prompt}`);
  
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Extract potential routine type from prompt
  const routineType = extractRoutineType(prompt);
  
  // Get mock cards based on the detected routine type
  const generatedCards = getMockCardsForType(routineType);
  
  // Convert Card array to RoutineCard array
  const routineCards: RoutineCard[] = generatedCards.map((card, index) => ({
    card,
    order: index + 1
  }));
  
  // Create a routine with the generated cards
  const routine: Routine = {
    id: generateMockId(),
    title: generateTitleFromPrompt(prompt, routineType),
    description: prompt,
    createdAt: new Date(),
    updatedAt: new Date(),
    cards: routineCards,
    tags: [],
    author: mockUser,
    isPublic: false,
    totalDuration: calculateTotalDuration(routineCards),
    difficulty: 'beginner',
    equipment: []
  };
  
  return routine;
};

/**
 * Generate a routine by stitching together content from the user's repository
 * @param searchTerm Term to search for in the repository
 * @param maxCards Maximum number of cards to include
 * @returns A structured routine with cards from repository
 */
export const generateRoutineFromRepository = async (
  searchTerm: string, 
  maxCards: number = 10
): Promise<Routine> => {
  try {
    // For testing, we'll use mock data instead of calling getUserRepository
    const mockRepositoryData = [
      {
        id: generateMockId(),
        title: 'Morning Yoga Flow',
        description: 'Gentle yoga sequence to start your day',
        source_type: 'video' as 'video',
        thumbnail: 'https://via.placeholder.com/300x200',
        source_url: 'https://youtube.com/watch?v=mockId1',
        duration: 600,
        tags: [
          { id: 't1', name: 'yoga', category: 'focus' as const }, 
          { id: 't2', name: 'morning', category: 'custom' as const }
        ],
        cues: [],
        created_at: new Date().toISOString()
      },
      {
        id: generateMockId(),
        title: 'HIIT Workout',
        description: '20-minute high intensity workout',
        source_type: 'video' as 'video',
        thumbnail: 'https://via.placeholder.com/300x200',
        source_url: 'https://youtube.com/watch?v=mockId2',
        duration: 1200,
        tags: [
          { id: 't3', name: 'hiit', category: 'focus' as const }, 
          { id: 't4', name: 'cardio', category: 'focus' as const }
        ],
        cues: [],
        created_at: new Date().toISOString()
      },
      {
        id: generateMockId(),
        title: 'Meditation Practice',
        description: 'Mindfulness meditation guide',
        source_type: 'article' as 'article',
        source_url: 'https://medium.com/mockId3',
        tags: [
          { id: 't5', name: 'meditation', category: 'focus' as const }, 
          { id: 't6', name: 'mindfulness', category: 'focus' as const }
        ],
        cues: [],
        created_at: new Date().toISOString()
      }
    ];
    
    // Filter content by search term (if provided)
    let filteredContent = mockRepositoryData;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredContent = mockRepositoryData.filter(item => 
        item.title.toLowerCase().includes(term) || 
        item.description.toLowerCase().includes(term) ||
        (item.tags && item.tags.some(tag => tag.name.toLowerCase().includes(term)))
      );
    }
    
    // Limit number of cards
    const limitedContent = filteredContent.slice(0, maxCards);
    
    // Convert to Card format
    const cards: Card[] = limitedContent.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      sourceUrl: item.source_url,
      sourceType: item.source_type,
      thumbnail: item.thumbnail,
      duration: item.duration,
      tags: item.tags || [],
      cues: item.cues || [],
      createdAt: new Date(item.created_at),
      updatedAt: new Date()
    }));
    
    // Convert to RoutineCard format
    const routineCards: RoutineCard[] = cards.map((card, index) => ({
      card,
      order: index + 1
    }));
    
    // Create a routine with these cards
    const routine: Routine = {
      id: generateMockId(),
      title: searchTerm ? `${searchTerm} Routine` : 'Custom Routine',
      description: `Routine created from ${cards.length} saved items`,
      createdAt: new Date(),
      updatedAt: new Date(),
      cards: routineCards,
      tags: [],
      author: mockUser,
      isPublic: false,
      totalDuration: calculateTotalDuration(routineCards),
      difficulty: 'beginner',
      equipment: []
    };
    
    return routine;
  } catch (error) {
    console.error('Error generating routine from repository:', error);
    throw new Error('Failed to generate routine from repository');
  }
};

// Helper functions

/**
 * Calculate total duration of a routine based on its cards
 */
const calculateTotalDuration = (routineCards: RoutineCard[]): number => {
  return routineCards.reduce((total, routineCard) => {
    return total + (routineCard.duration || routineCard.card.duration || 0);
  }, 0);
};

/**
 * Extract the routine type from a prompt
 */
const extractRoutineType = (prompt: string): string => {
  const prompt_lower = prompt.toLowerCase();
  
  if (prompt_lower.includes('yoga') || prompt_lower.includes('stretch')) {
    return 'yoga';
  } else if (prompt_lower.includes('strength') || prompt_lower.includes('weight')) {
    return 'strength';
  } else if (prompt_lower.includes('cardio') || prompt_lower.includes('hiit')) {
    return 'cardio';
  } else if (prompt_lower.includes('meditation') || prompt_lower.includes('mindfulness')) {
    return 'meditation';
  } else if (prompt_lower.includes('pilates')) {
    return 'pilates';
  } else {
    return 'general';
  }
};

/**
 * Generate a title from the prompt and detected type
 */
const generateTitleFromPrompt = (prompt: string, type: string): string => {
  // Extract key words from prompt (simplified version)
  const words = prompt.split(' ');
  const keyWords = words.filter(word => 
    word.length > 3 && 
    !['with', 'that', 'this', 'from', 'want', 'need', 'please', 'would', 'could'].includes(word.toLowerCase())
  );
  
  // Get a couple key words
  const selectedWords = keyWords.slice(0, 2).map(w => w.charAt(0).toUpperCase() + w.slice(1));
  
  // Create title based on type and key words
  switch (type) {
    case 'yoga':
      return `${selectedWords.join(' ')} Yoga Flow`;
    case 'strength':
      return `${selectedWords.join(' ')} Strength Training`;
    case 'cardio':
      return `${selectedWords.join(' ')} Cardio Workout`;
    case 'meditation':
      return `${selectedWords.join(' ')} Meditation`;
    case 'pilates':
      return `${selectedWords.join(' ')} Pilates Routine`;
    default:
      return `${selectedWords.join(' ')} Wellness Routine`;
  }
};

/**
 * Get mock cards based on routine type
 */
const getMockCardsForType = (type: string): Card[] => {
  // Define a helper to create mock tags
  const createMockTag = (name: string, category: 'bodyPart' | 'equipment' | 'goal' | 'difficulty' | 'focus' | 'custom' = 'custom'): Tag => ({
    id: generateMockId(),
    name,
    category
  });
  
  switch (type) {
    case 'yoga':
      return [
        {
          id: generateMockId(),
          title: 'Sun Salutation A',
          description: 'Classic yoga warm-up sequence',
          sourceType: 'custom',
          duration: 180,
          tags: [createMockTag('yoga', 'focus'), createMockTag('warm-up', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Breathe deeply through each position', type: 'breathing' },
            { id: generateMockId(), text: 'Keep your core engaged', type: 'form' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Standing Poses',
          description: 'Series of standing yoga poses',
          sourceType: 'custom',
          duration: 300,
          tags: [createMockTag('yoga', 'focus'), createMockTag('standing', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Ground through all four corners of your feet', type: 'form' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Final Relaxation',
          description: 'Savasana relaxation pose',
          sourceType: 'custom',
          duration: 240,
          tags: [createMockTag('yoga', 'focus'), createMockTag('relaxation', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Let your body completely relax', type: 'focus' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
    
    case 'strength':
      return [
        {
          id: generateMockId(),
          title: 'Warm-up',
          description: 'Dynamic warm-up for strength training',
          sourceType: 'custom',
          duration: 180,
          tags: [createMockTag('warm-up', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Squat Series',
          description: 'Various squat variations',
          sourceType: 'custom',
          sets: 3,
          reps: 12,
          tags: [createMockTag('legs', 'bodyPart'), createMockTag('strength', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Keep your knees in line with your toes', type: 'form' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Push-up Variations',
          description: 'Different push-up styles for upper body',
          sourceType: 'custom',
          sets: 3,
          reps: 10,
          tags: [createMockTag('chest', 'bodyPart'), createMockTag('arms', 'bodyPart')],
          cues: [
            { id: generateMockId(), text: 'Maintain a straight line from head to heels', type: 'form' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Cool Down',
          description: 'Static stretching sequence',
          sourceType: 'custom',
          duration: 240,
          tags: [createMockTag('stretching', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
    case 'cardio':
      return [
        {
          id: generateMockId(),
          title: 'Warm-up Jog',
          description: 'Light jogging to increase heart rate',
          sourceType: 'custom',
          duration: 180,
          tags: [createMockTag('cardio', 'focus'), createMockTag('warm-up', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'HIIT Interval 1',
          description: 'High intensity interval training set',
          sourceType: 'custom',
          duration: 240,
          tags: [createMockTag('hiit', 'focus'), createMockTag('cardio', 'focus')],
          cues: [
            { id: generateMockId(), text: 'All-out effort for 30 seconds', type: 'tempo' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Active Recovery',
          description: 'Light movement between intervals',
          sourceType: 'custom',
          duration: 120,
          tags: [createMockTag('recovery', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Focus on controlling your breathing', type: 'breathing' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'HIIT Interval 2',
          description: 'Second set of high intensity exercises',
          sourceType: 'custom',
          duration: 240,
          tags: [createMockTag('hiit', 'focus'), createMockTag('cardio', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Cool Down',
          description: 'Gradual reduction in intensity',
          sourceType: 'custom',
          duration: 180,
          tags: [createMockTag('cool-down', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
    case 'meditation':
      return [
        {
          id: generateMockId(),
          title: 'Settling In',
          description: 'Finding a comfortable position and settling your mind',
          sourceType: 'custom',
          duration: 120,
          tags: [createMockTag('meditation', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Find a comfortable seated position', type: 'form' },
            { id: generateMockId(), text: 'Close your eyes gently', type: 'form' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Breath Awareness',
          description: 'Focusing on the natural rhythm of your breath',
          sourceType: 'custom',
          duration: 300,
          tags: [createMockTag('breathing', 'focus'), createMockTag('meditation', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Notice the sensation of breath entering and leaving your body', type: 'breathing' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Body Scan',
          description: 'Bringing awareness to each part of your body',
          sourceType: 'custom',
          duration: 360,
          tags: [createMockTag('body-scan', 'focus'), createMockTag('meditation', 'focus')],
          cues: [
            { id: generateMockId(), text: 'Move your attention slowly from your toes to your head', type: 'focus' }
          ],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Gentle Return',
          description: 'Gradually returning to regular awareness',
          sourceType: 'custom',
          duration: 120,
          tags: [createMockTag('meditation', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
    default:
      return [
        {
          id: generateMockId(),
          title: 'Getting Started',
          description: 'Introduction to your custom routine',
          sourceType: 'custom',
          duration: 120,
          tags: [createMockTag('beginner', 'difficulty')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Main Activity',
          description: 'Core part of your wellness routine',
          sourceType: 'custom',
          duration: 480,
          tags: [createMockTag('wellness', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: generateMockId(),
          title: 'Finishing Up',
          description: 'Winding down your routine',
          sourceType: 'custom',
          duration: 180,
          tags: [createMockTag('cool-down', 'focus')],
          cues: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
  }
}; 