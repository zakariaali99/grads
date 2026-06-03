import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Badge } from '../../src/components/Badge';
import { useAuth } from '../../src/hooks/useAuth';
import { FadeInView } from '../../src/animations/components';

const institutionStats = [
  { label: 'Registered Grads', value: '2,847', change: '+18%', icon: 'people-outline' as const },
  { label: 'Employed Rate', value: '73%', change: '+5%', icon: 'trending-up-outline' as const },
  { label: 'Partner Companies', value: '42', change: '+8', icon: 'business-outline' as const },
  { label: 'Avg Salary', value: '8,200 SAR', change: '+12%', icon: 'cash-outline' as const },
];

const recentGrads = [
  { name: 'Nora Al-Ghamdi', major: 'Computer Science', gpa: '4.2', status: 'employed', year: '2024' },
  { name: 'Ahmed Al-Saud', major: 'Data Science', gpa: '3.8', status: 'seeking', year: '2024' },
  { name: 'Sara Al-Abdullah', major: 'UI/UX Design', gpa: '4.0', status: 'employed', year: '2023' },
];

export default function InstitutionDashboardScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Institution Portal</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{user?.full_name || 'University Admin'}</Text>
          </View>
          <Ionicons name="school-outline" size={32} color={colors.primary} />
        </View>
      </FadeInView>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
        {institutionStats.map((s) => (
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
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
          <Text style={[typography.h3, { color: colors.text }]}>Recent Graduates</Text>
          <TouchableOpacity>
            <Text style={[typography.small, { color: colors.primaryLight }]}>View All</Text>
          </TouchableOpacity>
        </View>
        {recentGrads.map((g, i) => (
          <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={styles.gradIcon}>
                <Text style={[typography.bodyBold, { color: colors.primary, fontSize: 16 }]}>
                  {g.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{g.name}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>{g.major} • GPA: {g.gpa}</Text>
              </View>
              <Badge label={g.status} variant={g.status === 'employed' ? 'success' : 'warning'} />
            </View>
          </GlassCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { label: 'Add Graduate', icon: 'person-add-outline' as const },
            { label: 'View Reports', icon: 'bar-chart-outline' as const },
            { label: 'Partnerships', icon: 'people-outline' as const },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={styles.actionCard}>
              <Ionicons name={a.icon} size={24} color={colors.primary} />
              <Text style={[typography.small, { color: colors.text, marginTop: spacing.xs }]}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
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
  gradIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
});
