import RegisterComplaint from "./pages/RegisterComplaint";
import AdminRegister from "./pages/AdminRegister";
import "./App.css";

function App() {
  const currentPath = window.location.pathname;

  if (currentPath === "/admin-register") {
    return <AdminRegister />;
  }

  return <RegisterComplaint />;
}

export default App;
