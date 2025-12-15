import React, { useEffect, useState, useRef } from "react";
import { useApiData } from "./ContextAPI";

export default function Home() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdfId, setActivePdfId] = useState(null);
  const [activeDownloadId, setActiveDownloadId] = useState(null); // New state for download highlight
  const [downloadingIds, setDownloadingIds] = useState(new Set()); // State for tracking downloading rows
  const [completedDownloadIds, setCompletedDownloadIds] = useState(new Set()); // State for tracking completed downloads (for row highlighting)

  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);

  const rowRefs = useRef({});

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        // Store in sessionStorage and set window flag
        sessionStorage.setItem('paperData', JSON.stringify(fetchedData));
        window.dataLoaded = true;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (window.dataLoaded) {
      // Load from sessionStorage if already loaded in this session
      const storedData = sessionStorage.getItem('paperData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      setLoading(false);
    } else {
      // Fetch from API only on first load or refresh/close-reopen
      loadData();
    }
  }, []);

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

  // Filter only enabled rows and sort by subject name alphabetically
  const filteredData = data
    .filter((row) => row.status?.toLowerCase() === "enabled")
    .filter((row) => {
      const yearMatch = yearFilter ? String(row.year) === yearFilter : true;
      const semMatch = semFilter ? String(row.semester) === semFilter : true;
      const typeMatch = typeFilter ? String(row.type) === typeFilter : true;
      const branchMatch = branchFilter ? String(row.branch).toLowerCase() === branchFilter : true;
      return yearMatch && semMatch && typeMatch && branchMatch;
    })
    .sort((a, b) => (a.subjectName || "").toLowerCase().localeCompare((b.subjectName || "").toLowerCase()));

  // Capitalize first letter of each word
  const titleCase = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Helper function to convert Google Drive view URL to direct download URL
  const getDownloadUrl = (url) => {
    if (!url) return "";
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)\//);
    if (match) {
      return `https://drive.google.com/uc?export=download&id=${match[1]}`;
    }
    return url; // Fallback if not a Google Drive link
  };

  // Function to handle download using fetch and blob for cross-device compatibility
  const handleDownload = async (id, url, filename) => {
    setDownloadingIds(prev => new Set(prev).add(id));
    setActiveDownloadId(id);
    try {
      const downloadUrl = getDownloadUrl(url);
      const response = await fetch(downloadUrl);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download.pdf';
      link.click();
      URL.revokeObjectURL(blobUrl);
      setCompletedDownloadIds(prev => new Set(prev).add(id));
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab if download fails
      window.open(getDownloadUrl(url), '_blank');
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      setActiveDownloadId(null);
    }
  };

  const handlePdfClick = (id, url) => {
    setActivePdfId(id);
    // Scroll to the row smoothly
    if (rowRefs.current[id]) {
      rowRefs.current[id].scrollIntoView({ behavior: "smooth", block: "center" });
    }
    window.open(url, "_blank");
  };

  return (
    <div className="min-h-screen bg-white p-2 mt-13">
      <div className="max-w-7xl mx-auto">
        {/* Filters - Sticky at top, horizontal scroll on small screens, hide scrollbar */}
        <div
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide
             fixed top-[55px] left-0 w-full 
             bg-white
             px-4 py-2"
        >

          <div className="flex gap-4 overflow-x-auto scrollbar-hide">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="p-2 border rounded shadow-sm flex-shrink-0"
            >
              <option value="">All Years</option>
              {uniqueYears.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              value={semFilter}
              onChange={(e) => setSemFilter(e.target.value)}
              className="p-2 border rounded shadow-sm flex-shrink-0"
            >
              <option value="">All Semesters</option>
              {uniqueSemesters.map((s) => (
                <option key={s} value={s}>Sem {s}</option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="p-2 border rounded shadow-sm flex-shrink-0"
            >
              <option value="">All Branches</option>
              {uniqueBranches.map((b) => (
                <option key={b} value={b}>{titleCase(b)}</option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="p-2 border rounded shadow-sm flex-shrink-0"
            >
              <option value="">All Types</option>
              {uniqueTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button
              className="p-2 bg-gray-600 text-white rounded shadow hover:bg-gray-700 transition flex-shrink-0"
              onClick={() => {
                setYearFilter(""); setSemFilter(""); setBranchFilter(""); setTypeFilter("");
              }}
            >
              Reset Filters
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto shadow border border-gray-200 py-12">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-800 text-white">
                <tr>
                  <th className="p-3 border-b text-left">No</th>
                  <th className="p-3 border-b text-left">Year</th>
                  <th className="p-3 border-b text-left">Sem</th>
                  <th className="p-3 border-b text-left">Branch</th>
                  <th className="p-3 border-b text-left">Paper Code</th>
                  <th className="p-3 border-b text-left">Subject</th>
                  <th className="p-3 border-b text-left">Type</th>
                  <th className="p-3 border-b text-left">PDF</th>
                  <th className="p-3 border-b text-left hidden sm:table-cell">PDF DOWNLOAD</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="p-4 text-center text-gray-500">
                      No papers found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => {
                    const isDownloading = downloadingIds.has(row.id);
                    const isCompleted = completedDownloadIds.has(row.id);
                    const isDisabled = downloadingIds.size > 0; // Disable ALL buttons when any download is in progress
                    const filename = `${titleCase(row.subjectName || 'paper')}.pdf`.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Sanitize filename
                    return (
                      <tr
                        key={row.id}
                        ref={(el) => (rowRefs.current[row.id] = el)}
                        className={`border-b hover:bg-gray-50 ${activePdfId === row.id
                            ? "bg-yellow-100"
                            : isCompleted
                              ? "bg-green-100"
                              : ""
                          }`}
                      >
                        <td className="p-2">{index + 1}</td>
                        <td className="p-2">{titleCase(String(row.year))}</td>
                        <td className="p-2">{titleCase(String(row.semester))}</td>
                        <td className="p-2">{titleCase(String(row.branch))}</td>
                        <td className="p-2">{titleCase(String(row.paperCode))}</td>
                        <td className="p-2">{titleCase(String(row.subjectName))}</td>
                        <td className="p-2">{titleCase(String(row.type))}</td>
                        <td className="p-2">
                          {row.pdfUrl ? (
                            <a
                              href={row.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`px-3 py-1 rounded shadow text-white transition cursor-pointer inline-block ${activePdfId === row.id
                                  ? "bg-yellow-500 shadow-lg"
                                  : "bg-green-600 hover:bg-green-700"
                                } ${downloadingIds.size > 0 ? "cursor-not-allowed" : ""}`}
                              onClick={() => setActivePdfId(row.id)}
                            >
                              PDF
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="p-2 hidden sm:table-cell">
                          {row.pdfUrl ? (
                            <button
                              onClick={() => {
                                // Remove from completed if it was completed
                                setCompletedDownloadIds(prev => {
                                  const newSet = new Set(prev);
                                  newSet.delete(row.id);
                                  return newSet;
                                });
                                handleDownload(row.id, row.pdfUrl, filename);
                              }}
                              className={`px-3 py-1 rounded shadow text-white transition relative ${isDownloading
                                  ? "bg-yellow-500 shadow-lg cursor-not-allowed"
                                  : isDisabled
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                                }`}
                              disabled={isDisabled}
                            >
                              <span className="relative z-10">Download</span>
                              {isDownloading && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                              )}
                            </button>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
