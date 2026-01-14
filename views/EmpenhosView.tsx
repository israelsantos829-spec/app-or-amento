
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Camera, 
  Gavel, 
  Building2, 
  DollarSign, 
  CheckCircle2, 
  Image as ImageIcon,
  ChevronDown,
  FileDown,
  Upload,
  Calendar,
  Filter
} from 'lucide-react';
import { Commitment, CompanyProfile } from '../types';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EmpenhosViewProps {
  commitments: Commitment[];
  setCommitments: React.Dispatch<React.SetStateAction<Commitment[]>>;
  companyProfile: CompanyProfile;
}

const EmpenhosView: React.FC<EmpenhosViewProps> = ({ commitments, setCommitments, companyProfile }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Commitment>>({
    prefeitura: '',
    prefeituraLogo: '',
    commitmentNumber: '',
    processNumber: '',
    date: new Date().toISOString().split('T')[0],
    value: 0,
    description: '',
    status: 'empenhado',
    images: []
  });

  const filteredCommitments = commitments.filter(c => 
    c.prefeitura.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.commitmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.processNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = filteredCommitments.reduce((acc, curr) => acc + curr.value, 0);

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const primaryColor = [37, 99, 235]; 
      
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.rect(0, 0, 210, 40, 'F');
      
      if (companyProfile.logo) {
        try {
          doc.addImage(companyProfile.logo, 'PNG', 15, 8, 24, 24);
        } catch (e) {
          console.error("Falha ao processar logo da empresa no PDF", e);
        }
      }
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(companyProfile.name || 'Sua Empresa', 45, 22);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Identificação: ${companyProfile.document || '---'}`, 45, 28);
      
      doc.setFontSize(14);
      doc.text('PLANILHA DE EMPENHOS PÚBLICOS', 120, 22);
      doc.setFontSize(8);
      doc.text(`Data do Relatório: ${new Date().toLocaleString()}`, 120, 28);

      const tableBody = filteredCommitments.map(c => [
        c.status.toUpperCase(),
        `      ${c.prefeitura}`, 
        c.commitmentNumber,
        c.processNumber,
        new Date(c.date).toLocaleDateString('pt-BR'),
        `R$ ${c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
      ]);

      autoTable(doc, {
        startY: 50,
        head: [['STATUS', 'ÓRGÃO / PREFEITURA', 'Nº EMPENHO', 'Nº PROCESSO', 'DATA', 'VALOR (R$)']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8, fontStyle: 'bold', halign: 'center' },
        styles: { fontSize: 8, halign: 'center', cellPadding: 3 },
        columnStyles: { 1: { halign: 'left', fontStyle: 'bold' }, 5: { halign: 'right', fontStyle: 'bold' } },
        margin: { left: 15, right: 15 },
        didDrawCell: (data: any) => {
          if (data.section === 'body' && data.column.index === 1) {
            const commitment = filteredCommitments[data.row.index];
            if (commitment && commitment.prefeituraLogo) {
              try {
                doc.addImage(commitment.prefeituraLogo, 'PNG', data.cell.x + 2, data.cell.y + 1, 6, 6);
              } catch (e) {
                // Silencioso se imagem estiver corrompida
              }
            }
          }
        }
      });

      const finalY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(10);
      doc.setTextColor(30, 41, 59);
      doc.text(`TOTAL EM PLANILHA: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 195, finalY, { align: 'right' });

      doc.save(`Planilha_Empenhos_${new Date().getTime()}.pdf`);
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      alert("Houve um problema ao gerar o PDF. Verifique os dados e tente novamente.");
    }
  };

  const handleSave = () => {
    if (!formData.prefeitura || !formData.commitmentNumber) {
      alert("Órgão e Número do Empenho são obrigatórios.");
      return;
    }

    const commitmentData = {
      ...formData,
      id: editingId || Math.random().toString(36).substr(2, 9).toUpperCase(),
      value: Number(formData.value) || 0,
    } as Commitment;

    if (editingId) {
      setCommitments(prev => prev.map(c => c.id === editingId ? commitmentData : c));
    } else {
      setCommitments(prev => [commitmentData, ...prev]);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      prefeitura: '',
      prefeituraLogo: '',
      commitmentNumber: '',
      processNumber: '',
      date: new Date().toISOString().split('T')[0],
      value: 0,
      description: '',
      status: 'empenhado',
      images: []
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setFormData(prev => ({ ...prev, prefeituraLogo: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Gavel className="text-blue-600" /> Planilha Digital de Empenhos
          </h1>
          <p className="text-slate-500 text-sm">Controle financeiro de contratos com a administração pública.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="bg-slate-100 text-slate-700 px-5 py-2.5 rounded-2xl font-bold hover:bg-slate-200 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            <FileDown size={16} /> Exportar Planilha
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2 text-xs uppercase tracking-widest"
          >
            <Plus size={16} /> Novo Registro
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Filtrar por órgão, empenho ou processo administrativo..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-slate-900 text-white px-8 py-4 rounded-2xl flex items-center gap-6 shadow-xl border border-slate-800">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Saldo Liquidado em Planilha</span>
            <span className="text-2xl font-black text-emerald-400">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
            <DollarSign size={24} className="text-emerald-400" />
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2rem] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-200">
              <tr>
                <th className="px-6 py-5">Situação</th>
                <th className="px-6 py-5">Órgão Público / Prefeitura</th>
                <th className="px-6 py-5">Nota de Empenho</th>
                <th className="px-6 py-5">Processo</th>
                <th className="px-6 py-5">Emissão</th>
                <th className="px-6 py-5 text-right">Valor Bruto</th>
                <th className="px-6 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommitments.map(commitment => (
                <tr key={commitment.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-tighter shadow-sm ${
                      commitment.status === 'pago' ? 'bg-emerald-500 text-white' :
                      commitment.status === 'liquidado' ? 'bg-blue-500 text-white' :
                      commitment.status === 'cancelado' ? 'bg-red-500 text-white' :
                      'bg-amber-400 text-amber-900'
                    }`}>
                      {commitment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                        {commitment.prefeituraLogo ? (
                          <img src={commitment.prefeituraLogo} className="w-full h-full object-contain p-1.5" />
                        ) : (
                          <Building2 size={18} className="text-slate-300" />
                        )}
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{commitment.prefeitura}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                      {commitment.commitmentNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{commitment.processNumber}</td>
                  <td className="px-6 py-4 text-xs text-slate-400">{new Date(commitment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                    R$ {commitment.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => { setEditingId(commitment.id); setFormData(commitment); setIsModalOpen(true); }}
                        className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-blue-100"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button 
                        onClick={() => setCommitments(prev => prev.filter(c => c.id !== commitment.id))}
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-xl shadow-sm border border-transparent hover:border-red-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCommitments.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center">
                    <div className="max-w-xs mx-auto text-slate-400 space-y-2">
                      <Filter className="mx-auto mb-2 opacity-20" size={48} />
                      <p className="font-bold">Nenhum registro encontrado.</p>
                      <p className="text-xs">Tente ajustar seus filtros ou adicione um novo empenho na planilha.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Detalhes do Empenho' : 'Novo Lançamento Público'}
                </h2>
                <p className="text-sm text-slate-500">Documentação completa para auditoria e controle.</p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="flex flex-col md:flex-row gap-8 items-center bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
                <div 
                  className="flex flex-col items-center gap-2 group cursor-pointer" 
                  onClick={() => logoInputRef.current?.click()}
                >
                   <div className="w-28 h-28 rounded-[2rem] bg-white border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:shadow-xl group-hover:shadow-blue-50 relative">
                      {formData.prefeituraLogo ? (
                        <>
                          <img src={formData.prefeituraLogo} className="w-full h-full object-contain p-4" />
                          <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <Upload className="text-blue-600" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-300 group-hover:text-blue-500">
                          <Upload size={24} />
                          <span className="text-[8px] font-black uppercase tracking-tighter">Logo do Órgão</span>
                        </div>
                      )}
                   </div>
                   <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   {formData.prefeituraLogo && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, prefeituraLogo: '' })); }}
                        className="text-[9px] font-black text-red-500 hover:bg-red-50 px-3 py-1 rounded-full transition-colors"
                      >
                        LIMPAR LOGO
                      </button>
                   )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefeitura / Órgão Público</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Ex: Prefeitura Municipal de Curitiba"
                        className="w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                        value={formData.prefeitura}
                        onChange={(e) => setFormData(prev => ({ ...prev, prefeitura: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status na Planilha</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none cursor-pointer"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="empenhado">Empenhado (Aguard. Liquid.)</option>
                      <option value="liquidado">Liquidado (Aguard. Pagam.)</option>
                      <option value="pago">Pago / Finalizado</option>
                      <option value="cancelado">Cancelado / Estornado</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Nota de Empenho</label>
                  <input 
                    type="text" 
                    placeholder="2024NE0001"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono font-black text-blue-600 uppercase"
                    value={formData.commitmentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, commitmentNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº Processo Administrativo</label>
                  <input 
                    type="text" 
                    placeholder="Proc. nº 000/2024"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={formData.processNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, processNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Empenho (R$)</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-xl text-slate-800"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data da Assinatura</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="date" 
                      className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objeto / Descrição do Empenho</label>
                <textarea 
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none leading-relaxed"
                  placeholder="Detalhe os serviços ou materiais amparados por este empenho..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-4">
              <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px] tracking-widest">Descartar</button>
              <button 
                onClick={handleSave}
                className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-200 hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 uppercase text-xs tracking-widest"
              >
                <CheckCircle2 size={18} /> {editingId ? 'Confirmar Edição' : 'Salvar em Planilha'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}</style>
    </div>
  );
};

export default EmpenhosView;
