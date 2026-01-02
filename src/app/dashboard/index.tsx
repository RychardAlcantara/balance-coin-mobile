import { router } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AnimatedBalance from "../../components/AnimatedBalance";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { Transacao } from "../../types/Transacao";

export default function Dashboard() {
  const { logout } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState(0);

  const { user } = useAuth();

  const carregarTransacoes = async () => {
    if (!user) return;

    const transacoesRef = collection(
      db,
      "users",
      user.uid,
      "transacoes"
    );

    const querySnapshot = await getDocs(transacoesRef);

    const data = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Transacao),
    }));

    setTransacoes(data);

    const total = data.reduce((acc, item) => {
      return item.tipo === "entrada" ? acc + item.valor : acc - item.valor;
    }, 0);

    setSaldo(total);
  };

  useEffect(() => {
    if (user) {
      carregarTransacoes();
    }
  }, [user]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard atau</Text>

      <AnimatedBalance saldo={saldo} />

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.botao}
          onPress={() => router.push("/dashboard/transacoes")}
        >
          <Text style={styles.botaoTexto}>Nova Transação</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoLogout} onPress={logout}>
          <Text style={styles.botaoTexto}>Sair</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={transacoes}
        keyExtractor={(item) => item.id ?? ""}
        renderItem={({ item }) => (
          <View style={styles.transacao}>
            <Text style={styles.descricao}>{item.descricao}</Text>
            <Text
              style={{
                color: item.tipo === "entrada" ? "green" : "red",
                fontWeight: "600",
              }}
            >
              {item.tipo === "entrada" ? "+" : "-"} R$ {item.valor.toFixed(2)}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  title: { fontSize: 26, fontWeight: "bold", textAlign: "center", marginVertical: 20 },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  botao: {
    backgroundColor: "#4caf50",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  botaoLogout: {
    backgroundColor: "#e53935",
    padding: 10,
    borderRadius: 8,
    width: "48%",
    alignItems: "center",
  },
  botaoTexto: { color: "#fff", fontWeight: "bold" },
  transacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 10,
  },
  descricao: { fontWeight: "bold", fontSize: 16 },
});
