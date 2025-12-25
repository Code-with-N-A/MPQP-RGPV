import React, { useEffect, useState, useCallback } from "react";
import { useApiData } from "./ContextAPI";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  RefreshCcw, Filter, RotateCcw, Upload, 
  ChevronUp, ChevronDown, Search, FileText, BookOpen, AlertCircle
} from "lucide-react";

export default function Home({ isAdmin = false }) {
  const { API_URL } = useApiData();
  const [data, setData] = useState(() => {
    const saved = sessionStorage.getItem("cached_papers");
    return saved ? JSON.parse(saved) : [];
  });

  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [options, setOptions] = useState({ years: [], sems: [], branches: [] });
  const [user, setUser] = useState(null);
  const [sortColumn, setSortColumn] = useState("year");
  const [sortDirection, setSortDirection] = useState("desc");
  // Highlight state for active PDF
  const [activePdfId, setActivePdfId] = useState(null);

  const navigate = useNavigate();
  const isFilterReady = yearFilter && semFilter && branchFilter;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const res = await fetch(`${API_URL}?action=getFilters`);
        const json = await res.json();
        if (json.status === "success") setOptions(json.options);
      } catch (err) { console.error(err); }
    };
    fetchFilters();
  }, [API_URL]);

  const handleFetchData = useCallback(async () => {
    if (!isAdmin && !isFilterReady) return;
    
    setData([]); 
    setLoading(true);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        action: "list",
        year: yearFilter,
        semester: semFilter,
        branch: branchFilter,
        admin: isAdmin ? "true" : "false"
      });
      const res = await fetch(`${API_URL}?${params.toString()}`);
      const text = await res.text();
      
      if (text.trim() && !text.includes("<!DOCTYPE")) {
        const rows = text.split("\n").filter(r => r.trim()).map(line => {
          const col = line.split("||");
          return {
            timestamp: col[0], id: col[1], year: col[2], semester: col[3],
            paperCode: col[4], pdfUrl: col[5], subjectName: col[6],
            type: col[7], status: col[8], branch: col[9], email: col[10]
          };
        });
        setData(rows);
        sessionStorage.setItem("cached_papers", JSON.stringify(rows));
      } else {
        setData([]);
        sessionStorage.removeItem("cached_papers");
      }
    } catch (err) { 
      console.error(err); 
      setData([]);
    }
    finally { setLoading(false); }
  }, [API_URL, yearFilter, semFilter, branchFilter, isAdmin, isFilterReady]);

  // Updated PDF Access Check with Highlight Logic
  const handlePdfAccess = (rowId, pdfUrl) => {
    if (!user) {
      navigate("/signup");
    } else {
      setActivePdfId(rowId); // Set this row as active
      window.open(pdfUrl, "_blank");
    }
  };

  const handleSort = (column) => {
    if (sortColumn === column) setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    else { setSortColumn(column); setSortDirection("asc"); }
  };

  const sortedData = [...data].sort((a, b) => {
    let aVal = a[sortColumn], bVal = b[sortColumn];
    if (sortColumn === "year" || sortColumn === "semester") {
      aVal = Number(aVal) || 0; bVal = Number(bVal) || 0;
    }
    return sortDirection === "asc" ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
  });

  const SortIcon = ({ col }) => {
    if (sortColumn !== col) return <ChevronDown size={12} className="inline ml-1 opacity-30" />;
    return sortDirection === "asc" ? <ChevronUp size={14} className="inline ml-1 text-blue-800" /> : <ChevronDown size={14} className="inline ml-1 text-blue-800" />;
  };

  return (
    <div className="min-h-screen bg-[#F4F7F9] font-sans">
      
      <div className="sticky top-6 bg-[#F4F7F9] pt-10 pb-2 shadow-sm md:shadow-none z-10">
        <div className="max-w-7xl mx-auto bg-white border border-slate-300 p-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 flex-1 overflow-x-auto no-scrollbar whitespace-nowrap">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-[10px] uppercase border-r pr-4">
                <Filter size={14} /> <span>Filters</span>
              </div>
              
              <div className="flex gap-3">
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="form-select text-xs font-bold border-slate-200 rounded min-w-[120px]">
                  <option value="">YEAR</option>
                  {options.years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="form-select text-xs font-bold border-slate-200 rounded min-w-[120px]">
                  <option value="">SEMESTER</option>
                  {options.sems.map(s => <option key={s} value={s}>Sem {s}</option>)}
                </select>
                <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="form-select text-xs font-bold border-slate-200 rounded min-w-[140px] uppercase">
                  <option value="">BRANCH</option>
                  {options.branches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2 pl-2 border-l border-slate-100">
              <button onClick={() => { setYearFilter(""); setSemFilter(""); setBranchFilter(""); setData([]); setHasSearched(false); setActivePdfId(null); }} className="p-2 text-slate-400 hover:text-red-600 border border-slate-100 rounded">
                <RotateCcw size={16} />
              </button>
              <button 
                onClick={handleFetchData}
                disabled={(!isAdmin && !isFilterReady) || loading}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F172A] text-white rounded font-bold text-[10px] uppercase tracking-widest hover:bg-blue-900 disabled:bg-slate-200"
              >
                {loading ? <RefreshCcw size={14} className="animate-spin" /> : <Search size={14} />}
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 bg-white border border-slate-200 rounded-lg">
            <div className="w-12 h-12 border-4 border-slate-200 border-t-blue-800 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-500 font-bold text-xs uppercase tracking-widest">Processing Request...</p>
          </div>
        ) : data.length > 0 ? (
          <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
               <h2 className="text-sm font-bold text-slate-800 uppercase italic">Found {data.length} Available Documents</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 text-left border-b border-slate-200">
                    <th className="p-4 text-[11px] font-bold text-slate-500 uppercase w-16 text-center">Sr.No</th>
                    {[{l:"Academic Session",k:"year"}, {l:"Branch",k:"branch"}, {l:"Subject Description",k:"subjectName"}].map(h => (
                      <th key={h.k} onClick={() => handleSort(h.k)} className="p-4 text-[11px] font-bold text-slate-700 uppercase cursor-pointer hover:bg-slate-200">
                        <div className="flex items-center gap-1">{h.l} <SortIcon col={h.k} /></div>
                      </th>
                    ))}
                    <th className="p-4 text-right text-[11px] font-bold text-slate-500 uppercase">Access</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sortedData.map((row, index) => (
                    <tr 
                      key={row.id} 
                      className={`transition-colors ${activePdfId === row.id ? 'bg-blue-100/80 border-l-4 border-l-blue-800' : 'hover:bg-blue-50/50'}`}
                    >
                      <td className="p-4 text-center text-slate-400 font-medium text-sm">{index + 1}</td>
                      <td className="p-4">
                        <div className="font-bold text-slate-700">{row.year}</div>
                        <div className="text-[10px] text-slate-500">Semester: {row.semester}</div>
                      </td>
                      <td className="p-4 text-sm font-semibold text-slate-600 uppercase">{row.branch}</td>
                      <td className="p-4">
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 uppercase">{row.subjectName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{row.paperCode} | {row.type}</span>
                         </div>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handlePdfAccess(row.id, row.pdfUrl)}
                          className={`px-4 py-2 border rounded text-[10px] font-bold uppercase transition-all ${activePdfId === row.id ? 'bg-blue-800 text-white border-blue-800' : 'border-blue-800 text-blue-800 hover:bg-blue-800 hover:text-white'}`}
                        >
                          {activePdfId === row.id ? 'Active' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : hasSearched ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-slate-200 rounded-xl shadow-sm animate-in fade-in duration-500">
            <div className="p-5 bg-slate-50 rounded-full mb-4">
               <AlertCircle size={48} className="text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-tight">No Data Available</h3>
            <p className="text-slate-500 text-xs mt-2 font-medium">चयनित फ़िल्टर के लिए कोई रिकॉर्ड नहीं मिला। कृपया पुनः प्रयास करें।</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-5 gap-8 items-start animate-in fade-in duration-700">
            <div className="lg:col-span-3 bg-white border border-slate-300 rounded-xl p-8 sm:p-12 shadow-sm">
               <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-lg">
                    <BookOpen size={30} />
                  </div>
                  <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight border-l-4 border-blue-800 pl-4">
                    Digital Resource Library
                  </h1>
               </div>
               
               <p className="text-slate-600 text-lg leading-relaxed mb-8">
                पुराने प्रश्न पत्र छात्रों के लिए सबसे महत्वपूर्ण मार्गदर्शक होते हैं। यह पोर्टल छात्र-एकता के आधार पर बनाया गया है। यदि आपके पास पिछले वर्षों के पेपर्स उपलब्ध हैं, तो कृपया उन्हें साझा करें। 
                <br /><br />
                <span className="bg-yellow-50 text-yellow-800 px-2 py-1 font-bold italic border border-yellow-200 text-sm">
                  "आपका एक छोटा सा योगदान किसी की परीक्षा की तैयारी को सफल बना सकता है।"
                </span>
               </p>

               <div className="p-6 bg-slate-50 border-l-4 border-slate-900 rounded-r-lg mb-8">
                  <h4 className="font-bold text-slate-800 text-sm uppercase mb-2">महत्वपूर्ण सूचना:</h4>
                  <ul className="text-xs text-slate-500 space-y-2 list-disc ml-4">
                    <li>पेपर्स को स्पष्ट रूप से स्कैन करके ही अपलोड करें।</li>
                    <li>कृपया केवल आधिकारिक यूनिवर्सिटी प्रश्न पत्र ही साझा करें।</li>
                    <li>अपलोड करने के बाद टीम द्वारा वेरिफिकेशन किया जाएगा।</li>
                  </ul>
               </div>

               <button 
                onClick={() => navigate("/paper-upload")} 
                className="flex items-center gap-3 px-10 py-4 bg-blue-800 text-white rounded font-bold text-sm uppercase tracking-widest hover:bg-[#0F172A] transition-all shadow-lg"
               >
                 <Upload size={18} /> पेपर अपलोड करें (Upload Now)
               </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
               <div className="bg-[#0F172A] p-8 rounded-xl text-white relative overflow-hidden group z-0">
                  <FileText className="absolute -right-4 -bottom-4 text-white/10 group-hover:rotate-12 transition-transform" size={120} />
                  <h3 className="text-xl font-bold mb-4">योगदान दें (Contribute)</h3>
                  <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    यह लाइब्रेरी पूरी तरह से छात्रों द्वारा संचालित है। यहाँ मौजूद हर पेपर किसी न किसी छात्र ने निःस्वार्थ भाव से अपलोड किया है।
                  </p>
                  <div className="text-[10px] font-bold text-blue-400 border-t border-white/10 pt-4 uppercase tracking-widest">
                    Support Student Community
                  </div>
               </div>

               <div className="bg-white border border-slate-300 p-8 rounded-xl">
                  <h3 className="text-slate-800 font-bold uppercase text-xs tracking-widest mb-6 border-b pb-2">Quick Instructions</h3>
                  <div className="space-y-6">
                    <div className="flex gap-4">
                      <div className="text-slate-300 font-black text-2xl italic">01.</div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">ऊपर दिए गए फ़िल्टर (Year, Sem, Branch) का उपयोग करके अपना पेपर खोजें।</p>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-slate-300 font-black text-2xl italic">02.</div>
                      <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">यदि पेपर उपलब्ध नहीं है, तो "Search Records" बटन दबाकर सुनिश्चित करें।</p>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .form-select {
          appearance: none;
          padding: 0.5rem 2rem 0.5rem 0.75rem;
          background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
          background-position: right 0.5rem center;
          background-repeat: no-repeat;
          background-size: 1.2em 1.2em;
        }
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}} />
    </div>
  );
}