import { useState, useRef, useEffect } from "react";
import {
  FiUser,
  FiMail,
  FiLogOut,
  FiEdit,
  FiArrowLeft,
  FiSave,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

export default function UserProfile({ user, onLogout, sidebarClose }) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState("menu");
  const [displayName, setDisplayName] = useState("");
  const [joinDate, setJoinDate] = useState("");
  const [lastLoginTime, setLastLoginTime] = useState("");
  const cardRef = useRef(null);
  const navigate = useNavigate();

  // Load saved name and last login from localStorage (user-specific)
  useEffect(() => {
    if (!user?.email) return;

    const savedName = localStorage.getItem(`userDisplayName_${user.email}`);
    const savedLastLogin = localStorage.getItem(`userLastLogin_${user.email}`);

    if (savedName) setDisplayName(savedName);
    if (savedLastLogin) setLastLoginTime(savedLastLogin);
  }, [user?.email]);

  // When user logs in or refresh happens update info
  useEffect(() => {
    if (!user) return;

    const nameFromLocal = localStorage.getItem(
      `userDisplayName_${user.email}`
    );
    const finalName =
      nameFromLocal ||
      user.displayName ||
      (user.email
        ? user.email.split("@")[0].charAt(0).toUpperCase() +
        user.email.split("@")[0].slice(1).toLowerCase()
        : "User");

    setDisplayName(finalName);
    localStorage.setItem(`userDisplayName_${user.email}`, finalName);

    const date = user.metadata?.creationTime
      ? new Date(user.metadata.creationTime)
      : new Date();
    const formattedDate = `${date.getDate()
      .toString()
      .padStart(2, "0")}/${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${date.getFullYear().toString().slice(-2)}`;
    setJoinDate(formattedDate);

    const now = new Date();
    const formattedLastLogin = `${now.getDate()
      .toString()
      .padStart(2, "0")}/${(now.getMonth() + 1)
        .toString()
        .padStart(2, "0")}/${now.getFullYear()} ${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now
            .getMinutes()
            .toString()
            .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLastLoginTime(formattedLastLogin);
    localStorage.setItem(`userLastLogin_${user.email}`, formattedLastLogin);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setOpen(false);
        setView("menu");
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const dropdownClasses = open
    ? "opacity-100 scale-100 translate-y-0"
    : "opacity-0 scale-95 -translate-y-2";

  const handleViewChange = (v) => setView(v);
  const backToMenu = () => setView("menu");

  const handleSave = (newName) => {
    if (!user?.email) return;
    setDisplayName(newName);
    localStorage.setItem(`userDisplayName_${user.email}`, newName);
    setView("menu");
  };

  return (
    <div className="relative" ref={cardRef}>
      {/* Profile Button */}
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setView("menu");
        }}
        className="w-10 h-10 flex items-center justify-center rounded-full 
        bg-gradient-to-br from-orange-400 to-orange-600 shadow-xl hover:scale-105 
        transition-all duration-300 cursor-pointer"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <FiUser className="text-white w-7 h-7" />
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className={`absolute right-0 mt-4 w-80 bg-white shadow-2xl 
          p-6 z-[200] transition-all duration-300 ${dropdownClasses}`}
        >
          {!user ? (
            <>
              <h3 className="text-xl font-bold text-gray-900 text-center">
                Welcome Back!
              </h3>
              <p className="text-sm text-gray-600 text-center mt-2">
                Create an account to continue.
              </p>

              <button
                onClick={() => {
                  navigate("/Signup");
                  setOpen(false);
                  sidebarClose && sidebarClose();
                }}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 mt-4 "
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              {/* Back Button */}
              {view !== "menu" && (
                <button
                  onClick={backToMenu}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 cursor-pointer"
                >
                  <FiArrowLeft /> Back
                </button>
              )}

              {/* --- MENU VIEW --- */}
              {view === "menu" && (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-md bg-gray-200">
                      {user?.photoURL ? (
                        <img
                          src={user.photoURL}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FiUser className="w-full h-full p-4 text-gray-600" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600 flex items-center gap-1">
                        <FiMail className="w-4 h-4" /> {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 border-t"></div>

                  {/* View Profile */}
                  <button
                    onClick={() => {
                      navigate("/user-account");
                      setOpen(false);
                      sidebarClose && sidebarClose();
                    }}
                    className="w-full bg-gray-50 hover:bg-gray-100 py-3 px-4 flex items-center gap-3 cursor-pointer"
                  >
                    <FiUser /> View Profile
                  </button>

                  {/* Edit Profile */}
                  <button
                    onClick={() => handleViewChange("edit")}
                    className="w-full bg-gray-50 hover:bg-gray-100 py-3 px-4 flex items-center gap-3 mt-2 cursor-pointer"
                  >
                    <FiEdit /> Edit Profile
                  </button>

                  {/* ⭐ ONLY SHOW FOR ADMIN EMAIL ⭐ */}
                  {user.email === "mpqp073@gmail.com" && (
                    <button
                      onClick={() => {
                        navigate("/@-nitesh-748933*2");
                        setOpen(false);
                        sidebarClose && sidebarClose();
                      }}
                      className="w-full bg-gray-50 hover:bg-gray-100 py-3 px-4 flex items-center gap-3 mt-2 cursor-pointer text-blue-600 font-semibold"
                    >
                      ⚙️ Control Panel
                    </button>
                  )}

                  <div className="my-3 border-t"></div>

                  {/* Logout */}
                  <button
                    onClick={() => {
                      onLogout();
                      setOpen(false);
                      sidebarClose && sidebarClose();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FiLogOut /> Logout
                  </button>
                </>
              )}

              {/* --- EDIT VIEW --- */}
              {view === "edit" && (
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const newName = e.target.name.value.trim();
                    if (newName) handleSave(newName);
                  }}
                >
                  <h3 className="text-lg font-bold text-gray-900">
                    Edit Profile
                  </h3>

                  <div>
                    <label className="text-sm text-gray-700">Display Name</label>
                    <input
                      type="text"
                      name="name"
                      defaultValue={displayName}
                      className="w-full px-3 py-2 border rounded-lg mt-1"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <FiSave /> Save Changes
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
