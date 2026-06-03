import { View, Text, ScrollView, TouchableOpacity, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { useAuth } from '../../../src/hooks/useAuth';
import { useState } from 'react';

export default function GraduateSettingsScreen() {
  const { logout } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [arabic, setArabic] = useState(true);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        { icon: 'person-outline' as const, label: 'Edit Profile', onPress: () => {} },
        { icon: 'lock-closed-outline' as const, label: 'Change Password', onPress: () => {} },
        { icon: 'trash-outline' as const, label: 'Delete Account', destructive: true, onPress: () => {} },
      ],
    },
    {
      title: 'Preferences',
      items: [
        { icon: 'notifications-outline' as const, label: 'Notifications', right: 'switch' as const, value: notifications, onToggle: setNotifications },
        { icon: 'language-outline' as const, label: 'Arabic (RTL)', right: 'switch' as const, value: arabic, onToggle: setArabic },
      ],
    },
    {
      title: 'Support',
      items: [
        { icon: 'help-circle-outline' as const, label: 'FAQ', onPress: () => {} },
        { icon: 'mail-outline' as const, label: 'Contact Us', onPress: () => {} },
        { icon: 'document-text-outline' as const, label: 'Privacy Policy', onPress: () => {} },
        { icon: 'shield-outline' as const, label: 'Terms of Service', onPress: () => {} },
      ],
    },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.text }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {settingsSections.map((section) => (
        <View key={section.title} style={styles.section}>
          <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, paddingHorizontal: spacing.xs }]}>
            {section.title}
          </Text>
          <GlassCard noPadding>
            {section.items.map((item: any, i: number) => (
              <TouchableOpacity
                key={item.label}
                onPress={item.onPress}
                style={[
                  styles.settingRow,
                  i < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
                ]}
              >
                <Ionicons name={item.icon} size={20} color={item.destructive ? colors.error : colors.textSecondary} />
                <Text
                  style={[
                    typography.body,
                    { flex: 1, color: item.destructive ? colors.error : colors.text },
                  ]}
                >
                  {item.label}
                </Text>
                {item.right === 'switch' ? (
                  <Switch
                    value={item.value}
                    onValueChange={item.onToggle}
                    trackColor={{ false: colors.surfaceDark, true: colors.primary + '60' }}
                    thumbColor={item.value ? colors.primary : colors.textMuted}
                  />
                ) : (
                  <Ionicons name="chevron-forward-outline" size={18} color={colors.textMuted} />
                )}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </View>
      ))}

      <TouchableOpacity onPress={logout} style={[styles.logoutButton]}>
        <Ionicons name="log-out-outline" size={20} color={colors.error} />
        <Text style={[typography.bodyBold, { color: colors.error }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.huge,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.error + '40',
  },
});
