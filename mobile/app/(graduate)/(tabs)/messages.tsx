import { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';

const conversations = [
  { id: '1', name: 'TechCorp HR', lastMessage: 'We received your application for Frontend Developer', time: '2m', unread: true },
  { id: '2', name: 'DataDriven Inc.', lastMessage: 'Are you available for an interview this Thursday?', time: '1h', unread: true },
  { id: '3', name: 'Sarah Ahmed', lastMessage: 'Thanks for connecting!', time: '3h', unread: false },
  { id: '4', name: 'DesignStudio', lastMessage: 'Your portfolio looks great!', time: '1d', unread: false },
];

export default function GraduateMessagesScreen() {
  const [search, setSearch] = useState('');

  const filtered = conversations.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>Messages</Text>
        <TouchableOpacity>
          <Ionicons name="create-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={colors.textMuted} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search messages..."
            placeholderTextColor={colors.textMuted}
            style={[typography.caption, { flex: 1, color: colors.text, paddingVertical: spacing.xs }]}
          />
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={item.name} size={48} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={[typography.bodyBold, { color: colors.text }]}>{item.name}</Text>
                  <Text style={[typography.tiny, { color: colors.textMuted }]}>{item.time}</Text>
                </View>
                <Text
                  style={[
                    typography.caption,
                    { color: item.unread ? colors.text : colors.textSecondary },
                    item.unread && { fontWeight: '600' },
                  ]}
                  numberOfLines={1}
                >
                  {item.lastMessage}
                </Text>
              </View>
              {item.unread && <View style={styles.unreadDot} />}
            </GlassCard>
          </TouchableOpacity>
        )}
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
