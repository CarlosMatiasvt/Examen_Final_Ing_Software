import { useState, useEffect } from 'react';
import { Plus, Info, Droplet, AlertCircle, ShoppingCart } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const Tanques = () => {
  const [tanques, setTanques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedTanque, setSelectedTanque] = useState(null);
  const [ingresoData, setIngresoData] = useState({ cantidad: '', factura: '' });

  const fetchTanques = async () => {
    try {
      const response = await axios.get('http://localhost:8000/tanques');
      setTanques(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching tanks", error);
    }
  };

  useEffect(() => {
    fetchTanques();
  }, []);

  const handleReabastecer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/tanques/reabastecer', {
        id_tanque: selectedTanque.id_tanque,
        cantidad_litros: parseFloat(ingresoData.cantidad),
        nro_factura_remision: ingresoData.factura
      });
      setShowModal(false);
      setIngresoData({ cantidad: '', factura: '' });
      fetchTanques();
    } catch (error) {
      alert("Error al procesar reabastecimiento");
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Infraestructura</h2>
          <p className="text-slate-500">Gestión de stock y monitoreo de tanques</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {tanques.map((tanque) => {
          const percent = (tanque.stock_actual / tanque.capacidad_maxima) * 100;
          const isLow = tanque.stock_actual < tanque.stock_minimo_seguridad;
          const colorClass = tanque.tipo_carburante === 'Gasolina' ? 'bg-red-500' : 'bg-blue-600';

          return (
            <motion.div 
              key={tanque.id_tanque}
              whileHover={{ y: -5 }}
              className="glass-card p-8 rounded-3xl relative overflow-hidden"
            >
              {/* Badge Stock Bajo */}
              {isLow && (
                <div className="absolute top-4 right-4 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 border border-amber-200 animate-bounce">
                  <AlertCircle size={14} />
                  STOCK CRÍTICO
                </div>
              )}

              <div className="flex items-start gap-6 mb-8">
                <div className={`p-5 rounded-2xl ${tanque.tipo_carburante === 'Gasolina' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                  <Droplet size={32} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xl font-bold text-slate-800">{tanque.identificador}</h3>
                    <span className="text-xs font-bold bg-slate-100 px-2 py-1 rounded uppercase tracking-wider text-slate-500">#{tanque.id_tanque}</span>
                  </div>
                  <p className="text-slate-500 font-medium">{tanque.tipo_carburante}</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-slate-400">Ocupación Atual</span>
                  <span className={isLow ? 'text-amber-600' : 'text-slate-700'}>
                    {tanque.stock_actual.toLocaleString()} / {tanque.capacidad_maxima.toLocaleString()} L
                  </span>
                </div>
                <div className="h-6 bg-slate-100 rounded-full overflow-hidden p-1 border border-slate-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full ${isLow ? 'bg-amber-500' : colorClass} shadow-inner`}
                  />
                </div>
                <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-tighter">
                  <Info size={12} />
                  Capacidad total: {tanque.capacidad_maxima} Litros | Mínimo seguridad: {tanque.stock_minimo_seguridad} L
                </div>
              </div>

              <button 
                onClick={() => { setSelectedTanque(tanque); setShowModal(true); }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl transition-all shadow-lg"
              >
                <Plus size={20} />
                Registrar Ingreso Cisterna
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Reabastecimiento */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
          >
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Ingreso de Cisterna</h3>
            <p className="text-slate-500 mb-6 font-medium">Tanque: {selectedTanque?.identificador} ({selectedTanque?.tipo_carburante})</p>
            
            <form onSubmit={handleReabastecer} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Cantidad de Litros</label>
                <input 
                  type="number" 
                  required
                  className="input-field" 
                  placeholder="Ej. 10000"
                  value={ingresoData.cantidad}
                  onChange={(e) => setIngresoData({...ingresoData, cantidad: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Número de Factura/Remisión</label>
                <input 
                  type="text" 
                  required
                  className="input-field" 
                  placeholder="Factura-XXXX"
                  value={ingresoData.factura}
                  onChange={(e) => setIngresoData({...ingresoData, factura: e.target.value})}
                />
              </div>
              <div className="flex gap-4 mt-8 pt-6 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2"
                >
                  Confirmar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Tanques;
