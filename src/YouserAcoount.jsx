import { useState, useEffect } from "react";
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiClock,
  FiTrendingUp,
  FiStar,
  FiAward,
  FiLogOut,
  FiLink
} from "react-icons/fi";

const provider = new GoogleAuthProvider();

export default function LandingPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      navigate("/profile");
    } catch (error) {
      alert("Sign-in failed. Please try again.");
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Sign-out error:", error);
    }
  };

  // Helper Functions
  const getJoinDate = () => {
    if (!user?.metadata?.creationTime) return "N/A";
    const date = new Date(user.metadata.creationTime);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  const getLastLoginTime = () => {
    return new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDaysSinceJoining = () => {
    if (!user?.metadata?.creationTime) return "N/A";
    const joinDate = new Date(user.metadata.creationTime);
    const now = new Date();
    const diff = now - joinDate;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const getLastLoginDay = () => {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  };

  const getLinkedAccountsCount = () => {
    return user?.providerData?.length || 0;
  };

  const getLinkedEmails = () => {
    return user?.providerData?.map(provider => provider.email).filter(email => email) || [];
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">Loading your professional dashboard...</p>
        </div>
      </div>
    );
  }

  // Logged in Dashboard
  if (user) {
    const linkedEmails = getLinkedEmails();
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-500 via-white to-blue-500 pt-15">
        {/* Main Dashboard */}
        <main className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-5 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Left Profile Card */}
            <div className="lg:w-1/3 bg-white  p-4 hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                {/* Profile Image */}
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-1 shadow-xl">
                    <img
                      src={user.photoURL || "https://via.placeholder.com/160"}
                      alt="Profile"
                      className="w-full h-full rounded-full object-cover border-4 border-white"
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-500 text-white rounded-full p-2 shadow-lg">
                    <FiUser className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full p-1 shadow-lg">
                    <FiStar className="w-3 h-3 sm:w-4 sm:h-4" />
                  </div>
                </div>

                {/* User Name */}
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{user.displayName || "Anonymous Professional"}</h3>
                <p className="text-gray-500 mb-3 text-sm">Premium Member</p>

                {/* Email */}
                <div className="flex items-center justify-center text-gray-600 mb-3">
                  <FiMail className="mr-2 text-blue-500" />
                  <span className="text-sm">{user.email}</span>
                </div>

                {/* Linked Accounts */}
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <FiLink className="mr-2 text-purple-500" />
                  <span className="text-sm">{getLinkedAccountsCount()} Linked Account(s)</span>
                </div>

                {/* Welcome Message */}
                <p className="text-gray-700 text-sm leading-relaxed mb-4">
                  Welcome back, {user.displayName?.split(' ')[0] || "User"}! Your dashboard is ready. Manage your profile, track progress, and unlock new features to enhance your productivity.
                </p>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{getDaysSinceJoining()}</p>
                    <p className="text-xs text-gray-500">Days Active</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">{getLinkedAccountsCount()}</p>
                    <p className="text-xs text-gray-500">Linked Accounts</p>
                  </div>
                </div>

                {/* Sign Out Button */}
                <button 
                  onClick={handleSignOut}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4  transition-colors font-medium flex items-center justify-center cursor-pointer rounded-lg"
                >
                  <FiLogOut className="mr-2" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* Right Section */}
            <div className="lg:w-2/3">
              {/* Stats Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                <div className="bg-white p-3  shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="bg-blue-100 p-1 rounded-full mr-2">
                      <FiCalendar className="text-blue-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Member Since</h4>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{getJoinDate()}</p>
                  <p className="text-gray-600 text-xs mt-1">Account creation date</p>
                </div>
                <div className="bg-white p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="bg-green-100 p-1 rounded-full mr-2">
                      <FiClock className="text-green-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Last Login</h4>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{getLastLoginTime()}</p>
                  <p className="text-gray-600 text-xs mt-1">Recent session</p>
                </div>
                <div className="bg-white p-3 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="bg-purple-100 p-1 rounded-full mr-2">
                      <FiTrendingUp className="text-purple-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Days Active</h4>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{getDaysSinceJoining()} days</p>
                  <p className="text-gray-600 text-xs mt-1">Engagement metric</p>
                </div>
                <div className="bg-white p-3  shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="flex items-center mb-2">
                    <div className="bg-orange-100 p-1 rounded-full mr-2">
                      <FiAward className="text-orange-600 w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900">Last Login Day</h4>
                  </div>
                  <p className="text-gray-800 text-sm font-medium">{getLastLoginDay()}</p>
                  <p className="text-gray-600 text-xs mt-1">Weekly activity</p>
                </div>
              </div>

              {/* Full User Account Details */}
              <div className="mt-4 bg-white p-4 shadow-xl hover:shadow-2xl transition-all duration-300">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <FiUser className="mr-2 text-blue-600 w-5 h-5 sm:w-6 sm:h-6" />
                  User Account Details
                </h3>
                <div 
                  className="overflow-x-auto overflow-y-auto max-h-80"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  <style>
                    {`
                      .overflow-x-auto::-webkit-scrollbar {
                        display: none;
                      }
                    `}
                  </style>
                  <table className="w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-3 text-left font-semibold text-gray-900">Field</th>
                        <th className="py-2 px-3 text-left font-semibold text-gray-900">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Name</td>
                        <td className="py-2 px-3 text-gray-700">{user.displayName}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Email</td>
                        <td className="py-2 px-3 text-gray-700">{user.email}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Email Verified</td>
                        <td className="py-2 px-3 text-gray-700">{user.emailVerified ? "Yes" : "No"}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">UID</td>
                        <td className="py-2 px-3 text-gray-700 break-all">{user.uid}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Provider</td>
                        <td className="py-2 px-3 text-gray-700">{user.providerData[0]?.providerId}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Linked Accounts</td>
                        <td className="py-2 px-3 text-gray-700">{getLinkedAccountsCount()}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Linked Emails</td>
                        <td className="py-2 px-3 text-gray-700">
                          {linkedEmails.length > 0 ? linkedEmails.join(', ') : 'None'}
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Account Created</td>
                        <td className="py-2 px-3 text-gray-700">{getJoinDate()}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Last Login</td>
                        <td className="py-2 px-3 text-gray-700">{getLastLoginTime()}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Photo URL</td>
                        <td className="py-2 px-3 text-gray-700 break-all">{user.photoURL}</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="py-2 px-3 font-medium text-gray-900">Phone Number</td>
                        <td className="py-2 px-3 text-gray-700">{user.phoneNumber || "N/A"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Default Landing Page (User Not Logged In)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ProApp</h1>
          <button
            onClick={handleSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
          >
            Sign In with Google
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="text-center">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 mb-4">
            Elevate Your Professional Journey
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 mb-6 max-w-2xl mx-auto">
            Discover powerful tools, connect with industry leaders, and manage your profile seamlessly. Join thousands of professionals who trust ProApp for their growth.
          </p>
          <button
            onClick={handleSignIn}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors shadow-lg"
          >
            Get Started Free
          </button>
        </div>
      </main>
    </div>
  );
}
