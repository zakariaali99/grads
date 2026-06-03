import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView, SlideUpView, StaggerView } from '../../../src/animations/components';

const quickActions = [
  { icon: 'search-outline' as const, label: 'Find Jobs', color: '#60A5FA' },
  { icon: 'document-text-outline' as const, label: 'My CV', color: '#34D399' },
  { icon: 'trending-up-outline' as const, label: 'Skill Analysis', color: '#FBBF24' },
  { icon: 'star-outline' as const, label: 'Recommendations', color: '#8B85FF' },
];

const recentJobs = [
  { title: 'Frontend Developer', company: 'TechCorp', location: 'Riyadh, KSA', salary: '8,000-12,000 SAR' },
  { title: 'UX Designer', company: 'DesignStudio', location: 'Dubai, UAE', salary: '10,000-15,000 AED' },
  { title: 'Data Analyst', company: 'DataDriven', location: 'Remote', salary: '5,000-8,000 USD' },
];

export default function GraduateHomeScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Welcome back,</Text>
            <Text style={[typography.h2, { color: colors.text }]}>{user?.full_name || 'Graduate'}</Text>
          </View>
          <Avatar uri={user?.avatar} name={user?.full_name} size={48} />
        </View>
      </FadeInView>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Quick Actions</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {quickActions.map((action, i) => (
            <StaggerView key={action.label} index={i}>
              <TouchableOpacity style={[styles.actionCard, { borderColor: action.color + '30' }]}>
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
            <TouchableOpacity>
              <Text style={[typography.small, { color: colors.primaryLight }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {recentJobs.map((job, i) => (
            <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
              <View style={{ gap: spacing.xs }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{job.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{job.company} • {job.location}</Text>
                <Text style={[typography.small, { color: colors.success }]}>{job.salary}</Text>
              </View>
            </GlassCard>
          ))}
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
});
