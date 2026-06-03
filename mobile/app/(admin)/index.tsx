import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { Badge } from '../../src/components/Badge';
import { useAuth } from '../../src/hooks/useAuth';
import { FadeInView } from '../../src/animations/components';
import { adminService } from '../../src/services/admin';

export default function AdminDashboardScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data: analyticsData } = await adminService.getDashboard();
        setData(analyticsData);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const adminStats = data
    ? [
        { label: 'Total Users', value: String(data.total_users || 0), change: '', icon: 'people-outline' as const },
        { label: 'Active Jobs', value: String(data.active_jobs || 0), change: '', icon: 'briefcase-outline' as const },
        { label: 'Applications', value: String(data.total_applications || 0), change: '', icon: 'document-outline' as const },
        { label: 'Companies', value: String(data.total_companies || 0), change: '', icon: 'business-outline' as const },
      ]
    : [];

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
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Admin Panel</Text>
            <Text style={[typography.h2, { color: colors.text }]}>Dashboard</Text>
          </View>
          <Badge label="Admin" variant="primary" size="md" />
        </View>
      </FadeInView>

      {adminStats.length > 0 && (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg }}>
          {adminStats.map((s) => (
            <GlassCard key={s.label} style={{ width: '48%' as any, gap: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Ionicons name={s.icon} size={20} color={colors.primary} />
              </View>
              <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>
      )}

      {data?.top_cities && data.top_cities.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Top Cities</Text>
          <GlassCard>
            {data.top_cities.slice(0, 5).map((city: any, i: number) => (
              <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.xs }}>
                <Text style={[typography.caption, { color: colors.text }]}>{city.city || city.college__name_ar || 'Unknown'}</Text>
                <Text style={[typography.small, { color: colors.primary }]}>{city.count}</Text>
              </View>
            ))}
          </GlassCard>
        </View>
      )}

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {[
            { label: 'Users', icon: 'people-outline' as const, color: '#60A5FA' },
            { label: 'Companies', icon: 'business-outline' as const, color: '#34D399' },
            { label: 'Jobs', icon: 'briefcase-outline' as const, color: '#FBBF24' },
            { label: 'Reports', icon: 'flag-outline' as const, color: '#EF4444' },
          ].map((a) => (
            <TouchableOpacity key={a.label} style={[styles.actionCard]}>
              <Ionicons name={a.icon} size={24} color={a.color} />
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
  actionCard: {
    width: '30%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    alignItems: 'center',
  },
});
