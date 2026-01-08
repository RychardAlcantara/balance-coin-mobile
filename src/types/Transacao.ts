import { Timestamp } from "firebase/firestore";

export interface Transacao {
  id?: string;
  descricao: string;
  valor: number;
  tipo: "entrada" | "saida";
  data: string;
  imageUrl?: string;
  createdAt: Timestamp;
}
