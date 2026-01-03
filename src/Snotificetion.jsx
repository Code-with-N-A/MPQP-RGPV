import { useState, useEffect, useRef } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function SignupNotification() {
  const [showCard, setShowCard] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [celebrate, setCelebrate] = useState(false);
  const navigate = useNavigate();

  const welcomeTimeoutRef = useRef(null);
  const autoHideTimeoutRef = useRef(null);
  const signupTimerRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && !localStorage.getItem("welcomeShown")) {
        if (signupTimerRef.current) clearTimeout(signupTimerRef.current);
        welcomeTimeoutRef.current = setTimeout(() => {
          setShowWelcome(true);
          setCelebrate(true); // Trigger Confetti/Skyshot
          localStorage.setItem("welcomeShown", "true");
          
          // Auto hide everything after 8 seconds
          autoHideTimeoutRef.current = setTimeout(() => {
            setShowWelcome(false);
            setCelebrate(false);
          }, 8000);
        }, 800);
      } else if (!currentUser) {
        localStorage.removeItem("welcomeShown");
        setShowWelcome(false);
        setCelebrate(false);
        if (signupTimerRef.current) clearTimeout(signupTimerRef.current);
        
        // Load after 5s for Google Ads stability
        signupTimerRef.current = setTimeout(() => {
          if (!currentUser) setShowCard(true);
        }, 5000);
      }
    });

    return () => {
      unsubscribe();
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
      if (autoHideTimeoutRef.current) clearTimeout(autoHideTimeoutRef.current);
      if (signupTimerRef.current) clearTimeout(signupTimerRef.current);
    };
  }, []);

  const handleGoogleSignup = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowCard(false);
    } catch (err) {
      console.error("Signup failed:", err);
      setError("Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (user) => user?.displayName || user?.email?.split("@")[0] || "Student";

  if (!showCard && !showWelcome) return null;

  return (
    <>
      {/* Celebration Effect (Fireworks/Confetti) */}
      {celebrate && (
        <div className="celebration-overlay fixed inset-0 z-[10000] pointer-events-none overflow-hidden">
          {[...Array(35)].map((_, i) => (
            <div key={i} className={`confetti piece-${i}`}></div>
          ))}
        </div>
      )}

      <div className="notification-fixed-container fixed z-[9999] pointer-events-none">
        
        {/* Signup Alert (Government Style) */}
        {showCard && !user && (
          <div className="notification-card pointer-events-auto bg-white/95 backdrop-blur-md shadow-2xl border-t-4 border-[#003366] overflow-hidden animate-slideIn">
            <div className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#003366] rounded-none flex items-center justify-center shadow-lg flex-shrink-0">
                    <span className="text-white font-serif text-xl font-bold">M</span>
                  </div>
                  <div>
                    <h3 className="text-[#003366] font-extrabold text-[12px] uppercase tracking-tighter leading-tight">MPQP Digital Repository</h3>
                    <p className="text-[10px] text-gray-500 font-semibold italic">A Portal for RGPV & Polytechnic Students</p>
                  </div>
                </div>
                <button onClick={() => setShowCard(false)} className="text-gray-300 hover:text-red-600 transition-colors p-1">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>

              {error && (
                <div className="mb-4 p-2 bg-red-50 border-l-2 border-red-500 text-red-700 text-[11px] font-bold">
                  {error}
                </div>
              )}

              <p className="text-gray-700 text-[13px] leading-snug mb-5 border-l-2 border-blue-100 pl-3">
                Authenticate your identity to download <b>Previous Year Question Papers</b> (Old & New Schemes).
              </p>

              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-none shadow-sm flex items-center justify-center gap-3 hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-[#4285F4] border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span className="text-sm font-bold tracking-tight">Login with Google Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Welcome / Congratulations Card */}
        {showWelcome && user && (
          <div className="notification-card pointer-events-auto bg-white/95 backdrop-blur-md border-b-4 border-green-600 shadow-[0_20px_50px_rgba(0,0,0,0.2)] overflow-hidden animate-slideIn">
            <div className="p-6 relative">
              <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-shrink-0">
                  <img src={user.photoURL || `https://ui-avatars.com/api/?name=${getUserName(user)}&background=0D8ABC&color=fff`} alt="User" className="w-14 h-14 rounded-none border-4 border-green-50 shadow-md" />
                  <span className="absolute bottom-0 right-0 bg-green-500 w-4 h-4 rounded-none border-2 border-white"></span>
                </div>
                <div>
                  <h4 className="text-xl font-black text-gray-900 leading-tight">Congratulations!</h4>
                  <p className="text-xs text-green-600 font-bold uppercase tracking-widest">Verification Successful</p>
                </div>
              </div>
              
              <div className="bg-gray-50/50 rounded-none p-4 mb-4 border border-gray-100">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  "Welcome <b>{getUserName(user)}</b> to the MPQP Official Repository. Your academic dashboard for RGPV Polytechnic papers is now active."
                </p>
              </div>

              <button 
                onClick={() => { setShowWelcome(false); setCelebrate(false); }}
                className="w-full bg-[#003366] text-white py-3 rounded-none font-bold text-xs uppercase tracking-widest hover:bg-[#002244] shadow-md transition-all active:scale-95"
              >
                Go to Dashboard
              </button>
              
              {/* Progress bar at the bottom */}
              <div className="absolute bottom-0 left-0 h-1 bg-green-500/30 w-full">
                <div className="h-full bg-green-600 animate-timerProgress origin-left"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Positioning */
        .notification-fixed-container { 
          bottom: 25px; 
          right: 25px; 
          width: 380px; 
          max-width: calc(100vw - 50px); 
        }

        .notification-card {
          border-radius: 0 !important;
        }

        /* Confetti Animation */
        .confetti {
          position: absolute; width: 10px; height: 10px; 
          top: -10%; opacity: 0; animation: fall 4s infinite ease-in-out;
        }
        @keyframes fall {
          0% { top: -10%; transform: translateX(0) rotate(0deg); opacity: 1; }
          100% { top: 100%; transform: translateX(100px) rotate(720deg); opacity: 0; }
        }
        ${[...Array(35)].map((_, i) => `
          .piece-${i} { 
            left: ${Math.random() * 100}%; 
            background-color: ${['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'][i % 5]};
            animation-delay: ${Math.random() * 3}s;
          }
        `).join('')}

        /* Mobile Adjustments (Phone) */
        @media (max-width: 640px) {
          .notification-fixed-container { 
            bottom: 15px; 
            right: 15px; 
            left: 15px; 
            width: auto; 
            max-width: none;
          }
          
          .notification-card { 
            border-radius: 0 !important;
            animation: slideInMobile 0.6s cubic-bezier(0.22, 1, 0.36, 1) forwards !important; 
          }
        }

        @keyframes slideIn {
          0% { transform: translateX(120%) translateY(0); opacity: 0; }
          100% { transform: translateX(0) translateY(0); opacity: 1; }
        }

        @keyframes slideInMobile {
          0% { transform: translateY(50px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes timerProgress {
          0% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }

        .animate-slideIn { animation: slideIn 0.8s cubic-bezier(0.19, 1, 0.22, 1) forwards; }
        .animate-timerProgress { animation: timerProgress 8s linear forwards; }
      `}</style>
    </>
  );
}