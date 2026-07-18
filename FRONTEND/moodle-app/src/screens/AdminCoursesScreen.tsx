import React, { useCallback, useEffect, useState } from "react";
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
import { AdminCourse, AdminService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Badge, Card, EmptyState, LoadingScreen, PrimaryButton, colors, spacing } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminCoursesScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setCourses(await AdminService.listCourses());
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

  if (loading) return <LoadingScreen message="Cargando cursos..." />;

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2D3436", "#636E72"]} style={styles.hero}>
        <Text style={styles.heroLabel}>Administración</Text>
        <Text style={styles.heroTitle}>Cursos</Text>
        <Text style={styles.heroSubtitle}>{courses.length} curso(s) registrado(s)</Text>
      </LinearGradient>

      <View style={styles.actions}>
        <PrimaryButton
          label="+ Crear curso"
          onPress={() => navigation.navigate("AdminCreateCourse")}
        />
      </View>

      {error ? (
        <TouchableOpacity style={styles.errorBanner} onPress={load}>
          <Text style={styles.errorText}>{error}</Text>
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
            icon="🏫"
            title="Sin cursos"
            subtitle="Crea un curso, asigna un docente e inscribe estudiantes."
          />
        }
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.title}>{item.fullname}</Text>
            <Text style={styles.code}>{item.shortname}</Text>
            <View style={styles.metaRow}>
              <Badge label={`👨‍🏫 ${item.teacherName}`} tone="info" />
              <Badge label={`👥 ${item.totalEstudiantes} estudiantes`} tone="default" />
            </View>
            {item.summary ? <Text style={styles.summary} numberOfLines={2}>{item.summary}</Text> : null}
          </Card>
        )}
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
  heroLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontWeight: "600" },
  heroTitle: { color: "#fff", fontSize: 28, fontWeight: "800", marginTop: 4 },
  heroSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 6 },
  actions: { padding: spacing.md, paddingBottom: 0 },
  list: { padding: spacing.md, paddingBottom: spacing.xl },
  title: { fontSize: 17, fontWeight: "800", color: colors.text },
  code: { fontSize: 13, color: colors.primary, fontWeight: "600", marginTop: 4 },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: spacing.sm },
  summary: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },
  errorBanner: {
    margin: spacing.md,
    backgroundColor: "#FFEAEA",
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: "#FFCDD2",
  },
  errorText: { color: colors.error, fontSize: 14, fontWeight: "600" },
});
