import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import getFirebaseErrorMessage from "../utils/firebaseErrors";

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      alert("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await login(email, senha);
      router.replace("/dashboard");
    } catch (error: any) {
      const message = getFirebaseErrorMessage(error.code);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#1e3c72", "#2a5298"]}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Balance Coin</Text>
          <Text style={styles.subtitle}>Acesse sua conta</Text>

          <TextInput
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#999"
          />

          <TextInput
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.link}>
              Não tem conta? <Text style={styles.linkBold}>Cadastre-se</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 25,
  },
  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#1e3c72",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
  },
  input: {
    width: "100%",
    backgroundColor: "#f6f6f6",
    borderRadius: 10,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#2a5298",
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  link: {
    textAlign: "center",
    color: "#555",
    marginTop: 15,
  },
  linkBold: {
    color: "#2a5298",
    fontWeight: "600",
  },
});
