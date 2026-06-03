import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Toast } from '../../src/components/Toast';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleReset = async () => {
    if (!email) {
      setToast({ message: 'Please enter your email', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      const resp = await fetch('http://localhost:8000/api/v1/accounts/password-reset/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!resp.ok) throw new Error('Failed to send reset email');
      setSent(true);
      setToast({ message: 'Reset link sent! Check your email.', type: 'success' });
    } catch (e: any) {
      setToast({ message: e?.message || 'Failed to send reset email.', type: 'error' });
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
        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Ionicons name="lock-open-outline" size={64} color={colors.primary} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>Reset Password</Text>
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs, textAlign: 'center' }]}>
            Enter your email and we'll send you a reset link
          </Text>
        </View>

        <GlassCard>
          <View style={{ gap: spacing.lg }}>
            {sent ? (
              <View style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.lg }}>
                <Ionicons name="checkmark-circle" size={48} color={colors.success} />
                <Text style={[typography.body, { color: colors.text, textAlign: 'center' }]}>
                  Check your email for the reset link
                </Text>
                <TouchableOpacity onPress={() => router.push('/(auth)/login')} style={[styles.button, { marginTop: spacing.md }]}>
                  <Text style={[typography.bodyBold, { color: '#FFF' }]}>Back to Login</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
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

                <TouchableOpacity
                  onPress={handleReset}
                  disabled={loading}
                  style={[styles.button, loading && { opacity: 0.6 }]}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={[typography.bodyBold, { color: '#FFF' }]}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.back()} style={{ alignItems: 'center' }}>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    <Text style={{ color: colors.primaryLight }}>Back to Login</Text>
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </GlassCard>
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
