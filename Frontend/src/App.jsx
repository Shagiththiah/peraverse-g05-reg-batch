import React from "react";
import RegistrationForm from "./components/RegistrationForm.jsx";

export default function App() {
  return (
    <div
      style={{
        maxWidth: 900,
        margin: "32px auto",
        padding: "0 16px",
        fontFamily:
          '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif'
      }}
    >
      <RegistrationForm />
    </div>
  );
}
