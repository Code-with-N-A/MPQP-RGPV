// src/App.jsx
import { Route, Routes, useNavigate } from "react-router-dom";
import Nave from "./Nave";
import Home from "./Home";
import LandingPage from "./YouserAcoount";
import Dashboard from "./Dasbor";
import PaperForm from "./PaperForm";
import SignupNotification from "./Snotificetion";
import Auth from "./Signup";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";
import CryptoJS from "crypto-js";

function App() {
  const navigate = useNavigate();

  // Example: create encrypted admin route slug
  const secretKey = "my-secret-key";

  const encryptedPath = CryptoJS.AES.encrypt(
    JSON.stringify("@-nitesh-748933"),
    secretKey
  ).toString();

  // Agar future me encrypted route use karna ho:
  // navigate(`/panel/${encryptedPath}`)

  return (
    <>
      <Nave />
      <SignupNotification />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/Paper Upload"
          element={<PaperForm />}
        />

        {/* Ye tumhara original route — admin protected */}
        <Route
          path="/@-nitesh-748933"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/signup"
          element={<Auth />}
        />

        <Route path="/user-account" element={<LandingPage />} />

        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
