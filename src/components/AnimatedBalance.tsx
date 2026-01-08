import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";

interface AnimatedBalanceProps {
  saldo: number;
}

export default function AnimatedBalance({ saldo }: AnimatedBalanceProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    // Animação de transição suave entre valores
    Animated.timing(animatedValue, {
      toValue: saldo,
      duration: 1000,
      useNativeDriver: false, // necessário pois estamos animando número
    }).start();
  }, [saldo]);

  useEffect(() => {
    // Escuta mudanças no valor animado e atualiza o estado exibido
    const listenerId = animatedValue.addListener(({ value }) => {
      setDisplayValue(Number(value.toFixed(2)));
    });

    // Limpa o listener ao desmontar
    return () => {
      animatedValue.removeListener(listenerId);
    };
  }, []);

  return (
    <View style={styles.container}>
      <Animated.Text
        style={[
          styles.balanceText,
          { color: displayValue < 0 ? "#c62828" : "#2e7d32" },
        ]}
      >
        R$ {displayValue.toFixed(2)}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "bold",
  },
});
