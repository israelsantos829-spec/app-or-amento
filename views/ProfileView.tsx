
import React, { useState, useRef } from 'react';
import { 
  Building2, 
  Upload, 
  Save, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  FileCheck,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { CompanyProfile } from '../types';

interface ProfileViewProps {
  profile: CompanyProfile;
  setProfile: React.Dispatch<React.SetStateAction<CompanyProfile>>;
}

const ProfileView: React.FC<ProfileViewProps> = ({ profile, setProfile }) => {
  const [formData, setFormData] = useState<CompanyProfile>(profile);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setSaveStatus('saving');
    // Simulando um delay de salvamento para UX
    setTimeout(() => {
      setProfile(formData);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Perfil da Empresa</h1>
          <p className="text-slate-500">Configure sua identidade visual e dados que aparecerão nos orçamentos.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
          className={`px-6 py-2.5 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all shadow-lg active:scale-95 ${
            saveStatus === 'saved' 
              ? 'bg-emerald-500 text-white shadow-emerald-200' 
              : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
          }`}
        >
          {saveStatus === 'saving' ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Salvando...
            </span>
          ) : saveStatus === 'saved' ? (
            <>
              <CheckCircle2 size={18} />
              <span>Dados Salvos!</span>
            </>
          ) : (
            <>
              <Save size={18} />
              <span>Salvar Alterações</span>
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Branding / Logo Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Logomarca</h3>
            
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center transition-all group-hover:border-blue-400 group-hover:bg-blue-50/30">
                {formData.logo ? (
                  <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain p-4" />
                ) : (
                  <div className="flex flex-col items-center text-slate-400 group-hover:text-blue-500">
                    <Camera size={32} className="mb-2" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Enviar Logo</span>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-all rounded-[2.5rem] flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Upload className="text-blue-600" size={24} />
              </div>
            </div>

            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoUpload} 
            />

            <p className="mt-6 text-xs text-slate-400 leading-relaxed">
              Formatos aceitos: PNG, JPG ou SVG.<br/>Recomendado: Fundo transparente.
            </p>
            
            {formData.logo && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setFormData(prev => ({ ...prev, logo: '' }));
                }}
                className="mt-4 text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest transition-colors"
              >
                Remover Logo
              </button>
            )}
          </div>

          <div className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-100 text-white space-y-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Building2 size={24} />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Dica de Marca</h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Um perfil completo e com logomarca aumenta em até <span className="font-bold text-white">45%</span> a taxa de aprovação dos orçamentos, pois transmite mais confiança ao cliente.
            </p>
          </div>
        </div>

        {/* Info Card */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <FileCheck className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800">Informações Básicas</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome Fantasia / Negócio</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Responsável</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CNPJ ou CPF</label>
                  <div className="relative">
                    <FileCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="document"
                      value={formData.document}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Site / Portfólio</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="website"
                      placeholder="www.seu site.com.br"
                      value={formData.website || ''}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <Phone className="text-blue-600" size={20} />
                <h3 className="font-bold text-slate-800">Contato & Localização</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail Comercial</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Endereço Comercial</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 text-slate-400" size={18} />
                  <textarea 
                    name="address"
                    rows={3}
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-bold text-slate-700 resize-none leading-relaxed"
                    placeholder="Endereço completo da sua sede ou base de operações..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
