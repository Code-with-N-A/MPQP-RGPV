// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Nave from "./Nave";
import Home from "./Home";
import LandingPage from "./YouserAcoount";
import Dashboard from "./Dasbor";
import PaperForm from "./PaperForm";
import SignupNotification from "./Snotificetion";
import Auth from "./Signup";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <>
      <Nave />
      <SignupNotification />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/Paper Upload"
          element={
            <PaperForm />
          }
        />
        <Route
          path="/Cntrol-Panel"
          element={
            <ProtectedRoute>
            <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/signup" element={
          <Auth />
        } />


        <Route path="/user-account" element={<LandingPage />} />

        <Route path="*" element={<Home />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
