import { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, Switch, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { jobService } from '../../../src/services/jobs';

const EMPLOYMENT_TYPES = ['full_time', 'part_time', 'contract', 'freelance', 'internship', 'temporary'];
const EXPERIENCE_LEVELS = ['entry', 'junior', 'mid', 'senior', 'lead', 'executive'];
const STATUSES = ['active', 'draft', 'paused'];

export default function CreateJobScreen() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    benefits: '',
    employment_type: 'full_time',
    experience_level: 'mid',
    city: '',
    is_remote: false,
    salary_min: '',
    salary_max: '',
    salary_currency: 'SAR',
    vacancies: '1',
    status: 'draft',
  });

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      Alert.alert('Validation', 'Job title is required');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        salary_min: form.salary_min ? Number(form.salary_min) : undefined,
        salary_max: form.salary_max ? Number(form.salary_max) : undefined,
        vacancies: Number(form.vacancies) || 1,
      };
      await jobService.create(payload);
      Alert.alert('Success', 'Job created successfully', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Failed to create job';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const renderPill = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={label}
      onPress={onPress}
      style={[
        styles.pill,
        { borderColor: selected ? colors.primary : colors.glassBorder },
        selected && { backgroundColor: colors.primary + '20' },
      ]}
    >
      <Text style={[typography.tiny, { color: selected ? colors.primary : colors.textSecondary }]}>
        {label.replace('_', ' ')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ paddingBottom: spacing.xxxl }}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close-outline" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.text }]}>Post a Job</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.form}>
        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>Job Title *</Text>
        <TextInput
          value={form.title}
          onChangeText={(v) => set('title', v)}
          placeholder="e.g. Software Engineer"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Employment Type
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {EMPLOYMENT_TYPES.map((t) => renderPill(t, form.employment_type === t, () => set('employment_type', t)))}
        </View>

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Experience Level
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {EXPERIENCE_LEVELS.map((l) => renderPill(l, form.experience_level === l, () => set('experience_level', l)))}
        </View>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>City</Text>
            <TextInput
              value={form.city}
              onChangeText={(v) => set('city', v)}
              placeholder="Riyadh"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
          <View style={{ justifyContent: 'flex-end', paddingBottom: 4 }}>
            <Text style={[typography.tiny, { color: colors.textSecondary, marginBottom: spacing.xs }]}>Remote</Text>
            <View style={styles.switchRow}>
              <Switch
                value={form.is_remote}
                onValueChange={(v) => set('is_remote', v)}
                trackColor={{ false: colors.surfaceLight, true: colors.primary + '60' }}
                thumbColor={form.is_remote ? colors.primary : colors.textMuted}
              />
            </View>
          </View>
        </View>

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Description
        </Text>
        <TextInput
          value={form.description}
          onChangeText={(v) => set('description', v)}
          placeholder="Describe the role..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { minHeight: 100 }]}
          multiline
        />

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Requirements
        </Text>
        <TextInput
          value={form.requirements}
          onChangeText={(v) => set('requirements', v)}
          placeholder="List key requirements..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { minHeight: 80 }]}
          multiline
        />

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Benefits
        </Text>
        <TextInput
          value={form.benefits}
          onChangeText={(v) => set('benefits', v)}
          placeholder="Health insurance, remote flexibility..."
          placeholderTextColor={colors.textMuted}
          style={[styles.input, { minHeight: 80 }]}
          multiline
        />

        <View style={{ flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg }}>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>Salary Min</Text>
            <TextInput
              value={form.salary_min}
              onChangeText={(v) => set('salary_min', v)}
              placeholder="5000"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm }]}>Salary Max</Text>
            <TextInput
              value={form.salary_max}
              onChangeText={(v) => set('salary_max', v)}
              placeholder="15000"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
              keyboardType="numeric"
            />
          </View>
        </View>

        <Text style={[typography.bodyBold, { color: colors.text, marginBottom: spacing.sm, marginTop: spacing.lg }]}>
          Status
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs }}>
          {STATUSES.map((s) => renderPill(s, form.status === s, () => set('status', s)))}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={saving}
          style={[styles.submit, saving && { opacity: 0.6 }]}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={[typography.bodyBold, { color: '#FFF' }]}>Post Job</Text>
          )}
        </TouchableOpacity>
      </View>
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
  form: {
    paddingHorizontal: spacing.lg,
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.md,
    fontSize: 14,
    lineHeight: 20,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  switchRow: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    padding: spacing.xs,
    alignItems: 'center',
  },
  submit: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
});
