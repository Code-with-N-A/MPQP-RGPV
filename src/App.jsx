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

function App() {
  return (
    <>
      <Nave />
      <SignupNotification />

      <ApiProvider>
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/Paper Upload" element={
            <UserRoute>
            <PaperForm />
            </UserRoute>
            } />
          <Route path="/User Status" element={
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
            path="/@-nitesh-748933*2"
            element={
              <ProtectedRoute>
                <MPQPPageM />
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
