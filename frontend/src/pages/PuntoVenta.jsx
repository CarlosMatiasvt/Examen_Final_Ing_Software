import { useState, useEffect } from 'react';
import { 
  Scan, 
  Search, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  Fuel,
  ArrowBigRightDash,
  RotateCcw,
  Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PuntoVenta = () => {
  const [step, setStep] = useState(1);
  const [placa, setPlaca] = useState('');
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState(null);
  const [carburante, setCarburante] = useState('Gasolina');
  const [cantidad, setCantidad] = useState('');
  const [tanques, setTanques] = useState([]);
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    axios.get('http://localhost:8000/tanques').then(res => setTanques(res.data));
  }, []);

  const handleValidar = async (e) => {
    e.preventDefault();
    if (!placa) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/venta/validar/${placa}`);
      setValidation(res.data);
      if (res.data.habilitado) {
        setStep(2);
      }
    } catch (error) {
      alert("Error en validación");
    } finally {
      setLoading(false);
    }
  };

  const procesarVenta = async () => {
    const tanqueSeleccionado = tanques.find(t => t.tipo_carburante === carburante);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/venta/procesar', {
        id_cliente: validation.cliente.id_cliente,
        id_tanque: tanqueSeleccionado.id_tanque,
        cantidad_litros: parseFloat(cantidad)
      });
      setResultado(res.data);
      setStep(3);
    } catch (error) {
      alert(error.response?.data?.detail || "Error al procesar");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setPlaca('');
    setCantidad('');
    setValidation(null);
    setResultado(null);
  };

  const exceedsLimit = validation && parseFloat(cantidad) > validation.limite_permitido;

  return (
    <div className="max-w-3xl mx-auto h-[80vh] flex flex-col">
      {/* Header POS */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Terminal de Despacho</h2>
          <p className="text-slate-500 font-medium">Operador de Bomba: Estación Central</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${step === 1 ? 'bg-primary-600' : 'bg-slate-200'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 2 ? 'bg-primary-600' : 'bg-slate-200'}`} />
          <div className={`w-3 h-3 rounded-full ${step === 3 ? 'bg-primary-600' : 'bg-slate-200'}`} />
        </div>
      </div>

      <div className="flex-1 relative">
        <AnimatePresence mode="wait">
          
          {/* PASO 1: Identificación */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-12 rounded-[2rem] shadow-2xl h-full flex flex-col justify-center"
            >
              <div className="text-center mb-10">
                <div className="w-24 h-24 bg-primary-100 text-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Scan size={48} />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">Identificación del Vehículo</h3>
                <p className="text-slate-500">Ingrese la placa para validar el cupo semanal</p>
              </div>

              <form onSubmit={handleValidar} className="space-y-6">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="PLACA (ABC-123)"
                    className="w-full text-center text-4xl font-black p-8 rounded-3xl border-4 border-slate-100 focus:border-primary-500 uppercase tracking-widest outline-none bg-slate-50 shadow-inner"
                    value={placa}
                    onChange={(e) => setPlaca(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {['Gasolina', 'Diésel'].map(tipo => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setCarburante(tipo)}
                      className={`py-6 rounded-2xl font-bold text-lg transition-all ${
                        carburante === tipo 
                        ? 'bg-slate-900 text-white shadow-xl scale-[1.02]' 
                        : 'bg-white border-2 border-slate-100 text-slate-400'
                      }`}
                    >
                      {tipo}
                    </button>
                  ))}
                </div>
                <button 
                  type="submit"
                  disabled={!placa || loading}
                  className="w-full h-20 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-200 text-white rounded-3xl font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary-500/30"
                >
                  {loading ? 'Validando...' : 'Iniciar Validación'}
                  <ChevronRight size={32} />
                </button>
              </form>
            </motion.div>
          )}

          {/* PASO 2: Validación y Cantidad */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-10 rounded-[2rem] shadow-2xl h-full border-t-8 border-primary-500"
            >
              <div className="flex justify-between items-start mb-10 pb-8 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                    <span className="text-xs font-bold text-green-600 uppercase tracking-widest">Habilitado</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-800">{validation.cliente.nombre_completo}</h3>
                  <p className="text-slate-400 font-bold">Placa: <span className="text-primary-600 font-mono tracking-wider">{validation.cliente.placa_vehiculo}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase">Límite Permitido</p>
                  <div className="text-5xl font-black text-slate-900">{validation.limite_permitido} <span className="text-xl">Lts</span></div>
                </div>
              </div>

              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-lg font-bold text-slate-700">Cantidad a Despachar</label>
                    {exceedsLimit && (
                      <span className="text-red-500 font-bold text-sm flex items-center gap-1 animate-pulse">
                        <AlertCircle size={16} /> ¡EXCEDE EL LÍMITE!
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input 
                      type="number" 
                      className={`w-full text-center text-6xl font-black p-10 rounded-[2rem] border-4 outline-none transition-all ${
                        exceedsLimit ? 'border-red-500 bg-red-50 text-red-600' : 'border-primary-100 bg-primary-50 text-primary-700'
                      }`}
                      placeholder="0.00"
                      value={cantidad}
                      onChange={(e) => setCantidad(e.target.value)}
                    />
                    <span className="absolute right-8 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-300">Lts</span>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
                    <Info size={24} />
                  </div>
                  <p className="text-sm text-slate-500 leading-snug">
                    Promedio semanal histórico: <strong>{validation.promedio_semanal} Litros</strong>. 
                    El sistema ha calculado un límite de <strong>{validation.limite_permitido} Litros</strong> para esta semana.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={reset}
                    className="w-20 h-20 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-3xl flex items-center justify-center transition-all"
                  >
                    <RotateCcw size={32} />
                  </button>
                  <button 
                    onClick={procesarVenta}
                    disabled={!cantidad || exceedsLimit || loading}
                    className="flex-1 h-20 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-[2rem] font-black text-2xl flex items-center justify-center gap-4 transition-all shadow-xl shadow-primary-500/20"
                  >
                    {loading ? 'Procesando...' : 'Autorizar Despacho'}
                    <ArrowBigRightDash size={32} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* PASO 3: Éxito */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="glass-card p-12 rounded-[2rem] shadow-2xl h-full flex flex-col items-center justify-center text-center"
            >
              <div className="w-32 h-32 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-8 shadow-inner">
                <CheckCircle2 size={64} />
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-2">Venta Procesada</h3>
              <p className="text-slate-500 text-xl font-medium mb-12">Imprimiendo comprobante de transacción</p>
              
              <div className="w-full bg-slate-50 rounded-3xl p-8 border-2 border-dashed border-slate-200 mb-12 text-left space-y-4 font-mono font-bold text-slate-600">
                <div className="flex justify-between"><span>Transacción:</span> <span className="text-slate-900">#{resultado.nro_transaccion}</span></div>
                <div className="flex justify-between"><span>Fecha/Hora:</span> <span className="text-slate-900">{new Date(resultado.fecha).toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Cantidad:</span> <span className="text-slate-900">{cantidad} Litros</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-4 text-xl"><span>TOTAL:</span> <span className="text-primary-600">PROCESADO</span></div>
              </div>

              <div className="flex gap-4 w-full">
                <button 
                  onClick={reset}
                  className="flex-1 h-20 bg-slate-900 text-white rounded-3xl font-bold text-xl flex items-center justify-center gap-3"
                >
                  <RotateCcw size={24} /> Nueva Venta
                </button>
                <button className="h-20 w-20 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center">
                  <Printer size={32} />
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default PuntoVenta;
