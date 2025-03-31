import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

type ForgotPasswordScreenProps = {
  navigation: any;
};

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const { resetPassword } = useAuth();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        Alert.alert('Reset Failed', error.message || 'Failed to send reset instructions');
      } else {
        setResetSent(true);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'An error occurred while sending reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Reset Password</Text>
            <Text style={styles.headerSubtitle}>
              {resetSent
                ? 'Check your email for password reset instructions'
                : 'Enter your email to receive password reset instructions'}
            </Text>
          </View>

          {!resetSent ? (
            <View style={styles.formContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.resetButton}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.resetButtonText}>Send Reset Instructions</Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                We've sent an email to <Text style={styles.emailText}>{email}</Text> with instructions to reset your password.
              </Text>
              <Text style={styles.noteText}>
                If you don't see the email, please check your spam folder.
              </Text>
            </View>
          )}

          <View style={styles.actionsContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.actionLink}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  headerContainer: {
    marginVertical: 30,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 20,
  },
  formContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333333',
  },
  input: {
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  resetButton: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  successContainer: {
    backgroundColor: '#F0FFF0',
    padding: 20,
    borderRadius: 10,
    marginVertical: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  successText: {
    fontSize: 16,
    color: '#333333',
    lineHeight: 24,
    marginBottom: 10,
  },
  emailText: {
    fontWeight: 'bold',
  },
  noteText: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  actionLink: {
    fontSize: 16,
    color: '#4A6FFF',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ForgotPasswordScreen; 