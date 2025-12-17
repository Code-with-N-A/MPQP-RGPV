import React, { useEffect, useState, useRef } from "react";
import { useApiData } from "./ContextAPI";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePdfId, setActivePdfId] = useState(null);

  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");

  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);

  const [user, setUser] = useState(null); // State to track authenticated user

  const rowRefs = useRef({});
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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

  const handlePdfClick = (id, url) => {
    if (!user) {
      // Redirect to Auth page if not logged in
      navigate("/signup"); // Assuming "/auth" is your Auth route
      return;
    }
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
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="p-4 text-center text-gray-500">
                      No papers found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((row, index) => (
                    <tr
                      key={row.id}
                      ref={(el) => (rowRefs.current[row.id] = el)}
                      className={`border-b hover:bg-gray-50 ${activePdfId === row.id ? "bg-yellow-100" : ""}`}
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
                          <button
                            onClick={() => handlePdfClick(row.id, row.pdfUrl)}
                            className={`px-3 py-1 rounded shadow text-white transition cursor-pointer ${activePdfId === row.id
                                ? "bg-yellow-500 shadow-lg"
                                : "bg-green-600 hover:bg-green-700"
                              }`}
                          >
                            PDF
                          </button>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
