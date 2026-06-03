import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView, StaggerView } from '../../../src/animations/components';
import { employerService } from '../../../src/services/admin';

export default function EmployerHomeScreen() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await employerService.getAnalytics();
        setAnalytics(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = analytics?.jobs
    ? [
        { label: 'Active Jobs', value: String(analytics.jobs.active || 0), icon: 'briefcase-outline' as const },
        { label: 'Applications', value: String(analytics.applications?.total || 0), icon: 'document-outline' as const },
        { label: 'Interviews', value: String(analytics.applications?.interviewed || 0), icon: 'calendar-outline' as const },
        { label: 'Hires', value: String(analytics.applications?.accepted || 0), icon: 'checkmark-outline' as const },
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
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{user?.full_name || 'Employer'}</Text>
          </View>
          <Avatar uri={user?.avatar} name={user?.full_name} size={48} />
        </View>
      </FadeInView>

      {stats.length > 0 && (
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
      )}
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
});
