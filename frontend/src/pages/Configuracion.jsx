import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Building2, Percent, Droplets, MapPin, Phone, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const Configuracion = () => {
  const [config, setConfig] = useState({
    nombre_estacion: '',
    nit: '',
    direccion: '',
    ciudad: '',
    contacto: '',
    factor_holgura: 10,
    cupo_base_inicial: 50
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('http://localhost:8000/config')
      .then(res => {
        setConfig(res.data);
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put('http://localhost:8000/config', config);
      alert("Configuración guardada correctamente");
    } catch (error) {
      alert("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Cargando...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Parámetros del Sistema</h2>
        <p className="text-slate-500">Configuración global y lógica de negocio</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección Datos Institucionales */}
        <div className="glass-card p-10 rounded-3xl">
          <h3 className="text-xl font-bold mb-8 flex items-center gap-3">
            <Building2 className="text-primary-600" />
            Información Institucional
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-2">Nombre de la Estación de Servicio</label>
              <input 
                type="text" 
                className="input-field" 
                value={config.nombre_estacion}
                onChange={e => setConfig({...config, nombre_estacion: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">NIT de la Empresa</label>
              <input 
                type="text" 
                className="input-field" 
                value={config.nit}
                onChange={e => setConfig({...config, nit: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-600 mb-2">Ciudad</label>
              <select 
                className="input-field"
                value={config.ciudad}
                onChange={e => setConfig({...config, ciudad: e.target.value})}
              >
                <option value="La Paz">La Paz</option>
                <option value="Cochabamba">Cochabamba</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Oruro">Oruro</option>
                <option value="Potosí">Potosí</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-600 mb-2">Dirección Fiscal</label>
              <input 
                type="text" 
                className="input-field" 
                value={config.direccion}
                onChange={e => setConfig({...config, direccion: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Sección Reglas de Algoritmo */}
        <div className="glass-card p-10 rounded-3xl border-2 border-primary-100 bg-primary-50/20">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <Percent className="text-primary-600" />
            Algoritmo de Cupos Dinámicos
          </h3>
          <div className="bg-white/60 p-4 rounded-xl mb-8 border border-primary-50 text-xs text-primary-700 flex gap-3 items-start">
            <Info size={20} className="shrink-0" />
            <p className="italic">
              El <strong>Factor de Holgura</strong> define el porcentaje de tolerancia adicional permitido sobre el promedio de consumo histórico (28 días). 
              El <strong>Cupo Base</strong> es el valor inicial asignado a vehículos sin historial o nuevos registros.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Factor de Holgura (%)</span>
                <span className="text-2xl font-black text-primary-600">{config.factor_holgura}%</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="50" 
                step="1"
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                value={config.factor_holgura}
                onChange={e => setConfig({...config, factor_holgura: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700">Cupo Base Inicial (Litros)</label>
              <div className="relative">
                <input 
                  type="number" 
                  className="input-field pr-16" 
                  value={config.cupo_base_inicial}
                  onChange={e => setConfig({...config, cupo_base_inicial: parseInt(e.target.value)})}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Lts</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full btn-primary h-16 text-lg flex items-center justify-center gap-4 bg-primary-700 shadow-xl shadow-primary-500/20"
        >
          <Save size={24} />
          {saving ? 'Guardando cambios...' : 'Actualizar Configuración Maestro'}
        </button>
      </form>
    </motion.div>
  );
};

export default Configuracion;
