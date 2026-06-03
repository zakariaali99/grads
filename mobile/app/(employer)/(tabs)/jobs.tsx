import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Badge } from '../../../src/components/Badge';
import { jobService, type JobPost } from '../../../src/services/jobs';

export default function EmployerJobsScreen() {
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await jobService.list({ page_size: 50 });
        setJobs(data.results);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statusColor = (status?: string) => {
    const map: Record<string, 'success' | 'warning' | 'error' | 'info'> = {
      active: 'success',
      draft: 'warning',
      paused: 'warning',
      closed: 'error',
      filled: 'info',
    };
    return map[status || ''] || 'warning';
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>My Jobs</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/(employer)/jobs/create')}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={[typography.small, { color: '#FFF', fontWeight: '600' }]}>Post Job</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl }}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <GlassCard>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                    {item.city || 'Remote'} • {item.employment_type?.replace('_', ' ')}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
                    <Badge label={item.status || 'unknown'} variant={statusColor(item.status)} />
                    <Text style={[typography.small, { color: colors.textMuted }]}>
                      {item.applications_count || 0} applicants
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward-outline" size={20} color={colors.textMuted} />
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
            <Ionicons name="briefcase-outline" size={48} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>No jobs posted yet</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.huge,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
});
