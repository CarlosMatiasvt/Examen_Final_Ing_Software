import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Calendar,
  Fuel,
  Droplets
} from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    stockTotal: 0,
    ventasHoy: 0,
    alertas: 0,
    config: null
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [configRes, tanquesRes] = await Promise.all([
          axios.get('http://localhost:8000/config'),
          axios.get('http://localhost:8000/tanques')
        ]);
        
        const total = tanquesRes.data.reduce((acc, t) => acc + t.stock_actual, 0);
        const alerts = tanquesRes.data.filter(t => t.stock_actual < t.stock_minimo_security).length;
        
        setStats({
          stockTotal: total,
          ventasHoy: 450, // Mock data for demo
          alertas: alerts,
          config: configRes.data
        });
      } catch (error) {
        console.error("Error loading dashboard data", error);
      }
    };
    
    fetchDashboardData();
  }, []);

  const cards = [
    { label: 'Stock Total', value: `${stats.stockTotal.toLocaleString()} L`, icon: Droplets, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Ventas de Hoy', value: `${stats.ventasHoy} L`, icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
    { label: 'Alertas Stock', value: stats.alertas, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Estación', value: stats.config?.nombre_estacion || 'SGIC', icon: Activity, color: 'text-primary-500', bg: 'bg-primary-50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Panel de Control</h2>
          <p className="text-slate-500">Resumen operativo de la estación de servicio</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
          <Calendar size={18} className="text-primary-600" />
          <span className="font-semibold text-slate-700">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} rounded-xl flex items-center justify-center ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-slate-800">{card.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="text-primary-600" />
            Flujo de Operación
          </h3>
          <div className="space-y-4">
            <p className="text-slate-600 text-sm leading-relaxed">
              El sistema está monitoreando activamente los tanques de Gasolina y Diésel. 
              El algoritmo de cupos dinámicos está configurado con un 
              <strong> holgura del {stats.config?.factor_holgura}%</strong> sobre el promedio de 28 días.
            </p>
            <div className="h-48 bg-slate-100/50 rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200">
              <span className="text-slate-400 font-medium italic">Gráfico de Consumo (Simulación)</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-2xl">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Fuel className="text-primary-600" />
            Parámetros de Control
          </h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center p-4 bg-primary-50/50 rounded-xl">
              <span className="text-slate-700 font-medium">Cupo Base (Nuevos)</span>
              <span className="font-bold text-primary-700">{stats.config?.cupo_base_inicial} Litros</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-slate-50 rounded-xl">
              <span className="text-slate-700 font-medium">NIT Emisor</span>
              <span className="font-bold text-slate-700">{stats.config?.nit}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
