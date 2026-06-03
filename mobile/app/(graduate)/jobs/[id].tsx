import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { jobService, type JobPost } from '../../../src/services/jobs';

export default function JobDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<JobPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await jobService.getById(id);
        setJob(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleApply = async () => {
    if (!job) return;
    setApplying(true);
    try {
      const api = (await import('../../../src/lib/api')).default;
      await api.post(`/jobs/${job.id}/apply/`);
      alert('Application submitted successfully!');
      router.back();
    } catch {
      alert('Failed to apply. You may have already applied.');
    } finally {
      setApplying(false);
    }
  };

  const getTypeColor = (type?: string) => {
    const map: Record<string, string> = {
      full_time: '#34D399',
      part_time: '#60A5FA',
      remote: '#8B85FF',
      freelance: '#FBBF24',
      contract: '#F97316',
      internship: '#F472B6',
    };
    return map[type || ''] || colors.textMuted;
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!job) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Stack.Screen options={{ headerShown: false }} />
        <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>Job not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: spacing.md }}>
          <Text style={[typography.body, { color: colors.primary }]}>Go back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[typography.h2, { color: colors.text, flex: 1, textAlign: 'center' }]}>Job Details</Text>
          <View style={{ width: 24 }} />
        </View>

        <GlassCard style={{ margin: spacing.lg }}>
          <Text style={[typography.h2, { color: colors.text }]}>{job.title}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
            {job.company_name} • {job.city || 'Remote'}
          </Text>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md, flexWrap: 'wrap' }}>
            <View style={[styles.badge, { backgroundColor: getTypeColor(job.employment_type) + '20' }]}>
              <Text style={[typography.tiny, { color: getTypeColor(job.employment_type) }]}>
                {job.employment_type?.replace('_', ' ')}
              </Text>
            </View>
            {job.experience_level && (
              <View style={styles.badge}>
                <Text style={[typography.tiny, { color: colors.textSecondary }]}>{job.experience_level}</Text>
              </View>
            )}
            {job.is_remote && (
              <View style={styles.badge}>
                <Text style={[typography.tiny, { color: colors.primary }]}>Remote</Text>
              </View>
            )}
            {job.is_urgent && (
              <View style={[styles.badge, { backgroundColor: '#F9731620' }]}>
                <Text style={[typography.tiny, { color: '#F97316' }]}>Urgent</Text>
              </View>
            )}
          </View>

          <View style={styles.statsRow}>
            {job.salary_min && (
              <View style={{ alignItems: 'center' }}>
                <Text style={[typography.small, { color: colors.success }]}>
                  {job.salary_currency || 'SAR'} {Number(job.salary_min).toLocaleString()}
                  {job.salary_max ? ` - ${Number(job.salary_max).toLocaleString()}` : ''}
                </Text>
                <Text style={[typography.tiny, { color: colors.textMuted }]}>Salary</Text>
              </View>
            )}
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.small, { color: colors.text }]}>{job.applications_count || 0}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>Applicants</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={[typography.small, { color: colors.text }]}>{job.vacancies || 1}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>Vacancies</Text>
            </View>
          </View>
        </GlassCard>

        {job.description && (
          <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Description</Text>
            <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>{job.description}</Text>
          </GlassCard>
        )}

        {job.requirements && (
          <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Requirements</Text>
            <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>{job.requirements}</Text>
          </GlassCard>
        )}

        {job.benefits && (
          <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Benefits</Text>
            <Text style={[typography.body, { color: colors.textSecondary, lineHeight: 22 }]}>{job.benefits}</Text>
          </GlassCard>
        )}

        {job.skills_list && job.skills_list.length > 0 && (
          <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.sm }]}>Skills</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
              {job.skills_list.map((skill) => (
                <View key={skill.id} style={styles.skillBadge}>
                  <Text style={[typography.tiny, { color: colors.primary }]}>{skill.name_ar}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}
      </ScrollView>

      <View style={styles.bottomBar}>
        <View>
          <Text style={[typography.small, { color: colors.textSecondary }]}>Posted by</Text>
          <Text style={[typography.bodyBold, { color: colors.text }]}>{job.company_name}</Text>
        </View>
        <TouchableOpacity
          onPress={handleApply}
          disabled={applying}
          style={[styles.applyButton, applying && { opacity: 0.6 }]}
        >
          {applying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={[typography.bodyBold, { color: '#fff' }]}>Apply Now</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.huge,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
  skillBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary + '15',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minWidth: 120,
    alignItems: 'center',
  },
});
