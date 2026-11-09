import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminRegister from "./pages/AdminRegister";
import AdminDashboard from "./pages/AdminDashboard";

import "./App.css";

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
        <Link to="/admin-dashboard">Admin Dashboard</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin-register" element={<AdminRegister />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
