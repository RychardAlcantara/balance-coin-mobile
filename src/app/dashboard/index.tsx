import { router, useFocusEffect } from "expo-router";
import { collection, getDocs } from "firebase/firestore";
import { useCallback, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";
import AnimatedBalance from "../../components/AnimatedBalance";
import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../firebase/firebaseConfig";
import { Transacao } from "../../types/Transacao";

const PRIMARY_COLOR = "#2a5298";
const screenWidth = Dimensions.get("window").width;

export default function Dashboard() {
  const { logout, user } = useAuth();
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  const [saldo, setSaldo] = useState(0);
  const [entradas, setEntradas] = useState(0);
  const [saidas, setSaidas] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  const percentualGastos =
    entradas > 0 ? Math.round((saidas / entradas) * 100) : 0;

  const situacaoFinanceira =
    saldo > 0
      ? "Saudável ✅"
      : saldo === 0
        ? "Neutra ⚖️"
        : "Atenção ⚠️";

  const carregarTransacoes = async () => {
    if (!user) return;

    const ref = collection(db, "users", user.uid, "transacoes");
    const snapshot = await getDocs(ref);

    const data = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Transacao),
    }));

    let total = 0;
    let totalEntradas = 0;
    let totalSaidas = 0;

    data.forEach((item) => {
      if (item.tipo === "entrada") {
        total += item.valor;
        totalEntradas += item.valor;
      } else {
        total -= item.valor;
        totalSaidas += item.valor;
      }
    });

    const ultimasTransacoes = data
      .sort((a: any, b: any) =>
        b.createdAt?.seconds - a.createdAt?.seconds
      )
      .slice(0, 5);

    setTransacoes(ultimasTransacoes);
    setSaldo(total);
    setEntradas(totalEntradas);
    setSaidas(totalSaidas);
  };

  useFocusEffect(
    useCallback(() => {
      carregarTransacoes();

      fadeAnim.setValue(0);
      slideAnim.setValue(30);

      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }, [user])
  );


  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <Animated.View
        style={[
          styles.header,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.headerTop}>
          <Text style={styles.title}>Olá 👋</Text>

          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.buttonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>Seu resumo financeiro</Text>
      </Animated.View>

      {/* Saldo */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Saldo Atual</Text>
        <AnimatedBalance saldo={saldo} />
      </View>

      {/* Cards Resumo */}
      <View style={styles.summaryContainer}>
        <View style={[styles.summaryCard, { backgroundColor: "#e3f2fd" }]}>
          <Text style={styles.summaryLabel}>Entradas</Text>
          <Text style={styles.summaryValue}>R$ {entradas.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: "#fdecea" }]}>
          <Text style={styles.summaryLabel}>Saídas</Text>
          <Text style={[styles.summaryValue, { color: "#c62828" }]}>
            R$ {saidas.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Gráfico Entradas x Saídas */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Entradas x Saídas</Text>

        <BarChart
          data={{
            labels: ["Entradas", "Saídas"],
            datasets: [{ data: [entradas, saidas] }],
          }}
          width={screenWidth - 100}
          height={220}
          yAxisLabel="R$ "
          yAxisSuffix=""
          chartConfig={{
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 2,
            color: () => PRIMARY_COLOR,
            labelColor: () => "#666",
            barPercentage: 0.7,
          }}
          style={{ borderRadius: 16 }}
        />
      </View>

      {/* Gráfico Pizza */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Distribuição Financeira</Text>

        <PieChart
          data={[
            {
              name: "Entradas",
              population: entradas,
              color: PRIMARY_COLOR,
              legendFontColor: "#555",
              legendFontSize: 14,
            },
            {
              name: "Saídas",
              population: saidas,
              color: "#e53935",
              legendFontColor: "#555",
              legendFontSize: 14,
            },
          ]}
          width={screenWidth - 40}
          height={220}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="10"
          chartConfig={{ color: () => "#000" }}
        />
      </View>

      {/* Análise Financeira */}
      <View style={styles.analysisCard}>
        <Text style={styles.analysisTitle}>Análise Financeira</Text>

        <Text style={styles.analysisText}>
          💰 Total de Entradas:{" "}
          <Text style={styles.bold}>R$ {entradas.toFixed(2)}</Text>
        </Text>

        <Text style={styles.analysisText}>
          💸 Total de Saídas:{" "}
          <Text style={styles.bold}>R$ {saidas.toFixed(2)}</Text>
        </Text>

        <Text style={styles.analysisText}>
          📊 Percentual de Gastos:{" "}
          <Text style={styles.bold}>{percentualGastos}%</Text>
        </Text>

        <Text style={styles.analysisText}>
          📌 Situação Financeira:{" "}
          <Text style={styles.bold}>{situacaoFinanceira}</Text>
        </Text>
      </View>

      {/* Botões */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push("/dashboard/transacoes")}
        >
          <Text style={styles.buttonText}>+ Nova Transação</Text>
        </TouchableOpacity>
      </View>

      {/* Últimas Transações */}
      <View style={styles.transacoesHeader}>
        <Text style={styles.transacoesTitle}>Últimas Transações</Text>

        <TouchableOpacity
          onPress={() => router.push("/dashboard/lista")}
        >
          <Text style={styles.verMais}>Ver mais</Text>
        </TouchableOpacity>
      </View>


      {/* Lista de Transações */}
      <FlatList
        data={transacoes}
        keyExtractor={(item) => item.id ?? ""}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <View style={styles.transacao}>
            <Text style={styles.descricao}>{item.descricao}</Text>
            <Text
              style={[
                styles.valor,
                { color: item.tipo === "entrada" ? "#2e7d32" : "#c62828" },
              ]}
            >
              {item.tipo === "entrada" ? "+" : "-"} R${" "}
              {item.valor.toFixed(2)}
            </Text>
          </View>
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 25,
    paddingTop: 60,
    backgroundColor: "#f5f7fb",
  },

  header: {
    marginBottom: 20,
  },

  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  logoutButton: {
    backgroundColor: "#c62828",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },

  subtitle: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },

  balanceCard: {
    backgroundColor: PRIMARY_COLOR,
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  balanceLabel: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
  },

  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  summaryCard: {
    width: "48%",
    padding: 16,
    borderRadius: 14,
  },

  summaryLabel: {
    fontSize: 14,
    color: "#555",
  },

  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2e7d32",
    marginTop: 4,
  },

  chartCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
  },

  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
    marginBottom: 10,
  },

  analysisCard: {
    backgroundColor: PRIMARY_COLOR,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },

  analysisTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },

  analysisText: {
    color: "#e3f2fd",
    fontSize: 14,
    marginBottom: 6,
  },

  bold: {
    fontWeight: "bold",
    color: "#fff",
  },

  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  primaryButton: {
    backgroundColor: PRIMARY_COLOR,
    padding: 14,
    borderRadius: 12,
    width: "65%",
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  transacao: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },

  descricao: {
    fontWeight: "600",
    fontSize: 15,
  },

  valor: {
    fontWeight: "bold",
  },

  transacoesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },

  transacoesTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: PRIMARY_COLOR,
  },

  verMais: {
    fontSize: 14,
    fontWeight: "600",
    color: PRIMARY_COLOR,
  },

});
