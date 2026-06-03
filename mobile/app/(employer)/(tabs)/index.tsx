import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView, StaggerView } from '../../../src/animations/components';

const stats = [
  { label: 'Active Jobs', value: '12', icon: 'briefcase-outline' as const },
  { label: 'Applications', value: '48', icon: 'document-outline' as const },
  { label: 'Interviews', value: '6', icon: 'calendar-outline' as const },
  { label: 'Shortlisted', value: '15', icon: 'checkmark-outline' as const },
];

const recentActivity = [
  { name: 'Ahmed Al-Saud', role: 'Frontend Developer', action: 'applied', time: '5m ago' },
  { name: 'Nora Al-Ghamdi', role: 'UX Designer', action: 'shortlisted', time: '1h ago' },
  { name: 'Sara Al-Abdullah', role: 'Data Analyst', action: 'interviewed', time: '2h ago' },
];

const actionIconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
  applied: 'send-outline',
  shortlisted: 'bookmark-outline',
  interviewed: 'calendar-outline',
};

export default function EmployerHomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{user?.full_name || 'Employer'}</Text>
          </View>
          <Avatar uri={user?.avatar} name={user?.full_name} size={48} />
        </View>
      </FadeInView>

      <View style={styles.statsRow}>
        {stats.map((s, i) => (
          <StaggerView key={s.label} index={i}>
            <GlassCard style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
            </GlassCard>
          </StaggerView>
        ))}
      </View>

      <View style={styles.section}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text }]}>Recent Activity</Text>
          <TouchableOpacity>
            <Text style={[typography.small, { color: colors.primaryLight }]}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentActivity.map((a, i) => (
          <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={a.name} size={40} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{a.name}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{a.role}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: spacing.xs }}>
                <Badge label={a.action} variant={a.action === 'applied' ? 'info' : a.action === 'shortlisted' ? 'warning' : 'success'} />
                <Text style={[typography.tiny, { color: colors.textMuted }]}>{a.time}</Text>
              </View>
            </View>
          </GlassCard>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    paddingTop: spacing.huge,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
  },
});
