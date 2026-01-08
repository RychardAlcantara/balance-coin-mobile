import { useAuth } from "@/src/contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { useState } from "react";
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from "react-native";
import { db, storage } from "../../firebase/firebaseConfig";

const PRIMARY_COLOR = "#2a5298";
const BG_COLOR = "#f5f7fb";

export default function NovaTransacao() {
  const { user } = useAuth();
  const [imagem, setImagem] = useState<string | null>(null);

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");

  const escolherImagem = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permissão necessária", "Autorize o acesso à galeria.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const uploadImagem = async () => {
    if (!imagem || !user) return null;

    const blob: Blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = () => resolve(xhr.response);
      xhr.onerror = () => reject(new Error("Erro ao converter imagem para blob"));
      xhr.responseType = "blob";
      xhr.open("GET", imagem, true);
      xhr.send(null);
    });

    const imageRef = ref(
      storage,
      `transacoes/${user.uid}/${Date.now()}.jpg`
    );

    await uploadBytes(imageRef, blob);

    return await getDownloadURL(imageRef);
  };


  const salvar = async () => {
    if (!user) return;
    if (!descricao.trim()) {
      Alert.alert("Campo obrigatório", "Informe a descrição da transação.");
      return;
    }

    if (!valor.trim()) {
      Alert.alert("Campo obrigatório", "Informe o valor da transação.");
      return;
    }
    const valorNumero = Number(valor.replace(",", "."));

    if (isNaN(valorNumero) || valorNumero <= 0) {
      Alert.alert("Valor inválido", "Informe um valor numérico válido.");
      return;
    }
    let imageUrl = null;

    if (imagem) {
      imageUrl = await uploadImagem();
    }

    await addDoc(
      collection(db, "users", user.uid, "transacoes"),
      {
        descricao,
        valor: parseFloat(valor),
        tipo,
        imageUrl,
        createdAt: serverTimestamp(),
      }
    );

    router.replace("/dashboard");
  };


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
          <Text style={styles.title}>Nova Transação</Text>

          <TextInput style={styles.input} placeholder="Descrição" placeholderTextColor="#999" value={descricao} onChangeText={setDescricao} />
          <TextInput style={styles.input} placeholder="Valor" placeholderTextColor="#999" keyboardType="numeric" value={valor} onChangeText={setValor} />

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
          <TouchableOpacity style={styles.uploadButton} onPress={escolherImagem}>
            <Text style={{ color: PRIMARY_COLOR }}>
              {imagem ? "Trocar Comprovantes" : "Adicionar comprovante"}
            </Text>
          </TouchableOpacity>

          {imagem && (
            <Image
              source={{ uri: imagem }}
              style={{ width: "100%", height: 200, borderRadius: 12, marginBottom: 20 }}
            />
          )}

          <TouchableOpacity style={styles.primaryButton} onPress={salvar}>
            <Text style={styles.primaryButtonText}>Criar Transação</Text>
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
  uploadButton: {
    backgroundColor: "#eee",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },

  backButton: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "600",
    marginRight: 12,
    marginBottom: 20,
  },

});

