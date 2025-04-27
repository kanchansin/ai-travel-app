// app/(auth)/login.jsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { SIZES, FONTS } from '../../constants/theme';
import { Feather } from '@expo/vector-icons';
import { loginUser } from '../../services/firebase';

export default function LoginScreen() {
  const router = useRouter();
  const { colors } = useTheme();
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

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { backgroundColor: colors.background }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.appName, { color: colors.primary }]}>
            AI Travel Planner
          </Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.textLight }]}>
            Sign in to your account to continue
          </Text>

          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.accent + '20' }]}>
              <Feather name="alert-circle" size={18} color={colors.accent} />
              <Text style={[styles.errorText, { color: colors.accent }]}>
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
            leftIcon={<Feather name="mail" size={18} color={colors.neutral} />}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Your password"
            secureTextEntry
            leftIcon={<Feather name="lock" size={18} color={colors.neutral} />}
          />

          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordContainer}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.primary }]}>
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
            <Text style={[styles.registerText, { color: colors.textLight }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={[styles.registerLink, { color: colors.primary }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SIZES.layout,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: SIZES.sm,
  },
  appName: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.lg,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.xl,
    marginBottom: SIZES.xs,
  },
  subtitle: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.md,
    marginBottom: SIZES.lg,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.md,
    borderRadius: 8,
    marginBottom: SIZES.md,
  },
  errorText: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.sm,
    marginLeft: SIZES.xs,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.lg,
  },
  forgotPasswordText: {
    ...FONTS.medium,
    fontSize: FONTS.sizes.sm,
  },
  loginButton: {
    marginTop: SIZES.sm,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SIZES.xl,
  },
  registerText: {
    ...FONTS.regular,
    fontSize: FONTS.sizes.md,
  },
  registerLink: {
    ...FONTS.bold,
    fontSize: FONTS.sizes.md,
    marginLeft: SIZES.xs,
  },
});