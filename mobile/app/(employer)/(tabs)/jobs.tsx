import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Badge } from '../../../src/components/Badge';

const jobs = [
  { title: 'Frontend Developer', applicants: 12, status: 'active', location: 'Riyadh', type: 'Full-time' },
  { title: 'UX Designer', applicants: 8, status: 'active', location: 'Remote', type: 'Contract' },
  { title: 'Data Analyst', applicants: 5, status: 'draft', location: 'Jeddah', type: 'Full-time' },
  { title: 'Backend Engineer', applicants: 15, status: 'active', location: 'Dammam', type: 'Full-time' },
];

export default function EmployerJobsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>My Jobs</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={20} color="#FFF" />
          <Text style={[typography.small, { color: '#FFF', fontWeight: '600' }]}>Post Job</Text>
        </TouchableOpacity>
      </View>

      {jobs.map((job, i) => (
        <TouchableOpacity key={i}>
          <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{job.title}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
                  {job.location} • {job.type}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
                  <Badge label={job.status} variant={job.status === 'active' ? 'success' : 'warning'} />
                  <Text style={[typography.small, { color: colors.textMuted }]}>
                    {job.applicants} applicants
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={colors.textMuted} />
            </View>
          </GlassCard>
        </TouchableOpacity>
      ))}
    </ScrollView>
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
