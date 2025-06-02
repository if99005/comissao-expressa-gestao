
export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  nif?: string;
  address?: string;
}

export interface Article {
  id: string;
  reference: string;
  description: string;
  unit: string;
  sale_price: number;
  purchase_price: number;
  group_name?: string;
}

export interface ProposalLine {
  id?: string;
  article_id?: string;
  description: string;
  unit: string;
  quantity: number;
  unit_price: number;
  cost_price: number;
  discount_percentage: number;
  line_total: number;
  calculation_mode: 'pvp' | 'cost';
  margin_percentage: number;
  margin_euro: number;
}

export interface Proposal {
  id?: string;
  number: string;
  client_id?: string;
  status: 'rascunho' | 'enviada' | 'aprovada' | 'rejeitada' | 'expirada';
  group_name?: string;
  proposal_date: string;
  expiry_date?: string;
  subtotal: number;
  discount_percentage: number;
  total: number;
  commission_percentage: number;
  notes?: string;
  client?: Client;
}

export const statusColors = {
  rascunho: "bg-gray-100 text-gray-800",
  enviada: "bg-blue-100 text-blue-800",
  aprovada: "bg-green-100 text-green-800",
  rejeitada: "bg-red-100 text-red-800",
  expirada: "bg-orange-100 text-orange-800"
};

export const statusLabels = {
  rascunho: "Rascunho",
  enviada: "Enviada",
  aprovada: "Aprovada",
  rejeitada: "Rejeitada",
  expirada: "Expirada"
};
