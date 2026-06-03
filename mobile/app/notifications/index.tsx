import { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../src/theme';
import { notificationService, type NotificationItem } from '../../src/services/notifications';
import { useAuth } from '../../src/hooks/useAuth';
import { useNotificationSocket } from '../../src/hooks/useNotificationSocket';

const typeIcons: Record<string, { icon: keyof typeof Ionicons.glyphMap; color: string }> = {
  application: { icon: 'briefcase-outline', color: '#60A5FA' },
  interview: { icon: 'calendar-outline', color: '#8B85FF' },
  message: { icon: 'chatbubble-outline', color: '#34D399' },
  job_match: { icon: 'search-outline', color: '#FBBF24' },
  profile_view: { icon: 'eye-outline', color: '#F472B6' },
  verification: { icon: 'shield-checkmark-outline', color: '#34D399' },
  system: { icon: 'alert-circle-outline', color: '#F97316' },
  announcement: { icon: 'megaphone-outline', color: '#FBBF24' },
};

export default function NotificationsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useNotificationSocket({
    enabled: isAuthenticated,
    onNotification: (data) => {
      const newNotif: NotificationItem = {
        id: data.id,
        notification_type: data.notification_type || 'system',
        title: data.title,
        message: data.message,
        data: data.data,
        is_read: false,
        created_at: data.created_at || new Date().toISOString(),
      };
      setNotifications(prev => [newNotif, ...prev]);
    },
    onUnreadCount: (count) => {},
  });

  const fetchNotifications = useCallback(async (pageNum: number, append: boolean) => {
    try {
      if (!append) setLoading(true);
      const { data } = await notificationService.list({ page: pageNum, page_size: 20 });
      if (append) {
        setNotifications(prev => [...prev, ...data.results]);
      } else {
        setNotifications(data.results);
      }
      setHasMore(!!data.next);
      setPage(pageNum);
    } catch {
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(1, false); }, []);
  useEffect(() => {
    if (!isAuthenticated) router.replace('/(auth)/login');
  }, [isAuthenticated]);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return 'now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return d.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h2, { color: colors.text }]}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={[typography.tiny, { color: colors.primary }]}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={[typography.small, { color: colors.primary }]}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, gap: spacing.sm, paddingBottom: spacing.xxxl }}
        refreshing={refreshing}
        onRefresh={() => { setRefreshing(true); fetchNotifications(1, false); }}
        onEndReached={() => { if (hasMore) fetchNotifications(page + 1, true); }}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => {
          const typeInfo = typeIcons[item.notification_type] || { icon: 'notifications-outline' as const, color: colors.textMuted };
          return (
            <TouchableOpacity
              onPress={() => !item.is_read && handleMarkRead(item.id)}
              style={[
                styles.notifCard,
                !item.is_read && { backgroundColor: colors.primary + '10', borderColor: colors.primary + '30' },
              ]}
            >
              <View style={[styles.iconWrap, { backgroundColor: typeInfo.color + '20' }]}>
                <Ionicons name={typeInfo.icon} size={20} color={typeInfo.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  typography.caption,
                  { color: item.is_read ? colors.textSecondary : colors.text },
                  !item.is_read && { fontWeight: '600' },
                ]}>
                  {item.title}
                </Text>
                <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]} numberOfLines={2}>
                  {item.message}
                </Text>
                <Text style={[typography.tiny, { color: colors.textMuted, marginTop: 2 }]}>
                  {formatTime(item.created_at)}
                </Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          loading ? (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
              <Ionicons name="notifications-off-outline" size={48} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>No notifications</Text>
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
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.huge,
  },
  notifCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
});
