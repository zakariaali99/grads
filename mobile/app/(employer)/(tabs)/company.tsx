import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';

export default function EmployerCompanyScreen() {
  const { user } = useAuth();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>Company</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <GlassCard style={{ marginHorizontal: spacing.lg, marginBottom: spacing.lg, alignItems: 'center', paddingVertical: spacing.xxl }}>
        <View style={styles.companyIcon}>
          <Ionicons name="business-outline" size={40} color={colors.primary} />
        </View>
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>TechCorp</Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Technology • Riyadh, KSA</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          <Badge label="Verified" variant="success" />
          <Badge label="50-200 employees" />
        </View>
      </GlassCard>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Company Stats</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { label: 'Jobs Posted', value: '45' },
            { label: 'Hires Made', value: '28' },
            { label: 'Rating', value: '4.8' },
          ].map((s) => (
            <GlassCard key={s.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>About</Text>
        <GlassCard>
          <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 22 }]}>
            TechCorp is a leading technology company based in Riyadh, specializing in web development,
            AI solutions, and digital transformation for businesses across the MENA region.
          </Text>
        </GlassCard>
      </View>

      <TouchableOpacity style={styles.verifyButton}>
        <Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} />
        <Text style={[typography.body, { color: colors.warning }]}>Verify Your Company</Text>
      </TouchableOpacity>
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
  companyIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.warning + '40',
  },
});
