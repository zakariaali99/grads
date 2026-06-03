import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView, SlideUpView, StaggerView } from '../../../src/animations/components';
import { jobService, type JobPost } from '../../../src/services/jobs';
import { notificationService } from '../../../src/services/notifications';

const quickActions = [
  { icon: 'search-outline' as const, label: 'Find Jobs', color: '#60A5FA', route: '/(graduate)/jobs' },
  { icon: 'document-text-outline' as const, label: 'My CV', color: '#34D399', route: null },
  { icon: 'trending-up-outline' as const, label: 'Skill Analysis', color: '#FBBF24', route: null },
  { icon: 'star-outline' as const, label: 'Recommendations', color: '#8B85FF', route: null },
];

export default function GraduateHomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const [jobsRes, notifRes] = await Promise.all([
          jobService.list({ page_size: 3 }),
          notificationService.unreadCount(),
        ]);
        setJobs(jobsRes.data.results);
        setUnreadCount(notifRes.data.count);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{user?.full_name || 'Graduate'}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/notifications')} style={{ position: 'relative' }}>
            <Avatar uri={user?.avatar} name={user?.full_name} size={48} />
            {unreadCount > 0 && (
              <View style={styles.notifBadge}>
                <Text style={[typography.tiny, { color: '#fff', fontSize: 10 }]}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </FadeInView>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {quickActions.map((action, i) => (
            <StaggerView key={action.label} index={i}>
              <TouchableOpacity
                style={[styles.actionCard, { borderColor: action.color + '30' }]}
                onPress={() => action.route ? router.push(action.route as any) : null}
              >
                <Ionicons name={action.icon} size={24} color={action.color} />
                <Text style={[typography.small, { color: colors.text, marginTop: spacing.xs }]}>{action.label}</Text>
              </TouchableOpacity>
            </StaggerView>
          ))}
        </View>
      </View>

      <SlideUpView delay={200}>
        <View style={styles.section}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <Text style={[typography.h3, { color: colors.text }]}>Recent Jobs</Text>
            <TouchableOpacity onPress={() => router.push('/(graduate)/jobs')}>
              <Text style={[typography.small, { color: colors.primaryLight }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : jobs.length === 0 ? (
            <GlassCard style={{ padding: spacing.lg, alignItems: 'center' }}>
              <Text style={[typography.body, { color: colors.textSecondary }]}>No jobs available</Text>
            </GlassCard>
          ) : (
            jobs.map((job) => (
              <TouchableOpacity key={job.id} onPress={() => router.push(`/(graduate)/jobs/${job.id}`)}>
                <GlassCard style={{ marginBottom: spacing.sm }}>
                  <View style={{ gap: spacing.xs }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>{job.title}</Text>
                    <Text style={[typography.caption, { color: colors.textSecondary }]}>
                      {job.company_name} • {job.city || 'Remote'}
                    </Text>
                    {job.salary_min ? (
                      <Text style={[typography.small, { color: colors.success }]}>
                        {job.salary_currency || 'SAR'} {Number(job.salary_min).toLocaleString()}
                        {job.salary_max ? ` - ${Number(job.salary_max).toLocaleString()}` : ''}
                      </Text>
                    ) : null}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))
          )}
        </View>
      </SlideUpView>
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
    padding: spacing.lg,
  },
  actionCard: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: colors.background,
  },
});
