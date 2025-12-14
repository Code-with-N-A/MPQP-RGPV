import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaBook, FaChartBar, FaFileDownload } from "react-icons/fa";

const API_URL = "https://script.google.com/macros/s/AKfycbyQGbi08nenrNPoHNmV3D6PUd0MkXH3X57qi0Yr75lxySDYpaBDLHHUvWPUcNGKhrLd/exec";

// Bell Icon SVG Component
const BellIcon = ({ className }) => (
  <svg
    className={className}
    fill="currentColor"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
  </svg>
);

const MPQPPaperM = () => {
  const navigate = useNavigate();
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNewRequestsCount = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}?action=list`);
        const json = await res.json();
        if (json.status === "success") {
          const fetchedData = json.rows || [];
          // Count disabled status items (new requests)
          const disabledCount = fetchedData.filter(item => item.status?.toLowerCase() === "disabled").length;
          setNewRequestsCount(disabledCount);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNewRequestsCount();
  }, []);

  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-600 text-white min-h-screen flex flex-col justify-center items-center text-center px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 relative overflow-hidden">
        {/* Subtle background pattern for professionalism */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGcgZmlsbD0iI2ZmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj4KPHBhdGggZD0iTTM2IDM0djEwaC0ydjEwSDI0VjM0SDF2LTJoMnYtMTBoNFYxNGgxMFYyNFoiLz4KPC9nPgo8L2c+Cjwvc3ZnPg==')] bg-repeat"></div>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-4 leading-tight tracking-tight">
            MPQP RGPV Question Papers
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl max-w-3xl mb-8 leading-relaxed mx-auto">
            Access all RGPV Polytechnic Question Papers easily. Browse, analyze,
            and download previous years’ question papers through a clean and
            government-style portal.
          </p>
          <div className="mt-6">
            <button
              onClick={() => navigate("/DataControl")}
              className="bg-white text-blue-800 font-semibold py-3 px-6 sm:px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* ================= CARDS SECTION ================= */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 bg-white">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-gray-800">
          Explore Portal
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10">
          {/* -------- All Question Papers -------- */}
          <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center text-center relative border border-gray-200">
            {newRequestsCount > 0 && (
              <div
                className="absolute top-3 sm:top-4 right-3 sm:right-4 bg-red-600 text-white text-xs sm:text-sm font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-md animate-pulse cursor-pointer group"
                title={`${newRequestsCount} New Request${newRequestsCount > 1 ? 's' : ''}`}
              >
                <BellIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">{newRequestsCount}</span>
                <span className="sm:hidden">{newRequestsCount > 9 ? '9+' : newRequestsCount}</span>
                {/* Tooltip for mobile/small screens */}
                <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                  {newRequestsCount} New Request{newRequestsCount > 1 ? 's' : ''}
                </div>
              </div>
            )}
            <FaBook className="text-blue-700 text-4xl sm:text-5xl mb-4 sm:mb-5" />
            <h3 className="font-semibold text-xl sm:text-2xl mb-3 text-gray-800">
              All Question Papers
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Browse and access all previous year RGPV question papers.
            </p>
            <button
              onClick={() => {
                navigate("/DataControl");
              }}
              className="bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-6 sm:px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              View Papers
            </button>
          </div>

          {/* -------- Subject-wise Analysis -------- */}
          <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center text-center border border-gray-200">
            <FaChartBar className="text-green-600 text-4xl sm:text-5xl mb-4 sm:mb-5" />
            <h3 className="font-semibold text-xl sm:text-2xl mb-3 text-gray-800">
              Subject-wise Analysis
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Analyze trends and patterns of RGPV question papers.
            </p>
            <button
              onClick={() => {
                navigate("/Dasbord");
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 sm:px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              View Analysis
            </button>
          </div>

          {/* -------- Download Reports -------- */}
          <div className="bg-gray-50 p-6 sm:p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 flex flex-col items-center text-center border border-gray-200">
            <FaFileDownload className="text-purple-600 text-4xl sm:text-5xl mb-4 sm:mb-5" />
            <h3 className="font-semibold text-xl sm:text-2xl mb-3 text-gray-800">
              Download Reports
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
              Download consolidated reports of RGPV question papers.
            </p>
            <button
              onClick={() => {
                navigate("/DataReport");
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-6 sm:px-8 rounded-full shadow-md transition-all duration-300 hover:scale-105 text-sm sm:text-base"
            >
              Download
            </button>
          </div>
        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 xl:px-24 text-center bg-gray-100">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-800">
          About MPQP RGPV Portal
        </h2>
        <p className="text-gray-700 max-w-4xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed">
          MPQP RGPV Question Paper Portal is a dedicated platform for students and
          faculty to access previous year RGPV Polytechnic question papers.
          The portal follows a clean, official, and government-style design,
          ensuring accessibility on mobile phones, tablets, and desktops.
        </p>
      </section>
    </div>
  );
};

export default MPQPPaperM;
