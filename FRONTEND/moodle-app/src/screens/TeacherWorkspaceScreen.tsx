import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import {
  AppInput,
  Card,
  EmptyState,
  LoadingScreen,
  PrimaryButton,
  SectionHeader,
  colors,
  spacing,
} from "../components/ui";
import { CourseService, TeacherService } from "../services/moodleApi";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface CourseOption {
  id: number;
  fullname: string;
}

export default function TeacherWorkspaceScreen() {
  const navigation = useNavigation<Nav>();
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipo, setTipo] = useState<"tarea" | "foro">("tarea");

  const loadCourses = useCallback(async () => {
    try {
      const data = await CourseService.listMyCourses();
      setCourses(data);
      if (data.length > 0) setSelectedCourseId(data[0].id);
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err));
    }
  }, []);

  useEffect(() => {
    loadCourses().finally(() => setLoading(false));
  }, [loadCourses]);

  async function handleCreate() {
    if (!selectedCourseId) {
      Alert.alert("Curso requerido", "Selecciona un curso antes de crear contenido.");
      return;
    }
    if (!nombre.trim()) {
      Alert.alert("Datos incompletos", "El título es obligatorio.");
      return;
    }

    try {
      setSaving(true);
      const result = await TeacherService.createActivity(selectedCourseId, {
        nombre: nombre.trim(),
        tipo,
        descripcion: descripcion.trim() || undefined,
      });
      Alert.alert("Contenido creado", `${result.message}`);
      setNombre("");
      setDescripcion("");
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen message="Cargando tu área docente..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Área docente" subtitle="Crea tareas y foros para tus cursos." />

      {courses.length === 0 ? (
        <EmptyState icon="🎓" title="Sin cursos asignados" subtitle="Cuando un administrador te asigne un curso, aparecerá aquí." />
      ) : (
        <Card>
          <Text style={styles.label}>Curso</Text>
          {courses.map((course) => (
            <TouchableOpacity key={course.id} onPress={() => setSelectedCourseId(course.id)}>
              <View style={[styles.courseOption, selectedCourseId === course.id && styles.courseOptionActive]}>
                <Text style={styles.courseTitle}>{course.fullname}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>
      )}

      <Card>
        <Text style={styles.label}>Tipo de contenido</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity style={[styles.roleChip, tipo === "tarea" && styles.roleChipActive]} onPress={() => setTipo("tarea")}>
            <Text style={[styles.roleChipText, tipo === "tarea" && styles.roleChipTextActive]}>Tarea</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.roleChip, tipo === "foro" && styles.roleChipActive]} onPress={() => setTipo("foro")}>
            <Text style={[styles.roleChipText, tipo === "foro" && styles.roleChipTextActive]}>Foro</Text>
          </TouchableOpacity>
        </View>

        <AppInput placeholder={tipo === "tarea" ? "Título de la tarea" : "Título del foro"} value={nombre} onChangeText={setNombre} />
        <AppInput
          placeholder={tipo === "tarea" ? "Descripción de la tarea" : "Descripción del foro"}
          value={descripcion}
          onChangeText={setDescripcion}
          multiline
          style={styles.textArea}
        />
      </Card>

      <PrimaryButton label={`Crear ${tipo === "tarea" ? "tarea" : "foro"}`} onPress={handleCreate} loading={saving} />
      <PrimaryButton label="Volver al inicio" onPress={() => navigation.navigate("MainTabs" as never)} variant="outline" />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  label: { fontSize: 14, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  roleRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.md },
  roleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: colors.surface,
  },
  roleChipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  roleChipText: { fontWeight: "700", color: colors.textSecondary },
  roleChipTextActive: { color: colors.primaryDark },
  courseOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  courseOptionActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  courseTitle: { fontSize: 14, fontWeight: "700", color: colors.text },
  textArea: { minHeight: 90, textAlignVertical: "top" },
});
