import React, { useEffect, useState } from "react";
import { useApiData } from "./ContextAPI";

export default function ControlD() {
  const { API_URL } = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRows, setUpdatingRows] = useState({}); // { [id]: action }
  const [expandedSection, setExpandedSection] = useState(null);

  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState("subjectName");

  const [uniqueYears, setUniqueYears] = useState([]);
  const [uniqueSemesters, setUniqueSemesters] = useState([]);
  const [uniqueBranches, setUniqueBranches] = useState([]);
  const [uniqueTypes, setUniqueTypes] = useState([]);

  const searchColumns = [
    { label: "Subject", value: "subjectName" },
    { label: "Paper Code", value: "paperCode" },
    { label: "Branch", value: "branch" },
    { label: "Type", value: "type" },
    { label: "Year", value: "year" },
    { label: "Semester", value: "semester" },
    { label: "Email", value: "email" }, // Added Email to search options
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        // Store in sessionStorage and set window flag
        sessionStorage.setItem('dashboardData', JSON.stringify(fetchedData));
        window.dashboardDataLoaded = true;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (window.dashboardDataLoaded) {
      // Load from sessionStorage if already loaded in this session
      const storedData = sessionStorage.getItem('dashboardData');
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

  const updateStatus = async (id, newStatus) => {
    const action = newStatus.toLowerCase() === 'disabled' ? 'disable' : 'enable';
    setUpdatingRows((prev) => ({ ...prev, [id]: action }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "updateStatus", id, status: newStatus }),
      });
      const json = await res.json();
      if (json.status === "success") {
        setData((prev) =>
          prev.map((row) => (row.id === id ? { ...row, status: newStatus } : row))
        );
      } else alert("Error: " + json.message);
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    } finally {
      setUpdatingRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setUpdatingRows((prev) => ({ ...prev, [id]: 'delete' }));
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: JSON.stringify({ action: "deleteRow", id }),
      });
      const json = await res.json();
      if (json.status === "success") setData((prev) => prev.filter((row) => row.id !== id));
      else alert("Error: " + json.message);
    } catch (err) {
      console.error(err);
      alert("Error deleting record.");
    } finally {
      setUpdatingRows((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const filteredData = data
    .filter((row) => {
      const rowYear = String(row.year || "").trim();
      const rowSem = String(row.semester || "").trim();
      const rowType = String(row.type || "").trim().toLowerCase();
      const rowBranch = String(row.branch || "").trim().toLowerCase();

      const yearMatch = yearFilter ? rowYear === yearFilter.trim() : true;
      const semMatch = semFilter ? rowSem === semFilter.trim() : true;
      const typeMatch = typeFilter ? rowType === typeFilter.trim().toLowerCase() : true;
      const branchMatch = branchFilter ? rowBranch === branchFilter.trim().toLowerCase() : true;

      let searchMatch = true;
      if (searchQuery.trim() !== "") {
        const value = String(row[searchColumn] || "").toLowerCase();
        searchMatch = value.includes(searchQuery.toLowerCase());
      }

      return yearMatch && semMatch && typeMatch && branchMatch && searchMatch;
    })
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by date descending (newest first)

  const newRows = filteredData.slice(0, 10);
  const enabledRows = filteredData.filter((r) => r.status?.toLowerCase() === "enabled");
  const disabledRows = filteredData.filter((r) => r.status?.toLowerCase() === "disabled");

  const highlightText = (text) => {
    if (!searchQuery) return text;
    const regex = new RegExp(`(${searchQuery})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="bg-yellow-200 font-semibold">{part}</span>
      ) : part
    );
  };

  // Capitalize first letter of each word
  const titleCase = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  // Format date from API timestamp
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-IN'); // Formats as DD/MM/YYYY for Indian locale, adjust if needed
  };

  const ActionButton = ({ onClick, disabled, children, loadingText, bgColor, hoverColor }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded text-white text-sm font-medium transition duration-200 ${disabled ? "bg-gray-400 cursor-not-allowed opacity-70" : `${bgColor} hover:${hoverColor}`
        }`}
    >
      {disabled ? loadingText : children}
    </button>
  );

  const Table = ({ rows }) => (
    <div className="overflow-x-auto shadow border border-gray-200 mb-6">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 border-b text-left">NO</th>
            <th className="p-3 border-b text-left">ID</th>
            <th className="p-3 border-b text-left">Date</th>
            <th className="p-3 border-b text-left">Year</th>
            <th className="p-3 border-b text-left">Sem</th>
            <th className="p-3 border-b text-left">Branch</th>
            <th className="p-3 border-b text-left">Paper Code</th>
            <th className="p-3 border-b text-left">Subject</th>
            <th className="p-3 border-b text-left">Type</th>
            <th className="p-3 border-b text-left">Email</th> {/* Added Email column header */}
            <th className="p-3 border-b text-left">PDF</th>
            <th className="p-3 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{index + 1}</td>
              <td className="p-2">{highlightText(String(row.id))}</td>
              <td className="p-2">{highlightText(formatDate(row.timestamp))}</td>
              <td className="p-2">{highlightText(String(row.year))}</td>
              <td className="p-2">{highlightText(String(row.semester))}</td>
              <td className="p-2">{highlightText(String(row.branch))}</td>
              <td className="p-2">{highlightText(String(row.paperCode))}</td>
              <td className="p-2">{highlightText(String(row.subjectName))}</td>
              <td className="p-2">{highlightText(String(row.type))}</td>
              <td className="p-2">
                {row.email ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent page reload
                      const mailtoLink = `mailto:${row.email}?subject=${encodeURIComponent(
                        "MPQP Polytechnic - Issue Found in Your Uploaded Data"
                      )}&body=${encodeURIComponent(
                        `Dear User,

Greetings from MPQP Polytechnic.

During the verification of the data or PDF uploaded by you, certain issues have been identified.

UPLOAD DETAILS
--------------------------------
ID: ${row.id}
Uploaded On: ${new Date(row.timestamp).toLocaleString()}
Year / Semester: ${row.year} / ${row.semester}
Branch: ${row.branch}
Paper Code: ${row.paperCode}
Subject: ${row.subjectName}
Type: ${row.type}
PDF Link: ${row.pdfUrl || "Not Available"}

IDENTIFIED ISSUE
--------------------------------
[PLEASE WRITE THE ISSUE HERE]

IMPORTANT
Please correct the above issue and re-upload the PDF with accurate information.
If the correction is not completed within 24 hours, the upload may be automatically rejected by the system.

Regards,
MPQP Polytechnic
Verification Team
Email: mpqp073@gmail.com
Website: https://mpqp.vercel.app/
`
                      )}`;
                      window.location.href = mailtoLink;
                    }}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition inline-block"
                  >
                    Email
                  </button>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>


              <td className="p-2">
                {row.pdfUrl ? (
                  <a
                    href={row.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition"
                  >
                    PDF
                  </a>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </td>
              <td className="p-2 flex gap-2 flex-wrap">
                {row.status?.toLowerCase() === "enabled" ? (
                  <ActionButton
                    onClick={() => updateStatus(row.id, "Disabled")}
                    disabled={updatingRows[row.id] === 'disable'}
                    loadingText="Disabling..."
                    bgColor="bg-red-600"
                    hoverColor="bg-red-700"
                  >
                    Disable
                  </ActionButton>
                ) : (
                  <ActionButton
                    onClick={() => updateStatus(row.id, "Enabled")}
                    disabled={updatingRows[row.id] === 'enable'}
                    loadingText="Enabling..."
                    bgColor="bg-blue-600"
                    hoverColor="bg-blue-700"
                  >
                    Enable
                  </ActionButton>
                )}
                <ActionButton
                  onClick={() => deleteRow(row.id)}
                  disabled={updatingRows[row.id] === 'delete'}
                  loadingText="Deleting..."
                  bgColor="bg-gray-700"
                  hoverColor="bg-gray-800"
                >
                  Delete
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-#FFF-100 p-6 mt-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Paper Dashboard</h1>

        {/* Section Buttons */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {["new", "enabled", "disabled"].map((sec) => (
            <button
              key={sec}
              className={`px-4 py-2 rounded shadow font-medium transition ${expandedSection === sec
                ? sec === "new"
                  ? "bg-blue-600 text-white"
                  : sec === "enabled"
                    ? "bg-green-600 text-white"
                    : "bg-red-600 text-white"
                : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              onClick={() => setExpandedSection(expandedSection === sec ? null : sec)}
            >
              {sec === "new" ? "New / Recent" : sec.charAt(0).toUpperCase() + sec.slice(1)}
            </button>
          ))}
        </div>

        {/* Filters + Search */}
        <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-7 gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="p-2 border rounded col-span-1 md:col-span-2"
          />
          <select
            value={searchColumn}
            onChange={(e) => setSearchColumn(e.target.value)}
            className="p-2 border rounded"
          >
            {searchColumns.map((col) => (
              <option key={col.value} value={col.value}>{col.label}</option>
            ))}
          </select>
          <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Years</option>
            {uniqueYears.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
          <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Semesters</option>
            {uniqueSemesters.map((s) => (
              <option key={s} value={s}>Sem {s}</option>
            ))}
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Types</option>
            {uniqueTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Branches</option>
            {uniqueBranches.map((b) => (
              <option key={b} value={b}>{titleCase(b)}</option>
            ))}
          </select>
          <button
            className="p-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            onClick={() => {
              setYearFilter(""); setSemFilter(""); setTypeFilter(""); setBranchFilter(""); setSearchQuery(""); setSearchColumn("subjectName");
            }}
          >
            Reset
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && expandedSection === "new" && <Table rows={newRows} />}
        {!loading && expandedSection === "enabled" && <Table rows={enabledRows} />}
        {!loading && expandedSection === "disabled" && <Table rows={disabledRows} />}
      </div>
    </div>
  );
}