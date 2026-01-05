import { Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";

function RootLayoutInner() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {user ? (
        // 🔐 Usuário logado → dashboard
        <>
          <Stack.Screen name="dashboard/index" />
          <Stack.Screen name="dashboard/transacoes" />
          <Stack.Screen name="dashboard/lista" />
          <Stack.Screen name="dashboard/[id]" />
        </>
      ) : (
        // 🚪 Usuário deslogado → home/login/register
        <>
          <Stack.Screen name="index" />     {/* tela de login/home */}
          <Stack.Screen name="register" />  {/* tela de cadastro */}
        </>
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
