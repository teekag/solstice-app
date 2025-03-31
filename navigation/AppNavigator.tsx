import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/Home/HomeScreen';
import BuilderScreen from '../screens/builder/BuilderScreen';
import RepositoryScreen from '../screens/Repository/RepositoryScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import PerformRoutineScreen from '../screens/perform/PerformRoutineScreen';
import SavedContentScreen from '../screens/SavedContent/SavedContentScreen';

// Stack navigator types
export type AppStackParamList = {
  MainTabs: undefined;
  PerformRoutine: { routineId: string };
  SavedContent: undefined;
  Builder: { routineId?: string };
  // Add other modal or stack screens here
};

export type TabParamList = {
  Home: undefined;
  Builder: undefined;
  Repository: undefined;
  Profile: undefined;
};

// Create navigators
const Tab = createBottomTabNavigator<TabParamList>();
const Stack = createStackNavigator<AppStackParamList>();

// Tab Navigator component
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Builder') {
            iconName = focused ? 'construct' : 'construct-outline';
          } else if (route.name === 'Repository') {
            iconName = focused ? 'folder' : 'folder-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FF6B6B',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: 'Discover' }}
      />
      <Tab.Screen 
        name="Builder" 
        component={BuilderScreen} 
        options={{ title: 'Builder' }}
      />
      <Tab.Screen 
        name="Repository" 
        component={RepositoryScreen} 
        options={{ title: 'Repository' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator component
const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen 
        name="PerformRoutine" 
        component={PerformRoutineScreen} 
        options={{ 
          headerShown: true,
          headerTitle: 'Perform Routine',
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#FFFFFF',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="SavedContent" 
        component={SavedContentScreen} 
        options={{ 
          headerShown: true,
          headerTitle: 'Saved Content',
          headerStyle: {
            backgroundColor: '#FF6B6B',
          },
          headerTintColor: '#FFFFFF',
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;