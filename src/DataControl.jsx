import React, { useState, useEffect, useMemo } from "react";
import { useApiData } from "./ContextAPI";
import { 
  Search, Trash2, CheckCircle, XCircle, ExternalLink, 
  RefreshCcw, Database, Filter, RotateCcw, User, Tag,
  CheckSquare, Square
} from "lucide-react";

export default function ControlD() {
  const { API_URL, data, setData, fetchData, loading: apiLoading, filterOptions } = useApiData();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [updatingRows, setUpdatingRows] = useState({});
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeTab, setActiveTab] = useState("all"); 
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedFilters, setLastSearchedFilters] = useState("");

  const [yearFilter, setYearFilter] = useState(sessionStorage.getItem("admin_year") || "");
  const [semFilter, setSemFilter] = useState(sessionStorage.getItem("admin_sem") || "");
  const [branchFilter, setBranchFilter] = useState(sessionStorage.getItem("admin_branch") || "");
  const [searchQuery, setSearchQuery] = useState("");

  const options = filterOptions || { years: [], sems: [], branches: [] };

  const currentFiltersKey = `${yearFilter}-${semFilter}-${branchFilter}`;
  const isFilterReady = yearFilter !== "" && semFilter !== "" && branchFilter !== "";
  const isApplyDisabled = !isFilterReady || apiLoading || localLoading || (hasSearched && currentFiltersKey === lastSearchedFilters);

  const loadData = async (forceType = "") => {
    setLocalLoading(true);
    let params = "&admin=true";
    
    if (forceType === "pending") {
      params += "&status=disabled";
    } else if (isFilterReady) {
      // FIX: Check if branch is "All_Branches" and handle the potential trailing space
      const branchVal = branchFilter.trim() === "All_Branches" ? "All_Branches " : branchFilter;
      params += `&year=${yearFilter}&semester=${semFilter}&branch=${encodeURIComponent(branchVal)}`;
      
      sessionStorage.setItem("admin_year", yearFilter);
      sessionStorage.setItem("admin_sem", semFilter);
      sessionStorage.setItem("admin_branch", branchFilter);
      setHasSearched(true);
      setLastSearchedFilters(currentFiltersKey);
    } else {
      params += "&status=disabled";
    }

    await fetchData(params); 
    setLocalLoading(false);
  };

  useEffect(() => {
    if (data.length === 0) {
      loadData("pending");
    }
  }, []);

  const resetFilters = () => {
    setYearFilter("");
    setSemFilter("");
    setBranchFilter("");
    setHasSearched(false);
    setLastSearchedFilters("");
    sessionStorage.removeItem("admin_year");
    sessionStorage.removeItem("admin_sem");
    sessionStorage.removeItem("admin_branch");
    loadData("pending"); 
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus?.toLowerCase() === "enabled" ? "Disabled" : "Enabled";
    setUpdatingRows(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", id: id, status: newStatus }),
      });
      const result = await res.text();
      if (result.toLowerCase().includes("success")) {
        setData(prev => prev.map(row => row.id === id ? { ...row, status: newStatus } : row));
      }
    } catch (err) {
      alert("Update failed!");
    } finally {
      setUpdatingRows(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleDelete = async (id, skipConfirm = false) => {
    if (!skipConfirm && !window.confirm("Delete permanent?")) return;
    setUpdatingRows(prev => ({ ...prev, [id]: true }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteRow", id: id }),
      });
      if ((await res.text()).toLowerCase().includes("success")) {
        setData(prev => prev.filter(row => row.id !== id));
      }
    } finally {
      setUpdatingRows(prev => ({ ...prev, [id]: false }));
    }
  };

  const runBulkAction = async (actionType) => {
    const ids = [...selectedIds];
    setSelectedIds([]); 
    for (const id of ids) {
      if (actionType === "delete") await handleDelete(id, true);
      else {
        const row = data.find(r => r.id === id);
        if (row) await handleStatusChange(id, row.status);
      }
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      const rowStatus = String(row.status || "Disabled").trim().toLowerCase();
      const matchTab = activeTab === "all" ? true : rowStatus === activeTab;
      const sTerm = searchQuery.toLowerCase();
      return (
        matchTab && 
        (row.subjectName?.toLowerCase().includes(sTerm) || 
         row.paperCode?.toLowerCase().includes(sTerm) ||
         row.email?.toLowerCase().includes(sTerm) ||
         row.type?.toLowerCase().includes(sTerm))
      );
    });
  }, [data, activeTab, searchQuery]);

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const isLoading = localLoading || apiLoading;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900 pt-15">
      <div className="max-w-7xl mx-auto">
        
        {/* Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] bg-slate-900 text-white px-6 py-4 shadow-2xl flex items-center gap-6 animate-in fade-in zoom-in duration-300">
            <span className="text-xs font-black uppercase tracking-widest">{selectedIds.length} Selected</span>
            <div className="flex gap-3 border-l border-slate-700 pl-6">
              <button onClick={() => runBulkAction("toggle")} title="Toggle Status" className="p-2 bg-indigo-500 rounded-lg hover:scale-110 transition-transform"><RefreshCcw size={18}/></button>
              <button onClick={() => runBulkAction("delete")} title="Delete All" className="p-2 bg-rose-500 rounded-lg hover:scale-110 transition-transform"><Trash2 size={18}/></button>
              <button onClick={() => setSelectedIds([])} className="p-2 bg-slate-700 rounded-lg text-[10px] font-bold uppercase">Cancel</button>
            </div>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 shadow-sm mb-6 border border-slate-200/60 gap-4 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800 uppercase">Control Center</h1>
              <p className="text-slate-400 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Database: {data.length} Items
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <button onClick={resetFilters} title="Reset All Filters" className="p-3.5 bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all border border-slate-200 rounded-xl">
                <RotateCcw size={20} />
             </button>
             <button 
                onClick={() => loadData()} 
                disabled={isLoading}
                className="flex-1 md:flex-none px-8 py-3.5 bg-slate-900 text-white rounded-xl font-black text-sm flex items-center justify-center gap-3 disabled:opacity-50 transition-all uppercase tracking-widest active:scale-95"
              >
                <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
                {isLoading ? "Syncing..." : "Sync Cloud"}
              </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-6 shadow-sm border border-slate-200/60 mb-8 rounded-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search paper..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {[
              { val: yearFilter, set: setYearFilter, opt: options.years, label: "Year" },
              { val: semFilter, set: setSemFilter, opt: options.sems, label: "Semester" },
              { val: branchFilter, set: setBranchFilter, opt: options.branches, label: "Branch" }
            ].map((f, i) => (
              <select 
                key={i} 
                value={f.val} 
                className="bg-slate-50 border-none p-3.5 font-black text-slate-600 rounded-xl cursor-pointer shadow-inner appearance-none focus:ring-2 focus:ring-indigo-500"
                onChange={(e) => f.set(e.target.value)}
              >
                <option value="">Select {f.label}</option>
                {f.opt?.map(o => <option key={o} value={o}>{f.label} {o}</option>)}
              </select>
            ))}

            <button 
              onClick={() => loadData()}
              disabled={isApplyDisabled}
              className={`py-3.5 rounded-xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2
                ${isApplyDisabled ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-emerald-500 text-white shadow-lg shadow-emerald-100 hover:bg-emerald-600 active:scale-95"}`}
            >
              <Filter size={18} /> {hasSearched && currentFiltersKey === lastSearchedFilters ? "Active" : "Apply"}
            </button>
          </div>
        </div>

        {/* Tabs for Filtering */}
        <div className="flex flex-nowrap gap-2 mb-6 bg-slate-200/50 p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
          {["all", "disabled", "enabled"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-8 py-2.5 rounded-lg text-[10px] font-black uppercase transition-all tracking-widest flex-shrink-0 ${activeTab === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              {t} ({t === 'all' ? data.length : data.filter(d => (d.status || "").toLowerCase().trim() === t).length})
            </button>
          ))}
        </div>

        {/* Main Table */}
        <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden rounded-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="px-6 py-4 w-12 text-center">
                    <button onClick={() => setSelectedIds(selectedIds.length === filteredData.length ? [] : filteredData.map(r => r.id))}>
                      {selectedIds.length > 0 ? <CheckSquare size={18} className="text-indigo-600"/> : <Square size={18}/>}
                    </button>
                  </th>
                  <th className="px-8 py-6">Subject / Type</th>
                  <th className="px-8 py-6">Identity & Uploader</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr><td colSpan="5" className="py-32 text-center animate-pulse font-black text-slate-300 uppercase tracking-widest">Syncing Cloud Database...</td></tr>
                ) : filteredData.length === 0 ? (
                  <tr><td colSpan="5" className="py-32 text-center text-slate-300 font-black uppercase italic tracking-widest">No Records Found</td></tr>
                ) : (
                  filteredData.map((row) => {
                    const isEnabled = row.status?.toLowerCase() === 'enabled';
                    return (
                      <tr key={row.id} className={`hover:bg-slate-50 transition-colors group ${selectedIds.includes(row.id) ? 'bg-indigo-50/40' : ''}`}>
                        <td className="px-6 py-6 text-center">
                          <button onClick={() => toggleSelect(row.id)}>
                            {selectedIds.includes(row.id) ? <CheckSquare size={18} className="text-indigo-600"/> : <Square size={18} className="text-slate-200"/>}
                          </button>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-800 uppercase tracking-tight">{row.subjectName}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-indigo-500 font-bold bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">{row.paperCode}</span>
                            
                            {/* ✅ REGULAR / EX BADGE ADDED HERE */}
                            <span className={`text-[9px] font-black px-2 py-0.5 rounded-md uppercase border flex items-center gap-1 
                              ${row.type?.toLowerCase() === 'regular' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                              <Tag size={10} /> {row.type || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-black text-slate-600">{row.branch}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">S{row.semester} • {row.year}</div>
                          
                          {/* ✅ CLICKABLE EMAIL ADDED HERE */}
                          <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                              <User size={12} className="text-slate-300" />
                              <a href={`mailto:${row.email}`} className="text-[10px] font-medium lowercase italic hover:text-indigo-600 hover:underline transition-all">
                                {row.email || "no-email@system.com"}
                              </a>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${isEnabled ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${isEnabled ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                            {row.status || "Disabled"}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex justify-center items-center gap-3">
                            {updatingRows[row.id] ? (
                              <div className="flex items-center gap-2 text-indigo-500 font-black text-[10px] animate-pulse uppercase">
                                <RefreshCcw size={16} className="animate-spin" /> Processing
                              </div>
                            ) : (
                              <>
                                <a href={row.pdfUrl} target="_blank" rel="noreferrer" title="View PDF" className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"><ExternalLink size={18}/></a>
                                
                                <button 
                                  onClick={() => handleStatusChange(row.id, row.status)} 
                                  title={isEnabled ? "Disable Now" : "Enable Now"}
                                  className={`p-2.5 rounded-xl border transition-all shadow-sm 
                                    ${isEnabled 
                                      ? "bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-500 hover:text-white" 
                                      : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white"}`}
                                >
                                  {isEnabled ? <XCircle size={18}/> : <CheckCircle size={18}/>}
                                </button>

                                <button onClick={() => handleDelete(row.id)} title="Delete Paper" className="p-2.5 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white border border-rose-100 transition-all shadow-sm"><Trash2 size={18}/></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}