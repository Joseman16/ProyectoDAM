import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Course, CourseService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Card, EmptyState, LoadingScreen, colors, spacing } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

const GRADIENTS = [
  ["#6C5CE7", "#A29BFE"],
  ["#00CEC9", "#55EFC4"],
  ["#FD79A8", "#FDCB6E"],
  ["#74B9FF", "#0984E3"],
  ["#E17055", "#FAB1A0"],
] as const;

export default function CourseListScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const data = await CourseService.listMyCourses();
      setCourses(data);
    } catch (err) {
      setError(getApiErrorMessage(err, "No se pudieron cargar los cursos."));
    }
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  if (loading) return <LoadingScreen message="Cargando tus cursos..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
        <Text style={styles.heroLabel}>Campus UG</Text>
        <Text style={styles.heroTitle}>Mis cursos</Text>
        <Text style={styles.heroSubtitle}>
          {courses.length} curso{courses.length !== 1 ? "s" : ""} matriculado{courses.length !== 1 ? "s" : ""}
        </Text>
      </LinearGradient>

      {error ? (
        <TouchableOpacity style={styles.errorBanner} onPress={load}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorRetry}>Toca para reintentar</Text>
        </TouchableOpacity>
      ) : null}

      <FlatList
        data={courses}
        keyExtractor={(item) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            icon="📚"
            title="Sin cursos todavía"
            subtitle="Cuando te matricules en un curso de Moodle, aparecerá aquí."
          />
        }
        renderItem={({ item, index }) => {
          const [c1, c2] = GRADIENTS[index % GRADIENTS.length];
          return (
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                navigation.navigate("CourseDetail", { courseId: item.id, courseName: item.fullname })
              }
            >
              <Card style={styles.courseCard}>
                <LinearGradient colors={[c1, c2]} style={styles.courseAccent} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
                <View style={styles.courseBody}>
                  <Text style={styles.courseTitle} numberOfLines={2}>
                    {item.fullname}
                  </Text>
                  <Text style={styles.courseCode}>{item.shortname}</Text>
                  <View style={styles.teacherRow}>
                    <Text style={styles.teacherIcon}>👨‍🏫</Text>
                    <Text style={styles.teacherName} numberOfLines={1}>
                      {item.teacherName || "Docente no asignado"}
                    </Text>
                  </View>
                </View>
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
  hero: {
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600", letterSpacing: 1 },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  heroSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  courseCard: { overflow: "hidden", padding: 0 },
  courseAccent: { height: 6, width: "100%" },
  courseBody: { padding: spacing.md },
  courseTitle: { fontSize: 17, fontWeight: "800", color: colors.text, lineHeight: 24 },
  courseCode: { fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 4 },
  teacherRow: { flexDirection: "row", alignItems: "center", marginTop: spacing.sm, gap: 6 },
  teacherIcon: { fontSize: 14 },
  teacherName: { fontSize: 13, color: colors.textSecondary, flex: 1 },
  errorBanner: {
    margin: spacing.md,
    marginBottom: 0,
    backgroundColor: "#FFEAEA",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: { color: colors.error, fontSize: 14, fontWeight: "600" },
  errorRetry: { color: colors.error, fontSize: 12, marginTop: 4 },
});
