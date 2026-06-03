import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { FadeInView } from '../../../src/animations/components';
import { graduateProfileService } from '../../../src/services/admin';

export default function GraduateProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [profileRes, analyticsRes] = await Promise.all([
          graduateProfileService.getMyProfile(),
          graduateProfileService.getAnalytics(),
        ]);
        setProfile(profileRes.data);
        setAnalytics(analyticsRes.data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = analytics?.applications
    ? [
        { label: 'Applications', value: String(analytics.applications.total || 0), icon: 'document-outline' as const },
        { label: 'Interviews', value: String(analytics.applications.interviews || 0), icon: 'calendar-outline' as const },
        { label: 'Accepted', value: String(analytics.applications.accepted || 0), icon: 'trophy-outline' as const },
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
          <Avatar uri={user?.avatar} name={user?.full_name} size={80} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>{user?.full_name || 'Graduate'}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{profile?.headline || user?.email}</Text>
          {profile?.city && (
            <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm }}>
              {profile.college_name && <Badge label={profile.college_name} variant="primary" />}
              <Badge label={profile.city} />
            </View>
          )}
        </View>
      </FadeInView>

      {stats.length > 0 && (
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <GlassCard key={s.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Ionicons name={s.icon} size={20} color={colors.primary} />
              <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>
      )}

      {profile?.education && profile.education.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Education</Text>
          {profile.education.map((edu: any, i: number) => (
            <GlassCard key={edu.id || i} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                <Ionicons name="school-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{edu.degree || edu.field_of_study}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>
                    {edu.school} {edu.end_year ? `• ${edu.end_year}` : ''}
                  </Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {profile?.experience && profile.experience.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Experience</Text>
          {profile.experience.map((exp: any, i: number) => (
            <GlassCard key={exp.id || i} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                <Ionicons name="briefcase-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{exp.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]}>{exp.company}</Text>
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      )}

      {profile?.skills && profile.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Skills</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {profile.skills.map((s: any) => (
              <Badge key={s.id} label={s.name_ar} size="md" />
            ))}
          </View>
        </View>
      )}

      {profile?.certifications && profile.certifications.length > 0 && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Certifications</Text>
          {profile.certifications.map((cert: any, i: number) => (
            <GlassCard key={cert.id || i} style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md }}>
                <Ionicons name="ribbon-outline" size={24} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{cert.name}</Text>
                  {cert.issuer && <Text style={[typography.caption, { color: colors.textSecondary }]}>{cert.issuer}</Text>}
                </View>
              </View>
            </GlassCard>
          ))}
        </View>
      )}
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
});
