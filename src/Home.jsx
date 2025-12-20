import React, { useEffect, useState, useRef, useCallback } from "react";
import { useApiData } from "./ContextAPI";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  RefreshCcw,
  Filter,
  RotateCcw,
  FileText,
  ChevronUp,
  ChevronDown,
  Lock,
  Search
} from "lucide-react";

export default function Home() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activePdfId, setActivePdfId] = useState(null);

  // Filters
  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  // Options
  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);

  const [user, setUser] = useState(null);

  // Sorting: Default set to Year descending (latest first)
  const [sortColumn, setSortColumn] = useState("year");
  const [sortDirection, setSortDirection] = useState("desc");

  const rowRefs = useRef({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const loadData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        sessionStorage.setItem('paperData', JSON.stringify(fetchedData));
        window.dataLoaded = true;
      }
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  // Full Page Refresh & Filter Reset Logic
  const handleFullRefresh = () => {
    setYearFilter("");
    setSemFilter("");
    setBranchFilter("");
    setTypeFilter("");
    setSortColumn("year");
    setSortDirection("desc");
    loadData(true);
  };

  useEffect(() => {
    if (window.dataLoaded) {
      const storedData = sessionStorage.getItem('paperData');
      if (storedData) {
        setData(JSON.parse(storedData));
        setLoading(false);
      } else {
        loadData();
      }
    } else {
      loadData();
    }
  }, [loadData]);

  useEffect(() => {
    if (data.length > 0) {
      const years = [...new Set(data.map(row => String(row.year)).filter(y => y))].sort((a, b) => b - a);
      const semesters = [...new Set(data.map(row => String(row.semester)).filter(s => s))].sort((a, b) => a - b);
      const branches = [...new Set(data.map(row => String(row.branch).toLowerCase()).filter(b => b))].sort();
      const types = [...new Set(data.map(row => String(row.type)).filter(t => t))].sort();
      setUniqueYears(years);
      setUniqueSemesters(semesters);
      setUniqueBranches(branches);
      setUniqueTypes(types);
    }
  }, [data]);

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Advanced Multi-Level Sorting Logic
  const filteredData = data
    .filter((row) => row.status?.toLowerCase() === "enabled")
    .filter((row) => {
      const yearMatch = yearFilter ? String(row.year) === yearFilter : true;
      const semMatch = semFilter ? String(row.semester) === semFilter : true;
      const typeMatch = typeFilter ? String(row.type) === typeFilter : true;
      const branchMatch = branchFilter ? String(row.branch).toLowerCase() === branchFilter : true;
      return yearMatch && semMatch && typeMatch && branchMatch;
    })
    .sort((a, b) => {
      // 1. Primary Sort (Selected Column)
      let aVal = a[sortColumn];
      let bVal = b[sortColumn];

      if (sortColumn === "year" || sortColumn === "semester") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      } else {
        aVal = String(aVal || "").toLowerCase();
        bVal = String(bVal || "").toLowerCase();
      }

      if (aVal !== bVal) {
        if (sortDirection === "asc") return aVal > bVal ? 1 : -1;
        return aVal < bVal ? 1 : -1;
      }

      // 2. Secondary Sort (Always Year Descending if not primary)
      if (sortColumn !== "year") {
        return Number(b.year) - Number(a.year);
      }

      // 3. Tertiary Sort (Semester Ascending)
      return Number(a.semester) - Number(b.semester);
    });

  const titleCase = (str) => {
    if (!str) return "";
    return str.split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
  };

  const handlePdfClick = (id, url) => {
    if (!user) {
      navigate("/signup");
      return;
    }
    setActivePdfId(id);
    if (rowRefs.current[id]) {
      rowRefs.current[id].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    window.open(url, "_blank");
  };

  const SortIcon = ({ col }) => {
    if (sortColumn !== col) return <ChevronDown size={12} className="inline ml-1 opacity-20" />;
    return sortDirection === "asc" ? <ChevronUp size={14} className="inline ml-1 text-blue-600" /> : <ChevronDown size={14} className="inline ml-1 text-blue-600" />;
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">

      <div className="max-w-7xl mx-auto px-2 pt-10">
        {/* Quick Filter Bar */}
        <div className="sticky top-[58px] mb-3 bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm overflow-hidden">

          <div className="flex items-center justify-between p-2 h-[54px]"> {/* Fixed height added here */}

            {/* Left Side: Scrollable Filters (Horizontal Only) */}
            <div className="flex items-center gap-3 overflow-x-auto overflow-y-hidden no-scrollbar whitespace-nowrap pr-4 flex-1">

              {/* Label */}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-500 font-bold text-[10px] uppercase flex-shrink-0">
                <Filter size={14} /> <span>Filter By</span>
              </div>

              {/* Year Select */}
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer hover:text-blue-600 flex-shrink-0"
              >
                <option value="">Year (All)</option>
                {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
              </select>

              {/* Semester Select */}
              <select
                value={semFilter}
                onChange={(e) => setSemFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer hover:text-blue-600 flex-shrink-0"
              >
                <option value="">Semester (All)</option>
                {uniqueSemesters.map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>

              {/* Branch Select */}
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="bg-transparent border-none text-sm font-semibold text-gray-700 focus:ring-0 cursor-pointer hover:text-blue-600 flex-shrink-0"
              >
                <option value="">Branch (All)</option>
                {uniqueBranches.map(b => <option key={b} value={b}>{b.toUpperCase()}</option>)}
              </select>

              {/* Filter Reset Button */}
              <button
                onClick={() => { setYearFilter(""); setSemFilter(""); setBranchFilter(""); setTypeFilter(""); }}
                className="p-2 text-gray-400 hover:text-red-500 transition flex-shrink-0"
              >
                <RotateCcw size={18} />
              </button>
            </div>

            {/* Right Side: Page Refresh Button (Static) */}
            <div className="flex-shrink-0 ml-2 border-l pl-2 border-gray-100">
              <button
                onClick={handleFullRefresh}
                disabled={isRefreshing || loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold hover:bg-blue-100 transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCcw size={14} className={`${isRefreshing ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="relative flex items-center justify-center">
              <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
              <FileText className="absolute text-blue-600 animate-pulse" size={20} />
            </div>
            <p className="mt-6 text-gray-400 font-bold tracking-widest text-xs uppercase">Fetching Resources</p>
          </div>
        ) : (
          <div className="bg-white mt-7  border border-gray-100 shadow-2xl shadow-gray-200/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100/100">
                    <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-tighter w-16">Ref</th>
                    {[
                      { label: "Session", key: "year" },
                      { label: "Sem", key: "semester" },
                      { label: "Branch", key: "branch" },
                      { label: "Subject Title", key: "subjectName" },
                      { label: "Category", key: "type" }
                    ].map((th) => (
                      <th
                        key={th.key}
                        onClick={() => handleSort(th.key)}
                        className="p-6 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest cursor-pointer hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-1">
                          {th.label} <SortIcon col={th.key} />
                        </div>
                      </th>
                    ))}
                    <th className="p-6 text-[11px] font-extrabold text-gray-500 uppercase tracking-widest text-right">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((row, index) => (
                    <tr
                      key={row.id}
                      ref={(el) => (rowRefs.current[row.id] = el)}
                      className={`group hover:bg-blue-50/30 transition-all ${activePdfId === row.id ? "bg-blue-50/80" : ""}`}
                    >
                      <td className="p-6 text-xs font-bold text-gray-300">{index + 1}</td>
                      <td className="p-6">
                        <span className="text-sm font-bold text-gray-700">{row.year}</span>
                      </td>
                      <td className="p-6">
                        <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600">S-{row.semester}</span>
                      </td>
                      <td className="p-6">
                        <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase">{row.branch}</span>
                      </td>
                      <td className="p-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-800 group-hover:text-blue-700 transition-colors uppercase">{row.subjectName}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{row.paperCode || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${row.type?.toLowerCase() === 'regular' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        {row.pdfUrl ? (
                          <button
                            onClick={() => handlePdfClick(row.id, row.pdfUrl)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95"
                          >
                            <FileText size={14} /> Open
                          </button>
                        ) : (
                          <span className="text-xs text-gray-300 font-bold uppercase">Locked</span>
                        )}

                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
              {filteredData.length === 0 && (
                <div className="py-20 flex flex-col items-center">
                  <Search size={40} className="text-gray-200 mb-4" />
                  <p className="text-gray-400 font-bold">No results match your filters</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}