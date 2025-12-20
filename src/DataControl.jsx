import React, { useEffect, useState, useCallback } from "react";
import { useApiData } from "./ContextAPI";
import { 
  RotateCw, 
  Search, 
  Filter, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  ExternalLink, 
  Mail, 
  RefreshCcw 
} from "lucide-react";

export default function ControlD() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [updatingRows, setUpdatingRows] = useState({}); // { [id]: action }
  const [expandedSection, setExpandedSection] = useState("new"); // Default open "new"

  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState("subjectName");

  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);

  const searchColumns = [
    { label: "Subject", value: "subjectName" },
    { label: "Paper Code", value: "paperCode" },
    { label: "Branch", value: "branch" },
    { label: "Type", value: "type" },
    { label: "Year", value: "year" },
    { label: "Semester", value: "semester" },
    { label: "Email", value: "email" },
  ];

  // Load Data Function (Memoized for performance)
  const loadData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        sessionStorage.setItem('dashboardData', JSON.stringify(fetchedData));
        window.dashboardDataLoaded = true;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [API_URL]);

  useEffect(() => {
    if (window.dashboardDataLoaded) {
      const storedData = sessionStorage.getItem('dashboardData');
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
      const years = [...new Set(data.map(row => String(row.year)).filter(y => y))].sort();
      const semesters = [...new Set(data.map(row => String(row.semester)).filter(s => s))].sort();
      const branches = [...new Set(data.map(row => String(row.branch).toLowerCase()).filter(b => b))].sort();
      const types = [...new Set(data.map(row => String(row.type)).filter(t => t))].sort();
      setUniqueYears(years);
      setUniqueSemesters(semesters);
      setUniqueBranches(branches);
      setUniqueTypes(types);
    }
  }, [data]);

  const updateStatus = async (id, newStatus) => {
    const action = newStatus.toLowerCase() === 'disabled' ? 'disable' : 'enable';
    setUpdatingRows((prev) => ({ ...prev, [id]: action }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", id, status: newStatus }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setData((prev) =>
          prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
        );
      } else alert("Error: " + json.message);
    } catch (err) {
      alert("Error updating status.");
    } finally {
      setUpdatingRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setUpdatingRows((prev) => ({ ...prev, [id]: 'delete' }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteRow", id }),
      });
      const json = await res.json();
      if (json.status === "success") setData((prev) => prev.filter((row) => row.id !== id));
      else alert("Error: " + json.message);
    } catch (err) {
      alert("Error deleting record.");
    } finally {
      setUpdatingRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const filteredData = data
    .filter((row) => {
      const rowYear = String(row.year || "").trim();
      const rowSem = String(row.semester || "").trim();
      const rowType = String(row.type || "").trim().toLowerCase();
      const rowBranch = String(row.branch || "").trim().toLowerCase();

      const yearMatch = yearFilter ? rowYear === yearFilter.trim() : true;
      const semMatch = semFilter ? rowSem === semFilter.trim() : true;
      const typeMatch = typeFilter ? rowType === typeFilter.trim().toLowerCase() : true;
      const branchMatch = branchFilter ? rowBranch === branchFilter.trim().toLowerCase() : true;

      let searchMatch = true;
      if (searchQuery.trim() !== "") {
        const value = String(row[searchColumn] || "").toLowerCase();
        searchMatch = value.includes(searchQuery.toLowerCase());
      }
      return yearMatch && semMatch && typeMatch && branchMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const newRows = filteredData.slice(0, 15);
  const enabledRows = filteredData.filter((r) => r.status?.toLowerCase() === "enabled");
  const disabledRows = filteredData.filter((r) => r.status?.toLowerCase() === "disabled");

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 text-black px-1 rounded">{part}</span>
      ) : part
    );
  };

  const titleCase = (str) => str ? str.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") : "";
  const formatDate = (ts) => ts ? new Date(ts).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : "";

  // Table Component
  const Table = ({ rows, title }) => (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mb-10">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800 uppercase tracking-wider">{title}</h2>
        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold">
          {rows.length} Records
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-800 text-gray-100 uppercase text-xs">
            <tr>
              <th className="px-4 py-4 font-semibold">ID / Date</th>
              <th className="px-4 py-4 font-semibold">Subject & Code</th>
              <th className="px-4 py-4 font-semibold">Details</th>
              <th className="px-4 py-4 font-semibold">Uploader</th>
              <th className="px-4 py-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-blue-50/50 transition-colors">
                <td className="px-4 py-4">
                  <div className="font-bold text-gray-900">#{highlightText(String(row.id))}</div>
                  <div className="text-gray-500 text-xs">{formatDate(row.timestamp)}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-blue-700">{highlightText(String(row.subjectName))}</div>
                  <div className="text-gray-500 text-xs">Code: {highlightText(String(row.paperCode))}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex gap-2 mb-1">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{row.branch}</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">{row.type}</span>
                  </div>
                  <div className="text-xs text-gray-600">Year {row.year} | Sem {row.semester}</div>
                </td>
                <td className="px-4 py-4">
                  {row.email ? (
                    <button 
                       onClick={() => window.location.href = `mailto:${row.email}`}
                       className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <Mail size={14} /> <span className="max-w-[120px] truncate">{row.email}</span>
                    </button>
                  ) : <span className="text-gray-400">No Email</span>}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center gap-2">
                    {row.pdfUrl && (
                      <a href={row.pdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition" title="View PDF">
                        <ExternalLink size={18} />
                      </a>
                    )}
                    
                    {row.status?.toLowerCase() === "enabled" ? (
                      <button 
                        onClick={() => updateStatus(row.id, "Disabled")}
                        disabled={updatingRows[row.id]}
                        className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition"
                        title="Disable"
                      >
                        {updatingRows[row.id] === 'disable' ? <RotateCw size={18} className="animate-spin" /> : <XCircle size={18} />}
                      </button>
                    ) : (
                      <button 
                        onClick={() => updateStatus(row.id, "Enabled")}
                        disabled={updatingRows[row.id]}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition"
                        title="Enable"
                      >
                        {updatingRows[row.id] === 'enable' ? <RotateCw size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                      </button>
                    )}

                    <button 
                      onClick={() => deleteRow(row.id)}
                      disabled={updatingRows[row.id]}
                      className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition"
                      title="Delete"
                    >
                      {updatingRows[row.id] === 'delete' ? <RotateCw size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 mt-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Paper Management</h1>
            <p className="text-gray-500">Manage, verify and control examination papers</p>
          </div>
          
          <button 
            onClick={() => loadData(true)}
            disabled={isRefreshing || loading}
            className="flex items-center justify-center gap-2 bg-white border border-gray-300 px-6 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 active:scale-95 transition-all font-semibold text-gray-700"
          >
            <RefreshCcw size={18} className={isRefreshing ? "animate-spin text-blue-600" : ""} />
            {isRefreshing ? "Refreshing..." : "Sync Data"}
          </button>
        </div>

        {/* Filters Card */}
        <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-8">
          <div className="flex items-center gap-2 mb-4 text-gray-700 font-bold uppercase text-xs tracking-widest">
            <Filter size={16} /> Filters & Search
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <div className="relative col-span-1 sm:col-span-2">
               <Search className="absolute left-3 top-3 text-gray-400" size={18} />
               <input
                type="text"
                placeholder="Quick search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition"
              />
            </div>

            <select value={searchColumn} onChange={(e) => setSearchColumn(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500">
              {searchColumns.map((col) => <option key={col.value} value={col.value}>{col.label}</option>)}
            </select>

            <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
              <option value="">All Years</option>
              {uniqueYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>

            <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
              <option value="">All Semesters</option>
              {uniqueSemesters.map((s) => <option key={s} value={s}>Sem {s}</option>)}
            </select>

            <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none">
              <option value="">All Branches</option>
              {uniqueBranches.map((b) => <option key={b} value={b}>{titleCase(b)}</option>)}
            </select>

            <button 
              onClick={() => {setYearFilter(""); setSemFilter(""); setTypeFilter(""); setBranchFilter(""); setSearchQuery("");}}
              className="p-2.5 text-red-600 font-bold hover:bg-red-50 rounded-xl transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-gray-200/50 rounded-2xl w-fit mb-8 gap-1">
          {[
            { id: "new", label: "Recent", color: "blue" },
            { id: "enabled", label: "Enabled", color: "green" },
            { id: "disabled", label: "Disabled", color: "red" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setExpandedSection(tab.id)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                expandedSection === tab.id 
                ? "bg-white shadow-sm text-gray-900 scale-100" 
                : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium animate-pulse">Loading dashboard records...</p>
          </div>
        ) : (
          <>
            {expandedSection === "new" && <Table rows={newRows} title="Recent Uploads" />}
            {expandedSection === "enabled" && <Table rows={enabledRows} title="Live Papers" />}
            {expandedSection === "disabled" && <Table rows={disabledRows} title="Disabled / Hidden Papers" />}
            
            {filteredData.length === 0 && (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                <div className="text-gray-300 mb-4 flex justify-center"><Search size={48}/></div>
                <h3 className="text-xl font-bold text-gray-800">No results found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}