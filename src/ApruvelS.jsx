import React, { useEffect, useState, useCallback } from "react";
import { auth } from "./firebase";
import { useApiData } from "./ContextAPI";
import { motion, AnimatePresence } from "framer-motion";
import {
    FiRefreshCw, FiCheckCircle, FiShield,
    FiArrowRight, FiActivity, FiSearch, FiGlobe, FiLock, FiStar, FiFileText, FiAward, FiInfo
} from "react-icons/fi";

// --- PROFESSIONAL STEP TRACKER COMPONENT ---
const ProcessTracker = ({ paper }) => {
    const status = paper.status?.toLowerCase();
    const isApproved = status === "approved" || status === "enabled";

    const formatDate = (dateStr) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    return (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-5 shadow-sm relative overflow-hidden group hover:border-indigo-300 transition-all duration-300">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <div className="flex gap-2 mb-3">
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-md uppercase tracking-wider">{paper.branch || "Academic"}</span>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-md uppercase tracking-wider">{paper.year || "Gen"} • SEM {paper.semester || "0"}</span>
                    </div>
                    <h4 className="text-lg font-extrabold text-slate-800 uppercase tracking-tight leading-none mb-2">{paper.subjectName}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1">
                        <FiFileText size={12} /> Ref ID: {paper.timestamp ? paper.timestamp.toString().slice(-6) : "PENDING"} • {formatDate(paper.timestamp)}
                    </p>
                </div>
                <div className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${isApproved ? "bg-emerald-500 text-white" : "bg-amber-500 text-white"}`}>
                    {isApproved ? "Verified" : "Under Review"}
                </div>
            </div>

            <div className="relative flex items-center justify-between px-6">
                <div className="absolute top-5 left-14 right-14 h-[3px] bg-slate-100 -z-0">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: isApproved ? "100%" : "50%" }}
                        className="h-full bg-indigo-600 transition-all duration-1000"
                    />
                </div>

                {[
                    { icon: <FiCheckCircle size={18} />, label: "Submission", active: true },
                    { icon: isApproved ? <FiCheckCircle size={18} /> : <FiSearch size={18} />, label: "Verification", active: true, pulse: !isApproved },
                    { icon: <FiGlobe size={18} />, label: "Public Live", active: isApproved, bounce: isApproved }
                ].map((step, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                        <motion.div
                            animate={step.pulse ? { scale: [1, 1.1, 1], backgroundColor: ["#f59e0b", "#fbbf24", "#f59e0b"] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={`w-11 h-11 rounded-full flex items-center justify-center border-4 border-white shadow-lg ${step.active ? (step.bounce ? "bg-emerald-500 animate-bounce" : "bg-indigo-600") : "bg-slate-200"} text-white`}
                        >
                            {step.icon}
                        </motion.div>
                        <p className="text-[9px] font-black mt-3 text-slate-700 uppercase tracking-tighter">{step.label}</p>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-50 flex justify-end">
                <a href={paper.pdfUrl} target="_blank" rel="noreferrer" className="text-[11px] font-black uppercase text-indigo-600 flex items-center gap-2 hover:gap-4 transition-all group-hover:underline">
                    View Digital Copy <FiArrowRight />
                </a>
            </div>
        </div>
    );
};

export default function ApprovalS() {
    const { data: allData, fetchData } = useApiData();
    const [myPapers, setMyPapers] = useState([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // --- Google Search SEO ---
    useEffect(() => {
        document.title = "Track Paper Status | MPQP Verification Portal";
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute("content", "Track your RGPV Polytechnic paper submissions. View real-time verification status on MPQP.");
        }
    }, []);
    // ----------------------------

    const user = auth.currentUser;
    const userEmail = user?.email?.toLowerCase().trim() || "";

    const syncData = useCallback(async () => {
        if (!userEmail) return;
        setIsRefreshing(true);
        try { await fetchData({ isApprovalScreen: true }); }
        catch (error) { console.error("Sync Error:", error); }
        finally { setIsRefreshing(false); }
    }, [userEmail, fetchData]);

    useEffect(() => { if (userEmail) syncData(); }, [userEmail, syncData]);

    useEffect(() => {
        if (allData) {
            let userRecords = allData.filter(row => row.email?.toLowerCase().trim() === userEmail).reverse();
            setMyPapers(userRecords);

            const visitCount = parseInt(sessionStorage.getItem("verify_visit_count") || "0");
            if (userRecords.some(p => p.status?.toLowerCase() === "approved") && visitCount < 2) {
                setShowToast(true);
                sessionStorage.setItem("verify_visit_count", (visitCount + 1).toString());
                setTimeout(() => setShowToast(false), 5000);
            }
        }
    }, [allData, userEmail]);

    if (!user) return <div className="h-screen flex items-center justify-center font-black tracking-widest text-slate-300 uppercase bg-[#F8FAFC]">Access Denied</div>;

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-24 font-['Inter',sans-serif]">

            {/* --- TOP TOAST --- */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ y: -50, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
                        className="fixed top-0 left-0 right-0 z-[100] flex justify-center px-6 pointer-events-none"
                    >
                        <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-white/10">
                            <FiAward className="text-amber-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Document Live: Your contribution is verified.</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- CLEAN HEADER --- */}
            <div className=" pt-10">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-100">
                            <FiShield className="text-white" size={22} />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 uppercase italic">
                                User <span className="text-indigo-600">Status</span>
                            </h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Global Repository Sync active</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={syncData}
                        className="flex items-center gap-2 bg-slate-900 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-full font-black text-[10px] uppercase transition-all active:scale-95 group"
                    >
                        <FiRefreshCw className={`${isRefreshing ? "animate-spin" : "group-hover:rotate-180"} transition-transform duration-700`} size={14} />
                        <span className="hidden sm:inline tracking-widest">Sync Status</span>
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 mt-10">
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT: INFORMATION & ANALYTICS */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Status Card */}
                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-4 opacity-10"><FiActivity size={60} /></div>
                            <h3 className="text-[11px] font-black uppercase text-indigo-600 mb-6 flex items-center gap-2 tracking-widest">
                                <FiInfo /> System Intelligence
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">Current Data</span>
                                    <span className="text-sm font-black text-slate-800">{myPapers.length}</span>
                                </div>
                            </div>
                            <div className="mt-8 pt-6 border-t border-slate-100">
                                <div className="space-y-4 text-[10px] font-bold text-slate-500 uppercase">
                                    <p className="flex gap-3"><FiCheckCircle className="text-emerald-500 shrink-0" /> Verified papers are open-sourced.</p>
                                    <p className="flex gap-3"><FiSearch className="text-amber-500 shrink-0" /> Standard review: 24-48 Hours.</p>
                                </div>
                            </div>
                        </div>

                        {/* Impact Card (The new card you asked for) */}
                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-100">
                            <FiAward size={32} className="mb-4 text-indigo-200" />
                            <h3 className="text-lg font-black leading-tight mb-2">Academic Impact</h3>
                            <p className="text-indigo-100 text-[10px] font-medium leading-relaxed uppercase tracking-wider mb-6">
                                Your contributions assist thousands of students in their exam preparation. We appreciate your role in building a free digital library.
                            </p>
                            <div className="bg-white/10 p-3 rounded-lg border border-white/10">
                                <p className="text-[9px] font-black text-indigo-200 uppercase mb-1 tracking-widest">Community Badge</p>
                                <p className="text-xs font-bold uppercase">Silver Contributor</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: TRACKING LIST */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {myPapers.length > 0 ? (
                                <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="flex items-center justify-between mb-6 px-1">
                                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Verification Pipeline</h2>
                                        <span className="text-[10px] font-black text-indigo-600">Updated Real-time</span>
                                    </div>
                                    {myPapers.map((paper, idx) => (
                                        <ProcessTracker key={idx} paper={paper} />
                                    ))}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-white border-2 border-dashed border-slate-200 p-12 md:p-20 text-center rounded-3xl"
                                >
                                    {/* Neutral Icon jo sabke liye sahi hai */}
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 text-slate-300">
                                        <FiShield size={40} />
                                    </div>

                                    <h3 className="text-2xl font-black text-slate-800 mb-4 uppercase tracking-tighter italic">
                                        वेरिफिकेशन
                                    </h3>

                                    <p className="text-slate-500 text-[11px] font-bold max-w-sm mx-auto leading-relaxed mb-10 uppercase tracking-widest">
                                        "शिक्षा की शक्ति साझा करने में है" <br />
                                        आपकी वेरिफिकेशन लिस्ट अभी पूरी तरह से क्लियर है।
                                        जब भी आप नए पेपर्स अपलोड करेंगे, उनका लाइव स्टेटस यहाँ दिखाई देगा।
                                    </p>

                                    <div className="flex flex-wrap justify-center gap-6 items-center border-t border-slate-50 pt-10">
                                        <div className="text-center">
                                            <p className="text-lg font-black text-slate-300">01</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">स्कैन और अपलोड</p>
                                        </div>
                                        <div className="w-8 h-[2px] bg-slate-100"></div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-slate-300">02</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">क्वालिटी चेक</p>
                                        </div>
                                        <div className="w-8 h-[2px] bg-slate-100"></div>
                                        <div className="text-center">
                                            <p className="text-lg font-black text-slate-300">03</p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">ग्लोबल लाइव</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* --- SYSTEM FOOTER --- */}

        </div>
    );
}