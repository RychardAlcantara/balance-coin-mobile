import { useAuth } from "@/src/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { deleteDoc, doc, getDoc, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useEffect, useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { db, storage } from "../../firebase/firebaseConfig";

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
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [novaImagem, setNovaImagem] = useState<string | null>(null);
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
          setImageUrl(data.imageUrl ?? null);
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

  const escolherImagem = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setNovaImagem(result.assets[0].uri);
    }
  };

  /* ☁️ Upload */
  const uploadImagem = async () => {
    if (!novaImagem || !user) return imageUrl;

    const response = await fetch(novaImagem);
    const blob = await response.blob();

    const imgRef = ref(
      storage,
      `transacoes/${user.uid}/${transacaoId}.jpg`
    );

    await uploadBytes(imgRef, blob);
    return await getDownloadURL(imgRef);
  };

  const salvar = async () => {
    if (!user || !transacaoId) return;

    try {
      const url = await uploadImagem();

      await updateDoc(
        doc(db, "users", user.uid, "transacoes", transacaoId),
        {
          descricao,
          valor: Number(valor),
          imageUrl: url ?? null,
        }
      );

      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível salvar a transação.");
    }
  };

  /* 🗑️ Excluir */
  const excluir = async () => {
    if (!user || !transacaoId) return;

    Alert.alert("Excluir Transação", "Deseja realmente excluir?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          await deleteDoc(
            doc(db, "users", user.uid, "transacoes", transacaoId)
          );
          router.replace("/dashboard");
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
        }}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.backButton}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Editar Transação</Text>

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
          {(novaImagem || imageUrl) && (
            <Image
              source={{ uri: novaImagem ?? imageUrl! }}
              style={styles.image}
            />
          )}

          <TouchableOpacity style={styles.imageBtn} onPress={escolherImagem}>
            <Text style={styles.imageText}>
              {imageUrl ? "Trocar comprovante" : "Adicionar comprovante"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.save} onPress={salvar}>
            <Text style={styles.text}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.delete} onPress={excluir}>
            <Text style={styles.text}>Excluir</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_COLOR,
    padding: 25,
    paddingTop: 60,
  },

  title: {
    textAlign: "center",
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

  backButton: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
    marginBottom: 20,
  },

  image: {
    width: "100%",
    height: 220,
    borderRadius: 14,
    marginBottom: 20,
  },

  imageBtn: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 15,
  },

  imageText: {
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },


});
