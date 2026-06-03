import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Badge } from '../../src/components/Badge';
import { useAuth } from '../../src/hooks/useAuth';
import { FadeInView } from '../../src/animations/components';
import { institutionService } from '../../src/services/admin';

export default function InstitutionDashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: dashboardData } = await institutionService.getDashboard();
        setData(dashboardData);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = data
    ? [
        { label: 'Registered Grads', value: String(data.total_alumni || 0), change: '', icon: 'people-outline' as const },
        { label: 'Employed Rate', value: data.employment_rate ? `${Math.round(data.employment_rate * 100)}%` : '-', change: '', icon: 'trending-up-outline' as const },
        { label: 'Partner Companies', value: String(data.partner_count || 0), change: '', icon: 'business-outline' as const },
        { label: 'Avg Salary', value: data.avg_salary ? `${Number(data.avg_salary).toLocaleString()} SAR` : '-', change: '', icon: 'cash-outline' as const },
      ]
    : [];

  const recentGrads: any[] = data?.recent_graduates || [];

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        {stats.map((s) => (
          <GlassCard key={s.label} style={{ width: '48%' as any, gap: spacing.xs }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
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
        {recentGrads.length > 0 ? recentGrads.map((g, i) => (
          <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <View style={styles.gradIcon}>
                <Text style={[typography.bodyBold, { color: colors.primary, fontSize: 16 }]}>
                  {(g.full_name || g.name || '?').split(' ').map((n: string) => n[0]).join('')}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{g.full_name || g.name}</Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>
                  {g.major || g.field_of_study || ''}{g.gpa ? ` • GPA: ${g.gpa}` : ''}
                </Text>
              </View>
              <Badge label={g.is_employed ? 'employed' : 'seeking'} variant={g.is_employed ? 'success' : 'warning'} />
            </View>
          </GlassCard>
        )) : (
          <GlassCard style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Ionicons name="people-outline" size={32} color={colors.textMuted} />
            <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.sm }]}>No graduates yet</Text>
          </GlassCard>
        )}
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
