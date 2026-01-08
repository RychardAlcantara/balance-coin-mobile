import { useAuth } from "@/src/contexts/AuthContext";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router, useFocusEffect } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useState } from "react";
import {
  FlatList,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { db } from "../../firebase/firebaseConfig";
import { Transacao } from "../../types/Transacao";

const PRIMARY_COLOR = "#2a5298";
const BG_COLOR = "#f5f7fb";

export default function ListaTransacoes() {
  const { user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);

  const [dataInicio, setDataInicio] = useState<Date | null>(null);
  const [dataFim, setDataFim] = useState<Date | null>(null);

  const [showInicio, setShowInicio] = useState(false);
  const [showFim, setShowFim] = useState(false);

  const [tipoFiltro, setTipoFiltro] =
    useState<"todos" | "entrada" | "saida">("todos");

  const ITENS_POR_PAGINA = 6;

  const carregar = async () => {
    if (!user) return;
    const snap = await getDocs(
      collection(db, "users", user.uid, "transacoes")
    );
    setTransacoes(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Transacao) }))
    );
  };

  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [user])
  );

  const formatarData = (data: any) => {
    if (!data) return "";
    const date = data.toDate ? data.toDate() : new Date(data);
    return date.toLocaleDateString("pt-BR");
  };

  const transacoesFiltradas = transacoes.filter((t) => {
    const descricaoMatch = t.descricao
      .toLowerCase()
      .includes(busca.toLowerCase());

    const tipoMatch =
      tipoFiltro === "todos" ? true : t.tipo === tipoFiltro;

    const dataTransacao = t.createdAt?.toDate
      ? t.createdAt.toDate()
      : null;

    let dataMatch = true;

    if (dataInicio && dataTransacao) {
      dataMatch = dataTransacao >= dataInicio;
    }

    if (dataFim && dataTransacao) {
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59, 999);
      dataMatch = dataMatch && dataTransacao <= fim;
    }

    return descricaoMatch && tipoMatch && dataMatch;
  });

  const limparFiltros = () => {
    setBusca("");
    setTipoFiltro("todos");
    setDataInicio(null);
    setDataFim(null);
    setPagina(1);
  };

  const inicio = (pagina - 1) * ITENS_POR_PAGINA;
  const fim = inicio + ITENS_POR_PAGINA;
  const transacoesPaginadas = transacoesFiltradas.slice(inicio, fim);
  const transacoesOrdenadas = [...transacoesPaginadas].sort(
    (a, b) => b.createdAt.toDate().getTime() - a.createdAt.toDate().getTime()
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          setShowInicio(false);
          setShowFim(false);
        }}
      >
        <View style={styles.container}>
          <TouchableOpacity onPress={() => router.push("/dashboard")}>
            <Text style={styles.backButton}>← Voltar para home</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Minhas Transações</Text>

          <TextInput
            placeholder="Buscar por descrição..."
            placeholderTextColor="#999"
            value={busca}
            onChangeText={(text) => {
              setBusca(text);
              setPagina(1);
            }}
            style={styles.input}
          />

          {/* 📅 FILTRO POR DATA */}
          <View style={styles.filtroLinha}>
            <TouchableOpacity
              style={[styles.input, styles.filtroInput]}
              onPress={() => {
                setShowFim(false);
                setShowInicio(true);
              }}
            >
              <Text style={{ color: dataInicio ? "#000" : "#999" }}>
                {dataInicio
                  ? dataInicio.toLocaleDateString("pt-BR")
                  : "Data início"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.input, styles.filtroInput]}
              onPress={() => {
                setShowInicio(false);
                setShowFim(true);
              }}
            >
              <Text style={{ color: dataFim ? "#000" : "#999" }}>
                {dataFim
                  ? dataFim.toLocaleDateString("pt-BR")
                  : "Data fim"}
              </Text>
            </TouchableOpacity>
          </View>

          {showInicio && (
            <DateTimePicker
              value={dataInicio || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              textColor="#2a5298"
              onChange={(event, selectedDate) => {
                if (event.type === "dismissed") {
                  setShowInicio(false);
                  return;
                }
                setShowInicio(false);
                if (selectedDate) {
                  setDataInicio(selectedDate);
                  setPagina(1);
                }
              }}
            />
          )}

          {showFim && (
            <DateTimePicker
              value={dataFim || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "calendar"}
              textColor="#2a5298"
              onChange={(event, selectedDate) => {
                if (event.type === "dismissed") {
                  setShowFim(false);
                  return;
                }
                setShowFim(false);
                if (selectedDate) {
                  setDataFim(selectedDate);
                  setPagina(1);
                }
              }}
            />
          )}

          {/* 🔄 FILTRO POR TIPO */}
          <View style={styles.tipoContainer}>
            {["todos", "entrada", "saida"].map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.tipoBotao,
                  tipoFiltro === tipo && styles.tipoAtivo,
                ]}
                onPress={() => {
                  setTipoFiltro(tipo as any);
                  setPagina(1);
                }}
              >
                <Text style={{ fontWeight: "600" }}>
                  {tipo === "todos"
                    ? "Todos"
                    : tipo === "entrada"
                      ? "Entradas"
                      : "Saídas"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.limparBtn} onPress={limparFiltros}>
            <Text style={styles.limparText}>Limpar filtros</Text>
          </TouchableOpacity>

          <FlatList
            data={transacoesOrdenadas}
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.desc}>{item.descricao}</Text>
                  <Text style={styles.data}>
                    {formatarData(item.createdAt)}
                  </Text>
                  <Text
                    style={{
                      color:
                        item.tipo === "entrada" ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    R$ {item.valor.toFixed(2)}
                  </Text>
                </View>

                {item.imageUrl && (
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.thumb}
                  />
                )}
              </TouchableOpacity>
            )}
          />
          <View style={styles.paginacao}>
            <TouchableOpacity disabled={pagina === 1} onPress={() => setPagina((p) => p - 1)} >
              <Text style={[styles.pagBtn, pagina === 1 && styles.disabled]}>
                Anterior
              </Text>
            </TouchableOpacity>
            <Text style={styles.pageText}>
              Página {pagina}</Text>
            <TouchableOpacity disabled={fim >= transacoesFiltradas.length} onPress={() => setPagina((p) => p + 1)} >
              <Text style={[styles.pagBtn, fim >= transacoesFiltradas.length && styles.disabled,]} > Próxima </Text>
            </TouchableOpacity>
          </View>
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
  thumb: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginLeft: 10,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  data: {
    fontSize: 12,
    color: "#777",
    marginVertical: 4,
  },
  backButton: {
    color: PRIMARY_COLOR,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 20,
  },
  filtroLinha: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filtroInput: {
    width: "48%",
  },
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  tipoBotao: {
    flex: 1,
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  tipoAtivo: {
    backgroundColor: "#e3f2fd",
    borderColor: PRIMARY_COLOR,
  },
  limparBtn: {
    alignSelf: "flex-end",
    marginBottom: 10,
  },
  limparText: {
    color: "#c62828",
    fontWeight: "bold",
  },

  paginacao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  pagBtn: {
    color: PRIMARY_COLOR,
    fontWeight: "bold",
  },
  pageText: {
    fontWeight: "600",
  },
  disabled: {
    color: "#aaa",
  },
});
