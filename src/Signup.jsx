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
  const [loadingProvider, setLoadingProvider] = useState(null); // Track which provider is loading
  const [showMsg, setShowMsg] = useState(false);
  const [progress, setProgress] = useState(0);
  const [blinkGoogle, setBlinkGoogle] = useState(false);

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
    setLoadingProvider(name); // Set which provider is loading
    setBlinkGoogle(false); // Reset blink on new attempt
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user.email) {
        showNotification("Unable to retrieve your email. Please try again.", "error");
        try {
          await deleteUser(user);
        } catch {}
        return;
      }

      showNotification("Login successful! Redirecting...", "success");
      setTimeout(() => navigate(from, { replace: true }), 1500);
    } catch (error) {
      // User-friendly error messages instead of raw errors
      let friendlyMessage = "Login failed. Please check your connection and try again.";
      if (error.code === "auth/popup-closed-by-user") {
        friendlyMessage = "Login cancelled. Please try again.";
      } else if (error.code === "auth/network-request-failed") {
        friendlyMessage = "Network error. Please check your internet and try again.";
      } else if (error.code === "auth/account-exists-with-different-credential") {
        friendlyMessage = "This account is linked to another provider. Please sign in with Google to continue.";
        setBlinkGoogle(true); // Trigger Google button blink
        setTimeout(() => setBlinkGoogle(false), 5000); // Stop blinking after 5 seconds
      }
      showNotification(friendlyMessage, "error");
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingProvider(null); // Reset loading provider
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20 relative">
      {/* Clean Professional Background - Plain White */}
      <div className="absolute inset-0 bg-white"></div>

      {/* Auth Card - Professional Look */}
      <div className="relative w-full max-w-lg bg-white p-10 shadow-xl z-10 border border-gray-300 rounded-lg">
        {/* Header with Professional SVG Logo */}
        <div className="text-center mb-10">
          {/* Custom SVG Logo for MPQP */}
          <div className="flex justify-center mb-6">
            <svg
              width="90"
              height="90"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-md"
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
          <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Welcome to MPQP</h1>
          <p className="text-gray-600 text-lg font-medium">Sign in with your preferred platform</p>
        </div>

        {/* Buttons Layout: Google Full Width, GitHub and Twitter in One Row */}
        <div className="space-y-6">
          {/* Google Button - Full Width */}
          <button
            onClick={() => handleAuth(googleProvider, "Google")}
            disabled={loading}
            className={`cursor-pointer flex items-center justify-center gap-2 py-4 px-6 bg-white text-gray-700 rounded-lg font-semibold hover:bg-gray-50 hover:shadow-lg transition-all duration-300 w-full border border-gray-300 ${blinkGoogle ? 'animate-pulse' : ''} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6" />
            Continue with Google
            {loadingProvider === "Google" && (
              <div className="w-3 h-3 border-2 border-gray-700 border-t-transparent rounded-full animate-spin"></div>
            )}
          </button>

          {/* GitHub and Twitter in One Row */}
          <div className="flex gap-4">
            <button
              onClick={() => handleAuth(githubProvider, "GitHub")}
              disabled={loading}
              className={`cursor-pointer flex items-center justify-center gap-2 py-4 px-5 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 hover:shadow-lg transition-all duration-300 flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <img src="https://github.githubassets.com/images/modules/site/icons/footer/github-mark.svg" className="w-5 h-5" />
              GitHub
              {loadingProvider === "GitHub" && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>

            <button
              onClick={() => handleAuth(twitterProvider, "Twitter")}
              disabled={loading}
              className={`cursor-pointer flex items-center justify-center gap-2 py-4 px-5 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 hover:shadow-lg transition-all duration-300 flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Custom Grey Twitter SVG with Small Background */}
              <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-3 h-3 text-gray-700"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              Twitter
              {loadingProvider === "Twitter" && (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          </div>
        </div>

        {/* Optional Footer for Extra Professionalism */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">By signing in, you agree to our Terms of Service and Privacy Policy.</p>
        </div>
      </div>

      {/* Enhanced Notification Popup */}
      {showMsg && (
        <div className="fixed top-4 inset-x-0 flex justify-center z-50 px-2">
          <div className="w-full sm:w-96 max-w-lg p-4 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-3">
              {/* Appropriate SVG Icon based on message type */}
              {msg.type === "success" ? (
                <svg className="w-6 h-6 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              ) : (
                <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
              )}
              <span className={`text-xs font-medium leading-tight ${msg.type === "success" ? "text-green-800" : "text-red-800"}`}>
                {msg.text}
              </span>
            </div>
            <div className="h-1 bg-gray-200 w-full rounded-full mt-3 overflow-hidden">
              <div className={`h-full transition-all duration-100 ${msg.type === "success" ? "bg-green-500" : "bg-red-500"}`} style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
