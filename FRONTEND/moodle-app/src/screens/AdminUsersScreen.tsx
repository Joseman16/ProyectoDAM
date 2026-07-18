import React, { useState } from "react";
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
  PrimaryButton,
  SectionHeader,
  colors,
  spacing,
} from "../components/ui";
import { AdminService } from "../services/moodleApi";
import { getApiErrorMessage } from "../utils/errors";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function AdminUsersScreen() {
  const navigation = useNavigation<Nav>();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "teacher">("student");
  const [saving, setSaving] = useState(false);

  async function handleCreate() {
    if (!username.trim() || !email.trim() || !nombreCompleto.trim() || !password) {
      Alert.alert("Datos incompletos", "Completa todos los campos para registrar el usuario.");
      return;
    }

    try {
      setSaving(true);
      const result = await AdminService.createUser({
        username: username.trim(),
        email: email.trim(),
        nombreCompleto: nombreCompleto.trim(),
        password,
        rol: role,
      });

      Alert.alert("Usuario registrado", `${result.message}`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error", getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SectionHeader
        title="Registrar usuarios"
        subtitle="Crea cuentas de estudiantes o docentes para el campus."
      />

      <Card>
        <Text style={styles.label}>Tipo de cuenta</Text>
        <View style={styles.roleRow}>
          <TouchableOpacity
            style={[styles.roleChip, role === "student" && styles.roleChipActive]}
            onPress={() => setRole("student")}
          >
            <Text style={[styles.roleChipText, role === "student" && styles.roleChipTextActive]}>Estudiante</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.roleChip, role === "teacher" && styles.roleChipActive]}
            onPress={() => setRole("teacher")}
          >
            <Text style={[styles.roleChipText, role === "teacher" && styles.roleChipTextActive]}>Docente</Text>
          </TouchableOpacity>
        </View>

        <AppInput placeholder="Usuario" value={username} onChangeText={setUsername} autoCapitalize="none" />
        <AppInput placeholder="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <AppInput placeholder="Nombre completo" value={nombreCompleto} onChangeText={setNombreCompleto} />
        <AppInput placeholder="Contraseña temporal" value={password} onChangeText={setPassword} secureTextEntry />
      </Card>

      <PrimaryButton label="Registrar usuario" onPress={handleCreate} loading={saving} />
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
});
