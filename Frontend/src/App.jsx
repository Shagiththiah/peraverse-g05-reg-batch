import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import BatchRegistration from "./components/BatchRegistration";
import AdminPortal from "./components/AdminPortal";

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to Registration Portal</h1>
      <div className="options">
        <Link to="/individual" className="btn">Individual Registration</Link>
        <Link to="/batch" className="btn">Batch Registration</Link>
        <Link to="/admin" className="btn">Admin Portal</Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/individual" element={<RegistrationForm />} />
        <Route path="/batch" element={<BatchRegistration />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
}
