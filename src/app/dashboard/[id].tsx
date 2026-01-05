import { useAuth } from "@/src/contexts/AuthContext";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase/firebaseConfig";

const PRIMARY_COLOR = "#2a5298";
const BG_COLOR = "#f5f7fb";

export default function EditarTransacao() {
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const transacaoId = Array.isArray(params.id)
    ? params.id[0]
    : params.id;

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      if (!user || !transacaoId) return;

      try {
        const ref = doc(db, "users", user.uid, "transacoes", transacaoId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          setDescricao(data.descricao);
          setValor(String(data.valor));
        }
      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível carregar a transação.");
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [user, transacaoId]);

  const salvar = async () => {
    if (!user || !transacaoId) return;

    try {
      await updateDoc(
        doc(db, "users", user.uid, "transacoes", transacaoId),
        {
          descricao,
          valor: Number(valor),
        }
      );

      router.back();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar a transação.");
    }
  };

  const excluir = async () => {
    if (!user || !transacaoId) return;

    Alert.alert(
      "Excluir Transação",
      "Tem certeza que deseja excluir?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(
                doc(db, "users", user.uid, "transacoes", transacaoId)
              );
              router.replace("/dashboard");
            } catch {
              Alert.alert("Erro", "Não foi possível excluir.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Editar Transação</Text>
      </View>

      <TextInput
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
        placeholder="Descrição"
      />

      <TextInput
        style={styles.input}
        value={valor}
        keyboardType="numeric"
        onChangeText={setValor}
        placeholder="Valor"
      />

      <TouchableOpacity style={styles.save} onPress={salvar}>
        <Text style={styles.text}>Salvar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.delete} onPress={excluir}>
        <Text style={styles.text}>Excluir</Text>
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

  save: {
    backgroundColor: PRIMARY_COLOR,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 10,
  },

  delete: {
    backgroundColor: "#c62828",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  backButton: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
  },

});
