import React, { useEffect, useState } from "react";
import { auth } from "./firebase";
import { useApiData } from "./ContextAPI";
import { motion, AnimatePresence } from "framer-motion"; 
import { 
    FiLock, FiAlertTriangle, FiInfo, FiFileText, 
    FiRefreshCw, FiExternalLink, FiUser, FiCalendar, FiBookOpen
} from "react-icons/fi";

const REFRESH_INTERVAL = 3000;

// --- STEP-BY-STEP STATUS COMPONENT ---
const StatusTimeline = ({ status }) => {
    const isApproved = status === "approved" || status === "enabled";
    
    const steps = [
        { label: "Received", active: true, color: "bg-emerald-500" },
        { label: "Review", active: true, color: isApproved ? "bg-emerald-500" : "bg-amber-500 animate-pulse" },
        { label: "Live", active: isApproved, color: isApproved ? "bg-emerald-500" : "bg-slate-200" }
    ];

    return (
        <div className="flex items-center gap-1">
            {steps.map((step, idx) => (
                <React.Fragment key={idx}>
                    <div className={`w-2.5 h-2.5 rounded-full ${step.color} shadow-sm`} title={step.label} />
                    {idx < steps.length - 1 && (
                        <div className={`w-4 h-[2px] ${step.active && (idx === 0 || isApproved) ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default function ApprovalS() {
    const { API_URL } = useApiData();
    // Initialize state from sessionStorage to avoid flickering on page return
    const [myPapers, setMyPapers] = useState(() => {
        const cached = sessionStorage.getItem("my_submissions");
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!sessionStorage.getItem("my_submissions"));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const user = auth.currentUser;
    const userEmail = user?.email?.toLowerCase() || "";

    const loadData = async (manual = false) => {
        if (!userEmail) return;
        if (manual) setIsRefreshing(true);

        try {
            const res = await fetch(`${API_URL}?action=list`);
            const json = await res.json();

            if (json.status === "success") {
                const filtered = json.rows.filter(
                    (row) => row.email?.toLowerCase() === userEmail && row.status?.toLowerCase() !== "rejected"
                );
                const sortedData = filtered.reverse(); // Newest first
                setMyPapers(sortedData);
                sessionStorage.setItem("my_submissions", JSON.stringify(sortedData));
                setLastUpdated(new Date());
                setError("");
            }
        } catch (err) {
            console.error("Fetch error:", err);
            // Don't show error if we already have cached data
            if (myPapers.length === 0) setError("Sync failed. Checking connection...");
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        if (!userEmail) return;
        loadData();
        const interval = setInterval(() => loadData(false), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [userEmail]);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm">
                    <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <FiLock size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Private Access</h2>
                    <p className="text-slate-500 mb-6">Please sign in to track your document submissions.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 font-[Poppins]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* HEADER SECTION */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Submission Tracker</h1>
                        <p className="text-slate-500 flex items-center gap-2 mt-1">
                            <FiUser className="text-indigo-500" />
                            Active Session: <span className="font-bold text-indigo-600">{userEmail}</span>
                        </p>
                    </motion.div>

                    <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
                        {lastUpdated && (
                            <div className="hidden sm:flex flex-col items-end px-3">
                                <span className="text-[9px] uppercase tracking-widest font-black text-slate-400">Last Sync</span>
                                <span className="text-xs font-bold text-slate-600">{lastUpdated.toLocaleTimeString()}</span>
                            </div>
                        )}
                        <button 
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-70"
                        >
                            <FiRefreshCw className={isRefreshing || loading ? "animate-spin" : ""} />
                            <span className="font-bold text-sm">{isRefreshing ? "Syncing..." : "Refresh"}</span>
                        </button>
                    </motion.div>
                </header>

                {/* INFO CARDS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-6 rounded-[2rem] shadow-sm">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm"><FiAlertTriangle size={24}/></div>
                            <div>
                                <h3 className="font-bold text-amber-900">Submission Policy</h3>
                                <p className="text-sm text-amber-800/80 leading-relaxed mt-1">
                                    Rejected scans are removed in 24h. Please ensure the <b>Branch</b> and <b>Subject Code</b> match the uploaded PDF.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -5 }} className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-6 rounded-[2rem] shadow-sm">
                        <div className="flex gap-4">
                            <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm"><FiInfo size={24}/></div>
                            <div className="w-full">
                                <h3 className="font-bold text-indigo-900">Live Status Guide</h3>
                                <div className="flex justify-between mt-4 text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                    <span>Cloud</span>
                                    <span>Verifying</span>
                                    <span>Public</span>
                                </div>
                                <div className="mt-2 h-2 w-full bg-indigo-200/50 rounded-full overflow-hidden flex">
                                    <div className="w-1/3 h-full bg-indigo-500 border-r border-white/20" />
                                    <div className="w-1/3 h-full bg-indigo-400 animate-pulse border-r border-white/20" />
                                    <div className="w-1/3 h-full bg-slate-200" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* MAIN TABLE */}
                <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {loading && myPapers.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="animate-spin w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p className="text-slate-400 font-medium">Fetching your papers...</p>
                        </div>
                    ) : myPapers.length === 0 ? (
                        <div className="py-24 text-center">
                            <FiFileText size={50} className="mx-auto text-slate-200 mb-4" />
                            <h3 className="text-xl font-bold text-slate-400">No submissions found</h3>
                            <p className="text-slate-300 text-sm mt-1">Your uploaded papers will appear here.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/80">
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Document Information</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Classification</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100">Live Status</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-100 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence>
                                        {myPapers.map((p, i) => (
                                            <motion.tr 
                                                key={i}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                className="hover:bg-indigo-50/20 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 text-base leading-tight group-hover:text-indigo-700 transition-colors">{p.subjectName}</span>
                                                        <div className="flex items-center gap-3 mt-1.5 text-xs font-bold text-slate-400">
                                                            <span className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-[10px] uppercase"><FiBookOpen size={10}/> {p.paperCode}</span>
                                                            <span className="flex items-center gap-1"><FiCalendar size={12}/> {new Date(p.timestamp).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-2">
                                                        {/* --- BRANCH SHOWING HERE --- */}
                                                        <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-indigo-100">
                                                            {p.branch || "N/A"}
                                                        </span>
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                            Sem: {p.semester}
                                                        </span>
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                            {p.year}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col gap-2">
                                                        <StatusTimeline status={p.status?.toLowerCase()} />
                                                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                            {p.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {p.pdfUrl ? (
                                                        <motion.a 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            href={p.pdfUrl} 
                                                            target="_blank" 
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-md"
                                                        >
                                                            View <FiExternalLink size={14}/>
                                                        </motion.a>
                                                    ) : (
                                                        <span className="text-slate-300 font-black text-[10px] uppercase italic tracking-widest">Processing</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* FOOTER INFO */}
                <p className="mt-8 text-center text-slate-400 text-xs font-medium">
                    Data updates automatically every {REFRESH_INTERVAL/1000} seconds. 
                    <br className="sm:hidden" /> Manual refresh forces a cloud sync.
                </p>

            </div>
        </div>
    );
}