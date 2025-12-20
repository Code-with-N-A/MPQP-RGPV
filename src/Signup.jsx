import React, { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged, deleteUser } from "firebase/auth";
import { auth, googleProvider, githubProvider, twitterProvider } from "./firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, 
  Github, 
  Twitter, 
  AlertCircle, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";

export default function Auth() {
  const [msg, setMsg] = useState({ text: "", type: "" });
  const [loadingProvider, setLoadingProvider] = useState(null);
  const [showMsg, setShowMsg] = useState(false);
  const [progress, setProgress] = useState(0);
  const [blinkGoogle, setBlinkGoogle] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) navigate(from, { replace: true });
    });
    return () => unsubscribe();
  }, [navigate, from]);

  // Progress Bar Logic
  useEffect(() => {
    let interval;
    if (showMsg) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setShowMsg(false), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 40);
    }
    return () => clearInterval(interval);
  }, [showMsg]);

  const showNotification = (text, type) => {
    setMsg({ text, type });
    setShowMsg(true);
  };

  const handleAuth = async (provider, name) => {
    if (loadingProvider) return;
    setLoadingProvider(name);
    setBlinkGoogle(false);

    try {
      const result = await signInWithPopup(auth, provider);
      if (!result.user.email) {
        showNotification("Email access is required to continue.", "error");
        await deleteUser(result.user);
        return;
      }
      showNotification("Authenticated successfully! Redirecting...", "success");
      setTimeout(() => navigate(from, { replace: true }), 2000);
    } catch (error) {
      let friendlyMessage = "Authentication failed. Please try again.";
      if (error.code === "auth/popup-closed-by-user") friendlyMessage = "Login cancelled.";
      else if (error.code === "auth/account-exists-with-different-credential") {
        friendlyMessage = "Account exists! Please use Google to sign in.";
        setBlinkGoogle(true);
      }
      showNotification(friendlyMessage, "error");
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
      
      {/* Auth Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[440px] bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 p-8 md:p-10 z-10"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
             <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">MPQP Portal</h1>
          <p className="text-gray-500 mt-2 text-center font-medium">Secure access to academic resources</p>
        </div>

        {/* Auth Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => handleAuth(googleProvider, "Google")}
            disabled={!!loadingProvider}
            className={`w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border-2 border-gray-100 rounded-2xl font-bold text-gray-700 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all duration-200 group relative overflow-hidden ${blinkGoogle ? 'ring-4 ring-indigo-500 ring-opacity-50 animate-bounce' : ''}`}
          >
            {loadingProvider === "Google" ? (
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
            ) : (
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5 group-hover:scale-110 transition-transform" alt="Google" />
            )}
            <span>{loadingProvider === "Google" ? "Connecting..." : "Continue with Google"}</span>
          </button>

          <div className="flex gap-4">
            <button
              onClick={() => handleAuth(githubProvider, "GitHub")}
              disabled={!!loadingProvider}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-gray-200 disabled:opacity-50"
            >
              {loadingProvider === "GitHub" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Github size={20} />}
              GitHub
            </button>

            <button
              onClick={() => handleAuth(twitterProvider, "Twitter")}
              disabled={!!loadingProvider}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-[#1DA1F2] text-white rounded-2xl font-bold hover:bg-[#1a91da] transition-all shadow-lg shadow-blue-100 disabled:opacity-50"
            >
              {loadingProvider === "Twitter" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Twitter size={20} />}
              Twitter
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-gray-50 text-center">
          <p className="text-xs text-gray-400 leading-relaxed uppercase tracking-widest font-bold">
            Trusted by 5000+ Students
          </p>
        </div>
      </motion.div>

      {/* Modern Toast Notification */}
      <AnimatePresence>
        {showMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed top-6 z-[100] w-full max-w-sm"
          >
            <div className={`mx-4 bg-white rounded-2xl shadow-2xl border-l-4 p-4 overflow-hidden ${msg.type === "success" ? "border-green-500" : "border-red-500"}`}>
              <div className="flex items-start gap-3">
                {msg.type === "success" ? (
                  <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 shrink-0" />
                )}
                <div className="flex-1">
                  <h4 className={`font-bold text-sm ${msg.type === "success" ? "text-green-800" : "text-red-800"}`}>
                    {msg.type === "success" ? "Success" : "Action Required"}
                  </h4>
                  <p className="text-gray-600 text-xs mt-0.5 font-medium leading-normal">{msg.text}</p>
                </div>
              </div>
              {/* Animated Progress Bar */}
              <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
                <motion.div 
                  className={`h-full ${msg.type === "success" ? "bg-green-500" : "bg-red-500"}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}