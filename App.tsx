
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  FileText, 
  Plus, 
  Search, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Building2,
  Package,
  Receipt as ReceiptIcon,
  Gavel
} from 'lucide-react';
import { Service, Product, Client, Quote, Receipt, ViewType, Appointment, CompanyProfile, Commitment } from './types';
import DashboardView from './views/DashboardView';
import ServicesView from './views/ServicesView';
import ProductsView from './views/ProductsView';
import ClientsView from './views/ClientsView';
import QuotesView from './views/QuotesView';
import ReceiptsView from './views/ReceiptsView';
import ProfileView from './views/ProfileView';
import EmpenhosView from './views/EmpenhosView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [categories, setCategories] = useState<string[]>(['Manutenção', 'Elétrica', 'Limpeza', 'Hidráulica', 'Geral']);
  const [productCategories, setProductCategories] = useState<string[]>(['Material', 'Peças', 'Equipamentos', 'Geral']);
  
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile>({
    name: 'Seu Negócio',
    ownerName: '',
    document: '',
    email: '',
    phone: '',
    address: '',
    logo: ''
  });

  const [services, setServices] = useState<Service[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [commitments, setCommitments] = useState<Commitment[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const savedServices = localStorage.getItem('sp_services');
    const savedProducts = localStorage.getItem('sp_products');
    const savedClients = localStorage.getItem('sp_clients');
    const savedQuotes = localStorage.getItem('sp_quotes');
    const savedReceipts = localStorage.getItem('sp_receipts');
    const savedCommitments = localStorage.getItem('sp_commitments');
    const savedProfile = localStorage.getItem('sp_profile');
    const savedCategories = localStorage.getItem('sp_categories');
    const savedProdCategories = localStorage.getItem('sp_prod_categories');

    if (savedServices) setServices(JSON.parse(savedServices));
    if (savedProducts) setProducts(JSON.parse(savedProducts));
    if (savedClients) setClients(JSON.parse(savedClients));
    if (savedQuotes) setQuotes(JSON.parse(savedQuotes));
    if (savedReceipts) setReceipts(JSON.parse(savedReceipts));
    if (savedCommitments) setCommitments(JSON.parse(savedCommitments));
    if (savedProfile) setCompanyProfile(JSON.parse(savedProfile));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
    if (savedProdCategories) setProductCategories(JSON.parse(savedProdCategories));
    
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('sp_services', JSON.stringify(services));
      localStorage.setItem('sp_products', JSON.stringify(products));
      localStorage.setItem('sp_clients', JSON.stringify(clients));
      localStorage.setItem('sp_quotes', JSON.stringify(quotes));
      localStorage.setItem('sp_receipts', JSON.stringify(receipts));
      localStorage.setItem('sp_commitments', JSON.stringify(commitments));
      localStorage.setItem('sp_profile', JSON.stringify(companyProfile));
      localStorage.setItem('sp_categories', JSON.stringify(categories));
      localStorage.setItem('sp_prod_categories', JSON.stringify(productCategories));
    }
  }, [services, products, clients, quotes, receipts, commitments, companyProfile, categories, productCategories, isLoaded]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const NavItem = ({ view, icon: Icon, label }: { view: ViewType, icon: any, label: string }) => (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full p-3 space-x-3 rounded-xl transition-all duration-200 ${
        currentView === view 
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
          : 'text-slate-500 hover:bg-slate-100 hover:text-blue-600'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {!isSidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(true)} />
      )}

      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transition-transform duration-300 lg:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Briefcase size={22} />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">orçamento g3</span>
            </div>
            <button onClick={toggleSidebar} className="lg:hidden text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-2 mt-4">
            <NavItem view="dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem view="services" icon={Briefcase} label="Serviços" />
            <NavItem view="products" icon={Package} label="Produtos" />
            <NavItem view="clients" icon={Users} label="Clientes" />
            <NavItem view="quotes" icon={FileText} label="Orçamentos" />
            <NavItem view="empenhos" icon={Gavel} label="Empenhos" />
            <NavItem view="receipts" icon={ReceiptIcon} label="Recibos" />
            <div className="pt-4 mt-4 border-t border-slate-100">
              <NavItem view="profile" icon={Building2} label="Meu Perfil" />
            </div>
          </nav>

          <div className="p-4 border-t border-slate-100">
            <button 
              onClick={() => setCurrentView('profile')}
              className="flex items-center w-full p-3 space-x-3 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Settings size={20} />
              <span className="font-medium">Ajustes</span>
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-10 no-print">
          <button onClick={toggleSidebar} className="lg:hidden text-slate-500 p-2 hover:bg-slate-100 rounded-md">
            <Menu size={24} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center space-x-4">
            <div 
              onClick={() => setCurrentView('profile')}
              className="h-8 w-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center text-blue-700 font-bold border border-blue-200 cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
            >
              {companyProfile.logo ? <img src={companyProfile.logo} className="w-full h-full object-cover" /> : companyProfile.name.substring(0, 2).toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 lg:p-8">
          {currentView === 'dashboard' && <DashboardView services={services} products={products} clients={clients} quotes={quotes} receipts={receipts} onNavigate={setCurrentView} profile={companyProfile} />}
          {currentView === 'services' && <ServicesView services={services} setServices={setServices} categories={categories} setCategories={setCategories} clients={clients} appointments={appointments} setAppointments={setAppointments} />}
          {currentView === 'products' && <ProductsView products={products} setProducts={setProducts} categories={productCategories} setCategories={setProductCategories} />}
          {currentView === 'clients' && <ClientsView clients={clients} setClients={setClients} />}
          {currentView === 'quotes' && <QuotesView quotes={quotes} setQuotes={setQuotes} services={services} products={products} clients={clients} companyProfile={companyProfile} onNavigate={setCurrentView} />}
          {currentView === 'empenhos' && <EmpenhosView commitments={commitments} setCommitments={setCommitments} companyProfile={companyProfile} />}
          {currentView === 'receipts' && <ReceiptsView receipts={receipts} setReceipts={setReceipts} clients={clients} quotes={quotes} companyProfile={companyProfile} />}
          {currentView === 'profile' && <ProfileView profile={companyProfile} setProfile={setCompanyProfile} />}
        </div>
      </main>
    </div>
  );
};

export default App;
