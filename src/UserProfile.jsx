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

  // --- 1. ADMIN PROTECTION LOGIC (Strict Check) ---
  const isAdmin = useMemo(() => {
    if (!user || !user.email) return false;
    return user.email.toLowerCase() === SECURITY_CONFIG.ADMIN_EMAIL.toLowerCase();
  }, [user]);

  const adminGradient = "from-[#1e293b] to-[#0f172a]";
  const userGradient = "from-[#4f46e5] to-[#7c3aed]";

  // --- 2. SESSION & NAME HANDLER (With Error Handling) ---
  useEffect(() => {
    if (!user?.email) return;

    try {
      const displayName = user.displayName || user.email.split("@")[0];
      const sessionKey = "mpqp_active_sessions";
      
      // Safe LocalStorage parsing
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

      // Keep only last 5 sessions for security/performance
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

  // --- 3. SECURE ACTIONS ---
  const handleToggle = () => {
    if (!user) {
      navigate("/signup"); // Redirect if guest clicks
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

  // Close on Outside Click
  useEffect(() => {
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Safe Name Getter
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
        className="relative flex items-center focus:outline-none p-1 active:scale-90 transition-transform"
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
            {/* Mobile Overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/10 backdrop-blur-[4px] z-[998] md:hidden"
              onClick={() => setOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="z-[999] bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] rounded-[32px] border border-slate-200 overflow-hidden flex flex-col fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-[340px] max-h-[85vh] md:absolute md:top-full md:left-auto md:right-0 md:translate-x-0 md:translate-y-0 md:mt-4 md:w-[350px]"
            >
              {/* --- HEADER --- */}
              <div className="px-6 pt-8 pb-6 flex flex-col items-center border-b border-slate-50 flex-shrink-0 bg-white">
                <div className="relative mb-3">
                  <div className="w-16 h-16 rounded-full overflow-hidden ring-4 ring-slate-50 shadow-md bg-slate-100 flex items-center justify-center">
                    {user?.photoURL ? (
                       <img src={user.photoURL} className="w-full h-full object-cover" alt="profile" />
                    ) : (
                       <UserCircle2 size={40} className="text-slate-300" />
                    )}
                  </div>
                  {isAdmin && (
                    <div className="absolute -bottom-1 -right-1 bg-amber-500 text-white p-1 rounded-full shadow-lg border-2 border-white">
                      <Crown size={12} />
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-bold text-slate-800 tracking-tight">
                  Hi, {getFirstName()}!
                </h2>
                <p className="text-[12px] text-slate-400 font-medium truncate w-full text-center px-6">{user?.email}</p>
              </div>

              {/* --- SCROLLABLE AREA --- */}
              <div className="overflow-y-auto no-scrollbar flex-1 bg-white p-3">
                <div className="space-y-2">
                  {/* Account Settings */}
                  <button 
                    onClick={() => { navigate("/user-account"); setOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-4 hover:bg-slate-50 rounded-[24px] transition-all group"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-100 group-hover:bg-white group-hover:shadow-sm">
                      <Fingerprint size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Manage Account</span>
                    <ChevronRight size={16} className="ml-auto text-slate-300" />
                  </button>

                  {/* Account Switcher */}
                  <div className="rounded-[28px] border border-slate-100 bg-[#f8fafc]/60 overflow-hidden">
                    <button 
                      onClick={() => setShowAccounts(!showAccounts)}
                      className="w-full px-6 py-4 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest"
                    >
                      <span>Switch Profiles</span>
                      {showAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                    
                    <AnimatePresence>
                      {showAccounts && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="px-2 pb-3 space-y-1">
                            {allUsers.length > 0 ? allUsers.map((acc, i) => (
                              <div key={i} onClick={() => switchAccount(acc)} className="px-4 py-3 flex items-center gap-3 hover:bg-white rounded-[18px] cursor-pointer transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50 border border-transparent hover:border-slate-100">
                                <img src={acc.photo || `https://ui-avatars.com/api/?name=${acc.email}`} className="w-8 h-8 rounded-full" alt="acc" />
                                <div className="flex flex-col truncate flex-1 text-left">
                                  <span className="text-xs font-bold text-slate-700">{acc.name}</span>
                                  <span className="text-[10px] text-slate-400 truncate">{acc.email}</span>
                                </div>
                                <LogIn size={14} className="text-slate-300" />
                              </div>
                            )) : (
                              <p className="text-[10px] text-center text-slate-300 py-2 font-bold uppercase tracking-tighter">No Other Sessions</p>
                            )}
                            <button onClick={handleAddAccount} className="w-full px-4 py-4 flex items-center gap-3 text-blue-600 hover:bg-white rounded-[18px] transition-all mt-1">
                              <Plus size={18} />
                              <span className="text-xs font-bold uppercase tracking-wider">Add Another Account</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Admin Panel (ONLY FOR ADMIN) */}
                  {isAdmin && (
                    <div 
                      onClick={() => { navigate("/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"); setOpen(false); }} 
                      className="p-4 bg-slate-900 rounded-[24px] flex items-center justify-between cursor-pointer hover:shadow-xl hover:shadow-slate-200 transition-all border border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-xl text-amber-400">
                          <ShieldCheck size={20} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="text-[11px] font-black text-white uppercase tracking-widest">Admin Console</span>
                          <span className="text-[9px] text-slate-500 font-bold uppercase">Root Access</span>
                        </div>
                      </div>
                      <ChevronRight size={16} className="text-slate-500" />
                    </div>
                  )}
                </div>
              </div>

              {/* --- FOOTER --- */}
              <div className="border-t border-slate-100 bg-slate-50/50 p-4 flex-shrink-0">
                <button 
                  onClick={() => {
                    localStorage.removeItem("mpqp_active_sessions");
                    if (onLogout) onLogout();
                    setOpen(false);
                  }}
                  className="w-full p-4 flex items-center justify-center gap-2 bg-white hover:bg-red-50 text-slate-600 hover:text-red-600 rounded-[22px] transition-all font-bold text-xs uppercase tracking-wide shadow-sm border border-slate-100"
                >
                  <LogOut size={16} />
                  Sign out all profiles
                </button>
                
                <div className="flex items-center justify-between px-2 mt-4 opacity-50">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={10} />
                    <span className="text-[9px] font-bold">{lastLoginTime}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ShieldAlert size={10} className="text-slate-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter tracking-[1px]">Security Guard v2</span>
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