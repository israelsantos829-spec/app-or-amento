
import React, { useState } from 'react';
import { Plus, Search, User, Phone, Mail, MapPin, X, Trash2 } from 'lucide-react';
import { Client } from '../types';

interface ClientsViewProps {
  clients: Client[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
}

const ClientsView: React.FC<ClientsViewProps> = ({ clients, setClients }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Client>>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const handleSave = () => {
    if (!formData.name) return;
    
    const newClient: Client = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
    };

    setClients(prev => [...prev, newClient]);
    setIsModalOpen(false);
    setFormData({ name: '', email: '', phone: '', address: '' });
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Seus Clientes</h1>
          <p className="text-slate-500">Gerencie sua lista de contatos para orçamentos rápidos.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Novo Cliente</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Buscar cliente por nome ou email..." 
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="px-6 py-4 font-semibold">Cliente</th>
              <th className="px-6 py-4 font-semibold">Contato</th>
              <th className="px-6 py-4 font-semibold">Endereço</th>
              <th className="px-6 py-4 font-semibold text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredClients.map(client => (
              <tr key={client.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{client.name}</p>
                      <p className="text-xs text-slate-500">ID: {client.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 space-y-1">
                  <div className="flex items-center text-sm text-slate-600">
                    <Mail size={14} className="mr-2 text-slate-400" />
                    {client.email || 'N/A'}
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <Phone size={14} className="mr-2 text-slate-400" />
                    {client.phone || 'N/A'}
                  </div>
                </td>
                <td className="px-6 py-4 max-w-xs">
                  <div className="flex items-start text-sm text-slate-600">
                    <MapPin size={14} className="mr-2 mt-0.5 text-slate-400 shrink-0" />
                    <span className="truncate">{client.address || 'N/A'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => setClients(prev => prev.filter(c => c.id !== client.id))}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredClients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 bg-slate-50">
                  Nenhum cliente cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800">Cadastrar Novo Cliente</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Nome Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Nome do cliente"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">E-mail</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="email@exemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Telefone/WhatsApp</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Endereço Principal</label>
                <textarea 
                  rows={2}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Rua, número, bairro, cidade..."
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
            </div>
            <div className="p-6 bg-slate-50 flex items-center justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 font-semibold hover:text-slate-800"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                Salvar Cliente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsView;
