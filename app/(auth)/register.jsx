import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { registerUser } from '../../services/auth';
import { useAuth } from '../../hooks/useAuth';

export default function Register() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setUser } = useAuth();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      // Form validation
      if (!name || !email || !password || !confirmPassword) {
        setError('All fields are required');
        return;
      }
      
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      
      setLoading(true);
      setError('');
      
      // Register the user
      const user = await registerUser(email, password, name);
      setUser(user);
      
      // Redirect to the home page or onboarding
      router.replace('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.formContainer}>
        <Text style={[styles.title, { color: theme.colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textLight }]}>
          Join AI Travel Planner to create personalized trips
        </Text>
        
        {error ? (
          <Text style={[styles.errorText, { backgroundColor: theme.colors.errorLight }]}>{error}</Text>
        ) : null}
        
        <Input
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          autoCapitalize="words"
        />
        
        <Input
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="Create a password"
          secureTextEntry
        />
        
        <Input
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          secureTextEntry
        />
        
        <Button
          title={loading ? "Creating Account..." : "Create Account"}
          onPress={handleRegister}
          disabled={loading}
          icon={loading ? () => <ActivityIndicator size="small" color="#fff" /> : null}
        />
        
        <View style={styles.linkContainer}>
          <Text style={{ color: theme.colors.textLight }}>Already have an account?</Text>
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.link, { color: theme.colors.accent }]}>Login</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  errorText: {
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    color: '#D32F2F',
    textAlign: 'center',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 4,
  },
  link: {
    fontWeight: '600',
  },
});