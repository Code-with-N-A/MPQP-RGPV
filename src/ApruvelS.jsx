import React, { useEffect, useRef, useState } from "react";
import { auth } from "./firebase";
import { useApiData } from "./ContextAPI";

// Refresh interval for polling
const REFRESH_INTERVAL = 3000; // 3 seconds

// SVG Icon Components for Professional Look
const LockIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
);

const WarningIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
);

const InfoIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const DocumentIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const RefreshIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
);

// Progress Bar Component with Enhanced Animation
const ProgressBar = ({ status }) => {
    const isApproved = status === "approved" || status === "enabled";
    const isPending = !isApproved;

    return (
        <div className="flex items-center justify-center space-x-2">
            {/* Step 1: Data Received - Always Green */}
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
            {/* Line 1 */}
            <div className={`w-6 h-0.5 ${isApproved ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            {/* Step 2: Pending - Yellow with Forward Progress Animation */}
            <div className={`w-4 h-4 rounded-full ${isApproved ? 'bg-green-500' : 'bg-yellow-500'} flex items-center justify-center ${isPending ? 'animate-bounce' : ''}`}>
                {isApproved && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
                {isPending && (
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                )}
            </div>
            {/* Line 2 */}
            <div className={`w-6 h-0.5 ${isApproved ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            {/* Step 3: Approved - Blue when pending, Green when approved */}
            <div className={`w-4 h-4 rounded-full ${isApproved ? 'bg-green-500' : 'bg-blue-500'} flex items-center justify-center`}>
                {isApproved && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
                {isPending && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
            </div>
        </div>
    );
};

// Demo Progress Bar Component for Status Info
const DemoProgressBar = () => (
    <div className="flex items-center justify-center space-x-2 mb-4">
        {/* Step 1: Data Received */}
        <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
            </div>
            <span className="text-xs text-gray-600 mt-1">Data Received</span>
        </div>
        {/* Line 1 */}
        <div className="w-6 h-0.5 bg-yellow-500"></div>
        {/* Step 2: Pending */}
        <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center animate-bounce">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            </div>
            <span className="text-xs text-gray-600 mt-1">Pending</span>
        </div>
        {/* Line 2 */}
        <div className="w-6 h-0.5 bg-gray-300"></div>
        {/* Step 3: Approved */}
        <div className="flex flex-col items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span className="text-xs text-gray-600 mt-1">Approved</span>
        </div>
    </div>
);

export default function ApprovalS() {
    const { API_URL } = useApiData();
    const [myPapers, setMyPapers] = useState(() => {
        const cached = localStorage.getItem("myPapers");
        return cached ? JSON.parse(cached) : [];
    });
    const [loading, setLoading] = useState(myPapers.length === 0);
    const [error, setError] = useState("");
    const [lastUpdated, setLastUpdated] = useState(null);

    const intervalRef = useRef(null);
    const user = auth.currentUser;
    const userEmail = user?.email?.toLowerCase() || "";

    // Fetch user data from API
    const fetchMyData = async () => {
        if (!userEmail) {
            setMyPapers([]);
            setLoading(false);
            return;
        }

        try {
            const res = await fetch(`${API_URL}?action=list`);
            const json = await res.json();

            if (json.status !== "success" || !Array.isArray(json.rows)) {
                setError("Unable to fetch data. Please try again later.");
                return;
            }

            const filtered = json.rows.filter(
                (row) => row.email && row.email.toLowerCase() === userEmail && row.status?.toLowerCase() !== "rejected"
            );

            setMyPapers(filtered);
            localStorage.setItem("myPapers", JSON.stringify(filtered));
            setLastUpdated(new Date());
            setError("");
        } catch (err) {
            console.error(err);
            setError("Server error. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    // Polling effect for real-time updates
    useEffect(() => {
        if (!userEmail) return;

        if (intervalRef.current) clearInterval(intervalRef.current);

        fetchMyData();
        intervalRef.current = setInterval(fetchMyData, REFRESH_INTERVAL);

        return () => {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        };
    }, [userEmail]);

    // Handle manual refresh
    const handleRefresh = () => {
        setLoading(true);
        fetchMyData();
    };

    // UI for unauthenticated users
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="text-center">
                    <div className="text-indigo-600 mb-4">
                        <LockIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
                    <p className="text-lg text-gray-600">Please log in to view your uploaded papers.</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your submissions...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6 pt-10">
                <div className="text-center">
                    <div className="text-red-600 mb-4">
                        <WarningIcon />
                    </div>
                    <h2 className="text-2xl font-bold text-red-800 mb-2">Error</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={handleRefresh}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition flex items-center"
                    >
                        <RefreshIcon />
                        <span className="ml-2">Retry</span>
                    </button>
                </div>
            </div>
        );
    }

    // Main UI with Professional Layout
    return (
        <div className="min-h-screen bg-gray-100 pt-10">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header Section */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Uploaded Papers</h1>
                            <p className="text-sm text-gray-600">
                                Logged in as <span className="font-semibold text-indigo-600">{userEmail}</span>
                            </p>
                        </div>
                        <div className="flex flex-col items-end mt-4 lg:mt-0">
                            {lastUpdated && (
                                <span className="text-xs text-gray-500 mb-2">
                                    Last updated: {lastUpdated.toLocaleTimeString()}
                                </span>
                            )}
                            <button
                                onClick={handleRefresh}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition flex items-center text-sm"
                            >
                                <RefreshIcon />
                                <span className="ml-2">Refresh</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notices Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Important Notice */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="text-yellow-600 mr-3">
                                <WarningIcon />
                            </div>
                            <div>
                                <h2 className="font-bold text-yellow-800 mb-3 text-lg">Important Submission Rules</h2>
                                <ul className="list-disc list-inside text-sm text-yellow-900 space-y-2">
                                    <li>If uploaded data is <strong>incorrect, incomplete, or mismatched</strong>, it may be <strong>rejected</strong>.</li>
                                    <li>Rejected submissions will be <strong>automatically deleted within 24 hours</strong>.</li>
                                    <li>You will receive an <strong>email notification</strong> explaining the issue.</li>
                                    <li>After correction, you can <strong>re-upload the PDF</strong>.</li>
                                    <li>Approval depends on <strong>subject, paper code, year, semester, and branch</strong>.</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Status Info */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg shadow-sm">
                        <div className="flex items-start">
                            <div className="text-blue-600 mr-3">
                                <InfoIcon />
                            </div>
                            <div>
                                <h2 className="font-bold text-blue-800 mb-3 text-lg">Status Meanings</h2>
                                <DemoProgressBar />
                                <ul className="text-sm text-blue-900 space-y-1">
                                    <li><strong>Step 1: Data Received</strong> – Your paper has been uploaded successfully.</li>
                                    <li><strong>Step 2: Pending</strong> – Your paper is under review (animated to show progress).</li>
                                    <li><strong>Step 3: Approved</strong> – Paper verified and published.</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Papers Table Section */}
                {myPapers.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-md text-center">
                        <div className="text-gray-400 mb-6">
                            <DocumentIcon />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Submissions Yet</h3>
                        <p className="text-gray-500 text-lg mb-4">You haven't uploaded any papers yet.</p>
                        <p className="text-sm text-gray-400">Start by uploading a paper to see your submissions here.</p>
                    </div>
                ) : (
                   

                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-sm">
                                <thead className="bg-indigo-900 text-white">
                                    <tr>
                                        <th className="p-4 text-left border-b">Date</th>
                                        <th className="p-4 text-left border-b">Paper Code</th>
                                        <th className="p-4 text-left border-b">Subject</th>
                                        <th className="p-4 text-left border-b">Year</th>
                                        <th className="p-4 text-left border-b">Sem</th>
                                        <th className="p-4 text-left border-b">Branch</th>
                                        <th className="p-4 text-left border-b">Type</th>
                                        <th className="p-4 text-left border-b">Status</th>
                                        <th className="p-4 text-left border-b">PDF</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {myPapers.map((p, i) => {
                                        const status = p.status?.toLowerCase();

                                        return (
                                            <tr key={i} className="hover:bg-gray-50 transition">
                                                <td className="p-4 border-b text-gray-700">
                                                    {new Date(p.timestamp).toLocaleString()}
                                                </td>
                                                <td className="p-4 border-b text-gray-700">{p.paperCode}</td>
                                                <td className="p-4 border-b text-gray-700">{p.subjectName}</td>
                                                <td className="p-4 border-b text-gray-700">{p.year}</td>
                                                <td className="p-4 border-b text-gray-700">{p.semester}</td>
                                                <td className="p-4 border-b text-gray-700">{p.branch}</td>
                                                <td className="p-4 border-b text-gray-700">{p.type}</td>
                                                <td className="p-4 border-b">
                                                    <ProgressBar status={status} />
                                                </td>
                                                <td className="p-4 border-b">
                                                    {p.pdfUrl ? (
                                                        <a
                                                            href={p.pdfUrl}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-800 underline transition"
                                                        >
                                                            Open PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Footer Note */}
                <div className="mt-8 bg-white p-4 rounded-lg shadow-sm text-center">
                    <div className="flex items-center justify-center">
                        <div className="text-indigo-600 mr-2">
                            <LockIcon />
                        </div>
                        <p className="text-xs text-gray-500">Your data is visible only to your logged-in email account. Unauthorized access is not allowed.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}