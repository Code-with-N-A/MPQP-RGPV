// Professional Signup Notification Component (Big Company Style)
import { useState, useEffect } from "react";
import { signInWithPopup, onAuthStateChanged } from "firebase/auth";
import { auth, googleProvider } from "./firebase";
import { useNavigate } from "react-router-dom";

export default function SignupNotification() {
  const [showCard, setShowCard] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Show card after 3 seconds if user is not logged in
    const timer = setTimeout(() => {
      if (!user) {
        setShowCard(true);
      }
    }, 3000);

    return () => {
      unsubscribe();
      clearTimeout(timer);
    };
  }, [user]);

  // Prevent page scrolling when modal is open
  useEffect(() => {
    if (showCard) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showCard]);

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      setShowCard(false);
      navigate("/"); // Redirect to home or desired page
    } catch (error) {
      console.error("Google signup failed:", error);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setShowCard(false);
  };

  if (!showCard || user) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-500 bg-black bg-opacity-50 backdrop-blur-md p-4" role="dialog" aria-modal="true" aria-labelledby="signup-title">
      <div className="bg-white  shadow-2xl max-w-md w-full overflow-hidden animate-fadeInScaleUp relative border border-gray-200">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 p-2 rounded-full hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Close notification"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 text-center border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="w-12 h-12 bg-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 id="signup-title" className="text-xl font-bold text-gray-900 mb-2">Welcome to MPQP</h2>
          <p className="text-sm text-gray-600 font-medium">Join our professional community</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">
              Access all old and new diploma papers of RGPV, MP Polytechnic. Only question papers available here.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800 text-sm font-medium">Verified diploma papers for all branches</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800 text-sm font-medium">Easy access to old & new papers</span>
            </div>
            <div className="flex items-center">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-gray-800 text-sm font-medium">Quick download & reference</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-3 text-sm cursor-pointer"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Signing Up...
              </>
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
                Continue with Google
              </>
            )}
          </button>

          {/* Footer */}
          <div className="text-center mt-4">
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-xs font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeInScaleUp {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; }
          100% { transform: scale(1) translateY(0); opacity: 1; }
        }
        .animate-fadeInScaleUp { animation: fadeInScaleUp 0.4s ease-out forwards; }
      `}</style>
    </div>
  );
}
