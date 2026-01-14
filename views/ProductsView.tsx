
import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Package, 
  Tag, 
  Box, 
  ChevronDown, 
  Save, 
  AlertTriangle 
} from 'lucide-react';
import { Product } from '../types';

interface ProductsViewProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  categories: string[];
  setCategories: React.Dispatch<React.SetStateAction<string[]>>;
}

const ProductsView: React.FC<ProductsViewProps> = ({ products, setProducts, categories, setCategories }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    stock: 0,
    unit: 'unidade',
    category: 'Geral'
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: '', description: '', price: 0, stock: 0, unit: 'unidade', category: 'Geral' });
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return;
    
    if (editingId) {
      setProducts(prev => prev.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name || '',
        description: formData.description || '',
        price: Number(formData.price) || 0,
        stock: Number(formData.stock) || 0,
        unit: formData.unit || 'unidade',
        category: formData.category || 'Geral'
      };
      setProducts(prev => [...prev, newProduct]);
    }
    closeModal();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 text-indigo-900">Catálogo de Produtos</h1>
          <p className="text-slate-500">Gerencie peças, materiais e itens de venda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
        >
          <Plus size={18} />
          <span>Novo Produto</span>
        </button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Pesquisar produtos..." 
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map(product => {
          const isLowStock = product.stock < 3;
          
          return (
            <div 
              key={product.id} 
              className={`bg-white border-2 rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden ${
                isLowStock 
                  ? 'border-red-400 bg-red-50/30' 
                  : 'border-slate-200'
              }`}
            >
              {isLowStock && (
                <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm">
                  <AlertTriangle size={12} className="animate-pulse" />
                  Estoque Baixo
                </div>
              )}

              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                  isLowStock ? 'bg-red-100 text-red-700' : 'bg-indigo-50 text-indigo-600'
                }`}>
                  {product.category}
                </span>
                <div className="flex space-x-1">
                  <button 
                    onClick={() => handleEdit(product)} 
                    className={`p-2 rounded-xl transition-all ${
                      isLowStock 
                        ? 'text-red-400 hover:text-red-700 hover:bg-red-100' 
                        : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => setProducts(prev => prev.filter(p => p.id !== product.id))} 
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className={`text-lg font-black mb-2 transition-colors ${
                isLowStock ? 'text-red-900' : 'text-slate-800 group-hover:text-indigo-600'
              }`}>
                {product.name}
              </h3>
              <p className={`text-sm mb-6 line-clamp-2 ${isLowStock ? 'text-red-700/70' : 'text-slate-500'}`}>
                {product.description || 'Nenhuma descrição fornecida.'}
              </p>

              <div className={`flex items-center justify-between pt-4 border-t ${
                isLowStock ? 'border-red-200' : 'border-slate-100'
              }`}>
                <div>
                  <span className={`text-[10px] uppercase font-black block mb-0.5 ${
                    isLowStock ? 'text-red-400' : 'text-slate-400'
                  }`}>Estoque</span>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-black ${isLowStock ? 'text-red-600' : 'text-slate-800'}`}>
                      {product.stock}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${
                      isLowStock ? 'text-red-400' : 'text-slate-400'
                    }`}>{product.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] uppercase font-black block mb-0.5 ${
                    isLowStock ? 'text-red-400' : 'text-slate-400'
                  }`}>Preço Unitário</span>
                  <span className={`text-xl font-black ${
                    isLowStock ? 'text-red-700' : 'text-indigo-600'
                  }`}>
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        {filteredProducts.length === 0 && (
          <div className="col-span-full py-20 text-center text-slate-400 bg-white border-2 border-dashed border-slate-200 rounded-[3rem]">
            <Package size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-bold">Nenhum produto encontrado.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800">{editingId ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button onClick={closeModal} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} /></button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome do Produto</label>
                <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-bold" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Categoria</label>
                  <select className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 outline-none appearance-none font-medium" value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Unidade</label>
                  <input type="text" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" placeholder="ex: un, kg, m" value={formData.unit} onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Preço de Venda</label>
                  <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Quantidade em Estoque</label>
                  <input type="number" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: Number(e.target.value) }))} />
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 flex items-center justify-end space-x-4">
              <button onClick={closeModal} className="px-6 py-3 text-slate-500 font-black uppercase text-xs tracking-widest">Cancelar</button>
              <button onClick={handleSave} className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all">Salvar Produto</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsView;
