import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { db } from "../firebase/firebaseConfig";

export default function TransacaoScreen() {
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [transacoes, setTransacoes] = useState<any[]>([]);

  const carregarTransacoes = async () => {
    const querySnapshot = await getDocs(collection(db, "transacoes"));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setTransacoes(data);
  };

  useEffect(() => {
    carregarTransacoes();
  }, []);

  const adicionarTransacao = async () => {
    await addDoc(collection(db, "transacoes"), {
      descricao,
      valor: parseFloat(valor),
    });
    setDescricao("");
    setValor("");
    carregarTransacoes();
  };

  const excluirTransacao = async (id: string) => {
    await deleteDoc(doc(db, "transacoes", id));
    carregarTransacoes();
  };

  return (
    <View style={styles.container}>
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
      <Button title="Adicionar" onPress={adicionarTransacao} />

      <FlatList
        data={transacoes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.transacao}>
            <Text>{item.descricao}</Text>
            <Text>R$ {item.valor.toFixed(2)}</Text>
            <Button title="Excluir" onPress={() => excluirTransacao(item.id)} />
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  input: { borderWidth: 1, borderColor: "#ccc", marginBottom: 10, padding: 10 },
  transacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
});
