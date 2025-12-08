import React, { useEffect, useState } from "react";

const API_URL = "https://script.google.com/macros/s/AKfycbyQGbi08nenrNPoHNmV3D6PUd0MkXH3X57qi0Yr75lxySDYpaBDLHHUvWPUcNGKhrLd/exec";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingRows, setUpdatingRows] = useState([]);
  const [expandedSection, setExpandedSection] = useState(null);

  const [yearFilter, setYearFilter] = useState("");
  const [semFilter, setSemFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchColumn, setSearchColumn] = useState("subjectName");

  const branches = ["CSE", "IT", "ECE", "EE", "ME", "CE", "AE"];
  const searchColumns = [
    { label: "Subject", value: "subjectName" },
    { label: "Paper Code", value: "paperCode" },
    { label: "Branch", value: "branch" },
    { label: "Type", value: "type" },
    { label: "Year", value: "year" },
    { label: "Semester", value: "semester" },
  ];

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      const json = await res.json();
      if (json.status === "success") setData(json.rows || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (id, newStatus) => {
    setUpdatingRows((prev) => [...prev, id]);
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
      setUpdatingRows((prev) => prev.filter((i) => i !== id));
    }
  };

  const deleteRow = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    setUpdatingRows((prev) => [...prev, id]);
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
      setUpdatingRows((prev) => prev.filter((i) => i !== id));
    }
  };

  const filteredData = data.filter((row) => {
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
  });

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

  const ActionButton = ({ onClick, disabled, children, loadingText, bgColor, hoverColor }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded text-white text-sm font-medium transition duration-200 ${
        disabled ? "bg-gray-400 cursor-not-allowed opacity-70" : `${bgColor} hover:${hoverColor}`
      }`}
    >
      {disabled ? loadingText : children}
    </button>
  );

  const Table = ({ rows }) => (
    <div className="overflow-x-auto rounded-lg shadow border border-gray-200 mb-6">
      <table className="w-full text-sm border-collapse">
        <thead className="bg-gray-800 text-white">
          <tr>
            <th className="p-3 border-b text-left">ID</th>
            <th className="p-3 border-b text-left">Year</th>
            <th className="p-3 border-b text-left">Sem</th>
            <th className="p-3 border-b text-left">Branch</th>
            <th className="p-3 border-b text-left">Paper Code</th>
            <th className="p-3 border-b text-left">Subject</th>
            <th className="p-3 border-b text-left">Type</th>
            <th className="p-3 border-b text-left">PDF</th>
            <th className="p-3 border-b text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b hover:bg-gray-50">
              <td className="p-2">{highlightText(String(row.id))}</td>
              <td className="p-2">{highlightText(String(row.year))}</td>
              <td className="p-2">{highlightText(String(row.semester))}</td>
              <td className="p-2">{highlightText(String(row.branch))}</td>
              <td className="p-2">{highlightText(String(row.paperCode))}</td>
              <td className="p-2">{highlightText(String(row.subjectName))}</td>
              <td className="p-2">{highlightText(String(row.type))}</td>
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
                    disabled={updatingRows.includes(row.id)}
                    loadingText="Disabling..."
                    bgColor="bg-red-600"
                    hoverColor="bg-red-700"
                  >
                    Disable
                  </ActionButton>
                ) : (
                  <ActionButton
                    onClick={() => updateStatus(row.id, "Enabled")}
                    disabled={updatingRows.includes(row.id)}
                    loadingText="Enabling..."
                    bgColor="bg-blue-600"
                    hoverColor="bg-blue-700"
                  >
                    Enable
                  </ActionButton>
                )}
                <ActionButton
                  onClick={() => deleteRow(row.id)}
                  disabled={updatingRows.includes(row.id)}
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
              className={`px-4 py-2 rounded shadow font-medium transition ${
                expandedSection === sec
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
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2025</option>
          </select>
          <select value={semFilter} onChange={(e) => setSemFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Semesters</option>
            <option value="1">Sem 1</option>
            <option value="2">Sem 2</option>
            <option value="3">Sem 3</option>
            <option value="4">Sem 4</option>
            <option value="5">Sem 5</option>
            <option value="6">Sem 6</option>
          </select>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Types</option>
            <option value="Regular">Regular</option>
            <option value="Ex">Ex</option>
          </select>
          <select value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)} className="p-2 border rounded">
            <option value="">All Branches</option>
            {branches.map((b) => <option key={b} value={b.toLowerCase()}>{b}</option>)}
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
