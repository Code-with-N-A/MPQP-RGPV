import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, LogOut, Edit3, ArrowLeft,
  Save, Settings, ShieldCheck, ExternalLink,
  Calendar, Clock
} from "lucide-react";

export default function UserProfile({ user, onLogout, sidebarClose }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [displayName, setDisplayName] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  const isAdmin = user?.email === "codewithna73@gmail.com";

  useEffect(() => {
    if (!user?.email) return;
    const savedName = localStorage.getItem(`userDisplayName_${user.email}`);
    const savedLastLogin = localStorage.getItem(`userLastLogin_${user.email}`);

    if (savedName) setDisplayName(savedName);

    // Initializing User Info
    const nameFromLocal = localStorage.getItem(`userDisplayName_${user.email}`);
    const finalName = nameFromLocal || user.displayName || user.email.split("@")[0];
    setDisplayName(finalName);

    const now = new Date();
    const formattedLastLogin = now.toLocaleString('en-IN', {
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
    });
    setLastLoginTime(formattedLastLogin);
  }, [user]);

  // Close on outside click
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
    <div className="relative" ref={cardRef}>
      {/* Profile Avatar Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setView("menu");
        }}
        className="relative group focus:outline-none"
      >
        <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 transition-transform duration-300 group-hover:scale-110 group-active:scale-95 shadow-lg">
          <div className="w-full h-full rounded-full bg-white p-[2px]">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                <User className="text-gray-400 w-5 h-5" />
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="absolute right-0 mt-4 w-72 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-gray-100 z-[200] overflow-hidden"
          >
            {!user ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Welcome Guest</h3>
                <p className="text-xs text-gray-500 mt-1 mb-4">Sign in to sync your progress across devices.</p>
                <button
                  onClick={() => { navigate("/Signup"); setOpen(false); }}
                  className="w-full bg-indigo-600 text-white py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100"
                >
                  Join Now
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {/* Header Info */}
                <div className="p-5 bg-gray-50/50">
                  {view !== "menu" && (
                    <button onClick={() => setView("menu")} className="flex items-center gap-1 text-xs font-bold text-indigo-600 mb-3 hover:underline">
                      <ArrowLeft size={14} /> BACK
                    </button>
                  )}

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user?.photoURL || "https://ui-avatars.com/api/?name=" + displayName}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-white shadow-sm"
                        alt="avatar"
                      />
                      {isAdmin && (
                        <div className="absolute -bottom-1 -right-1 bg-yellow-400 rounded-full p-0.5 border-2 border-white">
                          <ShieldCheck size={10} className="text-yellow-900" />
                        </div>
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="font-bold text-gray-900 truncate flex items-center gap-1">
                        {displayName}
                        {isAdmin && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded-md uppercase tracking-wider font-black">Admin</span>}
                      </h4>
                      <p className="text-[11px] text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* --- MENU VIEW --- */}
                {view === "menu" && (
                  <div className="p-2 flex flex-col gap-1">
                    <MenuButton
                      icon={<ExternalLink size={18} />}
                      label="Public Profile"
                      onClick={() => { navigate("/user-account"); setOpen(false); }}
                    />
                    <MenuButton
                      icon={<Edit3 size={18} />}
                      label="Settings"
                      onClick={() => setView("edit")}
                    />

                    {isAdmin && (
                      <MenuButton
                        icon={<Settings size={18} className="text-indigo-600" />}
                        label="Control Panel"
                        highlight
                        onClick={() => { navigate("/@-nitesh-748933*2"); setOpen(false); }}
                      />
                    )}

                    <div className="h-px bg-gray-100 my-1 mx-2" />

                    <div className="px-4 py-2 flex items-center justify-between text-[10px] text-gray-400 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {lastLoginTime}</span>
                    </div>

                    <button
                      onClick={() => { onLogout(); setOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-500 bg-red-50/50 hover:bg-red-50 border border-red-100/50 rounded-xl transition-all duration-200 font-bold text-sm"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}

                {/* --- EDIT VIEW --- */}
                {view === "edit" && (
                  <motion.div initial={{ x: 20 }} animate={{ x: 0 }} className="p-5">
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Display Name</label>
                    <input
                      autoFocus
                      type="text"
                      defaultValue={displayName}
                      className="w-full mt-2 px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      onKeyDown={(e) => e.key === "Enter" && handleSave(e.target.value)}
                      id="nameInput"
                    />
                    <button
                      onClick={() => handleSave(document.getElementById("nameInput").value)}
                      className="w-full mt-4 bg-gray-900 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-black transition-all"
                    >
                      <Save size={16} /> Save Changes
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Sub-component for Menu Items to keep code clean
function MenuButton({ icon, label, onClick, highlight = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group ${highlight ? "bg-indigo-50/50 text-indigo-700 hover:bg-indigo-50" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
    >
      <span className={`${highlight ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-600"} transition-colors`}>
        {icon}
      </span>
      {label}
    </button>
  );
}