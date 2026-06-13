import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../../src/theme';
import { Avatar } from '../../../src/components/Avatar';
import { useAuthStore } from '../../../src/store/authStore';
import { chatService, type Message } from '../../../src/services/chat';
import { useChatSocket } from '../../../src/hooks/useChatSocket';

export default function ConversationDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { sendMessage: wsSend, sendTyping, markRead } = useChatSocket({
    conversationId: id,
    enabled: !!id,
    onNewMessage: (data) => {
      setMessages(prev => [...prev, {
        id: data.id,
        conversation: data.conversation_id,
        sender: data.sender_id,
        sender_name: data.sender_name,
        content: data.content,
        is_read: false,
        created_at: data.created_at,
      }]);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
    onMessageSent: (data) => {
      setMessages(prev => prev.map(m =>
        m.id === data.id ? { ...m, id: data.id, content: data.content, created_at: data.created_at } : m
      ));
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    },
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const { data } = await chatService.getMessages(id);
        setMessages(data);
        markRead();
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSend = () => {
    if (!newMessage.trim() || !id) return;
    const optimistic: Message = {
      id: `temp-${Date.now()}`,
      conversation: id,
      sender: 'me',
      sender_name: 'You',
      content: newMessage.trim(),
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimistic]);
    wsSend(newMessage.trim());
    setNewMessage('');
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Avatar name="Conversation" size={36} />
        <Text style={[typography.bodyBold, { color: colors.text, flex: 1 }]}>Chat</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const isOwn = item.sender === currentUserId || item.sender_name === 'You';
            return (
              <View style={[styles.messageBubble, isOwn ? styles.ownMessage : styles.otherMessage]}>
                <Text style={[typography.caption, { color: isOwn ? '#fff' : colors.text }]}>{item.content}</Text>
                <Text style={[typography.tiny, { color: isOwn ? 'rgba(255,255,255,0.7)' : colors.textMuted, marginTop: 2, alignSelf: 'flex-end' }]}>
                  {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingVertical: spacing.xxxl }}>
              <Ionicons name="chatbubbles-outline" size={48} color={colors.textMuted} />
              <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>No messages yet</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>Send a message to start the conversation</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          multiline
          style={styles.input}
        />
        <TouchableOpacity onPress={handleSend} disabled={!newMessage.trim()} style={[styles.sendButton, !newMessage.trim() && { opacity: 0.5 }]}>
          <Ionicons name="send" size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    paddingTop: spacing.huge,
    borderBottomWidth: 1,
    borderBottomColor: colors.glassBorder,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  ownMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    paddingBottom: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceLight,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    maxHeight: 100,
    color: colors.text,
    fontSize: 14,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
