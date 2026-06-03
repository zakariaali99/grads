import { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';
import { chatService, type Conversation } from '../../../src/services/chat';

export default function EmployerMessagesScreen() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await chatService.getConversations();
        setConversations(data);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = Array.isArray(conversations)
    ? conversations.filter((c) =>
        (c.participant_names || []).some((name) =>
          name.toLowerCase().includes(search.toLowerCase())
        )
      )
    : [];

  const unreadTotal = Array.isArray(conversations)
    ? conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
    : 0;

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>Inbox</Text>
        {unreadTotal > 0 && (
          <Text style={[typography.caption, { color: colors.primaryLight }]}>{unreadTotal} unread</Text>
        )}
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search candidates..."
            placeholderTextColor={colors.textMuted}
            style={[typography.caption, { flex: 1, color: colors.text, paddingVertical: spacing.xs }]}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => {
          const name = item.participant_names?.[0] || 'User';
          return (
            <TouchableOpacity onPress={() => router.push(`/(graduate)/messages/${item.id}`)}>
              <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <Avatar name={name} size={48} />
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>{name}</Text>
                    {item.last_message_at && (
                      <Text style={[typography.tiny, { color: colors.textMuted }]}>
                        {new Date(item.last_message_at).toLocaleDateString()}
                      </Text>
                    )}
                  </View>
                  {item.last_message && (
                    <Text
                      style={[
                        typography.small,
                        { color: item.unread_count > 0 ? colors.text : colors.textSecondary, marginTop: 2 },
                        item.unread_count > 0 && { fontWeight: '600' },
                      ]}
                      numberOfLines={1}
                    >
                      {item.last_message}
                    </Text>
                  )}
                </View>
                {item.unread_count > 0 && <View style={styles.unreadDot} />}
              </GlassCard>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
            <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
            <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>No messages yet</Text>
          </View>
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
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
