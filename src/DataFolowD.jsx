import React, { useEffect, useState, useMemo } from "react";
import { Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { useApiData } from "./ContextAPI";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

// Constants

const CHART_COLORS = {
  year: "rgba(59, 130, 246, 0.8)",
  semester: "rgba(239, 68, 68, 0.8)",
  branch: [
    "rgba(255, 206, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 99, 71, 0.8)", // Additional colors for more branches
    "rgba(34, 197, 94, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(251, 191, 36, 0.8)",
  ],
  type: [
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
  ],
  subject: [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 99, 71, 0.8)", // Additional colors for more subjects
    "rgba(34, 197, 94, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(251, 191, 36, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(59, 130, 246, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(139, 69, 19, 0.8)",
    "rgba(107, 114, 128, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(6, 182, 212, 0.8)",
  ],
};

const DEFAULT_CHART_OPTIONS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        font: {
          size: 14,
          family: 'Inter, sans-serif',
        },
      },
    },
    title: {
      display: true,
      text: "Data Visualization",
      font: {
        size: 18,
        weight: 'bold',
        family: 'Inter, sans-serif',
      },
    },
    tooltip: {
      backgroundColor: 'rgba(0,0,0,0.8)',
      titleColor: '#fff',
      bodyColor: '#fff',
      cornerRadius: 8,
    },
  },
  scales: {
    x: {
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      ticks: {
        font: {
          size: 12,
          family: 'Inter, sans-serif',
        },
      },
    },
  },
};

// Utility function to process data
const processData = (data) => {
  const yearCounts = {};
  const semCounts = {};
  const branchCounts = {};
  const typeCounts = {};
  const subjectCounts = {};
  const yearBranchCounts = {};

  data.forEach((row) => {
    const year = row.year;
    const sem = row.semester;
    const branch = row.branch;
    const type = row.type;
    const subject = row.subjectName;

    yearCounts[year] = (yearCounts[year] || 0) + 1;
    semCounts[sem] = (semCounts[sem] || 0) + 1;
    branchCounts[branch] = (branchCounts[branch] || 0) + 1;
    typeCounts[type] = (typeCounts[type] || 0) + 1;
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;

    if (!yearBranchCounts[year]) yearBranchCounts[year] = {};
    yearBranchCounts[year][branch] = (yearBranchCounts[year][branch] || 0) + 1;
  });

  const sortedSubjects = Object.entries(subjectCounts).sort((a, b) => a[0].localeCompare(b[0]));
  const uniqueYears = Object.keys(yearBranchCounts).sort();
  const uniqueBranches = Array.from(new Set(data.map(row => row.branch))).sort();

  return {
    yearCounts,
    semCounts,
    branchCounts,
    typeCounts,
    sortedSubjects,
    yearBranchCounts,
    uniqueYears,
    uniqueBranches,
  };
};

// Chart data generators
const createBarChartData = (labels, data, label, color) => {
  const isArray = Array.isArray(color);
  const bgColor = isArray ? color.slice(0, labels.length) : color;
  const borderColor = isArray ? color.slice(0, labels.length).map(c => c.replace('0.8', '1')) : color.replace('0.8', '1');
  return {
    labels,
    datasets: [
      {
        label,
        data,
        backgroundColor: bgColor,
        borderColor: borderColor,
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };
};

const createPieChartData = (labels, data, label, colors) => ({
  labels,
  datasets: [
    {
      label,
      data,
      backgroundColor: colors.slice(0, labels.length),
      borderColor: colors.slice(0, labels.length).map(color => color.replace('0.8', '1')),
      borderWidth: 2,
    },
  ],
});

const createGroupedBarChartData = (labels, datasets) => ({
  labels,
  datasets,
});

export default function Dashboard() {
  const { API_URL } = useApiData();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        sessionStorage.setItem('dashboardData', JSON.stringify(fetchedData));
        window.dashboardDataLoaded = true;
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
    if (window.dashboardDataLoaded) {
      const storedData = sessionStorage.getItem('dashboardData');
      if (storedData) {
        setData(JSON.parse(storedData));
      }
      setLoading(false);
    } else {
      loadData();
    }
  }, []);

  const processedData = useMemo(() => processData(data), [data]);

  const {
    yearCounts,
    semCounts,
    branchCounts,
    typeCounts,
    sortedSubjects,
    yearBranchCounts,
    uniqueYears,
    uniqueBranches,
  } = processedData;

  const yearChartData = useMemo(() =>
    createBarChartData(Object.keys(yearCounts), Object.values(yearCounts), "Papers by Year", CHART_COLORS.year),
    [yearCounts]
  );

  const semChartData = useMemo(() =>
    createBarChartData(Object.keys(semCounts), Object.values(semCounts), "Papers by Semester", CHART_COLORS.semester),
    [semCounts]
  );

  const branchChartData = useMemo(() =>
    createPieChartData(Object.keys(branchCounts), Object.values(branchCounts), "Papers by Branch", CHART_COLORS.branch),
    [branchCounts]
  );

  const typeChartData = useMemo(() =>
    createPieChartData(Object.keys(typeCounts), Object.values(typeCounts), "Papers by Type", CHART_COLORS.type),
    [typeCounts]
  );

  const subjectChartData = useMemo(() =>
    createBarChartData(
      sortedSubjects.map(([subject]) => subject),
      sortedSubjects.map(([, count]) => count),
      "All Subjects (Sorted Alphabetically)",
      CHART_COLORS.subject
    ),
    [sortedSubjects]
  );

  const yearBranchChartData = useMemo(() =>
    createGroupedBarChartData(
      uniqueYears,
      uniqueBranches.map((branch, index) => ({
        label: branch,
        data: uniqueYears.map(year => yearBranchCounts[year][branch] || 0),
        backgroundColor: CHART_COLORS.branch[index % CHART_COLORS.branch.length],
        borderColor: CHART_COLORS.branch[index % CHART_COLORS.branch.length].replace('0.8', '1'),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      }))
    ),
    [uniqueYears, uniqueBranches, yearBranchCounts]
  );

  const subjectChartOptions = {
    ...DEFAULT_CHART_OPTIONS,
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: "All Subjects (Sorted Alphabetically)",
        font: {
          size: 18,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          font: {
            size: 10,
            family: 'Inter, sans-serif',
          },
          maxRotation: 90,
          minRotation: 90,
        },
      },
      y: {
        ticks: {
          font: {
            size: 12,
            family: 'Inter, sans-serif',
          },
        },
      },
    },
  };

  const yearBranchChartOptions = {
    ...DEFAULT_CHART_OPTIONS,
    plugins: {
      ...DEFAULT_CHART_OPTIONS.plugins,
      title: {
        display: true,
        text: "Papers by Year and Branch",
        font: {
          size: 18,
          weight: 'bold',
          family: 'Inter, sans-serif',
        },
      },
    },
  };

  const handleRefresh = () => {
    window.dashboardDataLoaded = false;
    sessionStorage.removeItem('dashboardData');
    loadData();
  };

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
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Paper Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">Comprehensive insights into academic papers and new requests</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
            aria-label="Refresh dashboard data"
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
            {/* Summary Section - Combined Total, Enabled, Disabled */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 mb-8">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Paper Summary</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Total Papers</h3>
                  <p className="text-3xl md:text-4xl font-extrabold text-blue-600">{data.length}</p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Enabled Papers</h3>
                  <p className="text-3xl md:text-4xl font-extrabold text-green-600">
                    {data.filter((row) => row.status?.toLowerCase() === "enabled").length}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">Disabled Papers</h3>
                  <p className="text-3xl md:text-4xl font-extrabold text-red-600">
                    {data.filter((row) => row.status?.toLowerCase() === "disabled").length}
                  </p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Year Bar Chart */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Year</h2>
                <div className="h-64 md:h-80">
                  <Bar data={yearChartData} options={DEFAULT_CHART_OPTIONS} />
                </div>
              </div>

              {/* Semester Bar Chart */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Semester</h2>
                <div className="h-64 md:h-80">
                  <Bar data={semChartData} options={DEFAULT_CHART_OPTIONS} />
                </div>
              </div>

              {/* Branch Pie Chart */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Branch</h2>
                <div className="h-64 md:h-80 flex justify-center">
                  <Pie data={branchChartData} options={DEFAULT_CHART_OPTIONS} />
                </div>
              </div>

              {/* Type Doughnut Chart */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Type</h2>
                <div className="h-64 md:h-80 flex justify-center">
                  <Doughnut data={typeChartData} options={DEFAULT_CHART_OPTIONS} />
                </div>
              </div>

              {/* Papers by Year and Branch (Grouped Bar Chart) */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 sm:col-span-2 lg:col-span-2">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Year and Branch (New Requests)</h2>
                <div className="h-64 md:h-80 overflow-x-auto">
                  <Bar data={yearBranchChartData} options={yearBranchChartOptions} />
                </div>
              </div>

              {/* All Subjects Vertical Bar Chart - Full Width */}
              <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 sm:col-span-2 lg:col-span-3">
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">All Subjects (Sorted Alphabetically)</h2>
                                <div className="h-96 md:h-[500px] overflow-x-auto">
                  <Bar data={subjectChartData} options={subjectChartOptions} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
