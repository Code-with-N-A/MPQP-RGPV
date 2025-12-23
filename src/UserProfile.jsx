import React, { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "./firebase"; 
import {
  LogOut, ShieldCheck, Clock, Crown, 
  ChevronRight, UserCircle2, LogIn, ShieldAlert, Plus, 
  ChevronDown, ChevronUp, Fingerprint
} from "lucide-react";

// --- SECURITY PROTOCOL: Hard-Locked Admin Email ---
const SECURITY_CONFIG = Object.freeze({
  ADMIN_EMAIL: "codewithna73@gmail.com"
});

export default function UserProfile({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [lastLoginTime, setLastLoginTime] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  // --- 1. ADMIN PROTECTION LOGIC ---
  const isAdmin = useMemo(() => {
    if (!user || !user.email) return false;
    return user.email.toLowerCase() === SECURITY_CONFIG.ADMIN_EMAIL.toLowerCase();
  }, [user]);

  const adminGradient = "from-[#1e293b] to-[#0f172a]";
  const userGradient = "from-[#4f46e5] to-[#7c3aed]";

  // --- 2. HIDE ON SCROLL LOGIC ---
  useEffect(() => {
    const handleScroll = () => {
      if (open) setOpen(false);
    };
    if (open) {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }
    return () => window.removeEventListener("scroll", handleScroll);
  }, [open]);

  // --- 3. SESSION HANDLER ---
  useEffect(() => {
    if (!user?.email) return;

    try {
      const displayName = user.displayName || user.email.split("@")[0];
      const sessionKey = "mpqp_active_sessions";
      
      let sessions = [];
      const stored = localStorage.getItem(sessionKey);
      if (stored) {
        sessions = JSON.parse(stored);
        if (!Array.isArray(sessions)) sessions = [];
      }
      
      const currentUserData = {
        email: user.email,
        name: displayName,
        photo: user.photoURL || "",
        uid: user.uid,
        lastActive: Date.now()
      };

      const userIndex = sessions.findIndex(u => u.email === user.email);
      if (userIndex > -1) {
        sessions[userIndex] = currentUserData;
      } else {
        sessions.push(currentUserData);
      }

      const limitedSessions = sessions.slice(-5);
      localStorage.setItem(sessionKey, JSON.stringify(limitedSessions));
      setAllUsers(limitedSessions.filter(u => u.email !== user.email));

      const now = new Date();
      setLastLoginTime(now.toLocaleString('en-IN', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      }));
    } catch (err) {
      console.error("Session Sync Error:", err);
    }
  }, [user]);

  const handleToggle = () => {
    if (!user) {
      navigate("/signup");
      return;
    }
    setOpen(!open);
  };

  const switchAccount = async (selectedUser) => {
    try {
      setOpen(false);
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        login_hint: selectedUser.email,
        prompt: 'select_account' 
      });
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Critical Auth Switch Error:", error.message);
    }
  };

  const handleAddAccount = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setOpen(false);
    } catch (error) {
      console.error("Account Add Error:", error.message);
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const getFirstName = () => {
    if (!user) return "Guest";
    const name = user.displayName || user.email?.split('@')[0] || "User";
    return name.split(' ')[0];
  };

  return (
    <div className="relative inline-block font-sans" ref={cardRef}>
      {/* TRIGGER AVATAR */}
      <button
        onClick={handleToggle}
        className="relative flex items-center focus:outline-none p-1 active:scale-95 transition-transform"
      >
        <div className={`w-10 h-10 rounded-full p-[2px] shadow-sm ${user ? `bg-gradient-to-tr ${isAdmin ? adminGradient : userGradient}` : 'bg-slate-200'}`}>
          <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden flex items-center justify-center">
            {user?.photoURL ? (
              <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt="avatar" />
            ) : (
              <UserCircle2 className="w-full h-full text-slate-300" />
            )}
          </div>
        </div>
      </button>

      {/* DROPDOWN MENU */}
      <AnimatePresence>
        {open && user && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-[1px] z-[998] md:hidden"
              onClick={() => setOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="z-[999] bg-white shadow-[0_30px_70px_-15px_rgba(0,0,0,0.35)] rounded-[12px] border border-slate-200 overflow-hidden flex flex-col fixed top-[80px] left-1/2 -translate-x-1/2 w-[95vw] max-w-[400px] max-h-[85vh] md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:mt-5"
            >
              {/* --- SUBSCRIPTION-STYLE PREMIUM HEADER --- */}
              <div className="relative flex flex-col items-center flex-shrink-0 bg-white">
                
                {/* SVG Abstract Background Header */}
                <div className={`w-full h-24 relative overflow-hidden ${isAdmin ? 'bg-[#1a1a1a]' : 'bg-[#4f46e5]'}`}>
                  {/* The SVG Wave Pattern */}
                  <svg className="absolute bottom-0 w-full h-full opacity-30" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <path 
                      fill={isAdmin ? "#fbbf24" : "#ffffff"} 
                      d="M0,128L48,144C96,160,192,192,288,181.3C384,171,480,117,576,112C672,107,768,149,864,165.3C960,181,1056,171,1152,144C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                    ></path>
                  </svg>

                  {/* Top Badge Overlay */}
                  <div className="absolute inset-0 flex items-start justify-center pt-4">
                    <div className={`px-3 py-1 rounded-full backdrop-blur-md border text-[9px] font-black uppercase tracking-[2px] ${isAdmin ? 'bg-amber-500/20 border-amber-500/30 text-amber-400' : 'bg-white/20 border-white/30 text-white'}`}>
                      {isAdmin ? "Super Authority" : "Active Member"}
                    </div>
                  </div>
                </div>

                {/* Profile Avatar (Perfectly Centered and Overlapping) */}
                <div className="relative -mt-10 mb-4">
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={`w-24 h-24 rounded-full p-1.5 shadow-2xl ${isAdmin ? 'bg-gradient-to-tr from-amber-600 to-yellow-300' : 'bg-gradient-to-tr from-indigo-600 to-purple-400'}`}
                  >
                    <div className="w-full h-full rounded-full bg-white p-1 overflow-hidden flex items-center justify-center">
                      {user?.photoURL ? (
                        <img src={user.photoURL} className="w-full h-full rounded-full object-cover" alt="profile" />
                      ) : (
                        <UserCircle2 size={50} className="text-slate-300" />
                      )}
                    </div>
                  </motion.div>
                  {isAdmin && (
                    <div className="absolute bottom-1 right-1 bg-black text-amber-400 p-2 rounded-full shadow-lg border-2 border-white">
                      <ShieldCheck size={16} />
                    </div>
                  )}
                </div>

                {/* Header Text - Spaced Properly to avoid overlap */}
                <div className="text-center px-6 pb-6 w-full">
                  <h2 className="text-2xl font-[900] text-slate-800 tracking-tight flex items-center justify-center gap-2">
                    Hi {getFirstName()} {isAdmin && <Crown size={22} className="text-amber-500 fill-amber-500" />}
                  </h2>
                  <div className="mt-1 flex items-center justify-center gap-2">
                    <span className="h-[1px] w-4 bg-slate-200"></span>
                    <p className="text-[12px] text-slate-400 font-bold truncate max-w-[200px]">{user?.email}</p>
                    <span className="h-[1px] w-4 bg-slate-200"></span>
                  </div>
                </div>
              </div>

              {/* --- SCROLLABLE BODY --- */}
              <div className="overflow-y-auto no-scrollbar flex-1 bg-slate-50/30 p-4 space-y-3">
                
                {/* Account Settings Button */}
                <button 
                  onClick={() => { navigate("/user-account"); setOpen(false); }}
                  className="w-full flex items-center gap-4 px-5 py-5 bg-white hover:bg-indigo-50/50 rounded-[24px] transition-all group border border-slate-100 shadow-sm active:scale-95"
                >
                  <div className="p-3.5 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 group-hover:rotate-12 transition-transform">
                    <Fingerprint size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                      <span className="text-[14px] font-[800] text-slate-700 uppercase tracking-tight">Personal Core</span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {user?.uid?.slice(0, 8)}...</span>
                  </div>
                  <ChevronRight size={18} className="ml-auto text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                </button>

                {/* Multiple Accounts Logic */}
                <div className="rounded-[28px] border border-slate-100 bg-white overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setShowAccounts(!showAccounts)}
                    className="w-full px-6 py-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[3px]"
                  >
                    <span>Switch Identity</span>
                    <div className={`transition-transform duration-300 ${showAccounts ? 'rotate-180' : ''}`}>
                      <ChevronDown size={16} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showAccounts && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }} 
                        className="overflow-hidden bg-slate-50/50"
                      >
                        <div className="px-4 pb-4 space-y-2.5">
                          {allUsers.map((acc, i) => (
                            <div key={i} onClick={() => switchAccount(acc)} className="px-4 py-3 flex items-center gap-3 bg-white hover:border-indigo-200 rounded-[20px] cursor-pointer transition-all border border-slate-100 shadow-sm">
                              <img src={acc.photo || `https://ui-avatars.com/api/?name=${acc.email}`} className="w-9 h-9 rounded-full border border-slate-100 shadow-sm" alt="acc" />
                              <div className="flex flex-col truncate flex-1 text-left">
                                <span className="text-xs font-black text-slate-700">{acc.name}</span>
                                <span className="text-[10px] text-slate-400 font-bold truncate">{acc.email}</span>
                              </div>
                              <LogIn size={14} className="text-indigo-200" />
                            </div>
                          ))}
                          <button onClick={handleAddAccount} className="w-full px-4 py-4 flex items-center gap-3 text-indigo-600 hover:bg-white rounded-[20px] transition-all group border-2 border-dashed border-slate-200 hover:border-indigo-400">
                            <div className="p-1.5 rounded-full bg-indigo-50 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                              <Plus size={18} />
                            </div>
                            <span className="text-xs font-black uppercase tracking-[2px]">New Session</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Admin Console - Hidden for users */}
                {isAdmin && (
                  <motion.div 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => { navigate("/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"); setOpen(false); }} 
                    className="relative p-5 bg-[#0f172a] rounded-[28px] flex items-center justify-between cursor-pointer overflow-hidden group shadow-xl"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-amber-500/20 transition-all"></div>
                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-3 bg-amber-500 rounded-2xl text-black shadow-lg shadow-amber-500/20">
                        <ShieldCheck size={24} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[14px] font-black text-white uppercase tracking-wider">Root Access</span>
                        <span className="text-[9px] text-amber-400 font-black uppercase tracking-[2px]">System Admin Mode</span>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-600 group-hover:text-amber-500 transition-colors" />
                  </motion.div>
                )}
              </div>

              {/* --- PREMIUM FOOTER --- */}
              <div className="bg-white p-6 flex-shrink-0">
                <button 
                  onClick={() => {
                    localStorage.removeItem("mpqp_active_sessions");
                    if (onLogout) onLogout();
                    setOpen(false);
                  }}
                  className={`w-full py-5 flex items-center justify-center gap-3 rounded-[22px] transition-all font-black text-[12px] uppercase tracking-[3px] border shadow-md active:scale-95 group ${isAdmin ? 'bg-amber-50 hover:bg-amber-600 hover:text-white border-amber-100 text-amber-700 shadow-amber-100' : 'bg-slate-900 hover:bg-red-600 text-white border-transparent shadow-slate-200'}`}
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Sign Out Portal
                </button>
                
                <div className="flex items-center justify-between px-2 mt-6">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Clock size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tighter">{lastLoginTime}</span>
                  </div>
                  <div className="flex items-center gap-1.5 opacity-40">
                    <ShieldAlert size={12} className="text-slate-400" />
                    <span className="text-[9px] font-black tracking-[1px] text-slate-400 uppercase">MPQP v2.0</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}