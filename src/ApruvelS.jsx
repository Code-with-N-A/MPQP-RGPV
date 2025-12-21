import React, { useEffect, useState, useCallback } from "react";
import { auth } from "./firebase";
import { useApiData } from "./ContextAPI";
import { motion, AnimatePresence } from "framer-motion"; 
import { 
    FiLock, FiAlertTriangle, FiInfo, FiFileText, 
    FiRefreshCw, FiExternalLink, FiUser, FiCalendar, FiBookOpen, FiCheckCircle, FiClock
} from "react-icons/fi";

const REFRESH_INTERVAL = 5000; // Updated to 5s for better performance

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
                    <div className={`w-2.5 h-2.5 rounded-full ${step.color} shadow-sm transition-colors duration-500`} title={step.label} />
                    {idx < steps.length - 1 && (
                        <div className={`w-4 h-[2px] transition-colors duration-500 ${step.active && (idx === 0 || isApproved) ? "bg-emerald-500" : "bg-slate-200"}`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

export default function ApprovalS() {
    const { API_URL } = useApiData();
    const [myPapers, setMyPapers] = useState(() => {
        const cached = sessionStorage.getItem("my_submissions");
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(!sessionStorage.getItem("my_submissions"));
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const user = auth.currentUser;
    const userEmail = user?.email?.toLowerCase() || "";

    const loadData = useCallback(async (manual = false) => {
        if (!userEmail || !API_URL) return;
        if (manual) setIsRefreshing(true);

        try {
            const res = await fetch(`${API_URL}?action=list`);
            const json = await res.json();

            if (json.status === "success") {
                const filtered = json.rows
                    .filter(row => row.email?.toLowerCase() === userEmail && row.status?.toLowerCase() !== "rejected")
                    .reverse();
                
                setMyPapers(filtered);
                sessionStorage.setItem("my_submissions", JSON.stringify(filtered));
                setLastUpdated(new Date());
            }
        } catch (err) {
            console.error("Sync Error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    }, [userEmail, API_URL]);

    useEffect(() => {
        loadData();
        const interval = setInterval(() => loadData(false), REFRESH_INTERVAL);
        return () => clearInterval(interval);
    }, [loadData]);

    // Stats calculation
    const stats = {
        total: myPapers.length,
        live: myPapers.filter(p => p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved').length,
        pending: myPapers.filter(p => p.status?.toLowerCase() !== 'enabled' && p.status?.toLowerCase() !== 'approved').length
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 max-w-sm">
                    <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <FiLock size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Private Access</h2>
                    <p className="text-slate-500 mb-6">Please sign in to track your document submissions.</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8fafc] pb-20 pt-10 font-[Poppins] selection:bg-indigo-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                {/* HEADER */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Track Submissions</h1>
                        <p className="text-slate-500 flex items-center gap-2 mt-2 font-medium">
                            <FiUser className="text-indigo-500" />
                            User: <span className="text-indigo-600 font-bold">{userEmail}</span>
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">System Status</p>
                            <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"/> Connected
                            </p>
                        </div>
                        <button 
                            onClick={() => loadData(true)}
                            disabled={isRefreshing}
                            className="group flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl hover:border-indigo-500 hover:text-indigo-600 transition-all shadow-sm disabled:opacity-50"
                        >
                            <FiRefreshCw className={`${isRefreshing || loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                            <span className="font-bold text-sm">{isRefreshing ? "Syncing..." : "Refresh Sync"}</span>
                        </button>
                    </div>
                </header>

                {/* STATS ROW */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Papers', val: stats.total, icon: <FiFileText/>, col: 'text-blue-600' },
                        { label: 'Live on Site', val: stats.live, icon: <FiCheckCircle/>, col: 'text-emerald-600' },
                        { label: 'Processing', val: stats.pending, icon: <FiClock/>, col: 'text-amber-600' },
                        { label: 'Last Sync', val: lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--', icon: <FiRefreshCw/>, col: 'text-slate-600' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                            <div className={`mb-2 ${s.col}`}>{s.icon}</div>
                            <div className="text-2xl font-black text-slate-800">{s.val}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>

                {/* POLICY & INFO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-amber-50/50 border border-amber-100 p-6 rounded-[2rem] flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-amber-600 shadow-sm h-fit"><FiAlertTriangle size={24}/></div>
                        <div>
                            <h3 className="font-bold text-amber-900">Important Note</h3>
                            <p className="text-sm text-amber-800/80 leading-relaxed mt-1">
                                Scans with incorrect <b>Subject Codes</b> are automatically rejected by the system. Rejected items are cleared every 24 hours.
                            </p>
                        </div>
                    </div>
                    <div className="bg-indigo-50/50 border border-indigo-100 p-6 rounded-[2rem] flex gap-4">
                        <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm h-fit"><FiInfo size={24}/></div>
                        <div className="flex-1">
                            <h3 className="font-bold text-indigo-900">Verification Process</h3>
                            <div className="mt-4 h-1.5 w-full bg-slate-200 rounded-full overflow-hidden flex">
                                <div className="w-2/3 h-full bg-indigo-500 animate-pulse" />
                            </div>
                            <p className="text-[10px] font-black text-indigo-400 mt-2 uppercase tracking-tighter">Your paper is currently being indexed in our database</p>
                        </div>
                    </div>
                </div>

                {/* MAIN CONTENT */}
                <div className="bg-white  shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    {loading && myPapers.length === 0 ? (
                        <div className="py-32 text-center">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-400 font-bold animate-pulse">Syncing Submission Cloud...</p>
                        </div>
                    ) : myPapers.length === 0 ? (
                        <div className="py-32 text-center px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiFileText size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">No Submissions Found</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mt-2">Any paper you upload using this email will appear here automatically.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Paper Details</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Live Status</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Cloud Link</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode='popLayout'>
                                        {myPapers.map((p, i) => (
                                            <motion.tr 
                                                key={p.timestamp + i}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-50/80 transition-colors group"
                                            >
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-slate-800 text-lg group-hover:text-indigo-600 transition-colors">{p.subjectName}</span>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-indigo-100">{p.paperCode}</span>
                                                            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1">
                                                                <FiCalendar size={12}/> {new Date(p.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-wrap gap-1.5">
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider">{p.branch}</span>
                                                        <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider">Sem {p.semester}</span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="space-y-2">
                                                        <StatusTimeline status={p.status?.toLowerCase()} />
                                                        <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {p.status || 'Checking'}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6 text-center">
                                                    {p.pdfUrl ? (
                                                        <motion.a 
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            href={p.pdfUrl} 
                                                            target="_blank" 
                                                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-xs hover:bg-indigo-600 transition-all shadow-lg shadow-slate-200"
                                                        >
                                                            Open PDF <FiExternalLink size={14}/>
                                                        </motion.a>
                                                    ) : (
                                                        <span className="text-slate-300 font-black text-[10px] uppercase italic tracking-[0.2em] animate-pulse">Syncing File...</span>
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

                <footer className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-full text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <FiRefreshCw className={isRefreshing ? "animate-spin" : ""}/> Auto-Refresh Every 5s
                    </div>
                </footer>
            </div>
        </div>
    );
}