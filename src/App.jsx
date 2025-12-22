// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Nave from "./Nave";
import Home from "./Home";
import LandingPage from "./YouserAcoount";
import PaperForm from "./PaperForm";
import SignupNotification from "./Snotificetion";
import Auth from "./Signup";
import Footer from "./Footer";
import ProtectedRoute from "./ProtectedRoute";
import MPQPPageM from "./MPQPM";
import Dashboard from "./DataFolowD";
import ControlD from "./DataControl";
import Report from "./Report";
import { ApiProvider } from "./ContextAPI";
import ApprovalS from "./ApruvelS";
import UserRoute from "./UserRout";
import EmailHrth from "./EmailGroth";

function App() {
  return (
    <>
      <Nave />
      <SignupNotification />

      <ApiProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="//paper-upload" element={
            <UserRoute>
            <PaperForm />
            </UserRoute>
            } />
          <Route path="/user-status" element={
            <UserRoute>
            <ApprovalS />
            </UserRoute>
            } />


          <Route path="/DataControl" element={
            <ProtectedRoute>
              <ControlD />
            </ProtectedRoute>} />
          <Route path="/Dasbord" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>} />
          <Route path="/DataReport" element={
            <ProtectedRoute>
              <Report />
              </ProtectedRoute>} />

          <Route
            path="/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"
            element={
              <ProtectedRoute>
                <MPQPPageM />
              </ProtectedRoute>
            }
          />

          <Route path="/Top-10-user" element={<EmailHrth/>} />
          <Route path="/signup" element={<Auth />} />
          <Route path="/user-account" element={<LandingPage />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </ApiProvider>

      <Footer />
    </>
  );
}

export default App;
