import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";

import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminRegister from "./pages/AdminRegister";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

// Protect admin dashboard
function ProtectedRoute({ children }) {
  const token = sessionStorage.getItem("adminToken");

  if (!token) {
    return <Navigate to="/admin-login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Register Complaint</Link>
        {" | "}
        <Link to="/track">Track Complaint</Link>
        {" | "}
        <Link to="/admin-register">Admin Registration</Link>
        {" | "}
        <Link to="/admin-login">Admin Login</Link>
        {" | "}
        <Link to="/admin-dashboard">Admin Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;