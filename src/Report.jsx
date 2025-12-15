import React, { useEffect, useState, useMemo } from "react";
import { FaSearch, FaFilter, FaDownload, FaPrint, FaEye, FaTimes } from "react-icons/fa";
import { useApiData } from "./ContextAPI";

// Constants (same as Dashboard)

export default function Report() {
  const { API_URL} = useApiData();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    year: "",
    semester: "",
    branch: "",
    type: "",
    subjectName: "",
    status: "",
  });
  const [selectedBranch, setSelectedBranch] = useState(""); // For branch-specific view
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRow, setSelectedRow] = useState(null);
  const itemsPerPage = 10;

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}?action=list`);
      if (!res.ok) throw new Error('Failed to fetch data');
      const json = await res.json();
      if (json.status === "success") {
        const fetchedData = json.rows || [];
        setData(fetchedData);
        sessionStorage.setItem('reportData', JSON.stringify(fetchedData));
        window.reportDataLoaded = true;
      } else {
        throw new Error('API returned error status');
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (window.reportDataLoaded) {
      const storedData = sessionStorage.getItem('reportData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  const handleRefresh = () => {
    window.reportDataLoaded = false;
    sessionStorage.removeItem('reportData');
    loadData();
  };

  // Get unique branches
  const uniqueBranches = useMemo(() => [...new Set(data.map(row => row.branch).filter(Boolean))].sort(), [data]);

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    let filtered = data.filter((row) => {
      return (
        (filters.year === "" || row.year?.toString().includes(filters.year)) &&
        (filters.semester === "" || row.semester?.toString().includes(filters.semester)) &&
        (filters.branch === "" || row.branch?.toLowerCase().includes(filters.branch.toLowerCase())) &&
        (filters.type === "" || row.type?.toLowerCase().includes(filters.type.toLowerCase())) &&
        (filters.subjectName === "" || row.subjectName?.toLowerCase().includes(filters.subjectName.toLowerCase())) &&
        (filters.status === "" || row.status?.toLowerCase().includes(filters.status.toLowerCase())) &&
        (selectedBranch === "" || row.branch === selectedBranch) &&
        (searchTerm === "" || 
         row.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         row.year?.toString().includes(searchTerm) ||
         row.branch?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key] || "";
        const bValue = b[sortConfig.key] || "";
        if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, filters, searchTerm, sortConfig, selectedBranch]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleBranchSelect = (branch) => {
    setSelectedBranch(branch);
    setCurrentPage(1);
  };

  const clearBranchFilter = () => {
    setSelectedBranch("");
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const csvContent = [
      ["Year", "Semester", "Branch", "Type", "Subject Name", "Status"],
      ...filteredData.map(row => [
        row.year || "N/A",
        row.semester || "N/A",
        row.branch || "N/A",
        row.type || "N/A",
        row.subjectName || "N/A",
        row.status || "N/A",
      ]),
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const openModal = (row) => setSelectedRow(row);
  const closeModal = () => setSelectedRow(null);

  // Summary stats
  const summary = useMemo(() => {
    const total = data.length;
    const enabled = data.filter(row => row.status?.toLowerCase() === "enabled").length;
    const disabled = total - enabled;
    const missingData = data.filter(row => !row.year || !row.semester || !row.branch || !row.type || !row.subjectName).length;
    const newRequests = data.filter(row => row.status?.toLowerCase() === "new").length; // Assuming "new" status for new entries
    return { total, enabled, disabled, missingData, newRequests };
  }, [data]);

  // Branch-specific summary
  const branchSummary = useMemo(() => {
    if (!selectedBranch) return null;
    const branchData = data.filter(row => row.branch === selectedBranch);
    const total = branchData.length;
    const enabled = branchData.filter(row => row.status?.toLowerCase() === "enabled").length;
    const disabled = total - enabled;
    const newRequests = branchData.filter(row => row.status?.toLowerCase() === "new").length;
    const missingData = branchData.filter(row => !row.year || !row.semester || !row.type || !row.subjectName).length;
    return { total, enabled, disabled, newRequests, missingData };
  }, [data, selectedBranch]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 mt-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Data</h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Academic Papers Report</h1>
          <p className="text-lg text-gray-600">Detailed list of all papers with advanced features</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
            aria-label="Refresh report data"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" aria-label="Loading data"></div>
          </div>
        ) : (
          <>
            {/* Overall Summary Section */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Overall Report Summary</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Total Papers</h3>
                  <p className="text-3xl font-extrabold text-blue-600">{summary.total}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Enabled</h3>
                  <p className="text-3xl font-extrabold text-green-600">{summary.enabled}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Disabled</h3>
                  <p className="text-3xl font-extrabold text-red-600">{summary.disabled}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">New Requests</h3>
                  <p className="text-3xl font-extrabold text-yellow-600">{summary.newRequests}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Missing Data</h3>
                  <p className="text-3xl font-extrabold text-orange-600">{summary.missingData}</p>
                </div>
              </div>
            </div>

            {/* Branch Filter Buttons */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Filter by Branch</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={clearBranchFilter}
                  className={`px-4 py-2 rounded-lg ${selectedBranch === "" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-500 transition`}
                >
                  All Branches
                </button>
                {uniqueBranches.map(branch => (
                  <button
                    key={branch}
                    onClick={() => handleBranchSelect(branch)}
                    className={`px-4 py-2 rounded-lg ${selectedBranch === branch ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"} hover:bg-blue-500 transition`}
                  >
                    {branch}
                  </button>
                ))}
              </div>
              {selectedBranch && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Branch: {selectedBranch}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700">Total</h4>
                      <p className="text-2xl font-extrabold text-blue-600">{branchSummary.total}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700">Enabled</h4>
                      <p className="text-2xl font-extrabold text-green-600">{branchSummary.enabled}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700">Disabled</h4>
                      <p className="text-2xl font-extrabold text-red-600">{branchSummary.disabled}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700">New Requests</h4>
                      <p className="text-2xl font-extrabold text-yellow-600">{branchSummary.newRequests}</p>
                    </div>
                    <div className="text-center">
                      <h4 className="text-sm font-semibold text-gray-700">Missing Data</h4>
                      <p className="text-2xl font-extrabold text-orange-600">{branchSummary.missingData}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <FaSearch className="text-gray-500" />
                  <input
                    type="text"
                    placeholder="Search by subject, year, or branch..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                  <FaDownload /> Export CSV
                </button>
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                  <FaPrint /> Print
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                <select value={filters.year} onChange={(e) => handleFilterChange("year", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Years</option>
                  {[...new Set(data.map(row => row.year))].filter(Boolean).sort().map(year => <option key={year} value={year}>{year}</option>)}
                </select>
                <select value={filters.semester} onChange={(e) => handleFilterChange("semester", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Semesters</option>
                  {[...new Set(data.map(row => row.semester))].filter(Boolean).sort().map(sem => <option key={sem} value={sem}>{sem}</option>)}
                </select>
                <select value={filters.branch} onChange={(e) => handleFilterChange("branch", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Branches</option>
                  {[...new Set(data.map(row => row.branch))].filter(Boolean).sort().map(branch => <option key={branch} value={branch}>{branch}</option>)}
                </select>
                <select value={filters.type} onChange={(e) => handleFilterChange("type", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Types</option>
                  {[...new Set(data.map(row => row.type))].filter(Boolean).sort().map(type => <option key={type} value={type}>{type}</option>)}
                </select>
                <select value={filters.subjectName} onChange={(e) => handleFilterChange("subjectName", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Subjects</option>
                  {[...new Set(data.map(row => row.subjectName))].filter(Boolean).sort().map(subject => <option key={subject} value={subject}>{subject}</option>)}
                </select>
                <select value={filters.status} onChange={(e) => handleFilterChange("status", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="">All Statuses</option>
                  {[...new Set(data.map(row => row.status))].filter(Boolean).sort().map(status => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">
                {selectedBranch ? `${selectedBranch} Branch Report` : "All Papers Report"}
              </h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("year")}>
                        Year {sortConfig.key === "year" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                                           <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("semester")}>
                        Semester {sortConfig.key === "semester" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("branch")}>
                        Branch {sortConfig.key === "branch" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("type")}>
                        Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("subjectName")}>
                        Subject Name {sortConfig.key === "subjectName" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700 cursor-pointer" onClick={() => handleSort("status")}>
                        Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th className="px-4 py-2 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((row, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{row.year || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.semester || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.branch || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.type || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">{row.subjectName || "N/A"}</td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            row.status?.toLowerCase() === "enabled" ? "bg-green-100 text-green-800" :
                            row.status?.toLowerCase() === "disabled" ? "bg-red-100 text-red-800" :
                            row.status?.toLowerCase() === "new" ? "bg-yellow-100 text-yellow-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {row.status || "N/A"}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => openModal(row)}
                            className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                            aria-label="View details"
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {paginatedData.length === 0 && (
                <p className="text-center text-gray-500 mt-4">No data found matching the filters.</p>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl mt-6">
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-lg ${
                        currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Modal for Row Details */}
            {selectedRow && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full mx-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Paper Details</h3>
                    <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                      <FaTimes />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Year:</strong> {selectedRow.year || "N/A"}</p>
                    <p><strong>Semester:</strong> {selectedRow.semester || "N/A"}</p>
                    <p><strong>Branch:</strong> {selectedRow.branch || "N/A"}</p>
                    <p><strong>Type:</strong> {selectedRow.type || "N/A"}</p>
                    <p><strong>Subject Name:</strong> {selectedRow.subjectName || "N/A"}</p>
                    <p><strong>Status:</strong> {selectedRow.status || "N/A"}</p>
                    {/* Add more fields if available in the data */}
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
