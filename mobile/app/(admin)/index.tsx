import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Badge } from '../../src/components/Badge';
import { useAuth } from '../../src/hooks/useAuth';
import { FadeInView } from '../../src/animations/components';

const adminStats = [
  { label: 'Total Users', value: '12,458', change: '+12%', icon: 'people-outline' as const },
  { label: 'Active Jobs', value: '847', change: '+5%', icon: 'briefcase-outline' as const },
  { label: 'Applications', value: '3,291', change: '+8%', icon: 'document-outline' as const },
  { label: 'Revenue', value: '$48.2K', change: '+15%', icon: 'cash-outline' as const },
];

const adminActions = [
  { label: 'Users', icon: 'people-outline' as const, color: '#60A5FA', count: '256 new' },
  { label: 'Companies', icon: 'business-outline' as const, color: '#34D399', count: '18 pending' },
  { label: 'Jobs', icon: 'briefcase-outline' as const, color: '#FBBF24', count: '43 flagged' },
  { label: 'Reports', icon: 'flag-outline' as const, color: '#EF4444', count: '7 new' },
  { label: 'Analytics', icon: 'bar-chart-outline' as const, color: '#8B85FF', count: '' },
  { label: 'Settings', icon: 'settings-outline' as const, color: colors.textMuted, count: '' },
];

const recentUsers = [
  { name: 'Ahmed Al-Saud', role: 'graduate', status: 'active', time: '2m ago' },
  { name: 'TechCorp HR', role: 'employer', status: 'pending', time: '15m ago' },
  { name: 'KSU Admin', role: 'institution', status: 'active', time: '1h ago' },
];

export default function AdminDashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Admin Panel</Text>
            <Text style={[typography.h2, { color: colors.text }]}>Dashboard</Text>
          </View>
          <Badge label="Admin" variant="primary" size="md" />
        </View>
      </FadeInView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        {adminStats.map((s) => (
          <GlassCard key={s.label} style={{ width: '48%' as any, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={[typography.tiny, { color: colors.success }]}>{s.change}</Text>
            </View>
            <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
            <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
          </GlassCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {adminActions.map((a) => (
            <TouchableOpacity key={a.label} style={[styles.actionCard]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
              <Text style={[typography.small, { color: colors.text, marginTop: spacing.xs }]}>{a.label}</Text>
              {a.count ? <Text style={[typography.tiny, { color: a.color, marginTop: 2 }]}>{a.count}</Text> : null}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Recent Users</Text>
        {recentUsers.map((u, i) => (
          <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={styles.userIcon}>
                <Ionicons name={u.role === 'graduate' ? 'person-outline' : u.role === 'employer' ? 'business-outline' : 'school-outline'} size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{u.name}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>{u.time}</Text>
              </View>
              <Badge label={u.status} variant={u.status === 'active' ? 'success' : 'warning'} />
            </View>
          </GlassCard>
        ))}
        <TouchableOpacity style={styles.viewAll}>
          <Text style={[typography.caption, { color: colors.primaryLight }]}>View All Users</Text>
        </TouchableOpacity>
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  actionCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    alignItems: 'center',
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAll: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
});
