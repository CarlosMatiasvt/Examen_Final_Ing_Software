import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, ShieldCheck, ShieldAlert, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Clientes = () => {
  const [clientes, setClientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClientes = async () => {
    try {
      const response = await axios.get('http://localhost:8000/clientes');
      setClientes(response.data);
    } catch (error) {
      console.error("Error loading clients", error);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const toggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Activo' ? 'Suspendido' : 'Activo';
    try {
      await axios.put(`http://localhost:8000/clientes/${id}/estado`, { estado: nextStatus });
      fetchClientes();
    } catch (error) {
      alert("Error al actualizar estado");
    }
  };

  const filteredClientes = clientes.filter(c => 
    c.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.placa_vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.ci_nit.includes(searchTerm)
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Padrón de Clientes</h2>
        <p className="text-slate-500">Gestión de usuarios y control de estado</p>
      </div>

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por placa, nombre o documento..." 
            className="input-field pl-12 h-14"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="flex items-center gap-2 px-6 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
          <UserPlus size={20} />
          Nuevo Registro Manual
        </button>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Cliente / Documento</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Vehículo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tipo</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Estado</th>
                <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filteredClientes.map((cliente) => (
                  <motion.tr 
                    layout
                    key={cliente.id_cliente}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-8 py-6">
                      <div className="font-bold text-slate-800">{cliente.nombre_completo}</div>
                      <div className="text-sm text-slate-400 font-medium">{cliente.ci_nit}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-primary-600 shadow-sm">
                        {cliente.placa_vehiculo}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm font-semibold text-slate-500 uppercase tracking-tight">{cliente.tipo_cliente}</span>
                    </td>
                    <td className="px-8 py-6">
                      <div className={`flex items-center gap-2 text-sm font-bold ${
                        cliente.estado === 'Activo' ? 'text-green-600' : 'text-red-500'
                      }`}>
                        {cliente.estado === 'Activo' ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                        {cliente.estado}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex justify-center gap-3">
                        <button 
                          title="Historial de Ventas"
                          className="p-3 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                        >
                          <History size={18} />
                        </button>
                        <button 
                          onClick={() => toggleStatus(cliente.id_cliente, cliente.estado)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            cliente.estado === 'Activo' 
                            ? 'bg-amber-50 text-amber-600 hover:bg-amber-100' 
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                          }`}
                        >
                          {cliente.estado === 'Activo' ? 'Suspender' : 'Habilitar'}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;
