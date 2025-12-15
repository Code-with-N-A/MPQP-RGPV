import { useState, useEffect } from "react";
import {
  signInWithPopup,
  onAuthStateChanged,
  deleteUser,
} from "firebase/auth";
import { auth, googleProvider, githubProvider, twitterProvider } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";

export default function Auth() {
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [showMsg, setShowMsg] = useState(false);
  const [progress, setProgress] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate(from, { replace: true });
      }
    });
    return () => unsubscribe();
  }, [navigate, from]);

  const startProgress = () => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowMsg(false);
          return 100;
        }
        return prev + 1;
      });
    }, 25);
  };

  const showNotification = (text, type) => {
    setMsg({ text, type });
    setShowMsg(true);
    startProgress();
  };

  const handleAuth = async (provider, name) => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        showNotification(`Unable to retrieve email from ${name}.`, "error");
        try {
          await deleteUser(user);
        } catch {}
        return;
      }

      showNotification(`Login with ${name} successful!`, "success");
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (error) {
      showNotification(`${name} login failed: ${error.message}`, "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background SVG Pattern for Attractiveness */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#4F46E5" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Auth Card */}
      <div className="relative w-full max-w-md bg-white p-8 shadow-2xl z-10 rounded-3xl border border-gray-200">
        {/* Header with Professional SVG Logo */}
        <div className="text-center mb-8">
          {/* Custom SVG Logo for MPQP */}
          <div className="flex justify-center mb-6">
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Outer Circle with Gradient */}
              <circle cx="40" cy="40" r="38" fill="url(#logoGradient)" stroke="#4F46E5" strokeWidth="2"/>
              {/* Inner Design - Stylized MPQP */}
              <text x="40" y="45" textAnchor="middle" fill="white" fontSize="18" fontWeight="bold" fontFamily="Arial, sans-serif">
                MPQP
              </text>
              {/* Subtle Inner Circle */}
              <circle cx="40" cy="40" r="25" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
              <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                  <stop offset="100%" style={{ stopColor: '#7C3AED', stopOpacity: 1 }} />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">Welcome to MPQP</h1>
          <p className="text-gray-600 text-base font-medium">Sign in with your preferred platform</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleAuth(googleProvider, "Google")}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-4 px-5 bg-gray-50 text-gray-800 rounded-2xl font-semibold hover:bg-gray-100 hover:shadow-md transition-all duration-300 w-full border border-gray-200"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" />
            Continue with Google
          </button>

          <button
            onClick={() => handleAuth(githubProvider, "GitHub")}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-4 px-5 bg-gray-900 text-white rounded-2xl font-semibold hover:bg-gray-800 hover:shadow-md transition-all duration-300 w-full"
          >
            <img src="https://github.githubassets.com/images/modules/site/icons/footer/github-mark.svg" className="w-6 h-6" />
            Continue with GitHub
          </button>

          <button
            onClick={() => handleAuth(twitterProvider, "Twitter")}
            disabled={loading}
            className="flex items-center justify-center gap-3 py-4 px-5 bg-blue-500 text-white rounded-2xl font-semibold hover:bg-blue-600 hover:shadow-md transition-all duration-300 w-full"
          >
            <img src="https://abs.twimg.com/icons/apple-touch-icon-192x192.png" className="w-6 h-6 rounded-full" />
            Continue with Twitter
          </button>
        </div>
      </div>

      {/* Notification */}
      {showMsg && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50 px-2">
          <div className={`w-full sm:w-96 max-w-lg p-4 rounded-2xl shadow-lg overflow-hidden border-l-4
            ${msg.type === "success" ? "bg-green-50 border-green-500 text-green-800" : "bg-red-50 border-red-500 text-red-800"}`}>
            <span className="font-bold mr-2">{msg.type === "success" ? "✓" : "✗"}</span>
            {msg.text}
            <div className="h-1 bg-gray-200 w-full rounded-b-lg mt-1 overflow-hidden">
              <div className={`h-full transition-all duration-100 ${msg.type === "success" ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
