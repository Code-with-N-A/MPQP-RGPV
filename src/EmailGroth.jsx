import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { useApiData } from "./ContextAPI";
import { auth } from "./firebase";
import { FileText } from "lucide-react";
import { Trophy, Medal, Crown, Star, Clock, RotateCw, CheckCircle2, ShieldCheck, Zap } from "lucide-react";

// --- Utilities ---
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
};

export default function EmailHrth() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const canvasRef = useRef(null);

  const BAR_COLORS = useMemo(() => [
    "from-amber-400 to-orange-500", // Gold
    "from-slate-300 to-slate-500",  // Silver
    "from-orange-400 to-amber-700", // Bronze
    "from-blue-500 to-indigo-600",
    "from-purple-500 to-violet-600",
    "from-emerald-500 to-teal-600",
  ], []);

  const loadData = useCallback(async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      else setLoading(true);

      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();

      if (json.status !== "success" || !Array.isArray(json.rows)) {
        setData([]);
        return;
      }

      const userMap = {};
      const firebaseUserEmail = auth.currentUser?.email?.toLowerCase();

      json.rows.forEach((row) => {
        if (!row.email || row.status !== "Enabled") return;
        const email = row.email.toLowerCase();

        if (!userMap[email]) {
          let name = row.displayName || email.split("@")[0];
          let finalImg = firebaseUserEmail === email
            ? (auth.currentUser?.photoURL || row.photoURL)
            : `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;

          userMap[email] = {
            email,
            displayName: name.charAt(0).toUpperCase() + name.slice(1),
            photoURL: finalImg,
            count: 0,
            latestTimestamp: row.timestamp,
          };
        }
        userMap[email].count += 1;
        if (new Date(row.timestamp) < new Date(userMap[email].latestTimestamp)) {
          userMap[email].latestTimestamp = row.timestamp;
        }
      });

      const sorted = Object.values(userMap).sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return new Date(a.latestTimestamp) - new Date(b.latestTimestamp);
      });

      const top10 = sorted.slice(0, 10);
      setData(top10);
      sessionStorage.setItem('leaderboardData', JSON.stringify(top10));
    } catch (err) {
      console.error("Load Error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    const stored = sessionStorage.getItem('leaderboardData');
    if (stored) {
      setData(JSON.parse(stored));
      setLoading(false);
    } else {
      loadData();
    }
  }, [loadData]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext('2d');
    let frame;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      r: Math.random() * 2,
      o: Math.random() * 0.5
    }));
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${p.o})`; ctx.fill();
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, [data]);

  const topUser = data[0];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-12 font-sans selection:bg-indigo-100">
      {/* Premium Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0  shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="relative">
              <div className="bg-indigo-600 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-indigo-200 rotate-3">
                <ShieldCheck size={22} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-800 leading-none">Elite</h1>
              <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest">Hall of Fame</p>
            </div>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 sm:px-5 sm:py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold hover:border-indigo-500 hover:text-indigo-600 transition-all active:scale-95 disabled:opacity-50"
          >
            <RotateCw size={16} className={refreshing ? "animate-spin text-indigo-500" : ""} />
            <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Refresh"}</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 mt-6 sm:mt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Verifying Contributions...</p>
          </div>
        ) : (
          <>
            {/* Rank 1 Premium Spotlight */}
            {topUser && (
              <div className="relative group transition-all duration-500 mb-8 sm:mb-16">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 rounded-[2rem] sm:rounded-[2.5rem] blur opacity-15"></div>

                <div className="relative overflow-hidden bg-white border border-white shadow-xl p-6 sm:p-14">
                  <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40" />

                  {/* Premium Ribbon */}
                  <div className="absolute top-0 right-0 z-20">
                    <div className="bg-amber-400 text-amber-900 font-black text-[8px] sm:text-[10px] px-8 sm:px-10 py-1.5 sm:py-2 uppercase tracking-widest rotate-45 translate-x-8 translate-y-3 sm:translate-x-10 sm:translate-y-4 shadow-lg">
                      Champion
                    </div>
                  </div>

                  <div className="relative flex flex-col md:flex-row gap-6 sm:gap-12 items-center">
                    <div className="relative">
                      <div className="w-32 h-32 sm:w-48 sm:h-48 md:w-56 md:h-56 rounded-[2rem] sm:rounded-[3rem] p-1.5 sm:p-2 bg-gradient-to-br from-amber-300 via-yellow-500 to-orange-600 shadow-2xl rotate-3">
                        <div className="w-full h-full rounded-[1.8rem] sm:rounded-[2.5rem] bg-white p-1 -rotate-3 overflow-hidden">
                          <img
                            src={topUser.photoURL}
                            alt=""
                            className="w-full h-full object-cover rounded-[1.6rem] sm:rounded-[2.2rem]"
                            onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${topUser.displayName}` }}
                          />
                        </div>
                      </div>
                      <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 bg-white p-2 sm:p-3 rounded-xl sm:rounded-2xl shadow-xl text-amber-500 border border-amber-100 animate-bounce">
                        <Crown size={24} className="sm:w-8 sm:h-8" fill="currentColor" />
                      </div>
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-3 sm:mb-4">
                        <span className="bg-amber-100 text-amber-700 text-[9px] sm:text-[10px] font-black px-2.5 py-1 rounded-full border border-amber-200 uppercase tracking-tighter">Rank #01</span>
                        <div className="h-px w-6 sm:w-8 bg-amber-200"></div>
                        <span className="flex items-center gap-1 text-amber-600 text-[9px] sm:text-[10px] font-bold uppercase"><Zap size={10} fill="currentColor" /> Elite Contributor</span>
                      </div>
                      <h2 className="text-3xl sm:text-5xl md:text-4x1 font-black text-slate-900 mb-3 sm:mb-4 tracking-tight flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                        {topUser.displayName}
                        <CheckCircle2 className="text-blue-500 w-6 h-6 sm:w-8 sm:h-8" fill="rgba(59, 130, 246, 0.1)" />
                      </h2>
                     <p className="text-slate-500 text-sm sm:text-base md:text-lg font-medium max-w-md leading-relaxed mb-6 sm:mb-8">
  Top contributor on this platform for uploading the 
  <span className="text-amber-600 font-black"> highest number of question papers ({topUser.count})</span>.
</p>


                      <div className="flex flex-wrap gap-3 sm:gap-4 justify-center md:justify-start">
                        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:py-4  border border-slate-100">
                          <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Impact Since</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> {formatDate(topUser.latestTimestamp)}</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:py-4  border border-slate-100">
                          <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Papers</p>
                          <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"><FileText size={14} className="text-amber-500" /> ({topUser.count})</p>
                        </div>
                        <div className="bg-slate-50 px-4 py-3 sm:px-6 sm:py-4  border border-slate-100">
                          <p className="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Badge</p>
                          <div className="flex gap-0.5"><Star size={14} fill="#fbbf24" className="text-amber-400" /> <Star size={14} fill="#fbbf24" className="text-amber-400" /> <Star size={14} fill="#fbbf24" className="text-amber-400" /></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ranking Table Section */}
            <div className="bg-white shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-5 py-5 sm:px-8 sm:py-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="p-2 sm:p-2.5 bg-white rounded-lg sm:rounded-xl shadow-sm border border-slate-100 text-indigo-600">
                    <Trophy size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <h3 className="text-base sm:text-xl font-black text-slate-800 tracking-tight">Top 10 Rankings</h3>
                </div>
                <div className="hidden sm:block text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100">
                  Verified Data
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {data.map((user, index) => (
                  <div key={user.email} className="group p-4 sm:p-6 md:p-8 hover:bg-slate-50/80 transition-all flex items-center gap-3 sm:gap-8 relative overflow-hidden">
                    {/* Rank Number */}
                    <div className={`shrink-0 w-8 h-8 sm:w-12 sm:h-12 flex items-center justify-center rounded-lg sm:rounded-2xl font-black text-sm sm:text-lg shadow-sm ${index === 0 ? "bg-amber-100 text-amber-600" :
                        index === 1 ? "bg-slate-100 text-slate-500" :
                          index === 2 ? "bg-orange-50 text-orange-700" : "bg-white border border-slate-100 text-slate-400"
                      }`}>
                      {index + 1}
                    </div>

                    {/* Profile */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl overflow-hidden border-2 border-white shadow-md ring-1 ring-slate-200">
                        <img
                          src={user.photoURL}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/initials/svg?seed=${user.displayName}` }}
                        />
                      </div>
                      {index < 3 && (
                        <div className="absolute -bottom-1 -right-1 bg-white p-0.5 sm:p-1 rounded shadow-md border border-slate-100">
                          <Medal size={10} className={index === 0 ? "text-amber-500" : index === 1 ? "text-slate-400" : "text-orange-600"} />
                        </div>
                      )}
                    </div>

                    {/* Name and Progress */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 sm:mb-2">
                        <h4 className="font-bold text-slate-800 truncate text-sm sm:text-lg tracking-tight group-hover:text-indigo-600 transition-colors">{user.displayName}</h4>
                        {index === 0 && <ShieldCheck size={14} className="text-indigo-500 shrink-0" />}
                        <p className="text-xs sm:text-sm font-bold text-slate-700 flex items-center gap-1.5"><Clock size={14} className="text-amber-500" /> {formatDate(topUser.latestTimestamp)}</p>

                      </div>
                      <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex-1 h-1.5 sm:h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-50 shadow-inner">
                          <div
                            className={`h-full bg-gradient-to-r transition-all duration-1000 ease-out rounded-full ${BAR_COLORS[index] || "from-indigo-400 to-blue-500"}`}
                            style={{ width: `${(user.count / (topUser?.count || 1)) * 100}%` }}
                          />
                        </div>
                        <span className="shrink-0 text-[10px] sm:text-sm font-black text-slate-700 bg-white px-2 py-0.5 sm:px-3 sm:py-1 rounded sm:rounded-lg border border-slate-100 shadow-sm">
                          {user.count} <span className="hidden sm:inline text-[10px] text-slate-400 uppercase font-bold ml-1">Papers</span>
                        </span>
                      </div>
                    </div>

                    {/* Badge for Desktop */}
                    {index < 3 && (
                      <div className={`hidden lg:block px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${index === 0 ? "bg-amber-50 text-amber-600 border-amber-100" :
                          index === 1 ? "bg-slate-50 text-slate-500 border-slate-200" :
                            "bg-orange-50 text-orange-700 border-orange-100"
                        }`}>
                        {index === 0 ? "Champion" : index === 1 ? "Elite" : "Pro"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Motivation Footer */}
            <div className="mt-8 sm:mt-12 text-center px-4">
              <p className="text-slate-400 text-[10px] sm:text-sm font-medium flex items-center justify-center gap-2 leading-tight">
                <Zap size={14} className="text-amber-500 shrink-0" fill="currentColor" />
                Want to see your name here? Keep contributing quality materials!
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
}