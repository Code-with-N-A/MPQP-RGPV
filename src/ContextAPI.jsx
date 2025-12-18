// src/ContextAPI.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const ApiContext = createContext();

const API_URL = "https://script.google.com/macros/s/AKfycbwgD4m0-ngJQLmmeRrrhTDo9EZ4qPgVY35sk7d543mUZNWZ4SPilfo5hq86a-qt5XJE/exec";


export const ApiProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // internal variable name changed for clarity
  const internalApiUrl = API_URL;

  useEffect(() => {
    setLoading(true);
    fetch(`${internalApiUrl}?action=list`) // internal variable use
      .then((res) => {
        if (!res.ok) throw new Error("Network error");
        return res.json();
      })
      .then((json) => {
        if (json.status === "success" && Array.isArray(json.rows)) {
          setData(json.rows);
        } else {
          setData([]);
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("Failed to load data");
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <ApiContext.Provider value={{ data, loading, error, API_URL }}>
      {children}
    </ApiContext.Provider>
  );
};

// Custom hook for easier usage
export const useApiData = () => useContext(ApiContext);
