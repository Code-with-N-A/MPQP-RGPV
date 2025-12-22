import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiAward, FiX, FiSearch, FiHome, FiUploadCloud, FiActivity, FiArrowRight, FiBell } from "react-icons/fi";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

function Nave() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false); // Mobile search state
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  // 1. Systematic Scroll Handler
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. Systematic Menu Items
  const menuItems = [
    { name: "Home", path: "/Home", icon: <FiHome /> },
    { name: "Paper Upload", path: "/paper-upload", icon: <FiUploadCloud /> },
    { name: "User Status", path: "/user-status", icon: <FiActivity /> },
    { name: "TOP 10 Users", path: "/Top-10-user", icon: <FiAward /> },
  ];

  // 3. Search & Menu Toggles
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch && menuOpen) setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen && showSearch) setShowSearch(false);
  };

  // 4. Firebase Auth Connection
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          email: currentUser.email,
          photoURL: currentUser.photoURL || "",
        });
      } else setUser(null);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setMenuOpen(false);
  };

  // --- PREMIUM LOGO ---
  const MPQPLogo = () => (
    <div className="flex items-center gap-3 group cursor-pointer">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-blue-600 blur-md opacity-20 group-hover:opacity-40 transition-opacity"></div>
        <svg width="40" height="40" viewBox="0 0 100 100" className="relative drop-shadow-xl transition-transform duration-700 group-hover:rotate-[360deg]">
          <rect width="100" height="100" rx="24" fill="url(#premiumGrad)" />
          <path d="M25 70V30L50 55L75 30V70" stroke="white" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round" />
          <defs>
            <linearGradient id="premiumGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e40af" />
              <stop offset="100%" stopColor="#7e22ce" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="flex-col border-l border-gray-200 pl-3">
        <h1 className="text-xl font-[900] tracking-tighter text-slate-900 leading-none">
          MP<span className="text-blue-600">QP</span>
        </h1>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Academic Vault</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Scrollbar Hide CSS Injection */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <nav
        className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 font-[Poppins] ${scrolled
          ? "py-2 bg-white/80 backdrop-blur-xl shadow-sm border-b border-slate-200/50"
          : "py-5 bg-white"
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 flex items-center justify-between gap-4">

          {/* LOGO */}
          <NavLink to="/" className="flex-shrink-0">
            <MPQPLogo />
          </NavLink>

          {/* DESKTOP SEARCH */}
          <div className="hidden lg:flex flex-1 max-w-xl">
            <SearchBar
              searchText={searchText}
              setSearchText={setSearchText}
              onClose={() => setSearchText("")}
            />
          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-2 md:gap-4">
            <ul className="hidden xl:flex items-center gap-1">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive ? "bg-blue-50 text-blue-600" : "text-slate-500 hover:text-slate-900"
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                </li>
              ))}
            </ul>

            <button
              onClick={toggleSearch}
              className="lg:hidden p-2.5 rounded-full text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
            >
              {showSearch ? <FiX size={22} /> : <FiSearch size={22} />}
            </button>

            <button className="hidden sm:flex p-2.5 rounded-full text-slate-400 hover:text-blue-600 relative">
              <FiBell size={20} />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            </button>

            <UserProfile
              user={user}
              onLogout={handleLogout}
              sidebarClose={() => setMenuOpen(false)}
            />

            <button
              onClick={toggleMenu}
              className="xl:hidden p-2.5 rounded-xl bg-slate-900 text-white shadow-lg active:scale-95 transition-all"
            >
              {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`fixed top-[68px] left-0 w-full z-[90] bg-white border-b border-slate-200 p-4 transition-all duration-300 transform lg:hidden ${showSearch ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <SearchBar
          searchText={searchText}
          setSearchText={setSearchText}
          onClose={() => setShowSearch(false)}
        />
      </div>

      {/* MOBILE SIDEBAR */}
      <div
        className={`fixed inset-0 z-[110] xl:hidden transition-all duration-500 ${menuOpen ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
        <div className={`absolute top-0 right-0 h-full w-full max-w-[320px] bg-white transform transition-transform duration-500 flex flex-col ${menuOpen ? "translate-x-0" : "translate-x-full"
          }`}>
          <div className="p-6 flex items-center justify-between border-b border-slate-50">
            <MPQPLogo />
            <button onClick={() => setMenuOpen(false)} className="p-2 bg-slate-50 rounded-full text-slate-400"><FiX size={20} /></button>
          </div>

          {/* Added 'hide-scrollbar' class here */}
          <div className="flex-1 overflow-y-auto py-8 px-4 hide-scrollbar">
            <div className="mb-8 px-2">
              <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl">
                <div className="w-10 h-10 rounded-full border border-blue-500 overflow-hidden bg-white">
                  <img src={user?.photoURL || "https://ui-avatars.com/api/?name=User"} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-white font-bold text-xs truncate w-32">{user?.email || "Guest Account"}</span>
                  <span className="text-blue-400 text-[9px] font-black uppercase tracking-widest">Premium Member</span>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-4">Main Menu</p>
              {menuItems.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "text-slate-600 hover:bg-blue-50"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-4">
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-bold">{item.name}</span>
                      </div>
                      <FiArrowRight className={`transition-all ${isActive ? "opacity-100" : "opacity-0"}`} />
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="p-6">
            <button onClick={handleLogout} className="w-full py-4 rounded-2xl border border-slate-200 font-bold text-slate-600 hover:bg-red-50">
              Sign Out Securely
            </button>
          </div>
        </div>
      </div>

      <div className="h-11"></div>
    </>
  );
}

export default Nave;