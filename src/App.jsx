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
import ControlD from "./DataControl";
import { ApiProvider } from "./ContextAPI";
import ApprovalS from "./ApruvelS";
import UserRoute from "./UserRout";

function App() {
  return (
    <>
      <Nave />
      <SignupNotification />

      <ApiProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/paper-upload" element={
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
          <Route
            path="/3EwV67iMsaehQU2W-@nitesh_Amule-@74-89-33eVGkVyzOYJF3"
            element={
              <ProtectedRoute>
                <ControlD/>
              </ProtectedRoute>
            }
          />

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
