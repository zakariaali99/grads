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

type Role = 'graduate' | 'employer' | 'institution';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [role, setRole] = useState<Role>('graduate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setToast({ message: 'Please fill in all fields', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await register({ name, email, password, role });
      setToast({ message: 'Account created!', type: 'success' });
    } catch (e: any) {
      setToast({ message: e?.message || 'Registration failed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const roles: { key: Role; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
    { key: 'graduate', label: 'Graduate', icon: 'person-outline' },
    { key: 'employer', label: 'Employer', icon: 'business-outline' },
    { key: 'institution', label: 'Institution', icon: 'school-outline' },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.xxl }}>
        <LinearGradient
          colors={['#6C63FF', '#4A42D6']}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 250,
            borderBottomLeftRadius: 60, borderBottomRightRadius: 60, opacity: 0.12,
          }}
        />

        <View style={{ alignItems: 'center', marginBottom: spacing.xxl }}>
          <Ionicons name="person-add-outline" size={48} color={colors.primary} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>Create Account</Text>
        </View>

        <GlassCard>
          <View style={{ gap: spacing.lg }}>
            <Text style={[typography.small, { color: colors.textSecondary }]}>I am a...</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {roles.map((r) => (
                <TouchableOpacity
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[
                    styles.roleChip,
                    role === r.key && styles.roleChipActive,
                  ]}
                >
                  <Ionicons name={r.icon} size={18} color={role === r.key ? colors.primary : colors.textMuted} />
                  <Text style={[typography.small, { color: role === r.key ? colors.primary : colors.textMuted }]}>
                    {r.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View>
              <Text style={[typography.small, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Full Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor={colors.textMuted}
                style={[styles.input]}
              />
            </View>

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
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="At least 8 characters"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                style={[styles.input]}
              />
            </View>

            <TouchableOpacity
              onPress={handleRegister}
              disabled={loading}
              style={[styles.button, loading && { opacity: 0.6 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={[typography.bodyBold, { color: '#FFF' }]}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>
        </GlassCard>

        <TouchableOpacity
          onPress={() => router.push('/(auth)/login')}
          style={{ marginTop: spacing.xl, alignItems: 'center' }}
        >
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            Already have an account?{' '}
            <Text style={{ color: colors.primaryLight, fontWeight: '600' }}>Sign In</Text>
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '20',
  },
});
