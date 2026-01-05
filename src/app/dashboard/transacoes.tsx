import { useAuth } from "@/src/contexts/AuthContext";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase/firebaseConfig";

const PRIMARY_COLOR = "#2a5298";
const BG_COLOR = "#f5f7fb";

export default function NovaTransacao() {
  const { user } = useAuth();

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");

  const salvar = async () => {
    if (!user || !descricao || !valor) return;

    await addDoc(
      collection(db, "users", user.uid, "transacoes"),
      {
        descricao,
        valor: parseFloat(valor),
        tipo,
        createdAt: serverTimestamp(),
      }
    );

    router.replace("/dashboard");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nova Transação</Text>

      <TextInput style={styles.input} placeholder="Descrição" value={descricao} onChangeText={setDescricao} />
      <TextInput style={styles.input} placeholder="Valor" keyboardType="numeric" value={valor} onChangeText={setValor} />

      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoBotao, tipo === "entrada" && styles.entrada]}
          onPress={() => setTipo("entrada")}
        >
          <Text>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoBotao, tipo === "saida" && styles.saida]}
          onPress={() => setTipo("saida")}
        >
          <Text>Saída</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={salvar}>
        <Text style={styles.primaryButtonText}>Salvar</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    padding: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  tipoBotao: {
    width: "48%",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  entrada: {
    backgroundColor: "#e8f5e9",
    borderColor: "#2e7d32",
  },

  saida: {
    backgroundColor: "#fdecea",
    borderColor: "#c62828",
  },

  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
  },

  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

