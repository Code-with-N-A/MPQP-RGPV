import { useState, useEffect, useRef } from "react";

export default function SearchBar({ searchText, setSearchText, onClose }) {
  const [suggestions, setSuggestions] = useState([]);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  const projects = [
    "All Projects",
    "HTML Form Project",
    "CSS Portfolio",
    "JavaScript MCQZ",
    "JavaScript ATM",
    "JavaScript Voting",
    "JavaScript Binary Number",
    "MPQP RGPV Exam Q Paper",
    "Blogs"
  ];

  const [placeholder, setPlaceholder] = useState("Searching...");
  const [projIndex, setProjIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  // Placeholder typing effect
  useEffect(() => {
    if (searchText) return; // typing stops when user types

    const currentProj = projects[projIndex];

    let timeout;
    if (charIndex <= currentProj.length) {
      setPlaceholder(currentProj.slice(0, charIndex));
      timeout = setTimeout(() => setCharIndex(charIndex + 1), 120);
    } else {
      timeout = setTimeout(() => {
        setCharIndex(0);
        setProjIndex((prev) => (prev + 1) % projects.length);
      }, 1500); // pause before next project
    }

    return () => clearTimeout(timeout);
  }, [charIndex, projIndex, searchText]);

  // Auto-focus input for mobile/tablet
  useEffect(() => {
    if (window.innerWidth <= 1024 && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 150);
    }
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (window.innerWidth <= 1024) {
        if (searchRef.current && !searchRef.current.contains(e.target)) {
          onClose();
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Suggestions logic
  useEffect(() => {
    if (!searchText) return setSuggestions([]);

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          const parent = node.parentElement;
          if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
          if (!parent || !parent.offsetParent) return NodeFilter.FILTER_REJECT;
          if (
            ["SCRIPT", "STYLE", "NOSCRIPT", "NAV", "HEADER", "FOOTER"].includes(
              parent.tagName
            )
          )
            return NodeFilter.FILTER_REJECT;
          if (parent.closest("nav")) return NodeFilter.FILTER_REJECT;
          if (parent.closest(".search-bar")) return NodeFilter.FILTER_REJECT;
          if (parent.tagName === "A") return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        },
      }
    );

    const foundMap = new Map();
    while (walker.nextNode()) {
      const text = walker.currentNode.nodeValue.trim();
      if (
        text.toLowerCase().includes(searchText.toLowerCase()) &&
        !foundMap.has(text)
      ) {
        foundMap.set(text, walker.currentNode.parentElement);
      }
    }

    setSuggestions(
      Array.from(foundMap.keys())
        .slice(0, 5)
        .map((text) => ({ text, el: foundMap.get(text) }))
    );
  }, [searchText]);

  const handleSuggestionClick = (el) => {
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    const bg = el.style.backgroundColor;
    el.style.transition = "background-color 0.3s ease";
    el.style.backgroundColor = "yellow";

    setTimeout(() => {
      el.style.backgroundColor = bg || "transparent";
    }, 1000);

    setSearchText("");
    setSuggestions([]);
    onClose();
  };

  return (
    <div
      ref={searchRef}
      className="
        search-bar relative z-50 w-full mx-auto
        max-w-[95%]        /* Mobile */
        sm:max-w-[500px]   /* Small Tablet */
        md:max-w-[600px]   /* Large Tablet / iPad */
        lg:max-w-lg        /* Desktop / original width */
      "
    >
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder || "Searching..."}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        className="w-full px-4 py-2 pr-10 rounded-md text-gray-800 border border-gray-300 focus:border-orange-400 focus:outline-none bg-white placeholder-gray-400 transition"
      />

      {searchText && (
        <button
          onClick={() => setSearchText("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-100 text-gray-600 px-2 rounded hover:bg-gray-200 transition"
        >
          X
        </button>
      )}

      {suggestions.length > 0 && (
        <ul className="absolute w-full mt-2 bg-white shadow-md border rounded-lg max-h-60 overflow-y-auto z-50">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(s.el)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100 transition"
            >
              {s.text.length > 50 ? s.text.slice(0, 50) + "..." : s.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
