import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { FiMenu, FiX, FiSearch } from "react-icons/fi";
import SearchBar from "./SearchBar";
import UserProfile from "./UserProfile";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";

function Nave() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [user, setUser] = useState(null);

  const menuItems = ["Home", "Paper Upload","User Status"];

  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (!showSearch && menuOpen) setMenuOpen(false);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    if (!menuOpen && showSearch) setShowSearch(false);
  };

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
  };

  useEffect(() => {
    if (!showSearch) return;

    const close = (e) => {
      const searchBox = document.getElementById("mobile-search-box");
      if (searchBox && !searchBox.contains(e.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [showSearch]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between bg-white/95 backdrop-blur-md shadow-md/5 px-4 lg:px-6 py-2 font-[Poppins]">
        {/* Logo - Simplified SVG without Circle */}
        <div className="flex items-center">
          <svg
            width="80"
            height="40"
            viewBox="0 0 80 40"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-md"
          >
            <text x="40" y="25" textAnchor="middle" fill="url(#textGradient)" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">
              MPQP
            </text>
            <defs>
              <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Desktop / Large Tablet Search */}
        <div className="hidden lg:flex flex-1 justify-center relative">
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onClose={() => setSearchText("")}
          />
        </div>

        {/* Desktop / Large Tablet Menu */}
        <div className="hidden lg:flex items-center gap-6">
          <ul className="flex gap-6 font-medium">
            {menuItems.map((item) => (
              <li key={item}>
                <NavLink
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className={({ isActive }) =>
                    `pb-1 transition-all duration-300 ease-in-out ${
                      isActive
                        ? "border-b-2 border-orange-400 text-orange-500 scale-105"
                        : "hover:border-b-2 hover:border-orange-400 hover:scale-105"
                    }`
                  }
                >
                  {item}
                </NavLink>
              </li>
            ))}
          </ul>

          <UserProfile
            user={user}
            onLogout={handleLogout}
            sidebarClose={() => setMenuOpen(false)}
          />
        </div>

        {/* Mobile + Tablet Icons */}
        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={toggleSearch}
            className="p-2 rounded-full hover:bg-orange-100 transition-shadow shadow-sm"
          >
            <FiSearch className="text-gray-700 text-xl" />
          </button>

          <button
            onClick={toggleMenu}
            className="p-2 rounded-full hover:bg-orange-100 transition-shadow shadow-sm"
          >
            {menuOpen ? (
              <FiX className="text-orange-500 text-2xl" />
            ) : (
              <FiMenu className="text-gray-700 text-2xl" />
            )}
          </button>
        </div>
      </nav>

      {/* Blur Overlay */}
      {showSearch && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setShowSearch(false)}
        ></div>
      )}

      {/* Mobile + Tablet Search Box */}
      {showSearch && (
        <div
          id="mobile-search-box"
          className="fixed top-16 left-2 right-2 w-[calc(100%-1rem)] z-50 lg:hidden bg-white rounded-xl shadow-lg p-3"
        >
          <SearchBar
            searchText={searchText}
            setSearchText={setSearchText}
            onClose={() => setShowSearch(false)}
          />
        </div>
      )}

      {/* Sidebar Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMenuOpen(false)}
        ></div>
      )}

      {/* Mobile + Tablet Sidebar */}
      <div
        className={`fixed top-14 right-0 h-full w-3/4 sm:w-1/2 bg-white z-50 shadow-2xl/20 border-t border-gray-300 transform duration-500 ease-in-out lg:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Sidebar Top */}
        <div className="flex items-center justify-between px-4 py-4 bg-blue-50 border-b border-orange-200 rounded-bl-xl">
          {/* Logo in Sidebar - Smaller SVG without Circle */}
          <div className="flex items-center">
            <svg
              width="60"
              height="30"
              viewBox="0 0 80 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
            >
              <text x="40" y="25" textAnchor="middle" fill="url(#textGradientSidebar)" fontSize="20" fontWeight="bold" fontFamily="Arial, sans-serif">
                MPQP
              </text>
              <defs>
                <linearGradient id="textGradientSidebar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <UserProfile
            user={user}
            onLogout={handleLogout}
            sidebarClose={() => setMenuOpen(false)}
          />
        </div>

        {/* Sidebar Menu Links */}
        <ul className="flex flex-col gap-3 w-full px-6 mt-4 font-[Poppins]">
          {menuItems.map((item) => (
            <li key={item}>
              <NavLink
                to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-3 text-lg transition-all rounded-lg ${
                    isActive
                      ? "text-orange-500 bg-orange-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`
                }
              >
                {item}
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default Nave;
