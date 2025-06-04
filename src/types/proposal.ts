
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

export interface Template {
  id: string;
  name: string;
  type: string;
  pages?: any;
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
  group_name?: string;
  template_id?: string;
  proposal_date: string;
  expiry_date?: string;
  subtotal: number;
  discount_percentage: number;
  discount_amount: number;
  total: number;
  commission_percentage: number;
  commission_amount: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  client?: Client;
  template?: Template;
}
