
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  FileText, 
  ArrowUpRight, 
  Clock,
  Plus,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  Package,
  Box,
  Receipt as ReceiptIcon,
  PieChart,
  BarChart3
} from 'lucide-react';
import { Service, Product, Client, Quote, Receipt, ViewType, CompanyProfile } from '../types';

interface DashboardProps {
  services: Service[];
  products: Product[];
  clients: Client[];
  quotes: Quote[];
  receipts: Receipt[];
  onNavigate: (view: ViewType) => void;
  profile: CompanyProfile;
}

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${trend >= 0 ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>
          <ArrowUpRight size={14} className={`mr-1 ${trend < 0 ? 'rotate-90' : ''}`} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
    <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
  </div>
);

const DashboardView: React.FC<DashboardProps> = ({ services, products, clients, quotes, receipts, onNavigate, profile }) => {
  const projectedRevenue = useMemo(() => quotes
    .filter(q => q.status === 'aprovado')
    .reduce((acc, q) => acc + q.total, 0), [quotes]);

  const realRevenue = useMemo(() => receipts
    .reduce((acc, r) => acc + r.amount, 0), [receipts]);

  const lowStockProducts = useMemo(() => products.filter(p => p.stock <= 2).length, [products]);

  // Cálculo de totais por categoria
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    
    quotes
      .filter(q => q.status === 'aprovado')
      .forEach(quote => {
        quote.items.forEach(item => {
          const source = item.type === 'service' 
            ? services.find(s => s.id === item.itemId) 
            : products.find(p => p.id === item.itemId);
          
          const category = source?.category || 'Geral';
          const price = item.priceOverride || source?.price || 0;
          const subtotal = price * item.quantity;

          if (!stats[category]) {
            stats[category] = { total: 0, count: 0 };
          }
          stats[category].total += subtotal;
          stats[category].count += 1;
        });
      });

    return Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6); // Top 6 categorias
  }, [quotes, services, products]);

  const maxCategoryValue = useMemo(() => 
    Math.max(...categoryStats.map(s => s[1].total), 1), 
  [categoryStats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumo do Negócio</h1>
          <p className="text-slate-500">Acompanhe seu desempenho comercial e financeiro.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('receipts')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Novo Recibo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Faturamento Real" value={`R$ ${realRevenue.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Aprovado (Projetado)" value={`R$ ${projectedRevenue.toLocaleString()}`} icon={FileCheck} color="bg-blue-100 text-blue-600" />
        <StatCard title="Recibos Emitidos" value={receipts.length} icon={ReceiptIcon} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Estoque Baixo" value={lowStockProducts} icon={Package} color="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Seção de Fluxo de Caixa */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2"><ReceiptIcon size={20} className="text-emerald-600" /> Fluxo de Caixa Recente</h2>
              <button onClick={() => onNavigate('receipts')} className="text-emerald-600 text-sm font-medium flex items-center">Ver recibos <ChevronRight size={14} /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold">
                  <tr><th className="px-6 py-3">Cliente</th><th className="px-6 py-3">Data</th><th className="px-6 py-3 text-right">Valor</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {receipts.slice(0, 5).map(r => (
                    <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800">{clients.find(c => c.id === r.clientId)?.name || '---'}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(r.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-right">R$ {r.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                  {receipts.length === 0 && (
                    <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400 italic">Nenhum recebimento registrado.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* NOVA SEÇÃO: Resumo por Categoria */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 size={20} className="text-indigo-600" /> 
                Volume por Categoria (Aprovados)
              </h2>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest bg-slate-50 px-3 py-1 rounded-full border border-slate-100">Top Categorias</span>
            </div>
            
            <div className="space-y-6">
              {categoryStats.map(([category, data]) => {
                const percentage = (data.total / maxCategoryValue) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700 text-sm">{category}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">({data.count} itens)</span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">R$ {data.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
              
              {categoryStats.length === 0 && (
                <div className="py-10 text-center text-slate-400 italic text-sm">
                  Sem dados de vendas aprovadas para exibir por categoria.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-white/20 rounded-xl"><Users size={20} /></div>
                <h3 className="font-bold text-lg">Próximos Passos</h3>
             </div>
             <div className="space-y-4">
                <button onClick={() => onNavigate('quotes')} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-left">
                  <span className="text-sm font-bold">Ver Orçamentos</span>
                  <ArrowUpRight size={16} />
                </button>
                <button onClick={() => onNavigate('clients')} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-left">
                  <span className="text-sm font-bold">Novo Cliente</span>
                  <Plus size={16} />
                </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest mb-4">Saúde do Negócio</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <PieChart size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-medium">Conversão de Orçamentos</p>
                  <p className="text-lg font-black text-slate-800">
                    {quotes.length > 0 ? ((quotes.filter(q => q.status === 'aprovado').length / quotes.length) * 100).toFixed(0) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Interface auxiliar para o ícone
const FileCheck = ({ size, className }: any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>
  </svg>
);

export default DashboardView;
