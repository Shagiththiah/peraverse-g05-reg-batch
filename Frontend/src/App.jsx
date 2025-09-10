import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import RegistrationForm from "./components/RegistrationForm";
import AdminPortal from "./components/AdminPortal";

export default function App() {
  return (
    <Router>
      <nav style={{ padding: "10px", background: "#f5f5f5" }}>
        <Link to="/" style={{ marginRight: "15px" }}>Registration</Link>
        <Link to="/admin">Admin Portal</Link>
      </nav>

      <Routes>
        <Route path="/" element={<RegistrationForm />} />
        <Route path="/admin" element={<AdminPortal />} />
      </Routes>
    </Router>
  );
}
