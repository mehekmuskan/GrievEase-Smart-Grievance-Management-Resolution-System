import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import AdminRegister from "./pages/AdminRegister";

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
      </nav>

      <Routes>
        <Route path="/" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
        <Route path="/admin-register" element={<AdminRegister />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
