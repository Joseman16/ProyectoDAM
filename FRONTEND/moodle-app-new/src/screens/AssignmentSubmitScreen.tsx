import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { AssignmentService } from "../services/moodleApi";
import { RootStackParamList } from "../navigation/AppNavigator";
import { Card, PrimaryButton, colors, spacing, radius } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";

type Rt = RouteProp<RootStackParamList, "AssignmentSubmit">;

export default function AssignmentSubmitScreen() {
  const { params } = useRoute<Rt>();
  const navigation = useNavigation();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) {
      Alert.alert("Escribe tu entrega", "El campo de texto no puede estar vacío.");
      return;
    }
    try {
      setSending(true);
      const result = await AssignmentService.submitText(params.assignId, text.trim());
      Alert.alert("¡Entrega enviada!", result.message ?? "Tu tarea fue enviada correctamente.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert("Error al enviar", getApiErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Card>
          <View style={styles.taskHeader}>
            <Text style={styles.taskIcon}>📝</Text>
            <View style={styles.taskInfo}>
              <Text style={styles.taskLabel}>Tarea</Text>
              <Text style={styles.taskTitle}>{params.activityName}</Text>
            </View>
          </View>
        </Card>

        <Text style={styles.label}>Tu respuesta</Text>
        <TextInput
          style={styles.textarea}
          multiline
          placeholder="Escribe aquí tu entrega en texto..."
          placeholderTextColor={colors.textMuted}
          value={text}
          onChangeText={setText}
          textAlignVertical="top"
        />

        <PrimaryButton label="Enviar tarea" onPress={handleSubmit} loading={sending} />

        <Text style={styles.hint}>
          La entrega se envía a Moodle y queda registrada en el historial local del backend.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xl },
  taskHeader: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  taskIcon: { fontSize: 32 },
  taskInfo: { flex: 1 },
  taskLabel: { fontSize: 12, color: colors.primary, fontWeight: "700", textTransform: "uppercase" },
  taskTitle: { fontSize: 17, fontWeight: "800", color: colors.text, marginTop: 2 },
  label: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.sm, marginTop: spacing.sm },
  textarea: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    minHeight: 200,
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: "center", marginTop: spacing.md, lineHeight: 18 },
});
