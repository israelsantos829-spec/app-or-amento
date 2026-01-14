
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  FileCheck,
  ChevronDown,
  Receipt as ReceiptIcon,
  CreditCard,
  Banknote,
  Smartphone
} from 'lucide-react';
import { Receipt, Client, Quote, CompanyProfile } from '../types';
import { jsPDF } from 'jspdf';

interface ReceiptsViewProps {
  receipts: Receipt[];
  setReceipts: React.Dispatch<React.SetStateAction<Receipt[]>>;
  clients: Client[];
  quotes: Quote[];
  companyProfile: CompanyProfile;
}

const ReceiptsView: React.FC<ReceiptsViewProps> = ({ receipts, setReceipts, clients, quotes, companyProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Receipt>>({
    clientId: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    description: '',
    paymentMethod: 'Pix'
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ clientId: '', amount: 0, date: new Date().toISOString().split('T')[0], description: '', paymentMethod: 'Pix' });
  };

  const handleSave = () => {
    if (!formData.clientId || !formData.amount || formData.amount <= 0) return;
    
    const newReceipt: Receipt = {
      id: Math.random().toString(36).substr(2, 6).toUpperCase(),
      clientId: formData.clientId || '',
      amount: Number(formData.amount) || 0,
      date: formData.date || new Date().toISOString(),
      description: formData.description || '',
      paymentMethod: formData.paymentMethod || 'Pix',
      quoteId: formData.quoteId
    };

    setReceipts(prev => [newReceipt, ...prev]);
    closeModal();
  };

  const handleDownloadPDF = (receipt: Receipt) => {
    const doc = new jsPDF() as any;
    const client = clients.find(c => c.id === receipt.clientId);
    const primaryColor = [16, 185, 129]; // Emerald 500 for receipts
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Background decoration
    doc.setFillColor(249, 250, 251);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'F');
    doc.setDrawColor(229, 231, 235);
    doc.rect(10, 10, pageWidth - 20, pageHeight - 20, 'S');

    // Header
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(10, 10, pageWidth - 20, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE PAGAMENTO', pageWidth / 2, 30, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`#${receipt.id}`, pageWidth - 25, 20, { align: 'right' });

    // Company Logo/Name
    doc.setTextColor(31, 41, 55);
    doc.setFontSize(14);
    doc.text(companyProfile.name, 20, 60);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(companyProfile.document || '', 20, 65);
    doc.text(companyProfile.phone || '', 20, 70);

    // Date
    doc.setFontSize(10);
    doc.text(`Data: ${new Date(receipt.date).toLocaleDateString('pt-BR')}`, pageWidth - 20, 60, { align: 'right' });

    // Content Box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(209, 213, 219);
    doc.rect(20, 80, pageWidth - 40, 100, 'FD');

    doc.setTextColor(55, 65, 81);
    doc.setFontSize(12);
    const amountStr = receipt.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    const mainText = `Recebemos de ${client?.name || '___________________________'}, a importância de ${amountStr}, referente a ${receipt.description || 'serviços prestados'}.`;
    const splitText = doc.splitTextToSize(mainText, pageWidth - 60);
    doc.text(splitText, 30, 105, { lineHeightFactor: 1.5 });

    // Payment Info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Forma de Pagamento:', 30, 160);
    doc.setFont('helvetica', 'normal');
    doc.text(receipt.paymentMethod, 75, 160);

    // Signatures
    doc.line(40, 230, 95, 230);
    doc.setFontSize(8);
    doc.text('Assinatura do Emitente', 67.5, 235, { align: 'center' });

    doc.line(pageWidth - 95, 230, pageWidth - 40, 230);
    doc.text('Assinatura do Cliente', pageWidth - 67.5, 235, { align: 'center' });

    // Footer
    doc.setTextColor(156, 163, 175);
    doc.text(`Emitido em ${new Date().toLocaleString('pt-BR')}`, pageWidth / 2, pageHeight - 15, { align: 'center' });

    doc.save(`Recibo_${receipt.id}.pdf`);
  };

  const filteredReceipts = receipts.filter(r => {
    const client = clients.find(c => c.id === r.clientId);
    return client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           r.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 text-emerald-900">Recibos Emitidos</h1>
          <p className="text-slate-500">Comprovantes de pagamento e histórico financeiro.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Emitir Recibo</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar por cliente ou descrição..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReceipts.map(receipt => {
          const client = clients.find(c => c.id === receipt.clientId);
          return (
            <div key={receipt.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ReceiptIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 truncate max-w-[150px]">{client?.name || 'Cliente'}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(receipt.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => handleDownloadPDF(receipt)} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"><Download size={18} /></button>
                   <button onClick={() => setReceipts(prev => prev.filter(r => r.id !== receipt.id))} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                </div>
              </div>

              <div className="flex-1 mb-4">
                <p className="text-sm text-slate-600 line-clamp-2 italic leading-relaxed">
                  "{receipt.description || 'Serviços prestados conforme orçamento.'}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Valor Recebido</span>
                  <span className="text-xl font-black text-emerald-600">R$ {receipt.amount.toFixed(2)}</span>
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  {receipt.paymentMethod === 'Pix' && <Smartphone size={14} className="text-emerald-500" />}
                  {receipt.paymentMethod === 'Dinheiro' && <Banknote size={14} className="text-emerald-500" />}
                  {receipt.paymentMethod === 'Cartão' && <CreditCard size={14} className="text-emerald-500" />}
                  <span className="text-[10px] font-bold text-slate-500 uppercase">{receipt.paymentMethod}</span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredReceipts.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
            <ReceiptIcon size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">Nenhum recibo emitido.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800">Emitir Recibo</h2>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 appearance-none font-bold"
                    value={formData.clientId}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  >
                    <option value="">Selecione um cliente...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input type="number" className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black" value={formData.amount} onChange={(e) => setFormData(prev => ({ ...prev, amount: Number(e.target.value) }))} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                  <input type="date" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium" value={formData.date} onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Forma de Pagamento</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pix', 'Dinheiro', 'Cartão'].map(method => (
                    <button 
                      key={method}
                      onClick={() => setFormData(prev => ({ ...prev, paymentMethod: method }))}
                      className={`py-3 rounded-xl text-xs font-bold transition-all border-2 ${
                        formData.paymentMethod === method 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' 
                          : 'bg-white text-slate-500 border-slate-100 hover:border-emerald-200'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Referente a</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all resize-none text-sm leading-relaxed"
                  placeholder="Ex: Instalação elétrica residencial conforme combinado."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex items-center justify-end space-x-4">
              <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all">Emitir Recibo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptsView;
