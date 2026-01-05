const getFirebaseErrorMessage = (code: string) => {
  switch (code) {
    case "auth/invalid-email":
      return "Email inválido.";
    case "auth/user-not-found":
      return "Usuário não encontrado.";
    case "auth/wrong-password":
      return "Senha incorreta.";
    case "auth/invalid-credential":
      return "Email ou senha inválidos.";
    case "auth/user-disabled":
      return "Este usuário foi desativado.";
    case "auth/too-many-requests":
      return "Muitas tentativas. Tente novamente mais tarde.";
    case "auth/network-request-failed":
      return "Erro de conexão. Verifique sua internet.";
    case "auth/missing-password":
      return "Informe a senha.";
    default:
      return "Erro ao fazer login. Tente novamente.";
  }
};
export default getFirebaseErrorMessage;
