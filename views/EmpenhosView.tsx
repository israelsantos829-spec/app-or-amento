
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  X, 
  Camera, 
  Gavel, 
  FileText, 
  Building2, 
  Calendar, 
  DollarSign, 
  CheckCircle2, 
  Image as ImageIcon,
  MoreVertical,
  ChevronDown,
  Download,
  FileDown,
  RotateCw,
  Upload
} from 'lucide-react';
import { Commitment, CompanyProfile } from '../types';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
    const doc = new jsPDF() as any;
    const primaryColor = [37, 99, 235]; // Blue 600
    
    // Cabeçalho do Documento
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 35, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(companyProfile.name || 'Minha Empresa', 15, 22);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`CNPJ/CPF: ${companyProfile.document || '---'}`, 15, 28);
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.text('RELATÓRIO DE EMPENHOS', 135, 22);
    doc.setFontSize(8);
    doc.text(`Gerado em: ${new Date().toLocaleString()}`, 135, 28);

    // Corpo do Relatório
    const tableData = filteredCommitments.map(c => [
      c.status.toUpperCase(),
      `      ${c.prefeitura}`, // Espaço para o logo
      c.commitmentNumber,
      c.processNumber,
      new Date(c.date).toLocaleDateString(),
      `R$ ${c.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
    ]);

    doc.autoTable({
      startY: 45,
      head: [['STATUS', 'PREFEITURA / ÓRGÃO', 'Nº EMPENHO', 'Nº PROCESSO', 'DATA', 'VALOR']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [30, 41, 59], 
        textColor: 255, 
        fontSize: 8, 
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: { fontSize: 8, halign: 'center', cellPadding: 3 },
      columnStyles: {
        1: { halign: 'left', fontStyle: 'bold' },
        5: { halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 15, right: 15 },
      didDrawCell: (data: any) => {
        // Renderiza o logo da prefeitura na coluna 1 (Órgão) se existir
        if (data.section === 'body' && data.column.index === 1) {
          const commitment = filteredCommitments[data.row.index];
          if (commitment.prefeituraLogo) {
            try {
              doc.addImage(commitment.prefeituraLogo, 'PNG', data.cell.x + 2, data.cell.y + 1, 6, 6);
            } catch (e) {
              console.warn("Erro ao renderizar logo no PDF", e);
            }
          }
        }
      }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;

    // Sumário no final do PDF
    doc.setFillColor(248, 250, 252);
    doc.rect(130, finalY - 5, 65, 20, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(130, finalY - 5, 65, 20, 'S');

    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL CONSOLIDADO:', 135, finalY + 2);
    
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.text(`R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 135, finalY + 10);

    doc.save(`Empenhos_${new Date().toISOString().split('T')[0]}.pdf`);
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

  const handleSave = () => {
    if (!formData.prefeitura || !formData.commitmentNumber) return;

    if (editingId) {
      setCommitments(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Commitment : c));
    } else {
      const newCommitment: Commitment = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        prefeitura: formData.prefeitura || '',
        prefeituraLogo: formData.prefeituraLogo,
        commitmentNumber: formData.commitmentNumber || '',
        processNumber: formData.processNumber || '',
        date: formData.date || new Date().toISOString(),
        value: Number(formData.value) || 0,
        description: formData.description || '',
        status: (formData.status as Commitment['status']) || 'empenhado',
        images: formData.images || []
      };
      setCommitments(prev => [newCommitment, ...prev]);
    }
    closeModal();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({
            ...prev,
            images: [...(prev.images || []), reader.result as string]
          }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, prefeituraLogo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Gavel className="text-blue-600" /> Gestão de Empenhos
          </h1>
          <p className="text-slate-500">Controle de contratos, processos e liquidações com prefeituras.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPDF}
            className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
          >
            <FileDown size={18} /> Exportar PDF
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Novo Empenho
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por prefeitura, empenho ou processo..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="bg-slate-900 text-white px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-slate-100">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Total na Planilha</span>
            <span className="text-lg font-black">R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <DollarSign size={20} className="text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Visualização de Planilha */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Prefeitura / Órgão</th>
                <th className="px-6 py-4">Nº Empenho</th>
                <th className="px-6 py-4">Nº Processo</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4 text-right">Valor</th>
                <th className="px-6 py-4 text-center">Fotos</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommitments.map(commitment => (
                <tr key={commitment.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter ${
                      commitment.status === 'pago' ? 'bg-emerald-100 text-emerald-700' :
                      commitment.status === 'liquidado' ? 'bg-blue-100 text-blue-700' :
                      commitment.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {commitment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {commitment.prefeituraLogo ? (
                          <img src={commitment.prefeituraLogo} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 size={14} className="text-slate-400" />
                        )}
                      </div>
                      <span className="font-bold text-slate-800 text-sm truncate">{commitment.prefeitura}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono font-bold text-blue-600">{commitment.commitmentNumber}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{commitment.processNumber}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(commitment.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-right font-black text-slate-800 text-sm">R$ {commitment.value.toLocaleString()}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center -space-x-2">
                      {commitment.images.slice(0, 3).map((img, i) => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                          <img src={img} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {commitment.images.length > 3 && (
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-800 text-white text-[8px] flex items-center justify-center">
                          +{commitment.images.length - 3}
                        </div>
                      )}
                      {commitment.images.length === 0 && <span className="text-slate-300">---</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => { setEditingId(commitment.id); setFormData(commitment); setIsModalOpen(true); }}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                      >
                        <ImageIcon size={16} />
                      </button>
                      <button 
                        onClick={() => setCommitments(prev => prev.filter(c => c.id !== commitment.id))}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCommitments.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Nenhum empenho registrado para esta busca.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cadastro/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-2xl h-full sm:h-auto sm:max-h-[90vh] sm:rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Editar Empenho' : 'Novo Empenho Público'}
                </h2>
                <p className="text-sm text-slate-500">Controle de faturamento governamental.</p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                {/* Upload Logo Prefeitura */}
                <div className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => logoInputRef.current?.click()}>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logo Órgão</span>
                   <div className="w-24 h-24 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400 group-hover:bg-blue-50">
                      {formData.prefeituraLogo ? (
                        <img src={formData.prefeituraLogo} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Upload size={24} className="text-slate-300 group-hover:text-blue-500" />
                      )}
                   </div>
                   <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   {formData.prefeituraLogo && (
                     <button 
                        onClick={(e) => { e.stopPropagation(); setFormData(prev => ({ ...prev, prefeituraLogo: '' })); }}
                        className="text-[9px] font-bold text-red-500 hover:underline"
                      >
                        Remover Logo
                      </button>
                   )}
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-1 gap-6 w-full">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Prefeitura / Órgão</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder="Ex: Pref. de São Paulo"
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                        value={formData.prefeitura}
                        onChange={(e) => setFormData(prev => ({ ...prev, prefeitura: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status do Processo</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold appearance-none"
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    >
                      <option value="empenhado">Empenhado</option>
                      <option value="liquidado">Liquidado</option>
                      <option value="pago">Pago</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº da Nota de Empenho</label>
                  <input 
                    type="text" 
                    placeholder="2023NE000123"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-mono font-bold text-blue-600"
                    value={formData.commitmentNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, commitmentNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nº do Processo Administrativo</label>
                  <input 
                    type="text" 
                    placeholder="123456/2023-99"
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={formData.processNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, processNumber: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Empenho</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black text-lg"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Data do Documento</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Objeto</label>
                <textarea 
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium resize-none leading-relaxed"
                  placeholder="Descreva o serviço ou material empenhado..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              {/* Seção de Fotos */}
              <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fotos / Comprovantes de Execução</label>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-all"
                  >
                    <Camera size={14} /> Adicionar Fotos
                  </button>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                  {formData.images?.map((img, idx) => (
                    <div key={idx} className="aspect-square rounded-xl bg-slate-100 border border-slate-200 relative group overflow-hidden">
                      <img src={img} className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all"
                  >
                    <Plus size={20} />
                  </div>
                </div>
                <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>

            <div className="p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-black uppercase text-[10px] tracking-widest">Cancelar</button>
              <button 
                onClick={handleSave}
                className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2"
              >
                <CheckCircle2 size={18} /> {editingId ? 'Atualizar Empenho' : 'Registrar Empenho'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmpenhosView;
