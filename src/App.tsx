import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Calendar, 
  DoorOpen, 
  BarChart3, 
  Users, 
  Settings, 
  AlertTriangle,
  Search,
  Bell,
  LogOut,
  ChevronRight,
  Thermometer,
  Droplets,
  Map as MapIcon,
  Maximize2,
  MoreVertical,
  Download,
  FileText,
  Zap,
  Activity,
  Cpu,
  Database,
  Wifi,
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  Filter,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: string;
  status: 'available' | 'occupied' | 'conflict' | 'maintenance';
  temp: number;
  humidity: number;
}

interface ClassSession {
  id: number;
  room_id: string;
  name: string;
  instructor: string;
  start_time: string;
  end_time: string;
  day_of_week: string;
  batch: string;
}

interface Conflict {
  id: number;
  room_id: string;
  room_name: string;
  class_a_id: number;
  class_b_id: number;
  status: string;
  description: string;
}

// --- Components ---

const SidebarItem = ({ icon: Icon, label, active, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200 group",
      active 
        ? "bg-primary/10 text-primary shadow-sm" 
        : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
    )}
  >
    <Icon size={20} className={cn("transition-transform group-hover:scale-110", active && "text-primary")} />
    <span className="text-sm font-medium">{label}</span>
    {active && <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />}
  </button>
);

const StatCard = ({ icon: Icon, label, value, trend, color }: { icon: any, label: string, value: string | number, trend?: string, color: string }) => (
  <div className="bg-card-dark border border-border-dark p-5 rounded-2xl shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <div className={cn("p-2.5 rounded-xl", color)}>
        <Icon size={20} className="text-white" />
      </div>
      {trend && (
        <span className={cn(
          "text-[10px] font-bold px-2 py-1 rounded-full",
          trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
        )}>
          {trend}
        </span>
      )}
    </div>
    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">{label}</p>
    <p className="text-2xl font-bold mt-1">{value}</p>
  </div>
);

const RoomCard = ({ room }: { room: Room }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-card-dark border border-border-dark p-5 rounded-2xl hover:border-primary/30 transition-all group"
  >
    <div className="flex items-start justify-between mb-4">
      <div>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Level {room.floor}</span>
        <h4 className="text-lg font-bold group-hover:text-primary transition-colors">{room.name}</h4>
      </div>
      <span className={cn(
        "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
        room.status === 'available' && "bg-emerald-500/10 text-emerald-500",
        room.status === 'occupied' && "bg-primary/10 text-primary",
        room.status === 'conflict' && "bg-amber-500/10 text-amber-500",
        room.status === 'maintenance' && "bg-slate-500/10 text-slate-500"
      )}>
        {room.status}
      </span>
    </div>
    
    <div className="grid grid-cols-2 gap-4 mb-4">
      <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3">
        <Thermometer size={16} className="text-primary" />
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Temp</p>
          <p className="text-sm font-bold">{room.temp}°C</p>
        </div>
      </div>
      <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3">
        <Droplets size={16} className="text-blue-400" />
        <div>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Humidity</p>
          <p className="text-sm font-bold">{room.humidity}%</p>
        </div>
      </div>
    </div>

    <div className="flex items-center justify-between pt-4 border-t border-border-dark">
      <div className="flex -space-x-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-6 h-6 rounded-full border-2 border-card-dark bg-slate-700 flex items-center justify-center text-[10px] font-bold">
            {String.fromCharCode(64 + i)}
          </div>
        ))}
        <div className="w-6 h-6 rounded-full border-2 border-card-dark bg-primary flex items-center justify-center text-[10px] font-bold">
          +12
        </div>
      </div>
      <button className="text-primary text-xs font-bold hover:underline">Quick Book</button>
    </div>
  </motion.div>
);

const Heatmap = () => {
  const hours = ['08A', '09A', '10A', '11A', '12P', '01P', '02P', '03P', '04P', '05P', '06P', '07P'];
  const rooms = ['BLOCK A1', 'BLOCK A2', 'SCI 101', 'LAB 4B', 'AUDI II'];
  
  return (
    <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h3 className="text-lg font-bold">Occupancy Heatmap</h3>
          <p className="text-xs text-slate-500 mt-1">Visualization of room usage across hours (x) and room blocks (y)</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500">Low</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.6, 0.8, 1].map(op => (
                <div key={op} className="w-3 h-3 rounded-sm bg-primary" style={{ opacity: op }} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-slate-500">Peak</span>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto custom-scrollbar">
        <div className="min-w-[800px]">
          <div className="flex mb-2">
            <div className="w-24 shrink-0"></div>
            <div className="flex-1 grid grid-cols-12 gap-1 text-[10px] font-bold text-slate-500 text-center uppercase tracking-wider">
              {hours.map(h => <div key={h}>{h}</div>)}
            </div>
          </div>
          <div className="space-y-1">
            {rooms.map(room => (
              <div key={room} className="flex items-center">
                <div className="w-24 shrink-0 text-[10px] font-bold text-slate-500 uppercase pr-4 text-right">{room}</div>
                <div className="flex-1 grid grid-cols-12 gap-1">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="h-10 rounded-sm bg-primary heatmap-cell" 
                      style={{ opacity: Math.random() > 0.3 ? Math.random() : 0.05 }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const GaugeChart = ({ value, label }: { value: number, label: string }) => (
  <div className="relative flex items-center justify-center">
    <svg className="w-48 h-48 transform -rotate-90">
      <circle className="text-slate-800" cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeWidth="12" />
      <circle 
        className="text-primary transition-all duration-1000" 
        cx="96" cy="96" fill="transparent" r="80" stroke="currentColor" strokeLinecap="round" strokeWidth="12"
        strokeDasharray={2 * Math.PI * 80}
        strokeDashoffset={2 * Math.PI * 80 * (1 - value / 100)}
      />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center">
      <span className="text-4xl font-black">{value}%</span>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</span>
    </div>
  </div>
);

const ActivityTimeline = ({ conflicts, resolveConflict }: { conflicts: Conflict[], resolveConflict: (id: number) => void }) => (
  <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
    <h3 className="font-bold mb-6">Recent Activity</h3>
    <div className="relative space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-dark">
      {conflicts.map((c, i) => (
        <div key={c.id} className="relative flex gap-6 pl-10">
          <div className={cn(
            "absolute left-0 w-10 h-10 rounded-full border-4 border-card-dark flex items-center justify-center z-10",
            c.status === 'pending' ? "bg-amber-500 text-white" : "bg-emerald-500 text-white"
          )}>
            <AlertTriangle size={18} />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <p className="text-sm font-bold">Conflict Detected in {c.room_name}</p>
              <span className="text-[10px] font-bold text-slate-500 uppercase">2 mins ago</span>
            </div>
            <p className="text-xs text-slate-500">{c.description}</p>
            <div className="flex gap-2 mt-3">
              <button 
                onClick={() => resolveConflict(c.id)}
                className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Resolve
              </button>
              <button className="px-4 py-1.5 bg-slate-800 text-slate-300 text-[10px] font-bold rounded-lg hover:bg-slate-700 transition-colors">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="relative flex gap-6 pl-10">
        <div className="absolute left-0 w-10 h-10 rounded-full border-4 border-card-dark bg-indigo-500 text-white flex items-center justify-center z-10">
          <Calendar size={18} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold">New Schedule Published</p>
            <span className="text-[10px] font-bold text-slate-500 uppercase">45 mins ago</span>
          </div>
          <p className="text-xs text-slate-500">Batch 11 Mid-term revised timetable is now live.</p>
        </div>
      </div>
    </div>
  </div>
);

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'monitor' | 'schedule' | 'rooms' | 'conflicts' | 'settings' | 'system'>('dashboard');
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [schedule, setSchedule] = React.useState<ClassSession[]>([]);
  const [conflicts, setConflicts] = React.useState<Conflict[]>([]);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<'all' | 'available' | 'occupied' | 'conflict'>('all');
  const [roomModal, setRoomModal] = React.useState<{
    isOpen: boolean;
    mode: 'add' | 'edit';
    room: Partial<Room>;
  }>({ isOpen: false, mode: 'add', room: {} });

  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = roomModal.mode === 'add' ? 'POST' : 'PUT';
    const url = roomModal.mode === 'add' ? '/api/rooms' : `/api/rooms/${roomModal.room.id}`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roomModal.room)
    });

    if (response.ok) {
      setRoomModal({ isOpen: false, mode: 'add', room: {} });
      const res = await fetch('/api/rooms');
      setRooms(await res.json());
      setToast({ message: `Room ${roomModal.mode === 'add' ? 'registered' : 'updated'} successfully`, type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    const response = await fetch(`/api/rooms/${id}`, { method: 'DELETE' });
    if (response.ok) {
      setRooms(prev => prev.filter(r => r.id !== id));
      setToast({ message: 'Room deleted successfully', type: 'success' });
      setTimeout(() => setToast(null), 3000);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, scheduleRes, conflictsRes, statsRes] = await Promise.all([
          fetch('/api/rooms'),
          fetch('/api/schedule'),
          fetch('/api/conflicts'),
          fetch('/api/stats')
        ]);
        
        setRooms(await roomsRes.json());
        setSchedule(await scheduleRes.json());
        setConflicts(await conflictsRes.json());
        setStats(await statsRes.json());
      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const resolveConflict = async (id: number) => {
    await fetch('/api/resolve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ conflictId: id })
    });
    setConflicts(prev => prev.filter(c => c.id !== id));
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-background-dark">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-dark flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">SmartSched</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Batch 11 Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Monitor} label="Live Monitor" active={activeTab === 'monitor'} onClick={() => setActiveTab('monitor')} />
          <SidebarItem icon={Calendar} label="Schedule" active={activeTab === 'schedule'} onClick={() => setActiveTab('schedule')} />
          <SidebarItem icon={DoorOpen} label="Rooms" active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} />
          <SidebarItem icon={Zap} label="Live Planner" active={activeTab === 'conflicts'} onClick={() => setActiveTab('conflicts')} />
          <SidebarItem icon={Activity} label="System Health" active={activeTab === 'system'} onClick={() => setActiveTab('system')} />
          
          <div className="pt-6 pb-2 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">System</div>
          <SidebarItem icon={Settings} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-4 border-t border-border-dark">
          <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">AR</div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 truncate">System Registrar</p>
            </div>
            <LogOut 
              size={14} 
              className="text-slate-500 cursor-pointer hover:text-primary" 
              onClick={() => showToast('Logging out...')}
            />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight capitalize">{activeTab} Overview</h2>
            <p className="text-slate-500 text-sm">Real-time campus operations and scheduling metrics.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search resources..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card-dark border border-border-dark rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-64"
              />
            </div>
            <button 
              onClick={() => showToast('No new notifications')}
              className="p-2 bg-card-dark border border-border-dark rounded-xl text-slate-400 hover:text-primary transition-colors relative"
            >
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-card-dark" />
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Calendar} label="Scheduled Classes" value="1,482" trend="+12%" color="bg-primary" />
                <StatCard icon={AlertTriangle} label="Active Conflicts" value={stats?.conflicts || 0} trend="-5%" color="bg-amber-500" />
                <StatCard icon={DoorOpen} label="Avg. Room Utilization" value={`${stats?.utilization || 0}%`} trend="+0.8%" color="bg-indigo-500" />
                <StatCard icon={BarChart3} label="Optimization Time" value="1.4s" trend="Stable" color="bg-emerald-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Conflict Resolution Rate Gauge */}
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
                  <h3 className="text-lg font-bold mb-8 w-full">Conflict Resolution Rate</h3>
                  <GaugeChart value={94.8} label="Success Rate" />
                  <div className="w-full space-y-3 mt-8">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Auto-Resolved</span>
                      <span className="font-bold">1,240</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-primary h-full rounded-full" style={{ width: '94.8%' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Manual Intervention</span>
                      <span className="font-bold">68</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-amber-500 h-full rounded-full" style={{ width: '5.2%' }} />
                    </div>
                  </div>
                </div>

                {/* Peak Utilization Bar Chart */}
                <div className="lg:col-span-2 bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold">Peak Utilization Hours</h3>
                    <div className="flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Weekday</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-slate-600" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Weekend</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { hour: '08:00', val: 40 }, { hour: '09:00', val: 65 }, { hour: '10:00', val: 85 },
                        { hour: '11:00', val: 95 }, { hour: '12:00', val: 80 }, { hour: '13:00', val: 45 },
                        { hour: '14:00', val: 75 }, { hour: '15:00', val: 90 }, { hour: '16:00', val: 60 },
                        { hour: '17:00', val: 30 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                        <XAxis dataKey="hour" stroke="#64748b" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                        <Tooltip 
                          cursor={{ fill: '#2d3748', opacity: 0.4 }}
                          contentStyle={{ backgroundColor: '#1a242f', border: '1px solid #2d3748', borderRadius: '12px' }}
                        />
                        <Bar dataKey="val" fill="#197fe6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <Heatmap />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Recent Optimizations</h3>
                  <div className="space-y-4">
                    {[
                      { title: 'Semester Schedule Generated', desc: 'Automated resolver cleared 240 potential conflicts.', time: '2h ago', color: 'bg-emerald-500' },
                      { title: 'Manual Overlap: CS101 vs ME204', desc: 'Resolved by moving ME204 to Lab 2.', time: '5h ago', color: 'bg-amber-500' },
                      { title: 'Room Capacity Update', desc: 'Main Auditorium capacity increased to 300.', time: 'Yesterday', color: 'bg-primary' }
                    ].map((opt, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition-colors">
                        <div className={cn("w-2 h-2 rounded-full shrink-0", opt.color)} />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{opt.title}</p>
                          <p className="text-xs text-slate-500">{opt.desc}</p>
                        </div>
                        <span className="text-xs font-medium text-slate-400">{opt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-6">Efficiency Reports</h3>
                  <div className="space-y-4">
                    {[
                      { name: 'Batch_11_Conflict_Summary.pdf', icon: FileText, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                      { name: 'Weekly_Utilization_Data.csv', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                      { name: 'Professor_Availability_Matrix.xlsx', icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-500/10' }
                    ].map((report, i) => (
                      <div key={i} className="flex items-center justify-between p-3 border border-border-dark rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-8 h-8 rounded flex items-center justify-center", report.bg, report.color)}>
                            <report.icon size={18} />
                          </div>
                          <span className="text-sm font-medium">{report.name}</span>
                        </div>
                        <button 
                          onClick={() => showToast(`Downloading ${report.name}...`)}
                          className="text-primary hover:underline text-xs font-bold"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'monitor' && (
            <motion.div 
              key="monitor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              <div className="lg:col-span-3 space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-bold flex items-center gap-2">
                      <Monitor className="text-primary" size={24} /> Room Occupancy
                    </h3>
                    <div className="flex bg-slate-800 rounded-lg p-1">
                      <button 
                        onClick={() => setFilterStatus('all')}
                        className={cn("px-4 py-1.5 text-[10px] font-bold rounded-md transition-all", filterStatus === 'all' ? "bg-primary text-white" : "text-slate-400 hover:text-white")}
                      >
                        All Rooms
                      </button>
                      <button 
                        onClick={() => setFilterStatus('available')}
                        className={cn("px-4 py-1.5 text-[10px] font-bold rounded-md transition-all", filterStatus === 'available' ? "bg-primary text-white" : "text-slate-400 hover:text-white")}
                      >
                        Vacant
                      </button>
                      <button 
                        onClick={() => setFilterStatus('occupied')}
                        className={cn("px-4 py-1.5 text-[10px] font-bold rounded-md transition-all", filterStatus === 'occupied' ? "bg-primary text-white" : "text-slate-400 hover:text-white")}
                      >
                        Occupied
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input 
                      type="text" 
                      placeholder="Find room..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-card-dark border border-border-dark rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-1 focus:ring-primary outline-none w-48"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {rooms
                    .filter(r => filterStatus === 'all' || r.status === filterStatus)
                    .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(room => (
                    <div key={room.id}>
                      <RoomCard room={room} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Daily Schedule Sidebar */}
              <div className="bg-card-dark border border-border-dark rounded-2xl p-6">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="font-bold flex items-center gap-2"><Calendar size={18} className="text-primary" /> Daily Schedule</h3>
                  <div className="flex gap-2">
                    <button onClick={() => showToast('Previous day')} className="p-1 hover:text-primary transition-colors"><ChevronRight size={16} className="rotate-180" /></button>
                    <button onClick={() => showToast('Next day')} className="p-1 hover:text-primary transition-colors"><ChevronRight size={16} /></button>
                  </div>
                </div>
                
                <div className="grid grid-cols-6 gap-2 mb-8">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day, i) => (
                    <div 
                      key={day} 
                      onClick={() => showToast(`Selected ${day} ${23 + i}`)}
                      className={cn(
                        "flex flex-col items-center p-2 rounded-xl transition-colors cursor-pointer",
                        i === 1 ? "bg-primary text-white" : "hover:bg-slate-800 text-slate-500"
                      )}
                    >
                      <span className="text-[8px] font-bold uppercase">{day}</span>
                      <span className="text-sm font-bold">{23 + i}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-6">
                  {[
                    { time: '09:00 AM', title: 'Morning Briefing', room: 'Staff Room • Online', type: 'info' },
                    { time: '10:30 AM', title: 'Advanced UI/UX Workshop', room: 'Batch 11 • Studio A', type: 'live' },
                    { time: '12:00 PM', title: 'Lunch Break', room: 'Main Cafeteria', type: 'break' },
                    { time: '02:00 PM', title: 'Research Paper Review', room: 'Batch 11 • Research Hub', type: 'conflict' },
                    { time: '04:30 PM', title: 'Closing Reflections', room: 'Lab 101', type: 'info' }
                  ].map((event, i) => (
                    <div key={i} className="relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-border-dark">
                      <div className={cn(
                        "absolute left-0 top-0 bottom-0 w-1 rounded-full",
                        event.type === 'live' ? "bg-primary" : 
                        event.type === 'conflict' ? "bg-amber-500" : "bg-slate-500"
                      )} />
                      <p className="text-[10px] font-bold text-slate-500 mb-1">{event.time}</p>
                      <div className={cn(
                        "p-3 rounded-xl",
                        event.type === 'conflict' ? "bg-amber-500/5 border border-amber-500/20" : "bg-slate-800/30"
                      )}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold">{event.title}</p>
                          {event.type === 'live' && <span className="px-1.5 py-0.5 bg-primary text-[8px] font-bold rounded uppercase">Live</span>}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">{event.room}</p>
                        {event.type === 'conflict' && (
                          <div className="mt-2 flex items-center gap-1 text-[8px] font-bold text-amber-500 uppercase">
                            <AlertTriangle size={10} /> Conflict Detected
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button className="w-full py-3 mt-8 bg-primary text-white text-xs font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
                  + New Booking
                </button>
              </div>
            </motion.div>
          )}

          {activeTab === 'schedule' && (
            <motion.div 
              key="schedule"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Filters Sidebar */}
              <div className="bg-card-dark border border-border-dark rounded-2xl p-6 h-fit">
                <h3 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-slate-500">Date Range</h3>
                <div className="relative mb-8">
                  <Calendar size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary" />
                  <input 
                    type="text" 
                    value="Oct 23 - Oct 29, 2023" 
                    readOnly 
                    className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-2.5 text-xs font-bold outline-none"
                  />
                </div>

                <h3 className="font-bold mb-6 uppercase text-[10px] tracking-widest text-slate-500">Filters</h3>
                <div className="space-y-4">
                  {['Classroom A-101', 'Lab Alpha', 'Lecture Hall 3'].map((f, i) => (
                    <label key={f} className="flex items-center gap-3 cursor-pointer group">
                      <div className={cn(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        i < 2 ? "bg-primary border-primary" : "border-border-dark group-hover:border-primary"
                      )}>
                        {i < 2 && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                      </div>
                      <span className="text-xs font-medium text-slate-300">{f}</span>
                    </label>
                  ))}
                </div>

                <button 
                  onClick={() => setActiveTab('conflicts')}
                  className="w-full py-3 mt-12 border border-primary/20 text-primary text-xs font-bold rounded-xl hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={14} /> Resolve Conflicts
                </button>
              </div>

              {/* Main Schedule Grid */}
              <div className="lg:col-span-3 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-card-dark border border-border-dark p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sessions Scheduled</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-2xl font-bold">42</span>
                      <span className="text-[10px] font-bold text-emerald-500 mb-1">+4</span>
                    </div>
                  </div>
                  <div className="bg-card-dark border border-border-dark p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending Review</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-2xl font-bold">3</span>
                      <span className="text-[10px] font-bold text-amber-500 mb-1">Attention Required</span>
                    </div>
                  </div>
                  <div className="bg-card-dark border border-border-dark p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Utilization</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-2xl font-bold">78%</span>
                      <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full" style={{ width: '78%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="bg-card-dark border border-border-dark p-4 rounded-2xl border-amber-500/30 bg-amber-500/5">
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider">Conflict Alerts</p>
                    <div className="flex items-end justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-500" />
                        <span className="text-2xl font-bold text-amber-500">2</span>
                      </div>
                      <span className="text-[8px] font-bold text-amber-500 uppercase">Action Needed</span>
                    </div>
                  </div>
                </div>

                <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden relative">
                  <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-800/30 border-b border-border-dark">
                          <th className="p-6 w-24"><Calendar size={20} className="text-slate-500" /></th>
                          {['MON 23', 'TUE 24', 'WED 25', 'THU 26', 'FRI 27', 'SAT 28', 'SUN 29'].map(day => (
                            <th key={day} className="p-6 text-center">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">{day.split(' ')[0]}</span>
                              <span className={cn("text-lg font-bold", day.includes('25') ? "text-primary" : "text-slate-300")}>{day.split(' ')[1]}</span>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-dark">
                        {['08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'].map(time => (
                          <tr key={time} className="h-24">
                            <td className="p-4 text-[10px] font-bold text-slate-500 border-r border-border-dark">{time}</td>
                            {Array.from({ length: 7 }).map((_, i) => {
                              const isWeekend = i >= 5;
                              const hasConflict = time === '09:00 AM' && i === 2;
                              const hasEvent = (time === '08:00 AM' && i === 0) || (time === '10:00 AM' && i === 1);
                              
                              return (
                                <td key={i} className={cn("p-2 border-r border-border-dark relative", isWeekend && "bg-slate-800/10")}>
                                  {isWeekend && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest rotate-90">Weekend</span>
                                    </div>
                                  )}
                                  {hasEvent && (
                                    <div 
                                      onClick={() => showToast('Session: CS101 - Advanced Algorithms')}
                                      className="bg-primary/10 border-l-4 border-primary p-3 rounded-lg h-full cursor-pointer hover:bg-primary/20 transition-all"
                                    >
                                      <p className="text-[8px] font-bold text-primary uppercase mb-1">Batch 11 - CS101</p>
                                      <p className="text-[10px] font-bold">Advanced Algorithms</p>
                                      <p className="text-[8px] text-slate-500 mt-1">Dr. Sarah Connor • Lab A</p>
                                    </div>
                                  )}
                                  {hasConflict && (
                                    <motion.div 
                                      initial={{ scale: 0.95 }}
                                      animate={{ scale: 1 }}
                                      onClick={() => showToast('Conflict detected: Batch 11 vs Batch 14', 'error')}
                                      className="bg-amber-500/10 border border-amber-500 p-3 rounded-lg h-full shadow-lg shadow-amber-500/10 cursor-pointer hover:bg-amber-500/20 transition-all"
                                    >
                                      <div className="flex items-center gap-1 text-[8px] font-bold text-amber-500 uppercase mb-1">
                                        <AlertTriangle size={10} /> Conflict Detected
                                      </div>
                                      <p className="text-[10px] font-bold">Machine Learning Lab</p>
                                      <p className="text-[8px] text-slate-500 mt-1">Lab Alpha</p>
                                    </motion.div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Conflict Suggestion Popup */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-12 right-12 w-80 bg-slate-900 border border-border-dark rounded-2xl shadow-2xl p-6 z-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                          <Monitor size={16} />
                        </div>
                        <h4 className="font-bold text-sm">Conflict Suggestion</h4>
                      </div>
                      <button className="text-slate-500 hover:text-white"><LogOut size={14} className="rotate-90" /></button>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">Overlapping: Machine Learning Lab</p>
                    <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold text-emerald-500 uppercase">New Slot: 16:00 - 18:00</span>
                      <button onClick={() => showToast('Slot suggestion applied')} className="text-primary text-[10px] font-bold hover:underline">Apply</button>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'rooms' && (
            <motion.div 
              key="rooms"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Capacity</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{rooms.reduce((acc, r) => acc + r.capacity, 0).toLocaleString()}</span>
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Users size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2">+120 vs last sem</p>
                </div>
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Maintenance Required</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">{rooms.filter(r => r.status === 'maintenance').length}</span>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <Settings size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-amber-500 mt-2">Critical issues tracked</p>
                </div>
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Avg. Room Health</p>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold">98.2%</span>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                      <Activity size={20} />
                    </div>
                  </div>
                  <p className="text-[10px] font-bold text-emerald-500 mt-2">Optimal range</p>
                </div>
              </div>

              <div className="bg-card-dark border border-border-dark rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <h3 className="font-bold">Room Management Portfolio</h3>
                    <button 
                      onClick={() => setRoomModal({ isOpen: true, mode: 'add', room: { status: 'available', type: 'Lecture', building: 'North Wing', floor: 1 } })}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-[10px] font-bold rounded-xl hover:bg-primary/90 transition-all ml-4"
                    >
                      <Plus size={14} /> Register New Room
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        placeholder="Filter by building or ID..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-background-dark border border-border-dark rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:ring-1 focus:ring-primary w-64"
                      />
                    </div>
                    <button onClick={() => showToast('Advanced filters opened')} className="p-2 bg-slate-800 border border-border-dark rounded-xl text-slate-400 hover:text-white transition-colors">
                      <Filter size={18} />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800/30 border-b border-border-dark">
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Room ID</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Building</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Capacity</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Type</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase">Status</th>
                        <th className="p-4 text-[10px] font-bold text-slate-500 uppercase text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-dark">
                      {rooms
                        .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.id.toLowerCase().includes(searchQuery.toLowerCase()) || r.building.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map(room => (
                        <tr key={room.id} className="hover:bg-slate-800/20 transition-colors group">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-primary font-bold text-[10px]">
                                {room.id.includes('-') ? room.id.split('-')[1] : room.id}
                              </div>
                              <span className="text-xs font-bold">{room.id}</span>
                            </div>
                          </td>
                          <td className="p-4 text-xs text-slate-400">{room.building} (F{room.floor})</td>
                          <td className="p-4 text-xs font-medium">{room.capacity} Seats</td>
                          <td className="p-4 text-xs font-bold">{room.type}</td>
                          <td className="p-4">
                            <span className={cn(
                              "px-2 py-1 rounded-full text-[10px] font-bold uppercase",
                              room.status === 'available' && "bg-emerald-500/10 text-emerald-500",
                              room.status === 'occupied' && "bg-primary/10 text-primary",
                              room.status === 'conflict' && "bg-amber-500/10 text-amber-500",
                              room.status === 'maintenance' && "bg-slate-500/10 text-slate-500"
                            )}>
                              {room.status}
                            </span>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => setRoomModal({ isOpen: true, mode: 'edit', room })}
                                className="p-1.5 hover:text-primary transition-colors"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteRoom(room.id)}
                                className="p-1.5 hover:text-rose-500 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                              <button className="p-1.5 hover:text-white transition-colors"><MoreVertical size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 border-t border-border-dark flex items-center justify-between">
                  <p className="text-[10px] font-bold text-slate-500 uppercase">Showing 1-{rooms.length} of {rooms.length} rooms</p>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 border border-border-dark rounded-lg text-[10px] font-bold text-slate-400 hover:text-white">Prev</button>
                    <button className="px-3 py-1 bg-primary text-white rounded-lg text-[10px] font-bold">1</button>
                    <button className="px-3 py-1 border border-border-dark rounded-lg text-[10px] font-bold text-slate-400 hover:text-white">Next</button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-amber-500/5 border border-amber-500/20 p-6 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center text-amber-500">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold">Daily Schedule Optimization</h4>
                      <p className="text-xs text-slate-500 mt-1">Our AI has suggested 3 improvements to today's room allocation.</p>
                    </div>
                  </div>
                  <button onClick={() => setActiveTab('conflicts')} className="px-6 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-all">Review Suggestions</button>
                </div>
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h4 className="font-bold mb-4">Recently Viewed</h4>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-primary font-bold text-xs">101</div>
                    <div>
                      <p className="text-xs font-bold">Lab 101</p>
                      <p className="text-[10px] text-slate-500 uppercase font-bold">North Wing • Level 1</p>
                    </div>
                    <ChevronRight size={16} className="ml-auto text-slate-600" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'conflicts' && (
            <motion.div 
              key="conflicts"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              <div className="lg:col-span-3 space-y-6">
                <div className="bg-card-dark border border-border-dark p-8 rounded-3xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8">
                    <div className="flex bg-slate-800 rounded-xl p-1">
                      <button className="px-4 py-2 text-xs font-bold bg-primary text-white rounded-lg">Floor 1</button>
                      <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">Floor 2</button>
                      <button className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white">Floor 3</button>
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2">CSE Building Live Planner</h3>
                  <p className="text-slate-500 text-sm mb-8">Interactive floor plan with real-time conflict detection and resolution.</p>
                  
                  <div className="h-[500px] bg-background-dark rounded-2xl border border-border-dark relative flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-8 p-12 w-full h-full">
                      {rooms.slice(0, 8).map((r, i) => (
                        <motion.div 
                          key={r.id}
                          whileHover={{ scale: 1.05 }}
                          className={cn(
                            "rounded-2xl border-2 flex flex-col items-center justify-center p-6 cursor-pointer transition-all relative",
                            r.status === 'conflict' ? "bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/20" : 
                            r.status === 'occupied' ? "bg-primary/5 border-primary/30" : "bg-slate-800/30 border-border-dark"
                          )}
                        >
                          <DoorOpen size={32} className={cn("mb-4", r.status === 'conflict' ? "text-amber-500" : "text-slate-500")} />
                          <span className="text-xs font-bold">{r.name}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">{r.status}</span>
                          {r.status === 'conflict' && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center text-white">
                              <AlertTriangle size={12} />
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                    
                    <div className="absolute bottom-8 left-8 flex gap-6">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Occupied</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Conflict</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold">AI Suggestion Engine</h4>
                      <p className="text-sm text-slate-500">Based on historical data and professor availability.</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                      <p className="text-xs font-bold text-primary uppercase mb-2">Suggestion #1</p>
                      <p className="text-sm font-bold mb-4">Move "Advanced Algorithms" to RM-105</p>
                      <p className="text-xs text-slate-500 mb-6">RM-105 has 120 seats and is currently vacant during this slot. This would resolve the conflict in RM-101.</p>
                      <button onClick={() => showToast('Resolution applied successfully')} className="w-full py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all">Apply Resolution</button>
                    </div>
                    <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                      <p className="text-xs font-bold text-emerald-500 uppercase mb-2">Optimization #1</p>
                      <p className="text-sm font-bold mb-4">Swap RM-102 and RM-201</p>
                      <p className="text-xs text-slate-500 mb-6">Batch 11 has a following class in South Wing. Swapping would reduce student travel time by 15%.</p>
                      <button onClick={() => showToast('Route optimized')} className="w-full py-3 border border-emerald-500/30 text-emerald-500 text-xs font-bold rounded-xl hover:bg-emerald-500/5 transition-all">Optimize Route</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h4 className="font-bold mb-6 flex items-center gap-2"><AlertTriangle size={18} className="text-amber-500" /> Resolution Panel</h4>
                  <div className="space-y-4">
                    {conflicts.map(c => (
                      <div key={c.id} className="p-4 bg-slate-800/50 rounded-xl border border-border-dark">
                        <p className="text-xs font-bold mb-1">{c.room_name}</p>
                        <p className="text-[10px] text-slate-500 mb-4">{c.description}</p>
                        <div className="flex gap-2">
                          <button onClick={() => resolveConflict(c.id)} className="flex-1 py-2 bg-primary text-white text-[10px] font-bold rounded-lg">Auto-Fix</button>
                          <button onClick={() => showToast('Manual resolution mode active')} className="flex-1 py-2 bg-slate-700 text-white text-[10px] font-bold rounded-lg">Manual</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h4 className="font-bold mb-4">Live Legend</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Total Conflicts</span>
                      <span className="text-xs font-bold text-amber-500">{conflicts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">Resolved Today</span>
                      <span className="text-xs font-bold text-emerald-500">14</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400">System Health</span>
                      <span className="text-xs font-bold text-primary">Excellent</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'system' && (
            <motion.div 
              key="system"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={Cpu} label="System Load" value="24%" trend="Optimal" color="bg-primary" />
                <StatCard icon={Database} label="DB Queries/s" value="142" trend="+5%" color="bg-indigo-500" />
                <StatCard icon={Wifi} label="Network Latency" value="12ms" trend="Low" color="bg-emerald-500" />
                <StatCard icon={ShieldCheck} label="Security Status" value="Secure" trend="Verified" color="bg-rose-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-8">Conflict Resolution Trends</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { day: 'Mon', resolved: 12, pending: 2 },
                        { day: 'Tue', resolved: 18, pending: 4 },
                        { day: 'Wed', resolved: 15, pending: 1 },
                        { day: 'Thu', resolved: 22, pending: 3 },
                        { day: 'Fri', resolved: 10, pending: 0 },
                        { day: 'Sat', resolved: 5, pending: 0 },
                        { day: 'Sun', resolved: 3, pending: 0 }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" vertical={false} />
                        <XAxis dataKey="day" stroke="#64748b" fontSize={10} fontWeight="bold" />
                        <YAxis stroke="#64748b" fontSize={10} fontWeight="bold" />
                        <Tooltip contentStyle={{ backgroundColor: '#1a242f', border: '1px solid #2d3748', borderRadius: '12px' }} />
                        <Bar dataKey="resolved" fill="#197fe6" stackId="a" radius={[0, 0, 0, 0]} />
                        <Bar dataKey="pending" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                  <h3 className="text-lg font-bold mb-8">Conflict Distribution</h3>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Room Overlap', value: 45 },
                            { name: 'Instructor Clash', value: 25 },
                            { name: 'Capacity Issue', value: 20 },
                            { name: 'Maintenance', value: 10 }
                          ]}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {[{ name: 'Room Overlap', value: 45 }, { name: 'Instructor Clash', value: 25 }, { name: 'Capacity Issue', value: 20 }, { name: 'Maintenance', value: 10 }].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={['#197fe6', '#6366f1', '#10b981', '#f59e0b'][index % 4]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: '#1a242f', border: '1px solid #2d3748', borderRadius: '12px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {['Room Overlap', 'Instructor Clash', 'Capacity Issue', 'Maintenance'].map((label, i) => (
                      <div key={label} className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", ['bg-primary', 'bg-indigo-500', 'bg-emerald-500', 'bg-amber-500'][i])} />
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card-dark border border-border-dark p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold">Infrastructure Visualization</h3>
                  <div className="flex gap-2">
                    <button onClick={() => showToast('Node view active')} className="px-4 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg">Node View</button>
                    <button onClick={() => showToast('Grid view active')} className="px-4 py-1.5 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg">Grid View</button>
                  </div>
                </div>
                <div className="grid grid-cols-8 md:grid-cols-12 lg:grid-cols-16 gap-4">
                  {Array.from({ length: 48 }).map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.01 }}
                      onClick={() => showToast(`Node ${i + 1} status: ${i % 7 === 0 ? 'Critical' : i % 5 === 0 ? 'Warning' : 'Healthy'}`)}
                      className={cn(
                        "aspect-square rounded-lg border flex items-center justify-center transition-all cursor-pointer hover:scale-110",
                        i % 7 === 0 ? "bg-amber-500/20 border-amber-500 shadow-lg shadow-amber-500/20" : 
                        i % 5 === 0 ? "bg-primary/20 border-primary" : "bg-slate-800/50 border-border-dark"
                      )}
                    >
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        i % 7 === 0 ? "bg-amber-500" : i % 5 === 0 ? "bg-primary" : "bg-slate-600"
                      )} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div 
              key="settings"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-w-4xl space-y-8"
            >
              <div className="bg-card-dark border border-border-dark rounded-3xl overflow-hidden">
                <div className="p-8 border-b border-border-dark bg-slate-800/30">
                  <h3 className="text-xl font-bold">System Configuration</h3>
                  <p className="text-sm text-slate-500 mt-1">Manage global scheduling parameters and AI engine sensitivity.</p>
                </div>
                <div className="p-8 space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-primary uppercase tracking-widest">Scheduling Engine</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">Auto-Resolve Conflicts</p>
                            <p className="text-[10px] text-slate-500">Automatically apply AI suggestions for minor overlaps.</p>
                          </div>
                          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">Strict Capacity Enforcement</p>
                            <p className="text-[10px] text-slate-500">Prevent booking if batch size exceeds room capacity.</p>
                          </div>
                          <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest">AI Optimization</h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">Travel Time Optimization</p>
                            <p className="text-[10px] text-slate-500">Minimize student movement between buildings.</p>
                          </div>
                          <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold">Energy Saving Mode</p>
                            <p className="text-[10px] text-slate-500">Consolidate classes to minimize HVAC usage.</p>
                          </div>
                          <div className="w-12 h-6 bg-slate-700 rounded-full relative cursor-pointer">
                            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 border-t border-border-dark">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">Database Management</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={() => showToast('Backup initiated...')} className="flex items-center justify-center gap-2 p-4 bg-slate-800 border border-border-dark rounded-2xl hover:bg-slate-700 transition-all">
                        <Database size={18} className="text-primary" />
                        <span className="text-xs font-bold">Backup DB</span>
                      </button>
                      <button onClick={() => showToast('Logs exported to CSV')} className="flex items-center justify-center gap-2 p-4 bg-slate-800 border border-border-dark rounded-2xl hover:bg-slate-700 transition-all">
                        <FileText size={18} className="text-emerald-500" />
                        <span className="text-xs font-bold">Export Logs</span>
                      </button>
                      <button onClick={() => showToast('Cache purged', 'error')} className="flex items-center justify-center gap-2 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl hover:bg-rose-500/20 transition-all text-rose-500">
                        <Trash2 size={18} />
                        <span className="text-xs font-bold">Purge Cache</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 border border-primary/20 p-8 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center text-primary">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold">Security & Access</h4>
                    <p className="text-sm text-slate-500">Manage registrar permissions and API access tokens.</p>
                  </div>
                </div>
                <button onClick={() => showToast('Access management panel opened')} className="px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all">Manage Access</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Map Widget */}
        <div className="fixed bottom-8 right-8 group">
          <button 
            onClick={() => showToast('Campus map expanded')}
            className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 transition-transform"
          >
            <MapIcon size={24} />
          </button>
          <div className="absolute bottom-full right-0 mb-4 w-72 h-48 bg-card-dark border border-border-dark rounded-2xl shadow-2xl p-2 hidden group-hover:block overflow-hidden">
            <div className="w-full h-full rounded-xl overflow-hidden relative">
              <img 
                src="https://picsum.photos/seed/map/400/300" 
                alt="Campus Map" 
                className="w-full h-full object-cover opacity-40"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-primary px-2 py-1 rounded">Interactive Map</span>
                <p className="text-[10px] text-white/80 mt-1">Click to expand building view</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={cn(
              "fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
              toast.type === 'success' ? "bg-emerald-500 border-emerald-400 text-white" : "bg-rose-500 border-rose-400 text-white"
            )}
          >
            {toast.type === 'success' ? <ShieldCheck size={18} /> : <AlertTriangle size={18} />}
            <span className="text-xs font-bold">{toast.message}</span>
          </motion.div>
        )}

        {roomModal.isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRoomModal({ ...roomModal, isOpen: false })}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-card-dark border border-border-dark rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border-dark flex items-center justify-between bg-slate-800/50">
                <h3 className="text-lg font-bold">{roomModal.mode === 'add' ? 'Register New Room' : 'Edit Room Details'}</h3>
                <button 
                  onClick={() => setRoomModal({ ...roomModal, isOpen: false })}
                  className="p-2 hover:bg-slate-700 rounded-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSaveRoom} className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Room ID</label>
                    <input 
                      required
                      disabled={roomModal.mode === 'edit'}
                      value={roomModal.room.id || ''}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, id: e.target.value } })}
                      placeholder="e.g. RM-101"
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Display Name</label>
                    <input 
                      required
                      value={roomModal.room.name || ''}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, name: e.target.value } })}
                      placeholder="e.g. Lab 101"
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Building</label>
                    <select 
                      value={roomModal.room.building || ''}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, building: e.target.value } })}
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="North Wing">North Wing</option>
                      <option value="South Wing">South Wing</option>
                      <option value="East Wing">East Wing</option>
                      <option value="Main Block">Main Block</option>
                      <option value="Science Wing">Science Wing</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Floor</label>
                    <input 
                      type="number"
                      required
                      value={roomModal.room.floor || 0}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, floor: parseInt(e.target.value) } })}
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacity</label>
                    <input 
                      type="number"
                      required
                      value={roomModal.room.capacity || 0}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, capacity: parseInt(e.target.value) } })}
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Type</label>
                    <select 
                      value={roomModal.room.type || ''}
                      onChange={e => setRoomModal({ ...roomModal, room: { ...roomModal.room, type: e.target.value } })}
                      className="w-full bg-background-dark border border-border-dark rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Lab">Lab</option>
                      <option value="Studio">Studio</option>
                      <option value="Workshop">Workshop</option>
                      <option value="Meeting">Meeting</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Status</label>
                  <div className="flex gap-3">
                    {['available', 'occupied', 'maintenance'].map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setRoomModal({ ...roomModal, room: { ...roomModal.room, status } })}
                        className={cn(
                          "flex-1 py-2 rounded-xl text-[10px] font-bold uppercase border transition-all",
                          roomModal.room.status === status 
                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                            : "bg-slate-800 border-border-dark text-slate-500 hover:text-white"
                        )}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setRoomModal({ ...roomModal, isOpen: false })}
                    className="flex-1 py-4 bg-slate-800 text-white text-xs font-bold rounded-2xl hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-4 bg-primary text-white text-xs font-bold rounded-2xl hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all"
                  >
                    {roomModal.mode === 'add' ? 'Create Room' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
