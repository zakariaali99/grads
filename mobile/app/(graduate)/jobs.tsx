import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { GlassCard } from '../../src/components/GlassCard';
import { jobService, type JobPost } from '../../src/services/jobs';
import { useAuth } from '../../src/hooks/useAuth';

const employmentTypes = [
  { key: '', label: 'All' },
  { key: 'full_time', label: 'Full Time' },
  { key: 'part_time', label: 'Part Time' },
  { key: 'remote', label: 'Remote' },
  { key: 'freelance', label: 'Freelance' },
  { key: 'contract', label: 'Contract' },
  { key: 'internship', label: 'Internship' },
];

export default function JobSearchScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchJobs = useCallback(async (pageNum: number, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      const params: Record<string, any> = { page: pageNum, page_size: 20 };
      if (search) params.search = search;
      if (typeFilter) params.employment_type = typeFilter;
      const { data } = await jobService.list(params);
      if (append) {
        setJobs(prev => [...prev, ...data.results]);
      } else {
        setJobs(data.results);
      }
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    setPage(1);
    fetchJobs(1);
  }, [fetchJobs]);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/(auth)/login');
  }, [isAuthenticated]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchJobs(1);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchJobs(page + 1, true);
    }
  };

  const getTypeColor = (type: string) => {
    const map: Record<string, string> = {
      full_time: '#34D399',
      part_time: '#60A5FA',
      remote: '#8B85FF',
      freelance: '#FBBF24',
      contract: '#F97316',
      internship: '#F472B6',
    };
    return map[type] || colors.textMuted;
  };

  const getLevelLabel = (level: string) => {
    const map: Record<string, string> = {
      entry: 'Entry',
      junior: 'Junior',
      mid: 'Mid',
      senior: 'Senior',
      lead: 'Lead',
      executive: 'Executive',
    };
    return map[level] || level;
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[typography.h2, { color: colors.text }]}>Find Jobs</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search jobs..."
            placeholderTextColor={colors.textMuted}
            style={[typography.caption, { flex: 1, color: colors.text, paddingVertical: spacing.xs }]}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={employmentTypes}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ gap: spacing.sm }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setTypeFilter(item.key)}
              style={[
                styles.filterChip,
                typeFilter === item.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={[
                typography.small,
                { color: typeFilter === item.key ? '#fff' : colors.textSecondary },
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={jobs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl }}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={loadingMore ? <ActivityIndicator color={colors.primary} style={{ padding: spacing.md }} /> : null}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => router.push(`/(graduate)/jobs/${item.id}`)}>
            <GlassCard style={{ gap: spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{item.title}</Text>
                  <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>
                    {item.company_name} • {item.city || 'Remote'}
                  </Text>
                </View>
                {item.is_featured && (
                  <View style={{ backgroundColor: colors.primary + '20', paddingHorizontal: 8, paddingVertical: 2, borderRadius: borderRadius.sm }}>
                    <Text style={[typography.tiny, { color: colors.primary }]}>Featured</Text>
                  </View>
                )}
              </View>

              <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' }}>
                <View style={[styles.badge, { backgroundColor: getTypeColor(item.employment_type) + '20' }]}>
                  <Text style={[typography.tiny, { color: getTypeColor(item.employment_type) }]}>
                    {item.employment_type?.replace('_', ' ')}
                  </Text>
                </View>
                <View style={styles.badge}>
                  <Text style={[typography.tiny, { color: colors.textSecondary }]}>
                    {getLevelLabel(item.experience_level)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                {item.salary_min ? (
                  <Text style={[typography.small, { color: colors.success }]}>
                    {item.salary_currency || 'SAR'} {Number(item.salary_min).toLocaleString()}
                    {item.salary_max ? ` - ${Number(item.salary_max).toLocaleString()}` : ''}
                  </Text>
                ) : <View />}
                <Text style={[typography.tiny, { color: colors.textMuted }]}>
                  {item.applications_count || 0} applicants
                </Text>
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
              <Ionicons name="search-outline" size={48} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>No jobs found</Text>
            </View>
          )
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceLight,
  },
});
