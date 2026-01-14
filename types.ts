
export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: 'hora' | 'unidade' | 'm2' | 'global';
  category: string;
  status?: 'ativo' | 'manutenção';
  image?: string; // base64 string
  isFavorite?: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  category: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export interface Appointment {
  id: string;
  serviceId: string;
  clientId: string;
  date: string;
  time: string;
  notes?: string;
}

export interface QuoteItem {
  itemId: string;
  type: 'service' | 'product';
  quantity: number;
  priceOverride?: number;
  image?: string; // base64 string
}

export interface Quote {
  id: string;
  clientId: string;
  items: QuoteItem[];
  discount: number;
  status: 'rascunho' | 'enviado' | 'aprovado' | 'rejeitado';
  date: string;
  validUntil: string;
  total: number;
  notes?: string;
}

export interface Receipt {
  id: string;
  clientId: string;
  quoteId?: string;
  amount: number;
  date: string;
  description: string;
  paymentMethod: string;
}

export interface Commitment {
  id: string;
  prefeitura: string;
  prefeituraLogo?: string; // Nova propriedade para o logo do órgão (base64)
  commitmentNumber: string; // Número do Empenho
  processNumber: string;    // Número do Processo
  date: string;
  value: number;
  description: string;
  status: 'empenhado' | 'liquidado' | 'pago' | 'cancelado';
  images: string[]; // Array de base64
}

export interface CompanyProfile {
  name: string;
  ownerName: string;
  document: string;
  email: string;
  phone: string;
  address: string;
  logo?: string; // base64
  website?: string;
}

export type ViewType = 'dashboard' | 'services' | 'products' | 'clients' | 'quotes' | 'receipts' | 'profile' | 'empenhos';
