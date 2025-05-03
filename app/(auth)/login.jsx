import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Feather } from '@expo/vector-icons';
import { loginUser } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Validate inputs
      if (!email || !password) {
        setError('Please enter both email and password');
        setLoading(false);
        return;
      }
      
      // Attempt login
      await loginUser(email, password);
      
      // Navigate to main app on success
      router.replace('/(tabs)/explore');
    } catch (error) {
      console.error('Login error:', error);
      // Format error message
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Please enter a valid email address');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register');
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
  };

  const styles = useMemo(() => StyleSheet.create({
    container: {
      flexGrow: 1,
      padding: theme.spacing.layout,
      justifyContent: 'center',
      backgroundColor: theme.colors.background,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: theme.spacing.xl,
    },
    logo: {
      width: 80,
      height: 80,
      marginBottom: theme.spacing.sm,
    },
    appName: {
      ...theme.fonts.bold,
      fontSize: theme.fonts.sizes.lg,
      color: theme.colors.primary,
    },
    formContainer: {
      width: '100%',
    },
    title: {
      ...theme.fonts.bold,
      fontSize: theme.fonts.sizes.xl,
      marginBottom: theme.spacing.xs,
      color: theme.colors.text,
    },
    subtitle: {
      ...theme.fonts.regular,
      fontSize: theme.fonts.sizes.md,
      marginBottom: theme.spacing.lg,
      color: theme.colors.textLight,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: theme.spacing.md,
      borderRadius: 8,
      marginBottom: theme.spacing.md,
      backgroundColor: theme.colors.accent + '20',
    },
    errorText: {
      ...theme.fonts.medium,
      fontSize: theme.fonts.sizes.sm,
      marginLeft: theme.spacing.xs,
      color: theme.colors.accent,
    },
    forgotPasswordContainer: {
      alignSelf: 'flex-end',
      marginBottom: theme.spacing.lg,
    },
    forgotPasswordText: {
      ...theme.fonts.medium,
      fontSize: theme.fonts.sizes.sm,
      color: theme.colors.primary,
    },
    loginButton: {
      marginTop: theme.spacing.sm,
    },
    registerContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: theme.spacing.xl,
    },
    registerText: {
      ...theme.fonts.regular,
      fontSize: theme.fonts.sizes.md,
      color: theme.colors.textLight,
    },
    registerLink: {
      ...theme.fonts.bold,
      fontSize: theme.fonts.sizes.md,
      marginLeft: theme.spacing.xs,
      color: theme.colors.primary,
    },
  }), [theme]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>
            AI Travel Planner
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.title}>
            Welcome Back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to your account to continue
          </Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={18} color={theme.colors.accent} />
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Your email address"
            keyboardType="email-address"
            leftIcon={<Feather name="mail" size={18} color={theme.colors.neutral} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            leftIcon={<Feather name="lock" size={18} color={theme.colors.neutral} />}
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={styles.forgotPasswordText}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            fullWidth
            style={styles.loginButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}