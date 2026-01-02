import { useAuth } from "@/src/contexts/AuthContext";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase/firebaseConfig";
import { Transacao } from "../../types/Transacao";

export default function TransacaoScreen() {
  const { user } = useAuth(); // 🔐 usuário logado

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const getTransacoesRef = () => {
    if (!user) throw new Error("Usuário não autenticado");

    return collection(db, "users", user.uid, "transacoes");
  };

  const carregarTransacoes = async () => {
    if (!user) return;

    const querySnapshot = await getDocs(getTransacoesRef());

    const data = querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Transacao),
    }));

    setTransacoes(data);
  };

  useEffect(() => {
    if (user) {
      carregarTransacoes();
    }
  }, [user]);

  const adicionarOuAtualizar = async () => {
    if (!descricao || !valor || !user) return;

    if (editandoId) {
      await updateDoc(
        doc(db, "users", user.uid, "transacoes", editandoId),
        {
          descricao,
          valor: parseFloat(valor),
          tipo,
        }
      );
      setEditandoId(null);
    } else {
      await addDoc(getTransacoesRef(), {
        descricao,
        valor: parseFloat(valor),
        tipo,
        createdAt: serverTimestamp(),
      });
    }

    setDescricao("");
    setValor("");
    setTipo("entrada");
    carregarTransacoes();
  };

  const editarTransacao = (item: Transacao) => {
    setDescricao(item.descricao);
    setValor(item.valor.toString());
    setTipo(item.tipo);
    setEditandoId(item.id ?? null);
  };

  const excluirTransacao = async (id: string) => {
    if (!user) return;

    await deleteDoc(doc(db, "users", user.uid, "transacoes", id));
    carregarTransacoes();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transações</Text>

      <TextInput
        placeholder="Descrição"
        style={styles.input}
        value={descricao}
        onChangeText={setDescricao}
      />

      <TextInput
        placeholder="Valor"
        style={styles.input}
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />

      <View style={styles.tipoContainer}>
        <TouchableOpacity
          style={[styles.tipoBotao, tipo === "entrada" && styles.selecionado]}
          onPress={() => setTipo("entrada")}
        >
          <Text>Entrada</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoBotao, tipo === "saida" && styles.selecionado]}
          onPress={() => setTipo("saida")}
        >
          <Text>Saída</Text>
        </TouchableOpacity>
      </View>

      <Button
        title={editandoId ? "Atualizar Transação" : "Adicionar Transação"}
        onPress={adicionarOuAtualizar}
      />

      <FlatList
        style={{ marginTop: 20 }}
        data={transacoes}
        keyExtractor={(item) => item.id ?? ""}
        renderItem={({ item }) => (
          <View style={styles.transacao}>
            <View>
              <Text style={styles.descricao}>{item.descricao}</Text>
              <Text
                style={{
                  color: item.tipo === "entrada" ? "green" : "red",
                }}
              >
                R$ {item.valor.toFixed(2)} ({item.tipo})
              </Text>
            </View>

            <View style={styles.botoes}>
              <Button title="✏️" onPress={() => editarTransacao(item)} />
              <Button title="🗑️" onPress={() => excluirTransacao(item.id!)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, textAlign: "center" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  tipoContainer: { flexDirection: "row", justifyContent: "space-around", marginBottom: 10 },
  tipoBotao: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    width: "40%",
    alignItems: "center",
  },
  selecionado: { backgroundColor: "#cdeccd", borderColor: "#5ba35b" },
  transacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  descricao: { fontWeight: "bold" },
  botoes: { flexDirection: "row", gap: 5 },
});
