import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, LogOut, ArrowLeft, Save, Settings, 
  ShieldCheck, ExternalLink, Clock, Crown
} from "lucide-react";

export default function UserProfile({ user, onLogout, sidebarClose }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [displayName, setDisplayName] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.email?.toLowerCase() === "codewithna73@gmail.com";

  const getDynamicTheme = () => {
    if (!user) return "from-slate-400 via-slate-500 to-slate-600"; // Login na hone par default
    // Admin (Aap) ke liye Golden theme
    if (isAdmin) return "from-amber-400 via-yellow-500 to-golden-600"; 
    // Users ke liye Indigo/Purple theme
    if (user?.photoURL) return "from-indigo-600 via-purple-500 to-pink-500";
    return "from-blue-500 via-cyan-400 to-emerald-400";
  };

  const currentTheme = getDynamicTheme();

  useEffect(() => {
    if (!user?.email) return;
    const savedName = localStorage.getItem(`userDisplayName_${user.email}`);
    const finalName = savedName || user.displayName || user.email.split("@")[0];
    setDisplayName(finalName);

    const now = new Date();
    const formattedLastLogin = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    setLastLoginTime(formattedLastLogin);
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

  const handleSave = (newName) => {
    if (!user?.email || !newName.trim()) return;
    setDisplayName(newName);
    localStorage.setItem(`userDisplayName_${user.email}`, newName);
    setView("menu");
  };

  return (
    <div className="relative inline-block" ref={cardRef}>
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setView("menu");
        }}
        className="relative group focus:outline-none cursor-pointer"
      >
        <div className={`w-11 h-11 rounded-full p-[2.5px] bg-gradient-to-tr ${currentTheme} transition-all duration-500 group-hover:rotate-12 shadow-xl`}>
          <div className="w-full h-full rounded-full bg-white p-[2px] overflow-hidden flex items-center justify-center">
            {!user ? (
              // Login na hone par SVG User Icon
              <svg viewBox="0 0 24 24" className="w-full h-full text-slate-400 fill-current p-1">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            ) : user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <img 
                src={`https://ui-avatars.com/api/?name=${displayName}&background=random&color=fff&bold=true`} 
                alt="initials" 
                className="w-full h-full rounded-full"
              />
            )}
          </div>
        </div>
        {user && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="absolute right-0 mt-4 w-[90vw] max-w-[320px] max-md:fixed max-md:top-24 max-md:left-1/2 max-md:-translate-x-1/2 bg-white/95 backdrop-blur-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] border border-white/50 z-[200] overflow-hidden rounded-[24px]"
          >
            {user && (
              <div className="absolute top-0 right-0 overflow-hidden w-32 h-32 pointer-events-none">
                <div className={`bg-gradient-to-r ${currentTheme} text-white text-[10px] font-black py-1 px-10 absolute top-5 -right-8 rotate-45 shadow-lg border-b border-white/20 flex items-center justify-center gap-1 uppercase tracking-tighter`}>
                  <Crown size={10} /> {isAdmin ? "ADMIN" : "MPQP USER"}
                </div>
              </div>
            )}

            {!user ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                  <User className="text-indigo-600 w-8 h-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Access Denied</h3>
                <p className="text-xs text-slate-500 mt-2 mb-6">Unlock professional MPQP features by joining our community.</p>
                <button
                  onClick={() => { navigate("/Signup"); setOpen(false); }}
                  className="w-full bg-slate-900 text-white py-3.5 rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95 cursor-pointer"
                >
                  Join MPQP Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                <div className="p-6 pb-4 bg-gradient-to-b from-slate-50/80 to-transparent">
                  {view !== "menu" && (
                    <button 
                      onClick={() => setView("menu")} 
                      className={`flex items-center gap-1.5 text-[11px] font-black mb-4 transition-colors cursor-pointer uppercase tracking-widest ${isAdmin ? "text-amber-600 hover:text-amber-800" : "text-indigo-600 hover:text-indigo-800"}`}
                    >
                      <ArrowLeft size={14} strokeWidth={3} /> Return
                    </button>
                  )}

                  <div className="flex items-center gap-4">
                    <div className="relative group">
                      <div className={`absolute -inset-1 bg-gradient-to-r ${currentTheme} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
                      <img
                        src={user?.photoURL || `https://ui-avatars.com/api/?name=${displayName}&background=f1f5f9&color=64748b`}
                        className="relative w-14 h-14 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                        alt="avatar"
                      />
                      {isAdmin && (
                        <div className="absolute -top-2 -left-2 bg-slate-900 rounded-lg p-1 shadow-lg border border-slate-700">
                          <Crown size={12} className="text-yellow-400" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-black text-slate-900 text-lg truncate flex items-center gap-2">
                        {displayName}
                        {isAdmin && <ShieldCheck size={16} className="text-amber-500" />}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isAdmin ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"}`}>
                          {isAdmin ? "System Admin" : "Verified User"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {view === "menu" && (
                  <div className="p-4 pt-0 flex flex-col gap-1.5">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] px-3 mb-1">Account Menu</div>
                    
                    <MenuButton
                      icon={<ExternalLink size={20} />}
                      label="Public Profile"
                      onClick={() => { navigate("/user-account"); setOpen(false); }}
                      isAdmin={isAdmin}
                    />
                    <MenuButton
                      icon={<Settings size={20} />}
                      label="Account Settings"
                      onClick={() => setView("edit")}
                      isAdmin={isAdmin}
                    />

                    {isAdmin && (
                      <MenuButton
                        icon={<ShieldCheck size={20} />}
                        label="Admin Dashboard"
                        highlight
                        onClick={() => { navigate("/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"); setOpen(false); }}
                        isAdmin={isAdmin}
                      />
                    )}

                    <div className="h-px bg-slate-100/80 my-2 mx-3" />

                    <div className="px-4 py-2 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5"><Clock size={14} strokeWidth={2.5} /> Last Activity: {lastLoginTime}</span>
                    </div>

                    <button
                      onClick={() => { onLogout(); setOpen(false); }}
                      className="w-full flex items-center justify-center gap-3 mt-2 px-4 py-3.5 text-white bg-red-500 hover:bg-red-600 rounded-2xl transition-all duration-300 font-black text-sm shadow-lg shadow-red-200 active:scale-[0.98] cursor-pointer"
                    >
                      <LogOut size={18} strokeWidth={3} /> LOGOUT SESSION
                    </button>
                  </div>
                )}

                {view === "edit" && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Change Identity</label>
                    <div className="relative mt-2.5">
                      <input
                        autoFocus
                        type="text"
                        defaultValue={displayName}
                        className={`w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-800 outline-none transition-all shadow-inner ${isAdmin ? "focus:border-amber-500" : "focus:border-indigo-500"} focus:bg-white`}
                        placeholder="Enter your name"
                        onKeyDown={(e) => e.key === "Enter" && handleSave(e.target.value)}
                        id="nameInput"
                      />
                    </div>
                    <button
                      onClick={() => handleSave(document.getElementById("nameInput").value)}
                      className={`w-full mt-5 text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-all active:scale-95 cursor-pointer ${isAdmin ? "bg-amber-600 hover:bg-amber-700" : "bg-indigo-600 hover:bg-indigo-700"}`}
                    >
                      <Save size={18} strokeWidth={2.5} /> UPDATE PROFILE
                    </button>
                  </motion.div>
                )}
              </div>
            )}
            
            <div className={`h-1.5 w-full bg-gradient-to-r ${currentTheme}`}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon, label, onClick, highlight = false, isAdmin = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 font-bold text-[14px] group cursor-pointer active:scale-[0.97] ${
        highlight 
        ? "bg-amber-50 text-amber-700 hover:bg-amber-100 shadow-sm shadow-amber-100" 
        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className={`${highlight ? "text-amber-600" : `text-slate-400 group-hover:scale-110 ${isAdmin ? "group-hover:text-amber-600" : "group-hover:text-indigo-600"}`} transition-all duration-300`}>
        {icon}
      </span>
      {label}
    </button>
  );
}