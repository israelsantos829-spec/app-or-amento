
import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Users, 
  Briefcase, 
  ArrowUpRight, 
  Plus, 
  ChevronRight,
  Package,
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

const DashboardView: React.FC<DashboardProps> = ({ 
  services = [], 
  products = [], 
  clients = [], 
  quotes = [], 
  receipts = [], 
  onNavigate 
}) => {
  // Cálculos protegidos com opcionais
  const projectedRevenue = useMemo(() => {
    return (quotes || [])
      .filter(q => q?.status === 'aprovado')
      .reduce((acc, q) => acc + (q?.total || 0), 0);
  }, [quotes]);

  const realRevenue = useMemo(() => {
    return (receipts || [])
      .reduce((acc, r) => acc + (r?.amount || 0), 0);
  }, [receipts]);

  const lowStockProducts = useMemo(() => {
    return (products || []).filter(p => (p?.stock || 0) <= 2).length;
  }, [products]);

  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; count: number }> = {};
    
    (quotes || [])
      .filter(q => q?.status === 'aprovado')
      .forEach(quote => {
        (quote?.items || []).forEach(item => {
          const source = item.type === 'service' 
            ? services.find(s => s.id === item.itemId) 
            : products.find(p => p.id === item.itemId);
          
          const category = source?.category || 'Geral';
          const price = item.priceOverride || source?.price || 0;
          const subtotal = price * (item.quantity || 1);

          if (!stats[category]) {
            stats[category] = { total: 0, count: 0 };
          }
          stats[category].total += subtotal;
          stats[category].count += 1;
        });
      });

    return Object.entries(stats)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 6); 
  }, [quotes, services, products]);

  const maxCategoryValue = useMemo(() => 
    Math.max(...categoryStats.map(s => s[1].total), 1), 
  [categoryStats]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Resumo Financeiro</h1>
          <p className="text-slate-500">Gestão simplificada do seu negócio.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => onNavigate('receipts')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-emerald-700 transition-all flex items-center gap-2">
            <Plus size={18} /> Novo Recibo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Recebido" value={`R$ ${realRevenue.toLocaleString()}`} icon={TrendingUp} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Em Aberto (Aprovado)" value={`R$ ${projectedRevenue.toLocaleString()}`} icon={FileCheck} color="bg-blue-100 text-blue-600" />
        <StatCard title="Recibos" value={receipts.length} icon={ReceiptIcon} color="bg-emerald-100 text-emerald-600" />
        <StatCard title="Alerta Estoque" value={lowStockProducts} icon={Package} color="bg-indigo-100 text-indigo-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <ReceiptIcon size={20} className="text-emerald-600" /> 
                Últimos Recebimentos
              </h2>
              <button onClick={() => onNavigate('receipts')} className="text-emerald-600 text-sm font-medium flex items-center">Ver histórico <ChevronRight size={14} /></button>
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
                    <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400 italic text-sm">Nenhum recebimento registrado ainda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 mb-8">
              <BarChart3 size={20} className="text-indigo-600" /> 
              Faturamento por Categoria
            </h2>
            <div className="space-y-6">
              {categoryStats.map(([category, data]) => {
                const percentage = (data.total / maxCategoryValue) * 100;
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="font-bold text-slate-700 text-sm">{category}</span>
                      <span className="font-black text-slate-900 text-sm">R$ {data.total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {categoryStats.length === 0 && (
                <div className="py-8 text-center text-slate-400 italic text-sm">Sem dados para o gráfico.</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl">
             <h3 className="font-bold text-lg mb-4">Acesso Rápido</h3>
             <div className="space-y-3">
                <button onClick={() => onNavigate('quotes')} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-sm font-bold">
                  Gerar Orçamento <Plus size={16} />
                </button>
                <button onClick={() => onNavigate('clients')} className="w-full flex justify-between items-center bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all text-sm font-bold">
                  Novo Cliente <Users size={16} />
                </button>
             </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Conversão</p>
                <p className="text-xl font-black text-slate-800">
                  {quotes.length > 0 ? ((quotes.filter(q => q.status === 'aprovado').length / quotes.length) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
