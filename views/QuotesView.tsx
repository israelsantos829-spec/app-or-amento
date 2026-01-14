
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Plus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  X, 
  MessageSquare,
  Sparkles,
  Loader2,
  FileText,
  Download,
  Eye,
  Calendar,
  User,
  MapPin,
  Mail,
  Phone,
  ChevronDown,
  Building2,
  Info,
  MoreVertical,
  Save,
  Package,
  Wrench,
  Receipt as ReceiptIcon,
  AlertTriangle,
  Camera,
  Image as ImageIcon,
  Settings,
  Maximize
} from 'lucide-react';
import { Quote, QuoteItem, Service, Product, Client, CompanyProfile, ViewType } from '../types';
import { generateQuoteMessage } from '../services/geminiService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface QuotesViewProps {
  quotes: Quote[];
  setQuotes: React.Dispatch<React.SetStateAction<Quote[]>>;
  services: Service[];
  products: Product[];
  clients: Client[];
  companyProfile: CompanyProfile;
  onNavigate?: (view: ViewType) => void;
}

type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const QuotesView: React.FC<QuotesViewProps> = ({ quotes, setQuotes, services, products, clients, companyProfile, onNavigate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false);
  const [quoteToDelete, setQuoteToDelete] = useState<Quote | null>(null);
  const [itemToDeleteIdx, setItemToDeleteIdx] = useState<number | null>(null);
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [editableQuote, setEditableQuote] = useState<Quote | null>(null);

  const [currentClientId, setCurrentClientId] = useState('');
  const [currentItems, setCurrentItems] = useState<QuoteItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  
  const [watermarkOpacity, setWatermarkOpacity] = useState(10); 
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('center');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const calculateTotal = (items: QuoteItem[], disc: number) => {
    const itemsTotal = items.reduce((acc, item) => {
      const source = item.type === 'service' 
        ? services.find(s => s.id === item.itemId) 
        : products.find(p => p.id === item.itemId);
      return acc + (source ? (item.priceOverride || source.price) * item.quantity : 0);
    }, 0);
    return Math.max(0, itemsTotal - disc);
  };

  const total = useMemo(() => calculateTotal(currentItems, discount), [currentItems, discount, services, products]);

  useEffect(() => {
    if (editableQuote) {
      const newTotal = calculateTotal(editableQuote.items, editableQuote.discount);
      if (newTotal !== editableQuote.total) {
        setEditableQuote({ ...editableQuote, total: newTotal });
      }
    }
  }, [editableQuote?.items, editableQuote?.discount, services, products]);

  const handleAddItem = (itemId: string, type: 'service' | 'product') => {
    if (!itemId) return;
    setCurrentItems(prev => [...prev, { itemId, type, quantity: 1 }]);
  };

  const handleUpdateStatus = (id: string, newStatus: Quote['status']) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const handleDeleteClick = (quote: Quote) => {
    setQuoteToDelete(quote);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (quoteToDelete) {
      setQuotes(prev => prev.filter(q => q.id !== quoteToDelete.id));
      setIsDeleteModalOpen(false);
      setQuoteToDelete(null);
    }
  };

  const handleDownloadPDF = (quote: Quote) => {
    try {
      const doc = new jsPDF();
      const client = clients.find(c => c.id === quote.clientId);
      const primaryColor = [37, 99, 235]; 
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.width ? pageSize.width : pageSize.getWidth();
      const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();

      const addWatermark = () => {
        if (companyProfile.logo) {
          try {
            // Em ESM/jspdf moderno, GState pode precisar ser acessado de forma diferente ou via plugin
            const imgWidth = 80;
            const imgHeight = 80;
            let x = (pageWidth / 2) - (imgWidth / 2);
            let y = (pageHeight / 2) - (imgHeight / 2);

            switch (watermarkPosition) {
              case 'top-left': x = 20; y = 50; break;
              case 'top-right': x = pageWidth - imgWidth - 20; y = 50; break;
              case 'bottom-left': x = 20; y = pageHeight - imgHeight - 20; break;
              case 'bottom-right': x = pageWidth - imgWidth - 20; y = pageHeight - imgHeight - 20; break;
            }
            doc.addImage(companyProfile.logo, 'PNG', x, y, imgWidth, imgHeight);
          } catch (e) {
            console.warn("Falha ao renderizar marca d'água", e);
          }
        }
      };

      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text(companyProfile.name || 'Empresa', 20, 25);
      
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ORÇAMENTO #' + quote.id, 140, 25);
      doc.text('Emissão: ' + new Date(quote.date).toLocaleDateString(), 140, 32);

      const tableData = quote.items.map(item => {
        const source = item.type === 'service' 
          ? services.find(s => s.id === item.itemId) 
          : products.find(p => p.id === item.itemId);
        const price = item.priceOverride || source?.price || 0;
        return [
          `${item.type === 'service' ? '[SERVIÇO]' : '[PRODUTO]'} ${source?.name || 'Item'}`,
          item.quantity,
          `R$ ${price.toFixed(2)}`,
          `R$ ${(price * item.quantity).toFixed(2)}`
        ];
      });

      autoTable(doc, {
        startY: 80,
        head: [['Descrição do Item', 'Qtd', 'Unitário', 'Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: primaryColor, fontStyle: 'bold' },
        styles: { fontSize: 9 },
        didDrawPage: () => addWatermark()
      });

      let finalY = (doc as any).lastAutoTable.finalY + 15;
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(`TOTAL FINAL: R$ ${quote.total.toFixed(2)}`, 140, finalY);

      doc.save(`Orcamento_${quote.id}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um problema ao gerar o PDF.");
    }
  };

  const handleSaveQuote = () => {
    if (!currentClientId || currentItems.length === 0) return;
    const newQuote: Quote = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      clientId: currentClientId,
      items: [...currentItems],
      discount,
      status: 'rascunho',
      date: new Date().toISOString(),
      validUntil: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      total,
      notes
    };
    setQuotes(prev => [newQuote, ...prev]);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setCurrentClientId('');
    setCurrentItems([]);
    setDiscount(0);
    setNotes('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0">
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingIdx !== null) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setCurrentItems(prev => prev.map((item, i) => i === uploadingIdx ? { ...item, image: reader.result as string } : item));
              setUploadingIdx(null);
            };
            reader.readAsDataURL(file);
          }
        }} 
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Orçamentos</h1>
          <p className="text-slate-500">Serviços e materiais em um só lugar.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2">
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {quotes.map(quote => {
          const client = clients.find(c => c.id === quote.clientId);
          const hasPhotos = quote.items.some(it => it.image);

          return (
            <div key={quote.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 relative">
                    <FileText size={24} />
                    {hasPhotos && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] text-white font-bold">
                        <ImageIcon size={10} />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800">{client?.name || 'Cliente'}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(quote.date).toLocaleDateString()} • #{quote.id}</p>
                  </div>
                </div>
                <select 
                  value={quote.status} 
                  onChange={(e) => handleUpdateStatus(quote.id, e.target.value as any)}
                  className={`appearance-none px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border-none focus:ring-4 ${
                    quote.status === 'aprovado' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <option value="rascunho">Rascunho</option>
                  <option value="enviado">Enviado</option>
                  <option value="aprovado">Aprovado</option>
                  <option value="rejeitado">Rejeitado</option>
                </select>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold text-slate-400">R$</span>
                  <span className="text-2xl font-black text-slate-900">{quote.total.toFixed(2)}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedQuote(quote); setEditableQuote({...quote}); setIsPreviewModalOpen(true); }} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Eye size={20} /></button>
                  <button onClick={() => handleDownloadPDF(quote)} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"><Download size={20} /></button>
                  <button onClick={() => handleDeleteClick(quote)} className="p-3 bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"><Trash2 size={20} /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[95vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
            <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-black text-slate-800">Novo Orçamento</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            
            <div className="p-6 sm:p-8 overflow-y-auto flex-1 space-y-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={currentClientId} onChange={(e) => setCurrentClientId(e.target.value)}>
                  <option value="">Selecione o cliente...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens do Orçamento</label>
                  <div className="flex gap-2">
                    <select className="text-[9px] bg-blue-600 text-white font-black px-3 py-2 rounded-full outline-none" onChange={(e) => { handleAddItem(e.target.value, 'service'); e.target.value = ""; }}>
                      <option value="">+ Add Serviço</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select className="text-[9px] bg-indigo-600 text-white font-black px-3 py-2 rounded-full outline-none" onChange={(e) => { handleAddItem(e.target.value, 'product'); e.target.value = ""; }}>
                      <option value="">+ Add Produto</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-100 text-[9px] font-black uppercase text-slate-500">
                      <tr><th className="px-5 py-3">Item</th><th className="px-5 py-3 text-center">Qtd</th><th className="px-5 py-3 text-right">Subtotal</th><th className="px-5 py-3"></th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {currentItems.map((item, idx) => {
                        const source = item.type === 'service' ? services.find(s => s.id === item.itemId) : products.find(p => p.id === item.itemId);
                        return (
                          <tr key={idx}>
                            <td className="px-5 py-4 text-xs font-bold text-slate-800">{source?.name}</td>
                            <td className="px-5 py-4">
                              <input type="number" min="1" className="w-12 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs font-bold" value={item.quantity} onChange={(e) => setCurrentItems(prev => prev.map((it, i) => i === idx ? {...it, quantity: Number(e.target.value)} : it))} />
                            </td>
                            <td className="px-5 py-4 text-xs text-right font-black">R$ {(source ? source.price * item.quantity : 0).toFixed(2)}</td>
                            <td className="px-5 py-4">
                              <button 
                                onClick={() => setCurrentItems(prev => prev.filter((_, i) => i !== idx))}
                                className="text-red-400 hover:text-red-600"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-slate-400">Total</span>
                <span className="text-4xl font-black">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex gap-3">
              <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-500 font-black uppercase text-xs">Cancelar</button>
              <button onClick={handleSaveQuote} className="flex-2 bg-blue-600 text-white py-4 px-8 rounded-2xl font-black uppercase text-xs shadow-xl shadow-blue-100">Salvar Orçamento</button>
            </div>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <AlertTriangle size={40} />
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">Excluir?</h2>
              <p className="text-slate-500 text-sm">Esta ação não pode ser desfeita.</p>
            </div>
            <div className="p-6 bg-slate-50 flex gap-3">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl text-xs uppercase tracking-widest">Cancelar</button>
              <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-red-700 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}

      {isPreviewModalOpen && editableQuote && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-0 sm:p-4 bg-slate-900/90 backdrop-blur-md overflow-y-auto">
          <div className="bg-white w-full max-w-2xl min-h-full sm:min-h-0 sm:rounded-[2.5rem] shadow-2xl flex flex-col">
            <div className="p-6 bg-blue-600 text-white flex justify-between items-center">
              <h2 className="text-xl font-black">Visualização</h2>
              <button onClick={() => setIsPreviewModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="p-8 space-y-6 flex-1">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Marca D'água</h4>
                 <input 
                    type="range" min="0" max="100" value={watermarkOpacity}
                    onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-blue-600"
                 />
              </div>

              <div className="border border-slate-200 rounded-3xl p-6 space-y-4">
                 <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Itens</h4>
                 <div className="space-y-2">
                   {editableQuote.items.map((item, i) => {
                      const source = item.type === 'service' ? services.find(s => s.id === item.itemId) : products.find(p => p.id === item.itemId);
                      return (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50">
                          <span className="font-bold text-slate-700">{source?.name} ({item.quantity}x)</span>
                          <span className="font-black text-slate-900">R$ {(source ? source.price * item.quantity : 0).toFixed(2)}</span>
                        </div>
                      );
                   })}
                 </div>
                 <div className="pt-4 flex justify-between items-center border-t border-slate-200">
                    <span className="text-xs font-black uppercase text-slate-400">Total</span>
                    <span className="text-2xl font-black text-blue-600">R$ {editableQuote.total.toFixed(2)}</span>
                 </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex gap-3">
                <button onClick={() => setIsPreviewModalOpen(false)} className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-xs font-black uppercase text-slate-400">Fechar</button>
                <button onClick={() => handleDownloadPDF(editableQuote)} className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase flex items-center justify-center gap-2"><Download size={16}/> Baixar PDF</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuotesView;
