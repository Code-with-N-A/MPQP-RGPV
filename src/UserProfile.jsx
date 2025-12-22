import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, ArrowLeft, Save, Settings, 
  ShieldCheck, Clock, Crown, Sparkles, ChevronRight, Mail, 
  UserCircle2, LogIn, ShieldAlert, Globe, Zap, Users
} from "lucide-react";

export default function UserProfile({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [displayName, setDisplayName] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  // --- TOP-TIER SECURITY: ADMIN VALIDATION ---
  const isAdmin = useMemo(() => {
    return user?.email?.toLowerCase() === "codewithna73@gmail.com";
  }, [user]);

  const currentTheme = isAdmin 
    ? "from-[#1a1a1a] via-[#333333] to-[#000000]" 
    : "from-[#00c6ff] to-[#0072ff]";

  useEffect(() => {
    if (!user?.email) return;
    const savedName = localStorage.getItem(`userDisplayName_${user.email}`);
    setDisplayName(savedName || user.displayName || user.email.split("@")[0]);

    const now = new Date();
    setLastLoginTime(now.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }));
  }, [user]);

  useEffect(() => {
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpen(false);
        setView("menu");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative inline-block" ref={cardRef}>
      {/* --- TRIGGER AVATAR --- */}
      <button
        onClick={() => { setOpen(!open); setView("menu"); }}
        className="relative flex items-center focus:outline-none group p-1 active:scale-95 transition-transform"
      >
        <div className={`w-10 h-10 rounded-full p-[2px] shadow-md transition-all ${user ? `bg-gradient-to-tr ${currentTheme}` : 'bg-slate-200 group-hover:bg-slate-300'}`}>
          <div className="w-full h-full rounded-full bg-white p-[1px] overflow-hidden relative flex items-center justify-center">
            {user ? (
              <img 
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=random`} 
                alt="profile" className="w-full h-full rounded-full object-cover" 
              />
            ) : (
              <UserCircle2 className="w-7 h-7 text-slate-400" />
            )}
          </div>
        </div>
        {user && <div className="absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`
              absolute right-0 mt-3 w-[290px] bg-white 
              shadow-[0_20px_50px_rgba(0,0,0,0.22)] z-[999] 
              overflow-hidden rounded-[26px] border border-slate-100
              max-sm:fixed max-sm:top-1/2 max-sm:left-1/2 max-sm:-translate-x-1/2 max-sm:-translate-y-1/2
            `}
          >
            <div className="flex flex-col">
              {/* --- HEADER: Dynamic for Guest/User/Admin --- */}
              <div className={`relative ${isAdmin ? 'p-4' : 'p-6'} overflow-hidden bg-gradient-to-br transition-all ${user ? currentTheme : 'from-slate-700 to-slate-900'}`}>
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <circle cx="90" cy="10" r="20" fill="white" />
                    <path d="M0 100 L100 0" stroke="white" strokeWidth="0.1" />
                  </svg>
                </div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <div className={`${isAdmin ? 'w-12 h-12' : 'w-16 h-16'} rounded-[20px] border-2 border-white/30 p-1 bg-white/10 backdrop-blur-md shadow-2xl transition-all`}>
                      {user ? (
                        <img
                          src={user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=fff&color=000&bold=true`}
                          className="w-full h-full rounded-[15px] object-cover"
                          alt="avatar"
                        />
                      ) : (
                        <div className="w-full h-full rounded-[15px] bg-white flex items-center justify-center">
                          <UserCircle2 className="w-8 h-8 text-slate-800" />
                        </div>
                      )}
                    </div>
                    {user && (
                      <div className="absolute -top-1.5 -right-1.5 bg-white p-1 rounded-lg shadow-md border border-slate-50">
                        {isAdmin ? <Crown size={12} className="text-amber-500" /> : <Sparkles size={12} className="text-blue-500" />}
                      </div>
                    )}
                  </div>

                  <h4 className={`font-bold text-white tracking-tight ${isAdmin ? 'text-base' : 'text-lg'}`}>
                    {user ? displayName : "Guest Explorer"}
                  </h4>
                  
                  <div className="mt-1.5 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/20 backdrop-blur-md border border-white/10">
                     {user ? <Mail size={10} className="text-white/70" /> : <Globe size={10} className="text-white/70" />}
                     <span className="text-white/90 text-[10px] font-bold uppercase tracking-wider truncate max-w-[180px]">
                        {user ? user.email : "Public Access Mode"}
                     </span>
                  </div>
                </div>
              </div>

              {/* --- BODY --- */}
              <div className={`px-5 ${isAdmin ? 'py-4' : 'py-5'} bg-white -mt-5 rounded-t-[30px] relative z-20`}>
                {!user ? (
                  /* GUEST VIEW: Professional Info */
                  <div className="space-y-4">
                    <div className="text-center pb-2">
                     <p className="text-slate-500 text-[11px] font-medium leading-relaxed">
  Join our <span className="text-slate-900 font-bold">MPQP Elite Community</span> to unlock <span className="text-slate-900 font-bold">RGPV Diploma</span> resources and your personalized academic dashboard.
</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <Zap size={16} className="text-amber-500" />
                        <span className="text-xs font-bold text-slate-700">Real-time Analytics</span>
                      </div>
                      <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                        <Users size={16} className="text-blue-500" />
                        <span className="text-xs font-bold text-slate-700">Expert Community</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => navigate("/signup")}
                      className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 transition-all active:scale-95 text-[11px] font-black uppercase tracking-widest"
                    >
                      <LogIn size={16} /> Authenticate Now
                    </button>
                  </div>
                ) : view === "menu" ? (
                  /* LOGGED IN USER VIEW */
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Dashboard Console</span>
                      <div className="h-1 w-4 rounded-full bg-emerald-400" />
                    </div>
                    
                    <MenuOption 
                      icon={<User size={18} />} 
                      label="Public Identity" 
                      onClick={() => navigate("/user-account")}
                      color={isAdmin ? "text-amber-600" : "text-blue-600"}
                    />
                    
                    <MenuOption 
                      icon={<Settings size={18} />} 
                      label="Preferences" 
                      onClick={() => setView("edit")} 
                    />

                    {isAdmin && (
                      <MenuOption 
                        icon={<ShieldCheck size={18} />} 
                        label="System Root" 
                        onClick={() => navigate("/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3")}
                        isSpecial={true}
                      />
                    )}

                    <div className="pt-3">
                      <button
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-red-600 text-white transition-all shadow-lg active:scale-95 text-[10px] font-black uppercase tracking-widest"
                      >
                        <LogOut size={16} /> Terminate
                      </button>
                    </div>
                  </div>
                ) : (
                  /* EDIT VIEW */
                  <motion.div initial={{ x: 10, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="space-y-4">
                    <button onClick={() => setView("menu")} className="flex items-center gap-1.5 text-slate-400 hover:text-slate-900 transition-colors">
                      <ArrowLeft size={18} strokeWidth={2.5} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Return</span>
                    </button>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Identity Name</label>
                      <input
                        id="nameInput"
                        type="text"
                        defaultValue={displayName}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-2xl text-[13px] font-bold outline-none"
                      />
                    </div>
                    <button
                      onClick={() => {
                         const val = document.getElementById("nameInput").value;
                         if(val.trim()) { 
                            setDisplayName(val); 
                            localStorage.setItem(`userDisplayName_${user.email}`, val); 
                            setView("menu"); 
                         }
                      }}
                      className={`w-full py-3.5 rounded-2xl text-white font-black text-[11px] tracking-widest shadow-lg active:scale-95 transition-all ${isAdmin ? 'bg-amber-600' : 'bg-blue-600'}`}
                    >
                      <Save size={16} className="inline mr-2" /> COMMIT UPDATES
                    </button>
                  </motion.div>
                )}
              </div>

              {/* --- FOOTER --- */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                 {user ? (
                   <div className="flex items-center gap-2 text-slate-400">
                      <Clock size={12} />
                      <span className="text-[10px] font-bold uppercase tracking-tight">{lastLoginTime}</span>
                   </div>
                 ) : (
                   <div className="flex items-center gap-2 text-slate-400">
                      <ShieldAlert size={12} />
                      <span className="text-[10px] font-bold uppercase">Restricted Session</span>
                   </div>
                 )}
                 <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic">V-2.0 Secure</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuOption({ icon, label, onClick, color = "text-slate-500", isSpecial = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full group flex items-center justify-between p-3 rounded-2xl transition-all ${
        isSpecial ? "bg-amber-50/50 hover:bg-amber-100/50 border border-amber-100/30" : "hover:bg-slate-50 border border-transparent"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`p-2 rounded-xl bg-white shadow-sm border border-slate-100 group-hover:scale-110 transition-transform ${isSpecial ? "text-amber-600" : color}`}>
          {icon}
        </div>
        <span className={`text-[13px] font-bold tracking-tight ${isSpecial ? "text-amber-900" : "text-slate-700"}`}>{label}</span>
      </div>
      <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 group-hover:text-slate-900 transition-all" />
    </button>
  );
}