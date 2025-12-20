import React, { useEffect, useState, useMemo } from "react";
import { 
  FaSearch, FaDownload, FaPrint, FaEye, FaTimes, 
  FaSync, FaFilter, FaFileAlt, FaCheckCircle, 
  FaExclamationTriangle, FaPlusCircle, FaArrowLeft, FaArrowRight 
} from "react-icons/fa";
import { useApiData } from "./ContextAPI";

export default function Report() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    semester: "",
    branch: "",
    type: "",
    subjectName: "",
    status: "",
  });
  const [selectedBranch, setSelectedBranch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "year", direction: "desc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        sessionStorage.setItem('reportData', JSON.stringify(fetchedData));
        window.reportDataLoaded = true;
      } else {
        throw new Error('API returned error status');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (window.reportDataLoaded) {
      const storedData = sessionStorage.getItem('reportData');
      if (storedData) setData(JSON.parse(storedData));
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  const handleRefresh = () => {
    window.reportDataLoaded = false;
    sessionStorage.removeItem('reportData');
    loadData();
  };

  const uniqueBranches = useMemo(() => [...new Set(data.map(row => row.branch).filter(Boolean))].sort(), [data]);

  const filteredData = useMemo(() => {
    let filtered = data.filter((row) => {
      const matchesSearch = searchTerm === "" || 
        Object.values(row).some(val => String(val).toLowerCase().includes(searchTerm.toLowerCase()));
      
      return (
        matchesSearch &&
        (filters.year === "" || String(row.year) === filters.year) &&
        (filters.semester === "" || String(row.semester) === filters.semester) &&
        (filters.branch === "" || row.branch === filters.branch) &&
        (filters.type === "" || row.type === filters.type) &&
        (filters.status === "" || row.status === filters.status) &&
        (selectedBranch === "" || row.branch === selectedBranch)
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key] || "";
        const bVal = b[sortConfig.key] || "";
        return sortConfig.direction === "asc" 
          ? String(aVal).localeCompare(String(bVal), undefined, { numeric: true })
          : String(bVal).localeCompare(String(aVal), undefined, { numeric: true });
      });
    }
    return filtered;
  }, [data, filters, searchTerm, sortConfig, selectedBranch]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const exportToCSV = () => {
    const headers = ["Year", "Semester", "Branch", "Type", "Subject Name", "Status"];
    const rows = filteredData.map(r => [r.year, r.semester, r.branch, r.type, r.subjectName, r.status]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `MPQP_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
  };

  const summary = useMemo(() => ({
    total: data.length,
    enabled: data.filter(r => r.status?.toLowerCase() === "enabled").length,
    disabled: data.filter(r => r.status?.toLowerCase() === "disabled").length,
    new: data.filter(r => r.status?.toLowerCase() === "new").length,
  }), [data]);

  const StatusBadge = ({ status }) => {
    const s = status?.toLowerCase();
    const styles = {
      enabled: "bg-emerald-100 text-emerald-700 border-emerald-200",
      disabled: "bg-rose-100 text-rose-700 border-rose-200",
      new: "bg-amber-100 text-amber-700 border-amber-200",
      default: "bg-slate-100 text-slate-700 border-slate-200"
    };
    const currentStyle = styles[s] || styles.default;
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentStyle} flex items-center w-fit gap-1`}>
        <span className={`w-1.5 h-1.5 rounded-full ${s === 'enabled' ? 'bg-emerald-500' : s === 'disabled' ? 'bg-rose-500' : 'bg-amber-500'}`}></span>
        {status?.toUpperCase() || "N/A"}
      </span>
    );
  };

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-2xl text-center border border-rose-100">
        <FaExclamationTriangle className="text-rose-500 text-5xl mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800 mb-2">Sync Failed</h2>
        <p className="text-slate-500 mb-6">{error}</p>
        <button onClick={handleRefresh} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
          <FaSync /> Reconnect Server
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-12">
      {/* --- Header Section --- */}
      <div className="bg-white border-b border-slate-200 pt-10 pb-8 px-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <FaFileAlt size={24} />
              </div>
              Academic Insights
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Manage and export comprehensive paper repositories</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-colors" title="Refresh Data">
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
            <button onClick={exportToCSV} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all">
              <FaDownload size={14} /> Export Dataset
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        {/* --- Stats Overview --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Grand Total", val: summary.total, icon: <FaFileAlt />, color: "blue" },
            { label: "Live Papers", val: summary.enabled, icon: <FaCheckCircle />, color: "emerald" },
            { label: "Draft/Disabled", val: summary.disabled, icon: <FaTimes />, color: "rose" },
            { label: "New Requests", val: summary.new, icon: <FaPlusCircle />, color: "amber" },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center text-xl`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900">{stat.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* --- Filters & Search --- */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search anything (e.g. 'Computer Science 2023')..."
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0">
               <button 
                onClick={() => setSelectedBranch("")}
                className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedBranch === "" ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
               >
                 All Branches
               </button>
               {uniqueBranches.map(b => (
                 <button 
                  key={b}
                  onClick={() => setSelectedBranch(b)}
                  className={`px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${selectedBranch === b ? "bg-indigo-600 text-white shadow-md" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                 >
                   {b}
                 </button>
               ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {['year', 'semester', 'type', 'status'].map((f) => (
              <select 
                key={f}
                className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 outline-none focus:border-indigo-500"
                value={filters[f]}
                onChange={(e) => setFilters({...filters, [f]: e.target.value})}
              >
                <option value="">All {f.charAt(0).toUpperCase() + f.slice(1)}s</option>
                {[...new Set(data.map(r => r[f]))].filter(Boolean).sort().map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ))}
            <button 
              onClick={() => {setFilters({year:"", semester:"", branch:"", type:"", status:""}); setSearchTerm(""); setSelectedBranch("");}}
              className="text-indigo-600 text-sm font-bold hover:underline flex items-center justify-center gap-1"
            >
              <FaSync size={10} /> Reset Filters
            </button>
          </div>
        </div>

        {/* --- Main Table --- */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden relative">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-600 font-bold animate-pulse">Analyzing Database...</p>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  {["year", "semester", "branch", "subjectName", "status"].map((col) => (
                    <th 
                      key={col}
                      onClick={() => handleSort(col)}
                      className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest cursor-pointer hover:text-indigo-600 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {col.replace(/([A-Z])/g, ' $1')}
                        <span className="opacity-30">{sortConfig.key === col ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '⇅'}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-6 py-4 font-bold text-slate-700">{row.year}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">SEM {row.semester}</span></td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{row.branch}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{row.subjectName}</td>
                    <td className="px-6 py-4"><StatusBadge status={row.status} /></td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedRow(row)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-none hover:shadow-sm"
                      >
                        <FaEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {!loading && filteredData.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                <FaSearch size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">No records found</h3>
              <p className="text-slate-500">Try adjusting your filters or search terms</p>
            </div>
          )}

          {/* --- Pagination --- */}
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500 font-medium">
              Showing <span className="text-slate-900 font-bold">{Math.min(filteredData.length, (currentPage-1)*itemsPerPage + 1)}-{Math.min(filteredData.length, currentPage*itemsPerPage)}</span> of <span className="text-slate-900 font-bold">{filteredData.length}</span> results
            </p>
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:border-indigo-500 transition-colors"
              >
                <FaArrowLeft size={12} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === pageNum ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 disabled:opacity-50 hover:border-indigo-500 transition-colors"
              >
                <FaArrowRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Detailed Modal --- */}
      {selectedRow && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedRow(null)}></div>
          <div className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20 animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black text-slate-900">Document Metadata</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Reference ID: #MPQP-{Math.floor(Math.random()*10000)}</p>
              </div>
              <button onClick={() => setSelectedRow(null)} className="p-2 hover:bg-white rounded-full transition-colors"><FaTimes className="text-slate-400" /></button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              {[
                { label: "Academic Year", value: selectedRow.year },
                { label: "Semester", value: `Semester ${selectedRow.semester}` },
                { label: "Department", value: selectedRow.branch },
                { label: "Paper Category", value: selectedRow.type },
                { label: "Subject", value: selectedRow.subjectName, colSpan: 2 },
                { label: "System Status", value: <StatusBadge status={selectedRow.status} /> },
              ].map((item, i) => (
                <div key={i} className={item.colSpan === 2 ? "col-span-2" : ""}>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">{item.label}</p>
                  <div className="text-slate-900 font-bold">{item.value || "Not Specified"}</div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-slate-50 flex gap-3">
              <button onClick={() => window.print()} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-all">
                <FaPrint /> Print Copy
              </button>
              <button onClick={() => setSelectedRow(null)} className="flex-1 py-3 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}