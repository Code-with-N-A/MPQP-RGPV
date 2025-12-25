import React, { useEffect, useState, useCallback } from "react";
import { auth } from "./firebase";
import { useApiData } from "./ContextAPI"; 
import { motion, AnimatePresence } from "framer-motion"; 
import { 
    FiLock, FiAlertTriangle, FiInfo, FiFileText, 
    FiRefreshCw, FiExternalLink, FiUser, FiCalendar, FiCheckCircle, FiClock
} from "react-icons/fi";

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
    const { data: allData, fetchData, loading: contextLoading, setData } = useApiData();
    const [myPapers, setMyPapers] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const user = auth.currentUser;
    const userEmail = user?.email?.toLowerCase().trim() || "";

    // 1. Storage se data uthane ka logic
    const loadFromCache = useCallback(() => {
        const cachedData = sessionStorage.getItem(`submissions_${userEmail}`);
        const cachedTime = sessionStorage.getItem(`lastSync_${userEmail}`);

        if (cachedData) {
            const parsedData = JSON.parse(cachedData);
            setData(parsedData); // Context ko storage wala data de do
            if (cachedTime) setLastUpdated(new Date(cachedTime));
            return true; 
        }
        return false;
    }, [userEmail, setData]);

    // 2. Data Filter Logic (Local State Update)
    const filterUserSubmissions = useCallback((data) => {
        if (!data || !Array.isArray(data)) return;
        const filtered = data
            .filter(row => {
                const rowEmail = row.email?.toLowerCase().trim();
                return rowEmail === userEmail && row.status?.toLowerCase() !== "rejected";
            })
            .reverse();
        setMyPapers(filtered);
    }, [userEmail]);

    // 3. Sync Function (Sirf Button par ya First Time load par)
    const syncData = useCallback(async (isManual = true) => {
        if (!userEmail) return;
        
        // Agar manual click nahi hai aur cache mil gaya, toh API call mat karo
        if (!isManual && loadFromCache()) return;

        setIsRefreshing(true);
        try {
            // Context se fresh data fetch karna
            await fetchData({ isApprovalScreen: true });
            const now = new Date();
            setLastUpdated(now);
            sessionStorage.setItem(`lastSync_${userEmail}`, now.toISOString());
        } catch (error) {
            console.error("Sync error:", error);
        } finally {
            setIsRefreshing(false);
        }
    }, [userEmail, fetchData, loadFromCache]);

    // 4. Mount hone par check karo
    useEffect(() => {
        if (userEmail) {
            syncData(false); // isManual = false (Check cache first)
        }
    }, [userEmail, syncData]);

    // 5. Jab bhi Context ka data badle, use Storage mein save karo
    useEffect(() => {
        if (allData && allData.length > 0) {
            sessionStorage.setItem(`submissions_${userEmail}`, JSON.stringify(allData));
            filterUserSubmissions(allData);
        }
    }, [allData, userEmail, filterUserSubmissions]);

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
                
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight">My Submissions</h1>
                        <p className="text-slate-500 flex items-center gap-2 mt-2 font-medium">
                            <FiUser className="text-indigo-500" />
                            Account: <span className="text-indigo-600 font-bold">{userEmail}</span>
                        </p>
                    </motion.div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">Status</p>
                            <p className="text-xs font-bold text-emerald-500 flex items-center justify-end gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"/> Synced
                            </p>
                        </div>
                        {/* REFRESH BUTTON - Trigger manual sync */}
                        <button 
                            onClick={() => syncData(true)}
                            disabled={isRefreshing || contextLoading}
                            className="group flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-50"
                        >
                            <FiRefreshCw className={`${isRefreshing || contextLoading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
                            <span className="font-bold text-sm">{(isRefreshing || contextLoading) ? "Updating..." : "Refresh Sync"}</span>
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Total Uploaded', val: myPapers.length, icon: <FiFileText/>, col: 'text-blue-600' },
                        { label: 'Approved', val: myPapers.filter(p => p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved').length, icon: <FiCheckCircle/>, col: 'text-emerald-600' },
                        { label: 'Pending', val: myPapers.filter(p => p.status?.toLowerCase() !== 'enabled' && p.status?.toLowerCase() !== 'approved').length, icon: <FiClock/>, col: 'text-amber-600' },
                        { label: 'Last Sync', val: lastUpdated ? lastUpdated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--', icon: <FiRefreshCw/>, col: 'text-slate-600' }
                    ].map((s, i) => (
                        <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
                            <div className={`mb-2 ${s.col}`}>{s.icon}</div>
                            <div className="text-2xl font-black text-slate-800">{s.val}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</div>
                        </div>
                    ))}
                </div>

                <div className="bg-white shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden rounded-[2rem]">
                    {(contextLoading && myPapers.length === 0) ? (
                        <div className="py-32 text-center">
                            <div className="relative w-16 h-16 mx-auto mb-4">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <p className="text-slate-400 font-bold">Checking Storage...</p>
                        </div>
                    ) : myPapers.length === 0 ? (
                        <div className="py-32 text-center px-6">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FiFileText size={40} className="text-slate-200" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-800">No Data Found</h3>
                            <p className="text-slate-400 max-w-xs mx-auto mt-2">Try clicking "Refresh Sync" to fetch data from cloud.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Subject Details</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Category</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Current Status</th>
                                        <th className="px-8 py-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    <AnimatePresence mode='popLayout'>
                                        {myPapers.map((p, i) => (
                                            <motion.tr 
                                                key={p.id || i}
                                                layout
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
                                                                <FiCalendar size={12}/> {p.timestamp ? new Date(p.timestamp).toLocaleDateString() : 'N/A'}
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
                                                        <div className={`text-[10px] font-black uppercase tracking-widest ${p.status?.toLowerCase() === 'enabled' || p.status?.toLowerCase() === 'approved' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                                            {p.status || 'Pending Review'}
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
                                                            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-2xl font-bold text-xs"
                                                        >
                                                            View PDF <FiExternalLink size={14}/>
                                                        </motion.a>
                                                    ) : (
                                                        <span className="text-slate-300 font-black text-[10px] uppercase italic">No Link</span>
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

                <footer className="mt-12 text-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                    Data is cached locally • Click Refresh Sync for latest updates
                </footer>
            </div>
        </div>
    );
}