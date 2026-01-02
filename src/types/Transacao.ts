export interface Transacao {
  id?: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
}
