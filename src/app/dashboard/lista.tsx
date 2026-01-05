import { useAuth } from "@/src/contexts/AuthContext";
import { router, useFocusEffect } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../firebase/firebaseConfig";
import { Transacao } from "../../types/Transacao";

const PRIMARY_COLOR = "#2a5298";
const BG_COLOR = "#f5f7fb";

export default function ListaTransacoes() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);

  const carregar = async () => {
    if (!user) return;
    const snap = await getDocs(collection(db, "users", user.uid, "transacoes"));
    setTransacoes(snap.docs.map(d => ({ id: d.id, ...(d.data() as Transacao) })));
  };

  useFocusEffect(useCallback(() => {
    carregar();
  }, [user]));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Transações</Text>

      <FlatList
        data={transacoes}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({
                pathname: "/dashboard/[id]",
                params: { id: item.id },
              })
            }
          >
            <Text style={styles.desc}>{item.descricao}</Text>

            <Text style={{ color: item.tipo === "entrada" ? "green" : "red" }}>
              R$ {item.valor.toFixed(2)}
            </Text>
          </TouchableOpacity>
        )}
      />

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

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  desc: {
    fontSize: 15,
    fontWeight: "600",
  },
});

