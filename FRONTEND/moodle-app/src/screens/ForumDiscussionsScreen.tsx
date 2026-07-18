import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ForumDiscussion, ForumService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Avatar, Card, EmptyState, LoadingScreen, colors, spacing } from "../components/ui";
import { formatTimestamp } from "../utils/format";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList, "ForumDiscussions">;
type Rt = RouteProp<RootStackParamList, "ForumDiscussions">;

export default function ForumDiscussionsScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const [discussions, setDiscussions] = useState<ForumDiscussion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ForumService.listDiscussions(params.forumId)
      .catch((err) => Alert.alert("Error", getApiErrorMessage(err)))
      .then((data) => data && setDiscussions(data))
      .finally(() => setLoading(false));
  }, [params.forumId]);

  if (loading) return <LoadingScreen message="Cargando discusiones..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerIcon}>💬</Text>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle} numberOfLines={2}>
            {params.forumName}
          </Text>
          <Text style={styles.headerMeta}>{discussions.length} discusiones</Text>
        </View>
      </View>

      <FlatList
        data={discussions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="💭"
            title="Foro vacío"
            subtitle="Aún no hay discusiones. Sé el primero en participar desde Moodle web."
          />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("ForumPosts", { discussionId: item.id, subject: item.subject })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardRow}>
                <Avatar name={item.userFullname} size={40} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle} numberOfLines={2}>
                    {item.subject}
                  </Text>
                  <Text style={styles.cardMeta}>
                    {item.userFullname} · {formatTimestamp(item.created)}
                  </Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerIcon: { fontSize: 28 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: colors.text },
  headerMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  card: { padding: spacing.md },
  cardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: "700", color: colors.text, lineHeight: 21 },
  cardMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  chevron: { fontSize: 24, color: colors.textMuted },
});
