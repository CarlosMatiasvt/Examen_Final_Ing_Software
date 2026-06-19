import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Fuel, 
  Users, 
  Settings, 
  CreditCard,
  Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Droplets, label: 'Tanques', path: '/tanques' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: CreditCard, label: 'Punto de Venta', path: '/pos' },
    { icon: Settings, label: 'Configuración', path: '/configuracion' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-64 glass-card border-r border-slate-200 z-50 p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
          <Fuel size={24} />
        </div>
        <div>
          <h1 className="font-bold text-xl tracking-tight">SGIC</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Fuel Management</p>
        </div>
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' 
                : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
            {item.path === '/pos' && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-auto w-2 h-2 bg-white rounded-full"
              />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-primary-50 rounded-2xl border border-primary-100">
        <p className="text-xs font-semibold text-primary-700 mb-1">Estado del Sistema</p>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-[11px] text-primary-600 font-medium">Online - Local DB</span>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
