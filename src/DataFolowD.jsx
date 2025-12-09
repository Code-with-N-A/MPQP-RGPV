import React, { useEffect, useState } from "react";
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

const API_URL = "https://script.google.com/macros/s/AKfycbyQGbi08nenrNPoHNmV3D6PUd0MkXH3X57qi0Yr75lxySDYpaBDLHHUvWPUcNGKhrLd/exec";

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Process data for charts
  const yearCounts = {};
  const semCounts = {};
  const branchCounts = {};
  const typeCounts = {};
  const subjectCounts = {};

  data.forEach((row) => {
    // Year
    const year = row.year;
    yearCounts[year] = (yearCounts[year] || 0) + 1;

    // Semester
    const sem = row.semester;
    semCounts[sem] = (semCounts[sem] || 0) + 1;

    // Branch
    const branch = row.branch;
    branchCounts[branch] = (branchCounts[branch] || 0) + 1;

    // Type
    const type = row.type;
    typeCounts[type] = (typeCounts[type] || 0) + 1;

    // Subject (all, sorted alphabetically)
    const subject = row.subjectName;
    subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
  });

  const sortedSubjects = Object.entries(subjectCounts)
    .sort((a, b) => a[0].localeCompare(b[0])); // Sort alphabetically by subject name

  const chartOptions = {
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

  const subjectChartOptions = {
    ...chartOptions,
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

  const yearChartData = {
    labels: Object.keys(yearCounts),
    datasets: [
      {
        label: "Papers by Year",
        data: Object.values(yearCounts),
        backgroundColor: "rgba(59, 130, 246, 0.8)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const semChartData = {
    labels: Object.keys(semCounts),
    datasets: [
      {
        label: "Papers by Semester",
        data: Object.values(semCounts),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgba(239, 68, 68, 1)",
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const branchColors = [
    "rgba(255, 206, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
  ];

  const branchChartData = {
    labels: Object.keys(branchCounts),
    datasets: [
      {
        label: "Papers by Branch",
        data: Object.values(branchCounts),
        backgroundColor: branchColors.slice(0, Object.keys(branchCounts).length),
        borderColor: branchColors.slice(0, Object.keys(branchCounts).length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
      },
    ],
  };

  const typeChartData = {
    labels: Object.keys(typeCounts),
    datasets: [
      {
        label: "Papers by Type",
        data: Object.values(typeCounts),
        backgroundColor: [
          "rgba(153, 102, 255, 0.8)",
          "rgba(255, 159, 64, 0.8)",
        ],
        borderColor: [
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const subjectColors = [
    "rgba(255, 99, 132, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 206, 86, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
    "rgba(199, 199, 199, 0.8)",
    "rgba(83, 102, 255, 0.8)",
    "rgba(255, 205, 86, 0.8)",
    "rgba(54, 162, 235, 0.8)",
    "rgba(255, 99, 132, 0.8)",
    "rgba(75, 192, 192, 0.8)",
    "rgba(153, 102, 255, 0.8)",
    "rgba(255, 159, 64, 0.8)",
  ];

  const subjectChartData = {
    labels: sortedSubjects.map(([subject]) => subject),
    datasets: [
      {
        label: "All Subjects (Sorted Alphabetically)",
        data: sortedSubjects.map(([, count]) => count),
        backgroundColor: subjectColors.slice(0, sortedSubjects.length),
        borderColor: subjectColors.slice(0, sortedSubjects.length).map(color => color.replace('0.8', '1')),
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  };

  const handleRefresh = () => {
    window.dashboardDataLoaded = false;
    sessionStorage.removeItem('dashboardData');
    loadData();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 mt-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2">Paper Analytics Dashboard</h1>
          <p className="text-lg text-gray-600">Comprehensive insights into academic papers</p>
          <button
            onClick={handleRefresh}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 shadow-lg"
          >
            Refresh Data
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Year Bar Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Year</h2>
              <div className="h-64 md:h-80">
                <Bar data={yearChartData} options={chartOptions} />
              </div>
            </div>

            {/* Semester Bar Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Semester</h2>
              <div className="h-64 md:h-80">
                <Bar data={semChartData} options={chartOptions} />
              </div>
            </div>

            {/* Branch Pie Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Branch</h2>
              <div className="h-64 md:h-80 flex justify-center">
                <Pie data={branchChartData} options={chartOptions} />
              </div>
            </div>

            {/* Type Doughnut Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">Papers by Type</h2>
              <div className="h-64 md:h-80 flex justify-center">
                <Doughnut data={typeChartData} options={chartOptions} />
              </div>
            </div>

            {/* All Subjects Vertical Bar Chart */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 sm:col-span-2 lg:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">All Subjects (Sorted Alphabetically)</h2>
              <div className="h-64 md:h-80 overflow-x-auto">
                <Bar data={subjectChartData} options={subjectChartOptions} />
              </div>
            </div>

            {/* Summary Cards */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Total Papers</h2>
              <p className="text-3xl md:text-4xl font-extrabold text-center">{data.length}</p>
            </div>

            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Enabled Papers</h2>
              <p className="text-3xl md:text-4xl font-extrabold text-center">
                {data.filter((row) => row.status?.toLowerCase() === "enabled").length}
              </p>
            </div>

            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 md:p-6 rounded-xl shadow-xl hover:shadow-2xl transition-shadow duration-300 text-white">
              <h2 className="text-xl md:text-2xl font-bold mb-2 text-center">Disabled Papers</h2>
              <p className="text-3xl md:text-4xl font-extrabold text-center">
                {data.filter((row) => row.status?.toLowerCase() === "disabled").length}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
