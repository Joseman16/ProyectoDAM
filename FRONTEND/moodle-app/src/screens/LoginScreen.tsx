import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { useAuth } from "../context/AuthContext";
import { AppInput, PrimaryButton, colors, spacing, radius } from "../components/ui";
import { getApiErrorMessage } from "../utils/errors";

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!username.trim() || !password) {
      Alert.alert("Faltan datos", "Ingresa tu usuario y contraseña de Moodle.");
      return;
    }
    try {
      setSubmitting(true);
      await login(username.trim(), password);
    } catch (err) {
      Alert.alert("Error de inicio de sesión", getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LinearGradient colors={[colors.gradientStart, colors.gradientEnd]} style={styles.gradient}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </View>
            <Text style={styles.brandName}>Campus UG</Text>
            <Text style={styles.brandTagline}>Tu plataforma de aprendizaje móvil</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>
            <Text style={styles.formSubtitle}>Usa tu cuenta de Moodle</Text>

            <AppInput
              placeholder="Usuario"
              autoCapitalize="none"
              autoCorrect={false}
              value={username}
              onChangeText={setUsername}
            />
            <AppInput
              placeholder="Contraseña"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              onSubmitEditing={handleLogin}
            />

            <PrimaryButton
              label="Entrar"
              onPress={handleLogin}
              loading={submitting}
            />
          </View>

          <Text style={styles.footer}>
            Conectado al backend Spring Boot · Puerto 8080
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    paddingVertical: spacing.xl,
  },
  brand: { alignItems: "center", marginBottom: spacing.xl },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  logoEmoji: { fontSize: 40 },
  brandName: { fontSize: 32, fontWeight: "900", color: "#fff", letterSpacing: -0.5 },
  brandTagline: { fontSize: 15, color: "rgba(255,255,255,0.85)", marginTop: 6 },
  formCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  formTitle: { fontSize: 22, fontWeight: "800", color: colors.text },
  formSubtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg, marginTop: 4 },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    marginTop: spacing.lg,
  },
});
