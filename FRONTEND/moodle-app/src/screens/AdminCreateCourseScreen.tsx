import React, { useEffect, useState } from "react";
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
import { AdminService, AppUser } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { AppInput, Card, LoadingScreen, PrimaryButton, SectionHeader, colors, spacing } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminCreateCourseScreen() {
  const navigation = useNavigation<Nav>();
  const [nombre, setNombre] = useState("");
  const [shortname, setShortname] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [teachers, setTeachers] = useState<AppUser[]>([]);
  const [students, setStudents] = useState<AppUser[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);
  const [selectedStudentIds, setSelectedStudentIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([AdminService.listUsers("teacher"), AdminService.listUsers("student")])
      .then(([t, s]) => {
        setTeachers(t);
        setStudents(s);
        if (t.length > 0) setSelectedTeacherId(t[0].id);
      })
      .catch((err) => Alert.alert("Error", getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  function toggleStudent(id: number) {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleCreate() {
    if (!nombre.trim() || !shortname.trim()) {
      Alert.alert("Datos incompletos", "Nombre y código del curso son obligatorios.");
      return;
    }
    if (selectedTeacherId == null) {
      Alert.alert("Docente requerido", "Selecciona un docente para el curso.");
      return;
    }

    setSaving(true);
    try {
      const result = await AdminService.createCourse({
        nombre: nombre.trim(),
        shortname: shortname.trim(),
        descripcion: descripcion.trim() || undefined,
        docenteId: selectedTeacherId,
        estudianteIds: selectedStudentIds,
      });
      Alert.alert("Curso creado", `${result.message}. ${result.estudiantesInscritos} estudiante(s) inscrito(s).`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <LoadingScreen message="Cargando usuarios..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader title="Nuevo curso" subtitle="Asigna un docente e inscribe estudiantes." />

      <AppInput placeholder="Nombre del curso" value={nombre} onChangeText={setNombre} />
      <AppInput placeholder="Código (ej. DAM-101)" value={shortname} onChangeText={setShortname} autoCapitalize="characters" />
      <AppInput
        placeholder="Descripción (opcional)"
        value={descripcion}
        onChangeText={setDescripcion}
        multiline
        style={styles.textArea}
      />

      <Text style={styles.label}>Docente asignado</Text>
      {teachers.length === 0 ? (
        <Card><Text style={styles.emptyHint}>No hay docentes. Crea uno en Usuarios.</Text></Card>
      ) : (
        teachers.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => setSelectedTeacherId(t.id)}>
            <Card style={selectedTeacherId === t.id ? styles.selected : undefined}>
              <Text style={styles.optionTitle}>{t.nombreCompleto}</Text>
              <Text style={styles.optionMeta}>@{t.username}</Text>
            </Card>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.label}>Estudiantes ({selectedStudentIds.length} seleccionados)</Text>
      {students.length === 0 ? (
        <Card><Text style={styles.emptyHint}>No hay estudiantes. Crea uno en Usuarios.</Text></Card>
      ) : (
        students.map((s) => {
          const selected = selectedStudentIds.includes(s.id);
          return (
            <TouchableOpacity key={s.id} onPress={() => toggleStudent(s.id)}>
              <Card style={selected ? styles.selected : undefined}>
                <Text style={styles.optionTitle}>{s.nombreCompleto}</Text>
                <Text style={styles.optionMeta}>@{s.username}</Text>
              </Card>
            </TouchableOpacity>
          );
        })
      )}

      <PrimaryButton label="Crear curso" onPress={handleCreate} loading={saving} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  textArea: { minHeight: 90, textAlignVertical: "top" },
  label: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  optionTitle: { fontSize: 15, fontWeight: "700", color: colors.text },
  optionMeta: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  selected: { borderColor: colors.primary, borderWidth: 2 },
  emptyHint: { color: colors.textSecondary, fontSize: 14 },
});
