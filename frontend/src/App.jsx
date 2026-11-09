
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import RegisterComplaint from "./pages/RegisterComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Register Complaint</Link>
        {" | "}
        <Link to="/track">Track Complaint</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RegisterComplaint />} />
        <Route path="/track" element={<TrackComplaint />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
