import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Activity, CourseService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Badge, Card, EmptyState, LoadingScreen, colors, spacing } from "../components/ui";
import { formatTimestamp } from "../utils/format";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList, "CourseDetail">;
type Rt = RouteProp<RootStackParamList, "CourseDetail">;

const ACTIVITY_META: Record<string, { icon: string; color: string; navigable: boolean }> = {
  assign: { icon: "📝", color: "#6C5CE7", navigable: true },
  forum: { icon: "💬", color: "#00CEC9", navigable: true },
  resource: { icon: "📄", color: "#74B9FF", navigable: false },
  quiz: { icon: "❓", color: "#FD79A8", navigable: false },
  url: { icon: "🔗", color: "#FDCB6E", navigable: false },
};

export default function CourseDetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params } = useRoute<Rt>();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    CourseService.listActivities(params.courseId)
      .catch((err) => Alert.alert("Error", getApiErrorMessage(err)))
      .then((data) => data && setActivities(data))
      .finally(() => setLoading(false));
  }, [params.courseId]);

  function openActivity(activity: Activity) {
    const meta = ACTIVITY_META[activity.modname];
    if (!meta?.navigable) {
      Alert.alert("Próximamente", `La actividad "${activity.type}" estará disponible en una futura versión.`);
      return;
    }
    if (activity.modname === "assign") {
      navigation.navigate("AssignmentSubmit", { assignId: activity.id, activityName: activity.name });
    } else if (activity.modname === "forum") {
      navigation.navigate("ForumDiscussions", { forumId: activity.id, forumName: activity.name });
    }
  }

  if (loading) return <LoadingScreen message="Cargando actividades..." />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle} numberOfLines={2}>
          {params.courseName}
        </Text>
        <Text style={styles.headerMeta}>{activities.length} actividades</Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => `${item.modname}-${item.courseModuleId}`}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Sin actividades"
            subtitle="Este curso aún no tiene tareas, foros ni recursos publicados."
          />
        }
        renderItem={({ item }) => {
          const meta = ACTIVITY_META[item.modname] ?? { icon: "📌", color: colors.textMuted, navigable: false };
          return (
            <TouchableOpacity activeOpacity={0.85} onPress={() => openActivity(item)}>
              <Card style={styles.row}>
                <View style={[styles.iconWrap, { backgroundColor: meta.color + "22" }]}>
                  <Text style={styles.icon}>{meta.icon}</Text>
                </View>
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <View style={styles.badges}>
                    <Badge label={item.type} tone="info" />
                    {item.status !== "N/A" ? (
                      <Badge
                        label={item.status}
                        tone={item.status === "entregado" ? "success" : "warning"}
                      />
                    ) : null}
                  </View>
                  {item.dueDate ? (
                    <Text style={styles.dueDate}>Entrega: {formatTimestamp(item.dueDate)}</Text>
                  ) : null}
                </View>
                {meta.navigable ? <Text style={styles.chevron}>›</Text> : null}
              </Card>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  headerTitle: { fontSize: 20, fontWeight: "800", color: colors.text },
  headerMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: { fontSize: 22 },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.text, lineHeight: 21 },
  badges: { flexDirection: "row", gap: 6, marginTop: 6, flexWrap: "wrap" },
  dueDate: { fontSize: 12, color: colors.textSecondary, marginTop: 6 },
  chevron: { fontSize: 28, color: colors.textMuted, fontWeight: "300" },
});
