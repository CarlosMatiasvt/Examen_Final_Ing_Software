import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tanques from './pages/Tanques';
import Clientes from './pages/Clientes';
import Configuracion from './pages/Configuracion';
import PuntoVenta from './pages/PuntoVenta';

function App() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-8 ml-64 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tanques" element={<Tanques />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/configuracion" element={<Configuracion />} />
          <Route path="/pos" element={<PuntoVenta />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
