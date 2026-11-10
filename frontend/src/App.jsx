import {
  BrowserRouter, Routes, Route, Navigate
} from "react-router-dom";

import Navbar from "./components/Navbar";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import DepartmentDashboard from "./pages/DepartmentDashboard";
import OfficerDashboard from "./pages/OfficerDashboard";
import CitizenRegister from "./pages/CitizenRegister";
import CitizenLogin from "./pages/CitizenLogin";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("adminToken");
  return token ? children : <Navigate to="/admin-login" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/citizen-register" element={<CitizenRegister />} />
        <Route path="/citizen-login" element={<CitizenLogin />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={
          <ProtectedRoute><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/department" element={<DepartmentDashboard />} />
        <Route path="/officer" element={<OfficerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
