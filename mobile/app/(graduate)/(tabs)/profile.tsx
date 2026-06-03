import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView } from '../../../src/animations/components';

export default function GraduateProfileScreen() {
  const { user } = useAuth();

  const stats = [
    { label: 'Profile Views', value: '142', icon: 'eye-outline' as const },
    { label: 'Applications', value: '8', icon: 'document-outline' as const },
    { label: 'Interviews', value: '3', icon: 'calendar-outline' as const },
    { label: 'Offers', value: '1', icon: 'trophy-outline' as const },
  ];

  const education = [
    { degree: 'B.Sc. Computer Science', school: 'King Saud University', year: '2024' },
    { degree: 'High School Diploma', school: 'Al Faisal Academy', year: '2020' },
  ];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <FadeInView>
        <View style={styles.header}>
          <Avatar uri={user?.avatar} name={user?.full_name} size={80} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>{user?.full_name || 'Graduate User'}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{user?.email}</Text>
          <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
            <Badge label="Computer Science" variant="primary" />
            <Badge label="KSU" variant="primary" />
          </View>
        </View>
      </FadeInView>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <GlassCard key={s.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
            <Ionicons name={s.icon} size={20} color={colors.primary} />
            <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
            <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
          </GlassCard>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Education</Text>
        {education.map((edu, i) => (
          <GlassCard key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
              <Ionicons name="school-outline" size={24} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyBold, { color: colors.text }]}>{edu.degree}</Text>
                <Text style={[typography.caption, { color: colors.textSecondary }]}>{edu.school} • {edu.year}</Text>
              </View>
            </View>
          </GlassCard>
        ))}
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add-outline" size={20} color={colors.primary} />
          <Text style={[typography.caption, { color: colors.primaryLight }]}>Add Education</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Skills</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {['React', 'TypeScript', 'Python', 'UI/UX', 'Data Analysis', 'Arabic (Native)', 'English (Fluent)'].map((s) => (
            <Badge key={s} label={s} size="md" />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: borderRadius.lg,
    borderStyle: 'dashed',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
});
