import { useState } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { GlassCard } from '../../../src/components/GlassCard';
import { Avatar } from '../../../src/components/Avatar';

const conversations = [
  { id: '1', name: 'Ahmed Al-Saud', role: 'Frontend Developer', lastMessage: 'Thank you for the opportunity!', time: '10m', unread: true },
  { id: '2', name: 'Nora Al-Ghamdi', role: 'UX Designer', lastMessage: 'I confirm my availability for Thursday', time: '2h', unread: true },
  { id: '3', name: 'Sara Al-Abdullah', role: 'Data Analyst', lastMessage: 'When can I expect to hear back?', time: '1d', unread: false },
];

export default function EmployerMessagesScreen() {
  const [search, setSearch] = useState('');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.header}>
        <Text style={[typography.h2, { color: colors.text }]}>Inbox</Text>
        <Text style={[typography.caption, { color: colors.primaryLight }]}>3 unread</Text>
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
        data={conversations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm }}
        renderItem={({ item }) => (
          <TouchableOpacity>
            <GlassCard style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
              <Avatar name={item.name} size={48} />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={[typography.bodyBold, { color: colors.text }]}>{item.name}</Text>
                    <Text style={[typography.tiny, { color: colors.textMuted }]}>{item.role}</Text>
                  </View>
                  <Text style={[typography.tiny, { color: colors.textMuted }]}>{item.time}</Text>
                </View>
                <Text
                  style={[
                    typography.small,
                    { color: item.unread ? colors.text : colors.textSecondary, marginTop: 2 },
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
