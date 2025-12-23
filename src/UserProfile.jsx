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
    if (!user?.email) return false;
    return user.email.toLowerCase() === SECURITY_CONFIG.ADMIN_EMAIL.toLowerCase();
  }, [user]);

  const adminGradient = "from-[#1e293b] to-[#0f172a]";
  const userGradient = "from-[#4f46e5] to-[#7c3aed]";

  // --- 2. SESSION & NAME HANDLER ---
  useEffect(() => {
    if (!user) return;
    const displayName = user.displayName || user.email.split("@")[0];
    let sessions = JSON.parse(localStorage.getItem("mpqp_active_sessions") || "[]");
    
    const currentUserData = {
      email: user.email,
      name: displayName,
      photo: user.photoURL,
      uid: user.uid,
      lastActive: Date.now()
    };

    const userIndex = sessions.findIndex(u => u.email === user.email);
    if (userIndex > -1) {
      sessions[userIndex] = currentUserData;
    } else {
      sessions.push(currentUserData);
    }

    localStorage.setItem("mpqp_active_sessions", JSON.stringify(sessions));
    setAllUsers(sessions.filter(u => u.email !== user.email));

    const now = new Date();
    setLastLoginTime(now.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    }));
  }, [user]);

  // --- 3. ACCOUNT ACTIONS ---
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
      console.error("Critical Auth Error:", error.message);
      navigate("/signup");
    }
  };

  const handleAddAccount = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      await signInWithPopup(auth, provider);
      setOpen(false);
    } catch (error) {
      console.error("Auth Error:", error.message);
    }
  };

  useEffect(() => {
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <div className="relative inline-block font-sans" ref={cardRef}>
      {/* TRIGGER AVATAR */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center focus:outline-none p-1 active:scale-90 transition-transform"
      >
        <div className={`w-10 h-10 rounded-full p-[2px] shadow-sm ${user ? `bg-gradient-to-tr ${isAdmin ? adminGradient : userGradient}` : 'bg-slate-200'}`}>
          <div className="w-full h-full rounded-full bg-white p-[1.5px] overflow-hidden">
            {user ? (
              <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} className="w-full h-full rounded-full object-cover" alt="avatar" />
            ) : (
              <UserCircle2 className="w-full h-full text-slate-300" />
            )}
          </div>
        </div>
      </button>

      {/* OVERLAY FOR MOBILE (Focus background) */}
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/5 backdrop-blur-[2px] z-[998] md:hidden"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={`
              z-[999] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] rounded-[32px] border border-slate-200 overflow-hidden flex flex-col
              /* Responsive Logic */
              fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[340px] max-h-[85vh]
              md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-3 md:w-[340px]
            `}
          >
            {/* --- HEADER (Fixed) --- */}
            <div className="px-6 pt-7 pb-5 flex flex-col items-center border-b border-slate-50 flex-shrink-0 bg-white">
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-slate-50 shadow-sm bg-slate-100">
                  <img src={user?.photoURL} className="w-full h-full object-cover" alt="profile" />
                </div>
                {isAdmin && (
                  <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                    <Crown size={12} />
                  </div>
                )}
              </div>
              <h2 className="text-lg font-bold text-slate-800 tracking-tight text-center">
                Hi, {user.displayName?.split(' ')[0] || user.email.split('@')[0]}!
              </h2>
              <p className="text-[12px] text-slate-400 font-medium truncate w-full text-center px-4">{user.email}</p>
            </div>

            {/* --- SCROLLABLE AREA (Responsive Buttons) --- */}
            <div className="overflow-y-auto no-scrollbar flex-1 bg-white">
              <div className="p-3 space-y-2">
                
                {/* ACCOUNT ACTION */}
                <button 
                  onClick={() => { navigate("/user-account"); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 rounded-[22px] transition-all group active:bg-slate-100"
                >
                  <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-white group-hover:shadow-sm transition-all border border-slate-100">
                    <Fingerprint size={18} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">Account Settings</span>
                  <ChevronRight size={16} className="ml-auto text-slate-300" />
                </button>

                {/* SESSIONS AREA */}
                <div className="rounded-[24px] border border-slate-100 bg-[#f8fafc]/50 overflow-hidden">
                  <button 
                    onClick={() => setShowAccounts(!showAccounts)}
                    className="w-full px-5 py-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]"
                  >
                    <span>Switch Profiles</span>
                    {showAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>

                  <AnimatePresence>
                    {showAccounts && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="pb-2 space-y-1">
                          {allUsers.length > 0 ? allUsers.map((acc, i) => (
                            <div 
                              key={i} 
                              onClick={() => switchAccount(acc)}
                              className="mx-2 px-4 py-2.5 flex items-center gap-3 hover:bg-white rounded-xl cursor-pointer transition-all active:bg-white shadow-sm shadow-transparent hover:shadow-slate-200/50"
                            >
                              <img src={acc.photo} className="w-8 h-8 rounded-full shadow-sm" alt="acc" />
                              <div className="flex flex-col truncate flex-1 text-left">
                                <span className="text-xs font-bold text-slate-700">{acc.name}</span>
                                <span className="text-[10px] text-slate-400 truncate">{acc.email}</span>
                              </div>
                              <LogIn size={14} className="text-slate-200" />
                            </div>
                          )) : (
                            <p className="text-[10px] text-center text-slate-300 py-2 font-bold uppercase italic">No other sessions</p>
                          )}
                          <button 
                            onClick={handleAddAccount}
                            className="w-full px-5 py-4 flex items-center gap-3 text-blue-600 hover:bg-white transition-all border-t border-slate-100 active:bg-slate-50"
                          >
                            <Plus size={18} />
                            <span className="text-xs font-bold uppercase tracking-wide">Add Account</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* ADMIN CONSOLE AREA */}
                {isAdmin && (
                  <div 
                    onClick={() => { navigate("/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"); setOpen(false); }}
                    className="p-4 bg-slate-900 rounded-[24px] flex items-center justify-between cursor-pointer hover:bg-black transition-all shadow-lg shadow-slate-200 active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                        <ShieldCheck size={20} />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Console Root</span>
                        <span className="text-[9px] text-slate-500 font-bold">Admin Privilege</span>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-slate-600" />
                  </div>
                )}
              </div>
            </div>

            {/* --- FOOTER (Fixed) --- */}
            <div className="border-t border-slate-100 bg-white p-3 flex-shrink-0">
              <button 
                onClick={() => {
                  localStorage.removeItem("mpqp_active_sessions");
                  if (onLogout) onLogout();
                  setOpen(false);
                }}
                className="w-full p-3.5 flex items-center justify-center gap-2 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-[20px] transition-all font-black text-[11px] uppercase tracking-wide active:bg-red-100"
              >
                <LogOut size={16} />
                Sign out all
              </button>
              
              <div className="flex items-center justify-between px-3 mt-2 opacity-40">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock size={10} />
                  <span className="text-[8px] font-black">{lastLoginTime}</span>
                </div>
                <div className="flex items-center gap-1 italic">
                  <ShieldAlert size={10} />
                  <span className="text-[8px] font-bold">Secure-v2</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}