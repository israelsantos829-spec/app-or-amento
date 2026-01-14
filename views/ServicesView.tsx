
import React, { useState, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Sparkles, 
  Loader2,
  X,
  Tag,
  Briefcase,
  CheckCircle2,
  Wrench,
  Settings2,
  Save,
  ChevronDown,
  CalendarDays,
  Clock,
  User,
  Info,
  Camera,
  RotateCw,
  Heart,
  DollarSign
} from 'lucide-react';
import { Service, Client, Appointment } from '../types';
import { enhanceDescription } from '../services/geminiService';

interface ServicesViewProps {
  services: Service[];
  setServices: React.Dispatch<React.SetStateAction<Service[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
  clients: Client[];
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
}

const ServicesView: React.FC<ServicesViewProps> = ({ 
  services, 
  setServices, 
  categories, 
  setCategories,
  clients,
  appointments,
  setAppointments
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [schedulingService, setSchedulingService] = useState<Service | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Categorias
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);
  const [tempCategoryName, setTempCategoryName] = useState('');

  // Formulário de Serviço
  const [formData, setFormData] = useState<Partial<Service>>({
    name: '',
    description: '',
    price: 0,
    unit: 'unidade',
    category: 'Geral',
    status: 'ativo',
    image: undefined,
    isFavorite: false
  });

  // Formulário de Agendamento
  const [scheduleData, setScheduleData] = useState({
    clientId: '',
    date: '',
    time: '',
    notes: ''
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0, unit: 'unidade', category: 'Geral', status: 'ativo', image: undefined, isFavorite: false });
  };

  const closeScheduleModal = () => {
    setIsScheduleModalOpen(false);
    setSchedulingService(null);
    setScheduleData({ clientId: '', date: '', time: '', notes: '' });
  };

  const handleEdit = (service: Service) => {
    setFormData(service);
    setEditingId(service.id);
    setIsModalOpen(true);
  };

  const handleToggleFavorite = (serviceId: string) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId ? { ...s, isFavorite: !s.isFavorite } : s
    ));
  };

  const handleOpenSchedule = (service: Service) => {
    setSchedulingService(service);
    setIsScheduleModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSchedule = () => {
    if (!schedulingService || !scheduleData.clientId || !scheduleData.date || !scheduleData.time) {
      alert("Por favor, preencha o cliente, a data e a hora.");
      return;
    }

    const newAppointment: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      serviceId: schedulingService.id,
      clientId: scheduleData.clientId,
      date: scheduleData.date,
      time: scheduleData.time,
      notes: scheduleData.notes
    };

    setAppointments(prev => [...prev, newAppointment]);
    alert("Serviço agendado com sucesso!");
    closeScheduleModal();
  };

  const handleSave = () => {
    if (!formData.name || formData.price === undefined) return;
    
    if (editingId) {
      setServices(prev => prev.map(s => 
        s.id === editingId 
          ? { ...s, ...formData } as Service 
          : s
      ));
    } else {
      const newService: Service = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || '',
        description: formData.description || '',
        price: Number(formData.price) || 0,
        unit: (formData.unit as Service['unit']) || 'unidade',
        category: formData.category || 'Geral',
        status: (formData.status as Service['status']) || 'ativo',
        image: formData.image,
        isFavorite: formData.isFavorite || false
      };
      setServices(prev => [...prev, newService]);
    }

    closeModal();
  };

  const handleEnhance = async () => {
    if (!formData.name) return;
    setIsEnhancing(true);
    const result = await enhanceDescription(formData.name, formData.description || '');
    setFormData(prev => ({ ...prev, description: result }));
    setIsEnhancing(false);
  };

  const handleAddCategory = () => {
    if (!newCategoryName.trim() || categories.includes(newCategoryName.trim())) return;
    setCategories(prev => [...prev, newCategoryName.trim()]);
    setNewCategoryName('');
  };

  const handleRemoveCategory = (catName: string) => {
    if (catName === 'Geral') return;
    setCategories(prev => prev.filter(c => c !== catName));
    setServices(prev => prev.map(s => s.category === catName ? { ...s, category: 'Geral' } : s));
  };

  const handleUpdateCategory = (index: number) => {
    const oldName = categories[index];
    const newName = tempCategoryName.trim();
    if (!newName || oldName === newName) {
      setEditingCategoryIndex(null);
      return;
    }

    setCategories(prev => prev.map((c, i) => i === index ? newName : c));
    setServices(prev => prev.map(s => s.category === oldName ? { ...s, category: newName } : s));
    setEditingCategoryIndex(null);
  };

  const filteredServices = services.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         s.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFavorite = showOnlyFavorites ? s.isFavorite : true;
    return matchesSearch && matchesFavorite;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catálogo de Serviços</h1>
          <p className="text-slate-500">Gerencie sua lista de serviços e preços profissionais.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl font-medium hover:bg-slate-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <Settings2 size={18} />
            <span className="hidden sm:inline">Categorias</span>
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
          >
            <Plus size={18} />
            <span>Novo Serviço</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar por nome ou categoria..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
          className={`px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all border ${
            showOnlyFavorites 
              ? 'bg-red-50 text-red-600 border-red-100' 
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Heart size={18} className={showOnlyFavorites ? 'fill-red-600' : ''} />
          <span>{showOnlyFavorites ? 'Favoritos' : 'Ver Favoritos'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredServices.map(service => {
          const isMaintenance = service.status === 'manutenção';
          
          return (
            <div 
              key={service.id} 
              className={`bg-white border rounded-[2.5rem] p-4 shadow-sm hover:shadow-2xl transition-all group flex flex-col relative overflow-hidden ${
                isMaintenance 
                  ? 'border-amber-200' 
                  : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              {/* Imagem e Botões Flutuantes */}
              <div className="relative h-48 w-full rounded-[1.8rem] overflow-hidden mb-6 bg-slate-50">
                {service.image ? (
                  <img src={service.image} alt={service.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-200">
                    <Briefcase size={48} strokeWidth={1} />
                  </div>
                )}
                
                {/* Overlay de Manutenção */}
                {isMaintenance && (
                  <div className="absolute inset-0 bg-amber-500/80 backdrop-blur-sm flex items-center justify-center p-4 text-center">
                    <div className="text-white">
                      <Wrench size={32} className="mx-auto mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest">Indisponível</p>
                    </div>
                  </div>
                )}

                {/* Badge de Favorito */}
                <button 
                  onClick={() => handleToggleFavorite(service.id)}
                  className={`absolute top-4 right-4 p-3 rounded-2xl backdrop-blur-md shadow-xl transition-all transform active:scale-75 ${
                    service.isFavorite 
                      ? 'bg-red-500 text-white shadow-red-200' 
                      : 'bg-white/90 text-slate-400 hover:text-red-500'
                  }`}
                >
                  <Heart size={16} className={service.isFavorite ? 'fill-white' : ''} />
                </button>
              </div>

              {/* Meta Info (Categoria e Ações) */}
              <div className="flex justify-between items-center mb-4 px-2">
                <span className={`flex items-center text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${
                  isMaintenance ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Tag size={12} className="mr-2" />
                  {service.category}
                </span>
                <div className="flex gap-1">
                  <button 
                    onClick={() => handleEdit(service)}
                    className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => setServices(prev => prev.filter(s => s.id !== service.id))}
                    className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Conteúdo Informativo */}
              <div className="px-2 mb-6 flex-1">
                <h3 className={`text-xl font-black mb-3 leading-tight ${
                  isMaintenance ? 'text-slate-400' : 'text-slate-900 group-hover:text-blue-600'
                }`}>
                  {service.name}
                </h3>
                
                {/* Descrição Agrupada */}
                <div className={`p-4 rounded-2xl border-l-4 ${
                  isMaintenance 
                    ? 'bg-slate-50 border-slate-200' 
                    : 'bg-blue-50/30 border-blue-400 group-hover:bg-white group-hover:shadow-inner transition-all'
                }`}>
                  <p className="text-sm leading-relaxed text-slate-600 font-medium line-clamp-3">
                    {service.description || 'Descrição detalhada não fornecida para este serviço profissional.'}
                  </p>
                </div>
              </div>

              {/* Grade de Preço e Unidade (2 Colunas) */}
              <div className="grid grid-cols-2 gap-4 mb-4 px-2">
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor Base</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs font-bold text-slate-500">R$</span>
                    <span className="text-xl font-black text-slate-900">{service.price.toFixed(2)}</span>
                  </div>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 flex flex-col justify-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Faturamento</span>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-100 text-blue-600 rounded-lg">
                      <Briefcase size={12} />
                    </div>
                    <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">Por {service.unit}</span>
                  </div>
                </div>
              </div>

              {/* Botão de Agendamento */}
              <div className="px-2">
                <button 
                  onClick={() => handleOpenSchedule(service)}
                  disabled={isMaintenance}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 ${
                    isMaintenance 
                      ? 'bg-slate-100 text-slate-300 cursor-not-allowed shadow-none' 
                      : 'bg-slate-900 text-white hover:bg-blue-600 shadow-slate-200 hover:shadow-blue-100'
                  }`}
                >
                  <CalendarDays size={18} />
                  <span>Agendar Agora</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredServices.length === 0 && (
          <div className="col-span-full py-20 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              {showOnlyFavorites ? <Heart size={32} /> : <Search size={32} />}
            </div>
            <p className="text-slate-500 font-bold">
              {showOnlyFavorites ? 'Nenhum serviço favorito encontrado.' : 'Nenhum serviço corresponde à sua busca.'}
            </p>
            {showOnlyFavorites && (
              <button 
                onClick={() => setShowOnlyFavorites(false)}
                className="mt-4 text-blue-600 font-bold hover:underline"
              >
                Ver catálogo completo
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal Cadastro/Edição de Serviço */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                  {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                </h2>
                <p className="text-sm text-slate-500">Cadastre suas informações profissionais.</p>
              </div>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Foto do Serviço</label>
                  {formData.image && (
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, image: undefined }))}
                      className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:bg-red-50 px-2 py-1 rounded-lg transition-all"
                    >
                      Remover
                    </button>
                  )}
                </div>
                
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full h-52 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden group relative ${
                    formData.image 
                      ? 'border-blue-500 ring-4 ring-blue-500/5' 
                      : 'bg-slate-50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'
                  }`}
                >
                  {formData.image ? (
                    <div className="relative w-full h-full">
                      <img src={formData.image} alt="Pré-visualização" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity backdrop-blur-sm">
                        <div className="bg-white text-slate-900 p-3 rounded-full shadow-xl mb-2">
                           <RotateCw size={24} />
                        </div>
                        <span className="text-xs font-black text-white uppercase tracking-widest">Trocar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm text-blue-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                        <Camera size={32} />
                      </div>
                      <p className="text-sm font-bold text-slate-700">Clique para enviar</p>
                      <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">JPG ou PNG</p>
                    </div>
                  )}
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 col-span-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Nome do Serviço</label>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, isFavorite: !prev.isFavorite }))}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black transition-all ${
                        formData.isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-slate-100 text-slate-400 hover:text-red-500'
                      }`}
                    >
                      <Heart size={12} className={formData.isFavorite ? 'fill-white' : ''} />
                      {formData.isFavorite ? 'FAVORITO' : 'FAVORITAR'}
                    </button>
                  </div>
                  <input 
                    type="text" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold"
                    placeholder="Ex: Reforma de Pintura..."
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Disponibilidade</label>
                  <div className="flex p-1 bg-slate-100 rounded-2xl h-[56px]">
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, status: 'ativo' }))}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
                        formData.status === 'ativo' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Ativo
                    </button>
                    <button 
                      onClick={() => setFormData(prev => ({ ...prev, status: 'manutenção' }))}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-xs font-bold transition-all ${
                        formData.status === 'manutenção' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500'
                      }`}
                    >
                      Pausa
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <div className="relative">
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none appearance-none font-bold pr-10"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((c, i) => <option key={i} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Descrição Profissional</label>
                  <button 
                    onClick={handleEnhance}
                    disabled={isEnhancing || !formData.name}
                    className="flex items-center space-x-1.5 text-[10px] text-blue-600 font-black hover:bg-blue-50 px-3 py-1 rounded-full transition-all disabled:opacity-30"
                  >
                    {isEnhancing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    <span>IA POWERED</span>
                  </button>
                </div>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 outline-none resize-none leading-relaxed font-medium"
                  placeholder="Explique o que o serviço inclui..."
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor Unitário</label>
                  <div className="relative">
                    <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">R$</span>
                    <input 
                      type="number" 
                      className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black"
                      value={formData.price}
                      onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Base de Cálculo</label>
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value as any }))}
                  >
                    <option value="unidade">Unidade</option>
                    <option value="hora">Hora</option>
                    <option value="m2">m²</option>
                    <option value="global">Fixo / Global</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="p-8 bg-slate-50 flex items-center justify-end space-x-4">
              <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-black uppercase text-xs tracking-widest">Voltar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-blue-600 transition-all active:scale-95">
                {editingId ? 'Atualizar' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Agendamento */}
      {isScheduleModalOpen && schedulingService && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Agendar</h2>
                <p className="text-sm text-slate-500">Reserve um horário na sua agenda.</p>
              </div>
              <button onClick={closeScheduleModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-[10px] font-black uppercase text-blue-400 tracking-widest block mb-1">Serviço</span>
                <p className="font-bold text-blue-900">{schedulingService.name}</p>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cliente</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold pr-12"
                    value={scheduleData.clientId}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, clientId: e.target.value }))}
                  >
                    <option value="">Selecione...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
                  <input 
                    type="date" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={scheduleData.date}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Hora</label>
                  <input 
                    type="time" 
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                    value={scheduleData.time}
                    onChange={(e) => setScheduleData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
            </div>
            <div className="p-8 bg-slate-50 flex flex-col gap-3">
              <button 
                onClick={handleSaveSchedule}
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2 active:scale-95"
              >
                <CheckCircle2 size={20} />
                <span>Confirmar Reserva</span>
              </button>
              <button 
                onClick={closeScheduleModal}
                className="w-full py-4 text-slate-500 font-bold hover:text-slate-800 transition-colors"
              >
                Desistir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Categorias */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Categorias</h2>
                <p className="text-sm text-slate-500">Organize seu catálogo.</p>
              </div>
              <button onClick={() => setIsCategoryModalOpen(false)} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all">
                <X size={24} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold"
                  placeholder="Nova..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                />
                <button 
                  onClick={handleAddCategory}
                  className="bg-blue-600 text-white p-3 rounded-2xl hover:bg-blue-700 transition-all"
                >
                  <Plus size={24} />
                </button>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-2xl group transition-all">
                    {editingCategoryIndex === idx ? (
                      <div className="flex-1 flex gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          className="flex-1 px-3 py-1 bg-white border border-blue-500 rounded-lg outline-none font-bold text-slate-800"
                          value={tempCategoryName}
                          onChange={(e) => setTempCategoryName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleUpdateCategory(idx)}
                        />
                        <button onClick={() => handleUpdateCategory(idx)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded-lg transition-all">
                          <Save size={18} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="font-bold text-slate-700">{cat}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => {
                              setEditingCategoryIndex(idx);
                              setTempCategoryName(cat);
                            }}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit size={16} />
                          </button>
                          {cat !== 'Geral' && (
                            <button 
                              onClick={() => handleRemoveCategory(cat)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-8 bg-slate-50">
              <button 
                onClick={() => setIsCategoryModalOpen(false)}
                className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl hover:bg-slate-800 transition-all active:scale-95"
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default ServicesView;
