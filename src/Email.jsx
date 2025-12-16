import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase"; // apna firebase config

const API_URL =
  "https://script.google.com/macros/s/AKfycbyNRjW7geD8sbLyCnzQE6ZpbYh7ESbB6CxrU6mL6x3BSiiGhnduHbTtKFQgypQZ83-s/exec";

export default function EmailNotification() {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(false);
  const [loading, setLoading] = useState(false);

  // ===============================
  // CHECK IF EMAIL EXISTS IN SHEET
  // ===============================
  const checkEmailInSheet = async (email) => {
    try {
      setChecking(true);
      const res = await fetch(`${API_URL}?mode=list`);
      const data = await res.json();

      if (data.status === "success") {
        const exists = data.data.some(
          (row) => row.email && row.email.toLowerCase() === email.toLowerCase()
        );
        return exists;
      } else {
        console.error("Failed to fetch sheet data");
        return false;
      }
    } catch (err) {
      console.error("Error checking sheet", err);
      return false;
    } finally {
      setChecking(false);
    }
  };

  // ===============================
  // HANDLE LOGGED IN USER
  // ===============================
  const handleUserLogin = async (currentUser) => {
    if (!currentUser || !currentUser.email) return;
    setUser(currentUser);

    const exists = await checkEmailInSheet(currentUser.email);

    if (!exists) setShow(true); // show popup only if email not in sheet
    else setShow(false);
  };

  // ===============================
  // INIT
  // ===============================
  useEffect(() => {
    if (auth.currentUser) handleUserLogin(auth.currentUser);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) handleUserLogin(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // ===============================
  // ALLOW CLICK
  // ===============================
  const handleAllow = async () => {
    if (!user) return;
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.displayName || "Unknown User",
          email: user.email,
        }),
      });

      const data = await res.json();

      if (data.status === "success" || data.status === "exists") {
        setShow(false);
      } else {
        alert("Something went wrong");
      }
    } catch (err) {
      console.error(err);
      alert(
        "Network error. Agar local me CORS error aa raha hai, toh Chrome me 'Allow CORS' extension ya server deploy karke test karo."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLater = () => setShow(false);

  if (!show) return null;

  // ===============================
  // POPUP UI
  // ===============================
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[90%] max-w-md rounded-2xl bg-white p-6 shadow-xl animate-scaleIn">
        <h2 className="text-xl font-bold text-gray-800">🔔 Enable Notifications</h2>

        <p className="mt-3 text-sm text-gray-600">
          Hi <b>{user?.displayName || "User"}</b>, latest updates aur new question papers ke liye notifications allow karein.
        </p>

        {checking && (
          <p className="mt-2 text-xs text-gray-400">Checking existing subscription...</p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={handleLater}
            className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Later
          </button>

          <button
            onClick={handleAllow}
            disabled={loading}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Sending..." : "Allow"}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          0% { transform: scale(0.9); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-scaleIn { animation: scaleIn 0.3s ease-out forwards; }
      `}</style>
    </div>
  );
}
