import React, { useEffect, useState, useMemo } from "react";
import { Bar, Pie, Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { useApiData } from "./ContextAPI";
import { FiRefreshCw, FiPieChart, FiBarChart2, FiLayers, FiDatabase, FiTrendingUp, FiArrowUpRight, FiUsers } from "react-icons/fi";

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement, PointElement, LineElement, Filler
);

// --- ENTERPRISE COLOR CONFIG ---
const THEME = {
  gradients: [
    "#6366F1", "#8B5CF6", "#EC4899", "#F43F5E", "#F59E0B", "#10B981", "#06B6D4", "#3B82F6"
  ],
  surface: "#ffffff",
  background: "#f8fafc",
  text: "#1e293b"
};

const getOptions = (isLine = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "bottom",
      labels: { usePointStyle: true, font: { family: 'Inter', size: 12, weight: '600' }, padding: 20 }
    },
    tooltip: {
      backgroundColor: '#0f172a',
      padding: 14,
      borderRadius: 12,
      titleFont: { size: 14, weight: 'bold' },
      bodyFont: { size: 13 },
      displayColors: true,
    },
  },
  scales: isLine ? {
    x: { grid: { display: false }, ticks: { font: { weight: '600' }, color: '#94a3b8' } },
    y: { 
      border: { display: false }, 
      grid: { color: 'rgba(226, 232, 240, 0.5)', drawBorder: false },
      ticks: { color: '#94a3b8' } 
    },
  } : {},
});

export default function Dashboard() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") {
        setData(json.rows || []);
        sessionStorage.setItem('dashboardData', JSON.stringify(json.rows));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setLoading(false), 800); // Premium feel delay
    }
  };

  useEffect(() => {
    const stored = sessionStorage.getItem('dashboardData');
    if (stored) { setData(JSON.parse(stored)); setLoading(false); }
    else { loadData(); }
  }, []);

  const stats = useMemo(() => {
    const counts = { 
      year: {}, 
      sem: {}, 
      branch: {}, 
      type: { regular: 0, ex: 0 }, // New: Regular vs Ex Logic
      status: { enabled: 0, disabled: 0 } 
    };
    
    data.forEach(row => {
      if (row.year) counts.year[row.year] = (counts.year[row.year] || 0) + 1;
      if (row.semester) counts.sem[row.semester] = (counts.sem[row.semester] || 0) + 1;
      if (row.branch) counts.branch[row.branch] = (counts.branch[row.branch] || 0) + 1;
      
      // Logical check for Regular and Ex
      const typeStr = (row.type || "").toLowerCase();
      if (typeStr.includes("regular")) counts.type.regular++;
      else if (typeStr.includes("ex")) counts.type.ex++;
      
      if (row.status?.toLowerCase() === "enabled") counts.status.enabled++;
      else counts.status.disabled++;
    });
    return counts;
  }, [data]);

  const StatCard = ({ title, value, icon: Icon, color, trend }) => (
    <div className="bg-white p-7 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col justify-between hover:translate-y-[-8px] transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} text-white shadow-lg group-hover:rotate-6 transition-transform`}>
          <Icon size={28} />
        </div>
        <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <FiTrendingUp /> {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-400 text-[11px] font-black uppercase tracking-[0.15em] mb-1">{title}</p>
        <h3 className="text-4xl font-black text-slate-800 tracking-tight">{value}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-12 font-['Inter',sans-serif]">
      <div className="max-w-[1440px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="h-1 w-12 bg-indigo-600 rounded-full"></span>
              <span className="text-indigo-600 font-bold text-xs uppercase tracking-widest">System Overview</span>
            </div>
            <h1 className="text-5xl font-[1000] text-slate-900 tracking-tighter">
              Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Pulse</span>
            </h1>
          </div>
          <button 
            onClick={loadData}
            className="group flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-3xl font-bold hover:bg-indigo-600 transition-all shadow-2xl shadow-indigo-100 active:scale-95"
          >
            <FiRefreshCw className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-700"} />
            Sync Real-time Data
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col h-96 items-center justify-center gap-4">
            <div className="w-16 h-16 border-[6px] border-slate-100 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-400 font-bold animate-pulse uppercase text-[10px] tracking-[0.3em]">Architecting View...</p>
          </div>
        ) : (
          <div className="space-y-8">
            
            {/* STATS GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <StatCard title="Total Repository" value={data.length} icon={FiDatabase} color="bg-indigo-600" trend="+12.5%" />
              <StatCard title="Active Nodes" value={stats.status.enabled} icon={FiArrowUpRight} color="bg-emerald-500" trend="+4.2%" />
              <StatCard title="Regular Mode" value={stats.type.regular} icon={FiUsers} color="bg-cyan-500" trend="Active" />
              <StatCard title="Ex-Student Mode" value={stats.type.ex} icon={FiLayers} color="bg-rose-500" trend="Historic" />
            </div>

            {/* CHARTS GRID - FIRST ROW */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5">
                  <FiBarChart2 size={150} />
                </div>
                <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
                  <span className="w-2 h-6 bg-indigo-600 rounded-full"></span> Data Inflow Over Time
                </h3>
                <div className="h-[400px]">
                  <Line 
                    options={getOptions(true)}
                    data={{
                      labels: Object.keys(stats.year),
                      datasets: [{
                        label: 'Paper Volume',
                        data: Object.values(stats.year),
                        borderColor: '#6366F1',
                        borderWidth: 4,
                        backgroundColor: (context) => {
                          const ctx = context.chart.ctx;
                          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
                          gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                          return gradient;
                        },
                        fill: true,
                        tension: 0.4,
                        pointRadius: 6,
                        pointHoverRadius: 10,
                        pointBackgroundColor: '#ffffff',
                        pointBorderColor: '#6366F1',
                        pointBorderWidth: 3
                      }]
                    }}
                  />
                </div>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
                <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
                  <span className="w-2 h-6 bg-rose-500 rounded-full"></span> Ecosystem Share
                </h3>
                <div className="h-[350px]">
                  <Doughnut 
                    options={{...getOptions(), cutout: '82%'}}
                    data={{
                      labels: Object.keys(stats.branch),
                      datasets: [{
                        data: Object.values(stats.branch),
                        backgroundColor: THEME.gradients,
                        hoverOffset: 30,
                        borderWidth: 0,
                      }]
                    }}
                  />
                </div>
              </div>

            </div>

            {/* CHARTS GRID - SECOND ROW (REGULAR vs EX PIE ADDED) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* NEW CHART: REGULAR VS EX PIE */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col">
                <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
                  <span className="w-2 h-6 bg-cyan-500 rounded-full"></span> Regular vs Ex (Mode)
                </h3>
                <div className="h-[300px] flex items-center justify-center">
                  <Pie 
                    options={getOptions()}
                    data={{
                      labels: ['Regular Students', 'Ex-Students'],
                      datasets: [{
                        data: [stats.type.regular, stats.type.ex],
                        backgroundColor: ['#06B6D4', '#F43F5E'],
                        borderWidth: 5,
                        borderColor: '#ffffff',
                        hoverOffset: 20
                      }]
                    }}
                  />
                </div>
                <p className="text-center text-slate-400 text-xs mt-4 font-semibold italic">Based on Semester & Branch scan data</p>
              </div>

              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 lg:col-span-1">
                <h3 className="text-xl font-black text-slate-800 mb-8 tracking-tight uppercase text-xs">Semester Distribution</h3>
                <div className="h-[300px]">
                  <Bar 
                    options={{...getOptions(true), indexAxis: 'y'}}
                    data={{
                      labels: Object.keys(stats.sem).map(s => `Sem ${s}`),
                      datasets: [{
                        label: 'Paper Count',
                        data: Object.values(stats.sem),
                        backgroundColor: THEME.gradients,
                        borderRadius: 12,
                        barThickness: 20,
                      }]
                    }}
                  />
                </div>
              </div>

              <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden group lg:col-span-1">
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-indigo-600/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
                <h3 className="text-xl font-black mb-8 relative z-10">Sync Status Overview</h3>
                <div className="h-[300px] flex justify-center relative z-10">
                  <Pie 
                    data={{
                      labels: ['Active Assets', 'Pending Sync'],
                      datasets: [{
                        data: [stats.status.enabled, stats.status.disabled],
                        backgroundColor: ['#10B981', 'rgba(255,255,255,0.1)'],
                        borderColor: '#0f172a',
                        borderWidth: 8
                      }]
                    }}
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>
    </div>
  );
}