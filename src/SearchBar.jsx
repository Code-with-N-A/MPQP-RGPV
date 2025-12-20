import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, FileText, CornerDownLeft, Clock, Command } from "lucide-react";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [placeholder, setPlaceholder] = useState("");
  const [projIndex, setProjIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  const inputRef = useRef(null);
  const searchRef = useRef(null);

  const projects = [
    "MPQP RGPV Exam Q Paper",
    "Verified diploma papers",
    "Find papers by year & branch",
    "Quick download & reference",
  ];

  // --- 1. Placeholder Typing Effect ---
  useEffect(() => {
    if (searchText || isOpen) return;
    const currentProj = projects[projIndex];
    let timeout;
    if (charIndex <= currentProj.length) {
      setPlaceholder(currentProj.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex(charIndex + 1), 60);
    } else {
      timeout = setTimeout(() => {
        setCharIndex(0);
        setProjIndex((prev) => (prev + 1) % projects.length);
      }, 2500);
    }
    return () => clearTimeout(timeout);
  }, [charIndex, projIndex, searchText, isOpen]);

  // --- 2. Enhanced Closing Logic (Click Outside & Escape) ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); 
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // --- 3. Search Logic ---
  useEffect(() => {
    if (!searchText || searchText.length < 2) return setSuggestions([]);

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        const parent = node.parentElement;
        if (!node.nodeValue.trim() || !parent || !parent.offsetParent) return NodeFilter.FILTER_REJECT;
        if (["SCRIPT", "STYLE", "NAV", "HEADER", "FOOTER"].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if (parent.closest(".search-container")) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const foundMap = new Map();
    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue.trim();
      if (text.toLowerCase().includes(searchText.toLowerCase()) && !foundMap.has(text)) {
        foundMap.set(text, walker.currentNode.parentElement);
      }
    }
    setSuggestions(Array.from(foundMap.keys()).slice(0, 6).map(text => ({ text, el: foundMap.get(text) })));
  }, [searchText]);

  const handleSuggestionClick = (el) => {
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.add("prime-highlight");
    setTimeout(() => el.classList.remove("prime-highlight"), 2000);
    
    setIsOpen(false);
    setSearchText("");
    inputRef.current?.blur(); 
  };

  return (
    <div ref={searchRef} className="search-container relative w-full max-w-2xl mx-auto z-[999]">
      
      {/* --- DESKTOP VIEW --- */}
      <div 
        onClick={() => { setIsOpen(true); inputRef.current?.focus(); }}
        className="hidden md:flex group items-center justify-between w-full cursor-pointer bg-white/10 backdrop-blur-md border border-gray-200 dark:border-zinc-800 hover:border-orange-500/50 p-2 pl-4 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
      >
        <div className="flex items-center gap-3 text-gray-400 group-hover:text-orange-500 transition-colors flex-1">
          <Search size={18} />
          <input
            ref={inputRef}
            type="text"
            value={searchText}
            onChange={(e) => { setSearchText(e.target.value); setIsOpen(true); }}
            placeholder={placeholder || "Search papers..."}
            className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder-gray-400 cursor-text"
          />
        </div>
        <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded-lg border border-gray-200 dark:border-zinc-700 text-[10px] font-bold text-gray-500">
          <Command size={10} /> K
        </div>
      </div>

      {/* --- MOBILE VIEW --- */}
      <div className="md:hidden relative flex items-center bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-1 shadow-md">
        <Search className="ml-3 text-gray-400" size={18} />
        <input
          ref={inputRef} 
          type="text"
          value={searchText}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={placeholder || "Search..."}
          className="flex-1 bg-transparent py-3 px-3 outline-none text-gray-800 dark:text-zinc-100"
        />
        {searchText && (
          <X onClick={() => { setSearchText(""); setIsOpen(false); inputRef.current?.blur(); }} size={18} className="mr-3 text-gray-400 cursor-pointer" />
        )}
      </div>

      {/* --- DROPDOWN RESULTS --- */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute left-0 right-0 mt-2 overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-[1000]"
          >
            <div className="max-h-[50vh] overflow-y-auto p-2 custom-scrollbar">
              {suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((s, i) => (
                    <div
                      key={i}
                      onClick={() => handleSuggestionClick(s.el)}
                      className="group flex items-center justify-between px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-500/10 cursor-pointer rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <FileText size={18} className="text-gray-400 group-hover:text-orange-500" />
                        <span className="text-gray-700 dark:text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-md">{s.text}</span>
                      </div>
                      <CornerDownLeft size={14} className="text-orange-500 opacity-0 md:group-hover:opacity-100" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Clock size={24} className="mx-auto text-orange-500 mb-2 opacity-50" />
                  <p className="text-sm text-gray-500 font-medium">Find papers by branch or year</p>
                </div>
              )}
            </div>
            
            <div className="flex px-4 py-2 bg-gray-50 dark:bg-zinc-800/50 justify-between items-center text-[9px] font-bold text-gray-400 border-t border-gray-100 dark:border-zinc-800">
               <span>ESC to close</span>
               <span className="text-orange-500">PRIME SEARCH</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .prime-highlight { 
          animation: prime-pulse 2s ease-out; 
        }
        @keyframes prime-pulse {
          0% { background-color: rgba(251, 146, 60, 0.3); outline: 2px solid #fb923c; }
          100% { background-color: transparent; outline: 2px solid transparent; }
        }
        .custom-scrollbar::-webkit-scrollbar { 
          width: 4px; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb { 
          background: #e5e7eb; 
          border-radius: 10px; 
        }
      `}</style>
    </div>
  );
}