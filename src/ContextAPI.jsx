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
  "https://script.google.com/macros/s/AKfycbzrJs6yJMpaiO0eVhhjxCcOztv9T66YV0xExkzMjFU-vaNlJMwIFnbB3Dya0Sy2FQ/exec";

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

  // 🔐 AUTH LISTENER
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

  // 📥 DATA FETCH (multi-branch compatible)
  const fetchData = useCallback(
    async (params = "") => {
      if (!authReady) return;

      setLoading(true);
      setError(null);

      try {
        let queryStr = "";

        if (typeof params === "object") {
          const { year, semester, branches, isApprovalScreen } = params;

          if (year) queryStr += `&year=${encodeURIComponent(year)}`;
          if (semester) queryStr += `&semester=${encodeURIComponent(semester)}`;

          // Multi-branch support
          if (branches) {
            if (Array.isArray(branches)) {
              branches.forEach(
                (b) => (queryStr += `&branch=${encodeURIComponent(b)}`)
              );
            } else {
              queryStr += `&branch=${encodeURIComponent(branches)}`;
            }
          }

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
    [isAdmin, authReady]
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

  // 📝 SAVE FUNCTION (multi-branch)
  const savePaper = useCallback(
    async ({
      id,
      year,
      semester,
      paperCode,
      subjectName,
      type,
      pdfBase64,
      filename,
      email,
      branches,
    }) => {
      if (!branches || branches.length === 0) branches = [branches];

      const payload = {
        action: "save",
        id,
        year,
        semester,
        paperCode,
        subjectName,
        type,
        pdfBase64,
        filename,
        email,
        branches,
      };

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        return result;
      } catch (err) {
        console.error("Save Error:", err);
        return { status: "error", message: err.toString() };
      }
    },
    []
  );

  // 📝 CHECK EXISTING BRANCHES
  const checkPaper = useCallback(
    async ({ year, semester, paperCode, type, branches }) => {
      if (!branches || branches.length === 0) branches = [branches];

      const payload = {
        action: "check",
        year,
        semester,
        paperCode,
        type,
        branches,
      };

      try {
        const res = await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(payload),
        });
        const result = await res.json();
        return result; // result.existingBranches (if backend updated)
      } catch (err) {
        console.error("Check Error:", err);
        return { status: "error", message: err.toString() };
      }
    },
    []
  );

  return (
    <ApiContext.Provider
      value={{
        data,
        setData,
        loading,
        error,
        fetchData,
        fetchFilters,
        filterOptions,
        savePaper,
        checkPaper,
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
