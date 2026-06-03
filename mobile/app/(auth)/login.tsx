import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { useAuth } from '../../src/hooks/useAuth';
import { Toast } from '../../src/components/Toast';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      setToast({ message: 'Welcome back!', type: 'success' });
    } catch (e: any) {
      setToast({ message: e?.message || 'Login failed. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xxl }}>
        <LinearGradient
          colors={['#6C63FF', '#4A42D6']}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 280,
            borderBottomLeftRadius: 60, borderBottomRightRadius: 60, opacity: 0.15,
          }}
        />

        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Ionicons name="school-outline" size={64} color={colors.primary} />
          <Text style={[typography.h1, { color: colors.text, marginTop: spacing.md }]}>Graduators</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            Sign in to continue
          </Text>
        </View>

        <GlassCard>
          <View style={{ gap: spacing.lg }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Login</Text>

            <View>
              <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input]}
              />
            </View>

            <View>
              <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textMuted}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1, borderWidth: 0 }]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: spacing.sm }}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')}>
              <Text style={[typography.small, { color: colors.primaryLight, textAlign: 'right' }]}>
                Forgot password?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[typography.bodyBold, { color: '#FFF' }]}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/register')}
          style={{ marginTop: spacing.xl, alignItems: 'center' }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Don't have an account?{' '}
            <Text style={{ color: colors.primaryLight, fontWeight: '600' }}>Sign Up</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast
        message={toast?.message || ''}
        type={toast?.type || 'info'}
        visible={!!toast}
        onHide={() => setToast(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    color: colors.text,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
