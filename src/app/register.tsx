import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !senha || !confirmarSenha) {
      return Alert.alert("Atenção", "Preencha todos os campos.");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Alert.alert("E-mail inválido", "Digite um e-mail válido.");
    }
    if (senha !== confirmarSenha) {
      return Alert.alert("Erro", "As senhas não coincidem.");
    }

    setLoading(true);
    try {
      await register(email, senha);
      Alert.alert("Sucesso", "Cadastro realizado com sucesso!");
      router.replace("/");
    } catch (error: any) {
      switch (error.message) {
        case "EMAIL_ALREADY_EXISTS":
          Alert.alert(
            "E-mail já cadastrado",
            "Este e-mail já está em uso. Tente outro ou faça login."
          );
          break;

        case "INVALID_EMAIL":
          Alert.alert("E-mail inválido", "Digite um e-mail válido.");
          break;

        case "WEAK_PASSWORD":
          Alert.alert(
            "Senha fraca",
            "A senha deve ter no mínimo 6 caracteres."
          );
          break;

        default:
          Alert.alert(
            "Erro ao cadastrar",
            "Não foi possível realizar o cadastro. Tente novamente."
          );
      }
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={["#1e3c72", "#2a5298"]} style={styles.gradient}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Crie sua conta</Text>
          <Text style={styles.subtitle}>Gerencie suas finanças com facilidade</Text>

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

          <TextInput
            placeholder="Confirmar Senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
            style={styles.input}
            placeholderTextColor="#999"
          />

          <TouchableOpacity
            style={[styles.button, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.link}>
              Já tem conta? <Text style={styles.linkBold}>Entrar</Text>
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e3c72",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
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
