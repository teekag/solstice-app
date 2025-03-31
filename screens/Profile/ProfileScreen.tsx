import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Image,
  Switch,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';

const ProfileScreen = () => {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // These would come from a user preferences context in a real app
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  
  const handleEditProfile = () => {
    // Navigate to edit profile screen
    console.log('Edit profile');
  };
  
  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="pencil" size={18} color="#FF6B6B" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={{ 
                uri: user?.profile?.profile_image_url || 
                'https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80' 
              }} 
              style={styles.profileImage} 
            />
          </View>
          <Text style={styles.profileName}>{user?.profile?.display_name || 'Your Name'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'email@example.com'}</Text>
        </View>

        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Routines</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>34</Text>
            <Text style={styles.statLabel}>Saved Items</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>28</Text>
            <Text style={styles.statLabel}>Activities</Text>
          </View>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="notifications-outline" size={20} color="#333" />
              <Text style={styles.settingLabel}>Notifications</Text>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#D1D1D6', true: '#FF6B6B' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLabelContainer}>
              <Ionicons name="moon-outline" size={20} color="#333" />
              <Text style={styles.settingLabel}>Dark Mode</Text>
            </View>
            <Switch
              value={darkModeEnabled}
              onValueChange={setDarkModeEnabled}
              trackColor={{ false: '#D1D1D6', true: '#FF6B6B' }}
              thumbColor={'#FFFFFF'}
            />
          </View>
          
          <View style={styles.settingItem}>
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={() => console.log('Navigate to account settings')}
            >
              <Ionicons name="settings-outline" size={20} color="#333" />
              <Text style={styles.settingButtonText}>Account Settings</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={() => console.log('Navigate to privacy settings')}
            >
              <Ionicons name="shield-outline" size={20} color="#333" />
              <Text style={styles.settingButtonText}>Privacy</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingItem}>
            <TouchableOpacity 
              style={styles.settingButton}
              onPress={() => console.log('Navigate to help center')}
            >
              <Ionicons name="help-circle-outline" size={20} color="#333" />
              <Text style={styles.settingButtonText}>Help Center</Text>
              <Ionicons name="chevron-forward" size={16} color="#999" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <React.Fragment>
              <Ionicons name="log-out-outline" size={20} color="#FFFFFF" />
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </React.Fragment>
          )}
        </TouchableOpacity>

        <Text style={styles.versionText}>Solstice v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 4,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 12,
    backgroundColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    color: '#666666',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 16,
    padding: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#E0E0E0',
  },
  settingsSection: {
    marginTop: 8,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  settingItem: {
    marginBottom: 16,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 10,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
  },
  settingButtonText: {
    fontSize: 16,
    color: '#333333',
    flex: 1,
    marginLeft: 10,
  },
  signOutButton: {
    backgroundColor: '#FF6B6B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 12,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999999',
    marginBottom: 24,
  }
});

export default ProfileScreen; 