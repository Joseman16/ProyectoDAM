import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRoute, RouteProp } from "@react-navigation/native";
import { ForumPost, ForumService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Avatar, LoadingScreen, PrimaryButton, colors, spacing, radius } from "../components/ui";
import { formatTimestamp, stripHtml } from "../utils/format";
import { getApiErrorMessage } from "../utils/errors";

type Rt = RouteProp<RootStackParamList, "ForumPosts">;

export default function ForumPostsScreen() {
  const { params } = useRoute<Rt>();
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    const data = await ForumService.listPosts(params.discussionId);
    setPosts(data);
  }, [params.discussionId]);

  useEffect(() => {
    load()
      .catch((err) => Alert.alert("Error", getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [load]);

  async function handlePublish() {
    if (!message.trim()) return;
    try {
      setSending(true);
      await ForumService.createPost(params.discussionId, `Re: ${params.subject}`, message.trim());
      setMessage("");
      await load();
    } catch (err) {
      Alert.alert("Error al publicar", getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  if (loading) return <LoadingScreen message="Cargando mensajes..." />;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <View style={styles.topicBar}>
          <Text style={styles.topicLabel}>Tema</Text>
          <Text style={styles.topicTitle} numberOfLines={2}>
            {params.subject}
          </Text>
        </View>

        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <View style={styles.postHeader}>
                <Avatar name={item.userFullname} size={36} />
                <View style={styles.postMeta}>
                  <Text style={styles.postAuthor}>{item.userFullname}</Text>
                  <Text style={styles.postDate}>{formatTimestamp(item.created)}</Text>
                </View>
              </View>
              <Text style={styles.postMessage}>{stripHtml(item.message)}</Text>
            </View>
          )}
        />

        <View style={styles.replyBox}>
          <TextInput
            style={styles.replyInput}
            placeholder="Escribe una respuesta..."
            placeholderTextColor={colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={2000}
          />
          <PrimaryButton
            label="Publicar"
            onPress={handlePublish}
            loading={sending}
            disabled={!message.trim()}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  topicBar: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  topicLabel: { fontSize: 11, color: colors.secondary, fontWeight: "700", textTransform: "uppercase" },
  topicTitle: { fontSize: 16, fontWeight: "800", color: colors.text, marginTop: 2 },
  list: { padding: spacing.md, paddingBottom: spacing.sm },
  postCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  postHeader: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.sm },
  postMeta: { flex: 1 },
  postAuthor: { fontWeight: "700", fontSize: 14, color: colors.text },
  postDate: { fontSize: 11, color: colors.textSecondary, marginTop: 1 },
  postMessage: { fontSize: 15, color: colors.text, lineHeight: 22 },
  replyBox: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  replyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: 15,
    color: colors.text,
    maxHeight: 100,
    backgroundColor: colors.background,
  },
});
