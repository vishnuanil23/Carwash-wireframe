/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Car, 
  ClipboardList, 
  Settings, 
  LogOut, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  BarChart3, 
  User, 
  Lock, 
  ShieldCheck, 
  QrCode,
  Search,
  Timer,
  ChevronRight,
  TrendingUp,
  LayoutDashboard,
  CalendarDays
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// --- Types ---
type AppRole = 'technician' | 'front_office' | 'manager';

interface Order {
  id: string;
  plate: string;
  model: string;
  service: string;
  status: 'queued' | 'in_progress' | 'payment_pending' | 'completed';
  timeWaiting: string;
  stage: number;
}

// --- Mock Data ---
const INITIAL_ORDERS: Order[] = [
  { id: '1', plate: 'A 12345', model: 'BMW 3 Series', service: 'Full Body Wash', status: 'queued', timeWaiting: '12m', stage: 0 },
  { id: '2', plate: 'K 77889', model: 'Mercedes C200', service: 'Deep Interior Clean', status: 'queued', timeWaiting: '25m', stage: 0 },
  { id: '3', plate: 'D 44221', model: 'Tesla Model 3', service: 'Wax & Polish', status: 'queued', timeWaiting: '5m', stage: 0 },
];

export default function App() {
  const [role, setRole] = useState<AppRole | null>(null);
  const [activeScreen, setActiveScreen] = useState('queue');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const activeJob = useMemo(() => orders.find(o => o.id === activeJobId), [orders, activeJobId]);

  if (!role) {
    return <LoginScreen onLogin={setRole} />;
  }

  const handleClaim = (id: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: 'in_progress', stage: 1 } : o));
    setActiveJobId(id);
    setActiveScreen('active-job');
  };

  const handleAddOrder = (newOrder: Omit<Order, 'id' | 'status' | 'timeWaiting' | 'stage'>) => {
    const order: Order = {
      ...newOrder,
      id: Math.random().toString(36).substr(2, 9),
      status: 'queued',
      timeWaiting: '0m',
      stage: 0
    };
    setOrders(prev => [order, ...prev]);
    setActiveScreen('queue');
  };

  const handleNextStage = () => {
    if (!activeJobId) return;
    setOrders(prev => prev.map(o => {
      if (o.id === activeJobId) {
        const nextStage = o.stage + 1;
        if (nextStage > 4) {
          return { ...o, status: 'payment_pending', stage: 4 };
        }
        return { ...o, stage: nextStage };
      }
      return o;
    }));
  };

  return (
    <div className="mobile-container">
      {/* Top Bar */}
      <header className="bg-white p-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-safety rounded-lg flex items-center justify-center font-bold text-white text-xs">
            CW
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900">BMW Dubai Marina</h1>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-success rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Online</span>
            </div>
          </div>
        </div>
        <button onClick={() => setRole(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors font-bold text-slate-400">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative bg-slate-50">
        <AnimatePresence mode="wait">
          {activeScreen === 'queue' && (
            <QueueScreen 
              key="queue" 
              orders={orders.filter(o => o.status === 'queued' || o.status === 'payment_pending')} 
              role={role} 
              onClaim={handleClaim} 
            />
          )}
          {activeScreen === 'active-job' && (
            <ActiveJobScreen 
              key="active-job" 
              order={activeJob} 
              onNext={handleNextStage} 
              onBack={() => setActiveScreen('queue')} 
            />
          )}
          {activeScreen === 'new-order' && (
            <NewOrderScreen key="new-order" onAdd={handleAddOrder} />
          )}
          {activeScreen === 'dashboard' && <DashboardScreen key="dashboard" />}
          {activeScreen === 'card' && <EmployeeCardScreen key="card" />}
          {activeScreen === 'day-close' && <DayCloseScreen key="day-close" />}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      <nav className="bg-white border-t border-slate-100 p-2 flex justify-around items-center shrink-0">
        {role === 'technician' && (
          <>
            <NavButton 
              active={activeScreen === 'queue'} 
              onClick={() => setActiveScreen('queue')} 
              icon={<ClipboardList size={20} />} 
              label="Queue" 
            />
            <NavButton 
              active={activeScreen === 'active-job'} 
              onClick={() => setActiveScreen('active-job')} 
              icon={<Car size={20} />} 
              label="Process" 
            />
            <NavButton 
              active={activeScreen === 'card'} 
              onClick={() => setActiveScreen('card')} 
              icon={<QrCode size={20} />} 
              label="My ID" 
            />
          </>
        )}
        {role === 'front_office' && (
          <>
            <NavButton 
              active={activeScreen === 'queue'} 
              onClick={() => setActiveScreen('queue')} 
              icon={<ClipboardList size={20} />} 
              label="Queue" 
            />
            <NavButton 
              active={activeScreen === 'new-order'} 
              onClick={() => setActiveScreen('new-order')} 
              icon={<Car size={20} className="text-orange-safety" />} 
              label="New" 
            />
            <NavButton 
              active={activeScreen === 'card'} 
              onClick={() => setActiveScreen('card')} 
              icon={<QrCode size={20} />} 
              label="ID" 
            />
          </>
        )}
        {role === 'manager' && (
          <>
            <NavButton 
              active={activeScreen === 'dashboard'} 
              onClick={() => setActiveScreen('dashboard')} 
              icon={<LayoutDashboard size={20} />} 
              label="Stats" 
            />
            <NavButton 
              active={activeScreen === 'queue'} 
              onClick={() => setActiveScreen('queue')} 
              icon={<ClipboardList size={20} />} 
              label="Orders" 
            />
            <NavButton 
              active={activeScreen === 'day-close'} 
              onClick={() => setActiveScreen('day-close')} 
              icon={<Lock size={20} />} 
              label="Close" 
            />
          </>
        )}
      </nav>
    </div>
  );
}

// --- Internal Components ---

function NavButton({ active, icon, label, onClick }: { active: boolean, icon: React.ReactNode, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all px-4 py-1 rounded-xl ${active ? 'text-orange-safety' : 'text-slate-400 hover:text-slate-600'}`}
    >
      <div className={`${active ? 'scale-110' : 'scale-100'} transition-transform`}>{icon}</div>
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

function LoginScreen({ onLogin }: { onLogin: (role: AppRole) => void }) {
  return (
    <div className="mobile-container justify-center items-center p-8 bg-slate-50">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full space-y-12"
      >
        <div className="text-center">
          <div className="w-20 h-20 bg-orange-safety rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-orange-safety/20">
            <Car size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 text-slate-900">CarWash Pro</h2>
          <p className="text-slate-400 text-sm font-medium">Operations Center Login</p>
        </div>

        <div className="space-y-4">
          <RoleButton icon={<ShieldCheck size={20} />} label="Technician Portal" color="bg-white" onClick={() => onLogin('technician')} />
          <RoleButton icon={<LayoutDashboard size={20} />} label="Manager Dashboard" color="bg-white" onClick={() => onLogin('manager')} />
          <RoleButton icon={<Search size={20} />} label="Front Office" color="bg-white" onClick={() => onLogin('front_office')} />
        </div>

        <div className="text-center">
          <p className="text-[10px] text-slate-300 tracking-widest uppercase font-bold">Encrypted by CarWash Tech • v1.4.2</p>
        </div>
      </motion.div>
    </div>
  );
}

function RoleButton({ icon, label, color, onClick }: { icon: React.ReactNode, label: string, color: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full ${color} hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl flex items-center gap-4 transition-all group shadow-sm`}
    >
      <div className="w-10 h-10 rounded-xl bg-orange-safety/10 flex items-center justify-center text-orange-safety group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="font-bold tracking-tight text-slate-700">{label}</span>
      <ChevronRight size={18} className="ml-auto text-slate-300" />
    </button>
  );
}

function QueueScreen({ orders, role, onClaim }: { orders: Order[], role: AppRole, onClaim: (id: string) => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="p-4 space-y-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Order Queue</h3>
          <p className="text-xs text-slate-400 font-medium">{orders.length} active batches found</p>
        </div>
        <button className="p-2 bg-slate-100 rounded-xl text-slate-400">
          <Search size={18} />
        </button>
      </div>

      <div className="space-y-3">
        {orders.map((order) => (
          <motion.div 
            layout
            key={order.id}
            className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between group hover:border-slate-200 transition-colors shadow-sm"
          >
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <Car size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg leading-tight uppercase tracking-tight text-slate-900">{order.plate}</h4>
                <p className="text-xs text-slate-400 font-medium mb-1">{order.model}</p>
                <div className="flex items-center gap-1">
                  <Timer size={12} className="text-orange-safety" />
                  <span className="text-[10px] text-orange-safety font-bold uppercase">{order.timeWaiting} WAITING</span>
                </div>
              </div>
            </div>
            
            {role === 'technician' && !order.status.includes('payment') && (
              <button 
                onClick={() => onClaim(order.id)}
                className="bg-orange-safety hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-orange-safety/20"
              >
                Claim
              </button>
            )}

            {order.status === 'payment_pending' && (
              <div className="bg-green-50 text-green-success px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-green-success/20">
                Awaiting Pay
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ActiveJobScreen({ order, onNext, onBack }: { order?: Order, onNext: () => void, onBack: () => void }) {
  if (!order) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center gap-4 bg-slate-50">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
          <Car size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Active Job</h3>
        <p className="text-sm text-slate-400 leading-relaxed">Return to the queue and claim a vehicle to start the wash pipeline.</p>
        <button 
          onClick={onBack}
          className="mt-4 bg-white border border-slate-200 hover:bg-slate-50 px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors shadow-sm"
        >
          Return to Queue
        </button>
      </div>
    );
  }

  const stages = [
    { id: 1, name: 'Pre-Wash Inspection', desc: 'Scan for body panels and damage logs' },
    { id: 2, name: 'Exterior Shampoo', desc: 'Apply high-pressure foam treatment' },
    { id: 3, name: 'Bespoke Detailing', desc: 'Intensive interior and tire dressing' },
    { id: 4, name: 'Final Quality Check', desc: 'Manager verification and sign-off' },
  ];

  return (
    <motion.div 
      initial={{ x: 20, opacity: 0 }} 
      animate={{ x: 0, opacity: 1 }} 
      exit={{ x: -20, opacity: 0 }}
      className="flex flex-col h-full bg-slate-50"
    >
      <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg uppercase tracking-tight text-slate-900">{order.plate}</h3>
          <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{order.service}</p>
        </div>
        <div className="px-3 py-1 bg-orange-safety/10 text-orange-safety rounded-full text-[10px] font-black tracking-widest border border-orange-safety/20">
          STAGE {order.stage}/4
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {stages.map((stage) => (
          <div key={stage.id} className="flex gap-4 relative">
            {stage.id < 4 && (
              <div className={`absolute left-5 top-10 bottom-0 w-0.5 ${order.stage > stage.id ? 'bg-green-success' : 'bg-slate-200'}`} />
            )}
            <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10 ${
              order.stage > stage.id ? 'bg-green-success border-green-success text-white' :
              order.stage === stage.id ? 'bg-white border-orange-safety text-orange-safety' :
              'bg-white border-slate-200 text-slate-200'
            }`}>
              {order.stage > stage.id ? <CheckCircle2 size={18} /> : <span className="font-black italic">{stage.id}</span>}
            </div>
            <div className={`flex-1 py-1 transition-opacity ${order.stage < stage.id ? 'opacity-30' : 'opacity-100'}`}>
              <h4 className="font-bold leading-none mb-1 text-sm text-slate-800">{stage.name}</h4>
              <p className="text-[10px] text-slate-400 leading-tight font-medium uppercase tracking-tight">{stage.desc}</p>
              
              {order.stage === stage.id && (
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 space-y-3">
                  <div className="bg-white rounded-xl border border-dashed border-slate-200 p-4 flex flex-col items-center gap-3">
                    <Camera size={24} className="text-slate-300" />
                    <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">Mandatory Photo Proof Required</span>
                  </div>
                  <button 
                    onClick={onNext}
                    className="w-full bg-orange-safety text-white p-3 rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-orange-safety/20 flex items-center justify-center gap-2"
                  >
                    Complete {stage.name} <ChevronRight size={16} />
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-100 flex gap-3 bg-white/80 backdrop-blur-md">
        <button className="flex-1 flex items-center justify-center gap-2 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500">
          <AlertTriangle size={14} className="text-red-400" /> Report Issue
        </button>
        <button className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-400">
          <Settings size={18} />
        </button>
      </div>
    </motion.div>
  );
}

function DashboardScreen() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-slate-900">Live Analytics</h3>
          <p className="text-xs text-slate-400 font-medium">Real-time facility throughput</p>
        </div>
        <div className="w-10 h-10 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 shadow-sm">
          <CalendarDays size={20} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <KpiCard label="Total Revenue" value="AED 4,821" icon={<TrendingUp size={16} />} color="text-green-success" trend="+12%" />
        <KpiCard label="Active Orders" value="14" icon={<Car size={16} />} color="text-blue-500" trend="Live" />
        <KpiCard label="Avg Wash Time" value="22m" icon={<Timer size={16} />} color="text-orange-safety" trend="-2m" />
        <KpiCard label="Efficiency" value="94.2%" icon={<ShieldCheck size={16} />} color="text-purple-500" trend="+0.5%" />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold tracking-tight uppercase text-slate-700">Wash Distribution</h4>
          <BarChart3 size={16} className="text-slate-200" />
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
          <div className="bg-orange-safety h-full" style={{ width: '45%' }} />
          <div className="bg-blue-400 h-full" style={{ width: '30%' }} />
          <div className="bg-green-success h-full" style={{ width: '25%' }} />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <LegendItem color="bg-orange-safety" label="Express" />
          <LegendItem color="bg-blue-400" label="Premium" />
          <LegendItem color="bg-green-success" label="VIP" />
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-[10px] font-black tracking-widest text-slate-300 uppercase pl-1">Recently Completed</h4>
        <div className="p-3 bg-white border border-slate-100 rounded-xl flex items-center gap-3 shadow-sm">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-success">
            <CheckCircle2 size={16} />
          </div>
          <div className="flex-1">
            <h5 className="text-xs font-bold uppercase tracking-tight text-slate-700">K 77889 • Mercedes C200</h5>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">Completed 8m ago</p>
          </div>
          <span className="text-[10px] font-bold text-slate-500">AED 120</span>
        </div>
      </div>
    </motion.div>
  );
}

function KpiCard({ label, value, icon, color, trend }: { label: string, value: string, icon: React.ReactNode, color: string, trend: string }) {
  return (
    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 mb-3 text-slate-400">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className={`text-xl font-black tracking-tight ${color}`}>{value}</div>
      <div className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">{trend} vs yesterday</div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string, label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{label}</span>
    </div>
  );
}

function NewOrderScreen({ onAdd }: { onAdd: (order: Omit<Order, 'id' | 'status' | 'timeWaiting' | 'stage'>) => void }) {
  const [plate, setPlate] = useState('');
  const [model, setModel] = useState('');
  const [service, setService] = useState('Express Wash');

  const services = ['Express Wash', 'Premium Polish', 'Full Interior Detail', 'Ceramic Coating'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="p-6 space-y-8"
    >
      <div>
        <h3 className="text-2xl font-black tracking-tight text-slate-900 uppercase italic">Register Vehicle</h3>
        <p className="text-xs text-slate-400 font-medium">Injection point for new service batches</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Plate Number</label>
          <input 
            type="text" 
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            placeholder="E.G. A 12345"
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl text-lg font-bold tracking-tight text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-safety/20 transition-all placeholder:text-slate-200"
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Vehicle Model</label>
          <input 
            type="text" 
            value={model}
            onChange={(e) => setModel(e.target.value)}
            placeholder="E.G. BMW X5"
            className="w-full bg-white border border-slate-200 p-4 rounded-2xl font-bold tracking-tight text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-safety/20 transition-all placeholder:text-slate-200"
          />
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Service Package</label>
          <div className="grid grid-cols-2 gap-2">
            {services.map((s) => (
              <button
                key={s}
                onClick={() => setService(s)}
                className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                  service === s 
                    ? 'bg-orange-safety border-orange-safety text-white shadow-lg shadow-orange-safety/20 translate-y-[-2px]' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button 
        disabled={!plate || !model}
        onClick={() => onAdd({ plate, model, service })}
        className="w-full bg-slate-900 text-white p-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-900/20 disabled:opacity-30 transition-all active:scale-95"
      >
        Initiate Operations
      </button>

      <div className="p-4 bg-orange-safety/5 rounded-2xl border border-orange-safety/10 flex gap-3 items-center">
        <AlertTriangle size={16} className="text-orange-safety shrink-0" />
        <p className="text-[9px] font-bold text-orange-safety uppercase leading-tight">By initiating, you agree to automatic damage logging and real-time tracking protocols.</p>
      </div>
    </motion.div>
  );
}

function EmployeeCardScreen() {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }} 
      animate={{ scale: 1, opacity: 1 }} 
      className="p-8 h-full flex flex-col justify-center bg-slate-50"
    >
      <div className="bg-white rounded-[2rem] p-8 text-slate-900 relative overflow-hidden shadow-2xl border border-slate-100">
        <div className="absolute top-0 right-0 p-4">
           <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-xs">CW</div>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-slate-50 rounded-[1.5rem] flex items-center justify-center">
              <User size={32} className="text-slate-300" />
            </div>
            <div>
              <h3 className="text-2xl font-black leading-tight uppercase italic tracking-tighter">Ahmed Hassan</h3>
              <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Senior Technician • EMP-0042</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl flex items-center justify-center aspect-square">
            <QrCode size={180} strokeWidth={1.5} className="text-slate-900" />
          </div>

          <div className="text-center space-y-4">
            <div className="px-4 py-2 border border-slate-100 rounded-full inline-flex items-center gap-2">
              <ShieldCheck size={14} className="text-green-success" />
              <span className="text-[10px] font-black tracking-widest uppercase text-slate-600">Verified Identity</span>
            </div>
            <p className="text-[9px] font-medium text-slate-300 leading-relaxed uppercase tracking-widest">
              HMAC-SHA256 SIGNED • EXPIRES 24H<br/>
              SESSION: DXB-MAR-042-8821
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function DayCloseScreen() {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => setIsClosing(false), 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
      className="p-8 h-full flex flex-col items-center justify-center text-center space-y-8 bg-slate-50"
    >
      <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-500">
        <Lock size={40} />
      </div>

      <div className="space-y-3">
        <h3 className="text-2xl font-black tracking-tight uppercase text-slate-900">Daily Cycle Termination</h3>
        <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto font-medium lowercase">
          This operation will reconcile all 42 transactions, finalize employee commissions, and dispatch the encrypted EOD reports.
        </p>
      </div>

      <div className="w-full space-y-4">
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-left flex items-center justify-between shadow-sm">
           <div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Batch Summary</p>
             <p className="font-bold text-lg text-slate-700">42 Orders Processed</p>
           </div>
           <ChevronRight size={18} className="text-slate-200" />
        </div>
        
        <div className="bg-white border border-slate-100 p-4 rounded-2xl text-left flex items-center justify-between shadow-sm">
           <div>
             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Financial Audit</p>
             <p className="font-bold text-lg text-green-success">AED 6,102.00</p>
           </div>
           <ChevronRight size={18} className="text-slate-200" />
        </div>
      </div>

      <motion.button 
        whileTap={{ scale: 0.95 }}
        onClick={handleClose}
        disabled={isClosing}
        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 ${
          isClosing ? 'bg-slate-100 text-slate-400' : 'bg-orange-safety text-white hover:bg-orange-600 shadow-orange-safety/20'
        }`}
      >
        {isClosing ? (
          <>Generating Report...</>
        ) : (
          <><ShieldCheck size={18} strokeWidth={3} /> Double-Tap to Close Day</>
        )}
      </motion.button>

      <p className="text-[10px] font-bold text-red-500/30 uppercase tracking-widest">Irreversible Corporate Action</p>
    </motion.div>
  );
}
