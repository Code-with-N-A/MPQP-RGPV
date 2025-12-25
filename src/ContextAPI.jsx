import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

const ApiContext = createContext();

const API_URL =
  "https://script.google.com/macros/s/AKfycbwMy3F5EhYwRQ5uamxPcePXpAAwFv51tSBHlByGwt47ILXyKyY3Cr2nEoOPfhETOVSu/exec";

const ADMIN_EMAIL = "codewithna73@gmail.com";

export const ApiProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const [filterOptions, setFilterOptions] = useState({
    years: [],
    sems: [],
    branches: [],
  });

  // 🔐 AUTH LISTENER (unchanged)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user && user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });

    return () => unsub();
  }, []);

  // 📥 DATA FETCH (ONLY FIX: authReady check)
  const fetchData = useCallback(
    async (params = "") => {
      if (!authReady) return; // ✅ यही main fix है

      setLoading(true);
      setError(null);

      try {
        let queryStr = "";

        if (typeof params === "object") {
          const { year, semester, branch, isApprovalScreen } = params;

          if (year) queryStr += `&year=${encodeURIComponent(year)}`;
          if (semester) queryStr += `&semester=${encodeURIComponent(semester)}`;
          if (branch) queryStr += `&branch=${encodeURIComponent(branch)}`;

          if (isAdmin || isApprovalScreen) {
            queryStr += "&admin=true";
          }
        } else {
          queryStr = params;
        }

        const fullUrl = `${API_URL}?action=list${queryStr}`;
        const response = await fetch(fullUrl);
        const text = await response.text();

        if (!text || text.trim() === "" || !text.includes("||")) {
          setData([]);
        } else {
          const rows = text.trim().split("\n").map((line) => {
            const col = line.split("||");
            return {
              timestamp: col[0] || "",
              id: col[1] || "",
              year: col[2] || "",
              semester: col[3] || "",
              paperCode: col[4] || "",
              pdfUrl: col[5] || "",
              subjectName: col[6] || "",
              type: col[7] || "",
              status: col[8]?.trim() || "Disabled",
              branch: col[9] || "",
              email: col[10] || "",
            };
          });
          setData(rows);
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Data load nahi ho paya.");
      } finally {
        setLoading(false);
      }
    },
    [isAdmin, authReady] // ✅ authReady added
  );

  // 🎯 FILTERS (unchanged)
  const fetchFilters = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}?action=getFilters`);
      const result = await res.json();
      if (result.status === "success") {
        setFilterOptions(result.options);
      }
    } catch (err) {
      console.error("Filter Fetch Error:", err);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return (
    <ApiContext.Provider
      value={{
        data,
        setData,
        loading,
        error,
        fetchData,
        filterOptions,
        isAdmin,
        authReady,
        API_URL,
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApiData = () => useContext(ApiContext);
