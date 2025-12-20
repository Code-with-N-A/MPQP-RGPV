import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaChartBar, FaFileDownload, FaArrowRight, FaGraduationCap } from "react-icons/fa";
import { HiOutlineLightBulb } from "react-icons/hi";

const API_URL = "https://script.google.com/macros/s/AKfycbyQGbi08nenrNPoHNmV3D6PUd0MkXH3X57qi0Yr75lxySDYpaBDLHHUvWPUcNGKhrLd/exec";

// Modern Notification Badge Component
const NotificationBadge = ({ count }) => (
  <div className="absolute -top-3 -right-3 flex items-center justify-center z-30">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
    <div className="relative bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white">
      {count > 99 ? "99+" : count} NEW
    </div>
  </div>
);

const MPQPPaperM = () => {
  const navigate = useNavigate();
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      try {
        const res = await fetch(`${API_URL}?action=list`);
        const json = await res.json();
        if (json.status === "success") {
          const fetchedData = json.rows || [];
          const disabledCount = fetchedData.filter(item => item.status?.toLowerCase() === "disabled").length;
          setNewRequestsCount(disabledCount);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNewRequestsCount();
  }, []);

  // Optimized Navigation Handler
  const handleVaultAccess = (e) => {
    e.preventDefault();
    navigate("/DataControl");
  };

  return (
    <div className="font-[Poppins] bg-[#f8fafc] min-h-screen overflow-x-hidden text-slate-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-12 px-6 overflow-hidden bg-[#0f172a]">
        
        {/* Animated Background Blobs - z-index set to 0 to prevent blocking clicks */}
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob z-0"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 z-0"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 z-0"></div>

        <div className="relative z-10 max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-xs font-bold mb-6 tracking-widest uppercase">
            <HiOutlineLightBulb className="text-lg" /> Official RGPV Polytechnic Hub
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black text-white mb-6 leading-[1.1] tracking-tighter">
            Smart Way to <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              Master Exams
            </span>
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Elevate your preparation with MPQP. Access a curated vault of RGPV 
            Polytechnic papers with advanced subject-wise analytics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20">
            <button
              onClick={handleVaultAccess}
              className="group bg-blue-600 hover:bg-blue-500 text-white px-10 py-4 rounded-2xl font-bold shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-3 active:scale-95 pointer-events-auto"
            >
              Access Vault <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
               onClick={() => window.scrollTo({top: 800, behavior: 'smooth'})}
               className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-2xl font-bold backdrop-blur-md transition-all active:scale-95"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID SECTION ================= */}
      <section className="py-24 px-6 max-w-7xl mx-auto -mt-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Card (Paper Access) */}
          <div className="md:col-span-2 group relative bg-white rounded-[2rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
               <FaBook size={180} />
            </div>
            
            <div className="relative">
              {newRequestsCount > 0 && <NotificationBadge count={newRequestsCount} />}
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                <FaBook size={24} />
              </div>
              <h3 className="text-3xl font-bold mb-4">Central Repository</h3>
              <p className="text-slate-500 max-w-sm mb-8">
                Browse through 1000+ previous year papers categorized by semester, branch, and subject.
              </p>
            </div>

            <button
              onClick={handleVaultAccess}
              className="w-fit bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors z-10 active:scale-95"
            >
              Explore Papers
            </button>
          </div>

          {/* Side Bento Stack */}
          <div className="flex flex-col gap-6">
            <div className="group bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-8 text-white shadow-xl shadow-emerald-200 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate("/Dasbord")}>
               <div className="flex justify-between items-start">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <FaChartBar size={20} />
                  </div>
                  <FaArrowRight className="-rotate-45 opacity-50" />
               </div>
               <div>
                  <h3 className="text-xl font-bold mt-12 mb-2">Trend Analysis</h3>
                  <p className="text-emerald-50 text-sm opacity-80">Subject-wise pattern insights.</p>
                  <button className="mt-4 text-xs font-black uppercase tracking-widest border-b-2 border-white/30 pb-1">View Stats</button>
               </div>
            </div>

            <div className="group bg-white rounded-[2rem] p-8 border border-slate-100 shadow-xl shadow-slate-200/50 flex flex-col justify-between hover:scale-[1.02] transition-transform cursor-pointer" onClick={() => navigate("/DataReport")}>
               <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <FaFileDownload size={20} />
               </div>
               <div>
                  <h3 className="text-xl font-bold mt-10 mb-2">Bulk Reports</h3>
                  <p className="text-slate-500 text-sm">Download consolidated data.</p>
                  <button className="mt-4 text-xs font-black uppercase tracking-widest text-purple-600">Start Download</button>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS SECTION ================= */}
      <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-500 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2 text-blue-400">10k+</div>
            <div className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Active Students</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2 text-purple-400">50+</div>
            <div className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Total Subjects</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2 text-emerald-400">100%</div>
            <div className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Accuracy</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-black mb-2 text-orange-400">24/7</div>
            <div className="text-slate-400 text-sm font-bold uppercase tracking-tighter">Online Access</div>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-white rounded-[3rem] p-10 md:p-20 shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/3">
             <div className="w-32 h-32 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 rotate-12">
                <FaGraduationCap size={60} className="text-white -rotate-12" />
             </div>
          </div>
          <div className="md:w-2/3">
            <h2 className="text-4xl font-black mb-6 tracking-tight text-slate-800">
              Beyond Just Papers. <br />
              <span className="text-blue-600">A Smart Ecosystem.</span>
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed mb-8">
              MPQP isn't just a download portal. It's an intelligent platform designed 
              to give RGPV Polytechnic students a competitive edge. Our government-standard 
              security and clean UI ensure you focus on what matters most: **Your Results.**
            </p>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default MPQPPaperM;