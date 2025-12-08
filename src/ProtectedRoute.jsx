// src/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  if (!user)
    return (
      <Navigate
        to="/signup"
        replace
        state={{ from: location.pathname }}
      />
    );

  return children;
}
