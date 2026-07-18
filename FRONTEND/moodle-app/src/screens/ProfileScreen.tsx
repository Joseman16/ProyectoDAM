import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { StatsService, UserStats } from "../services/moodleApi";
import { Avatar, Card, LoadingScreen, PrimaryButton, colors, spacing, radius } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";
import { RootStackParamList } from "../navigation/AppNavigator";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function StatBox({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <View style={[styles.statBox, { borderColor: color + "44" }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [noData, setNoData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await StatsService.myStats();
      if ("mensaje" in data) {
        setNoData(data.mensaje);
        setStats(null);
      } else {
        setStats(data);
        setNoData(null);
      }
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err));
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

  async function handleLogout() {
    Alert.alert("Cerrar sesión", "¿Deseas salir de tu cuenta?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Salir", style: "destructive", onPress: logout },
    ]);
  }

  if (loading) return <LoadingScreen message="Cargando perfil..." />;

  const displayName = stats?.nombreCompleto || user?.username || "Estudiante";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <LinearGradient colors={[colors.primary, colors.secondary]} style={styles.hero}>
        <Avatar name={displayName} size={72} />
        <Text style={styles.heroName}>{displayName}</Text>
        <Text style={styles.heroEmail}>{user?.email || user?.username}</Text>
      </LinearGradient>

      <Text style={styles.sectionTitle}>Mi actividad</Text>

      {noData ? (
        <Card>
          <Text style={styles.noDataIcon}>📊</Text>
          <Text style={styles.noDataText}>{noData}</Text>
          <Text style={styles.noDataHint}>
            Entrega tareas o participa en foros para ver tus estadísticas aquí.
          </Text>
        </Card>
      ) : stats ? (
        <>
          <View style={styles.statsRow}>
            <StatBox icon="📝" value={stats.totalEntregas} label="Entregas" color={colors.primary} />
            <StatBox icon="💬" value={stats.totalParticipacionesForo} label="Foros" color={colors.secondary} />
          </View>

          <Card>
            <Text style={styles.lastLabel}>Última entrega</Text>
            <Text style={styles.lastValue}>{stats.ultimaEntrega}</Text>
          </Card>
        </>
      ) : null}

      {user?.rol === "admin" ? (
        <View style={styles.actionGroup}>
          <PrimaryButton label="Gestionar cursos" onPress={() => navigation.navigate("AdminCourses")} />
          <PrimaryButton label="Registrar usuarios" onPress={() => navigation.navigate("AdminUsers")} variant="outline" />
        </View>
      ) : null}

      {user?.rol === "teacher" ? (
        <View style={styles.actionGroup}>
          <PrimaryButton label="Crear tareas y foros" onPress={() => navigation.navigate("TeacherWorkspace")} />
        </View>
      ) : null}

      <View style={styles.logoutWrap}>
        <PrimaryButton label="Cerrar sesión" onPress={handleLogout} variant="outline" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingBottom: spacing.xl },
  hero: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroName: { color: "#fff", fontSize: 22, fontWeight: "800", marginTop: spacing.md },
  heroEmail: { color: "rgba(255,255,255,0.8)", fontSize: 14, marginTop: 4 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  statsRow: { flexDirection: "row", gap: spacing.md, paddingHorizontal: spacing.md },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIcon: { fontSize: 28, marginBottom: 4 },
  statValue: { fontSize: 28, fontWeight: "900" },
  statLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", marginTop: 2 },
  lastLabel: { fontSize: 12, color: colors.textSecondary, fontWeight: "600", textTransform: "uppercase" },
  lastValue: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 4 },
  noDataIcon: { fontSize: 36, textAlign: "center", marginBottom: spacing.sm },
  noDataText: { fontSize: 16, fontWeight: "700", color: colors.text, textAlign: "center" },
  noDataHint: { fontSize: 13, color: colors.textSecondary, textAlign: "center", marginTop: spacing.sm, lineHeight: 20 },
  actionGroup: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.sm },
  logoutWrap: { padding: spacing.lg, marginTop: spacing.md },
});
