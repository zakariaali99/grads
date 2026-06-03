import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Badge } from '../../../src/components/Badge';
import { useAuth } from '../../../src/hooks/useAuth';
import { employerService } from '../../../src/services/admin';

export default function EmployerCompanyScreen() {
  const { user } = useAuth();
  const [company, setCompany] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await employerService.getMyCompany();
        setCompany(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

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
        <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>
          {company?.company_name || 'Your Company'}
        </Text>
        {company?.industry_name || company?.city ? (
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {[company.industry_name, company.city].filter(Boolean).join(' • ')}
          </Text>
        ) : null}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md }}>
          {company?.is_verified && <Badge label="Verified" variant="success" />}
          {company?.company_size && <Badge label={company.company_size} />}
        </View>
      </GlassCard>

      <View style={styles.section}>
        <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>Company Stats</Text>
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[
            { label: 'Jobs Posted', value: String(company?.total_jobs || 0) },
            { label: 'Hires Made', value: String(company?.total_hires || 0) },
            { label: 'Profile Views', value: String(company?.profile_views || 0) },
          ].map((s) => (
            <GlassCard key={s.label} style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}>
              <Text style={[typography.h3, { color: colors.text }]}>{s.value}</Text>
              <Text style={[typography.tiny, { color: colors.textMuted }]}>{s.label}</Text>
            </GlassCard>
          ))}
        </View>
      </View>

      {company?.description && (
        <View style={styles.section}>
          <Text style={[typography.h3, { color: colors.text, marginBottom: spacing.md }]}>About</Text>
          <GlassCard>
            <Text style={[typography.caption, { color: colors.textSecondary, lineHeight: 22 }]}>
              {company.description}
            </Text>
          </GlassCard>
        </View>
      )}

      {!company?.is_verified && (
        <TouchableOpacity style={styles.verifyButton}>
          <Ionicons name="shield-checkmark-outline" size={20} color={colors.warning} />
          <Text style={[typography.body, { color: colors.warning }]}>Verify Your Company</Text>
        </TouchableOpacity>
      )}
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
