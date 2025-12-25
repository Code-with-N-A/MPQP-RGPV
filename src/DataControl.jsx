import React, { useState, useEffect, useMemo } from "react";
import { useApiData } from "./ContextAPI";
import { 
  Search, Trash2, CheckCircle, XCircle, ExternalLink, 
  RefreshCcw, Database, Filter, RotateCcw, ChevronRight 
} from "lucide-react";

export default function ControlD() {
  const { API_URL, data, setData, fetchData, loading: apiLoading, filterOptions } = useApiData();
  
  const [localLoading, setLocalLoading] = useState(false);
  const [updatingRows, setUpdatingRows] = useState({});
  const [activeTab, setActiveTab] = useState("all"); 
  const [hasSearched, setHasSearched] = useState(false);
  const [lastSearchedFilters, setLastSearchedFilters] = useState("");

  const [yearFilter, setYearFilter] = useState(sessionStorage.getItem("admin_year") || "");
  const [semFilter, setSemFilter] = useState(sessionStorage.getItem("admin_sem") || "");
  const [branchFilter, setBranchFilter] = useState(sessionStorage.getItem("admin_branch") || "");
  const [searchQuery, setSearchQuery] = useState("");

  const options = filterOptions || { years: [], sems: [], branches: [] };

  // 1. Smart Logic for Button State
  const currentFiltersKey = `${yearFilter}-${semFilter}-${branchFilter}`;
  const isFilterReady = yearFilter !== "" && semFilter !== "" && branchFilter !== "";
  
  // Button tab disable hoga jab: loading ho RAHI ho, ya Filters incomplete hon, ya wahi purana data screen par ho
  const isApplyDisabled = !isFilterReady || apiLoading || localLoading || (hasSearched && currentFiltersKey === lastSearchedFilters);

  const loadData = async (forceType = "") => {
    setLocalLoading(true);
    let params = "&admin=true";
    
    if (forceType === "pending") {
      params += "&status=disabled";
    } else if (isFilterReady) {
      params += `&year=${yearFilter}&semester=${semFilter}&branch=${branchFilter}`;
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete permanent?")) return;
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

  const filteredData = data.filter((row) => {
    const rowStatus = String(row.status || "Disabled").trim().toLowerCase();
    const matchTab = activeTab === "all" ? true : rowStatus === activeTab;
    const sTerm = searchQuery.toLowerCase();
    return matchTab && (row.subjectName?.toLowerCase().includes(sTerm) || row.paperCode?.toLowerCase().includes(sTerm));
  });

  const isLoading = localLoading || apiLoading;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-[2rem] shadow-sm mb-6 border border-slate-200/60 gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Database size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-slate-800">CONTROL CENTER</h1>
              <p className="text-slate-400 text-xs font-bold flex items-center gap-2 uppercase tracking-wider">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Live Database: {data.length} Items
              </p>
            </div>
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
             <button onClick={resetFilters} title="Reset All" className="p-3.5 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all border border-slate-200">
                <RotateCcw size={20} />
             </button>
             <button 
                onClick={() => loadData()} 
                disabled={isLoading}
                className="flex-1 md:flex-none px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 disabled:opacity-50 shadow-xl shadow-slate-200 active:scale-95 transition-all uppercase tracking-widest"
              >
                <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
                {isLoading ? "Syncing..." : "Sync Cloud"}
              </button>
          </div>
        </div>

        {/* Search & Filters Grid */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* Search Box */}
            <div className="relative lg:col-span-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" placeholder="Search by name..." 
                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 placeholder:text-slate-300 transition-all shadow-inner"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {/* Filter Selects */}
            {[
              { val: yearFilter, set: setYearFilter, opt: options.years, label: "Year" },
              { val: semFilter, set: setSemFilter, opt: options.sems, label: "Semester" },
              { val: branchFilter, set: setBranchFilter, opt: options.branches, label: "Branch" }
            ].map((f, i) => (
              <select 
                key={i} 
                value={f.val} 
                className="bg-slate-50 border-none p-3.5 rounded-2xl font-black text-slate-600 focus:ring-2 focus:ring-indigo-500 cursor-pointer shadow-inner appearance-none"
                onChange={(e) => f.set(e.target.value)}
              >
                <option value="">Select {f.label}</option>
                {f.opt?.map(o => <option key={o} value={o}>{f.label} {o}</option>)}
              </select>
            ))}

            {/* Smart Apply Button */}
            <button 
              onClick={() => loadData()}
              disabled={isApplyDisabled}
              className={`py-3.5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg
                ${isApplyDisabled 
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                  : "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-100 active:scale-95"}`}
            >
              <Filter size={18} /> {hasSearched && currentFiltersKey === lastSearchedFilters ? "Results Active" : "Apply Filter"}
            </button>
          </div>
          
          {!isFilterReady && (
            <div className="flex items-center gap-2 mt-4 px-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
              <p className="text-[10px] text-amber-600 font-black uppercase tracking-tighter">Please select all filters to search the cloud database</p>
            </div>
          )}
        </div>

        {/* Tabs for Quick Sort */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-200/50 p-1.5 w-fit border border-slate-200">
          {["all", "disabled", "enabled"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all tracking-widest ${activeTab === t ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
            >
              {t} <span className="ml-1 opacity-50">({t === 'all' ? data.length : data.filter(d => (d.status || "").toLowerCase().trim() === t).length})</span>
            </button>
          ))}
        </div>

        {/* Main Table / Grid */}
        <div className="bg-white shadow-sm border border-slate-200/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Subject / Code</th>
                  <th className="px-8 py-6">Identity Meta</th>
                  <th className="px-8 py-6">Current Status</th>
                  <th className="px-8 py-6 text-center">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <RefreshCcw className="animate-spin text-indigo-500" size={40} />
                        <span className="font-black text-slate-300 uppercase tracking-widest text-sm">Accessing Secure API...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-32 text-center text-slate-300 font-black uppercase italic tracking-widest">
                      No Records Found in this category
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">{row.subjectName}</div>
                        <div className="text-[10px] text-indigo-500 font-bold mt-1 inline-block bg-indigo-50 px-2.5 py-0.5 rounded-full">{row.paperCode}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-black text-slate-600">{row.branch}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">S{row.semester} • {row.year}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase border ${row.status?.toLowerCase() === 'enabled' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${row.status?.toLowerCase() === 'enabled' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`} />
                          {row.status || "Disabled"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex justify-center gap-3">
                          <a href={row.pdfUrl} target="_blank" rel="noreferrer" title="Preview PDF" className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-slate-900 hover:text-white transition-all border border-slate-100 shadow-sm"><ExternalLink size={18}/></a>
                          
                          <button 
                            onClick={() => handleStatusChange(row.id, row.status)} 
                            disabled={updatingRows[row.id]} 
                            title={row.status === "Enabled" ? "Disable Now" : "Enable Now"}
                            className={`p-3 rounded-2xl border transition-all shadow-sm ${row.status === "Enabled" ? "bg-amber-50 text-amber-500 border-amber-100 hover:bg-amber-500 hover:text-white" : "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-500 hover:text-white"}`}
                          >
                            {updatingRows[row.id] ? <RefreshCcw size={18} className="animate-spin"/> : (row.status === "Enabled" ? <XCircle size={18}/> : <CheckCircle size={18}/>)}
                          </button>

                          <button 
                            onClick={() => handleDelete(row.id)} 
                            disabled={updatingRows[row.id]} 
                            title="Delete Row"
                            className="p-3 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-600 hover:text-white border border-rose-100 shadow-sm"
                          >
                            <Trash2 size={18}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}