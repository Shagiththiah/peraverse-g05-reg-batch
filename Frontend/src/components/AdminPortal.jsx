import React, { useEffect, useState } from "react";
import axios from "axios";

export default function AdminPortal() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get("/api/admin/registrations", {
        headers: { Authorization: "Bearer supersecret123" },
      })
      .then((res) => setRows(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Portal</h1>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th>
            <th>Type</th>
            <th>Leader</th>
            <th>Group Size</th>
            <th>Group Meta</th>
            <th>Registered At</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.type}</td>
              <td>{r.school || r.university || r.age_range || "-"}</td>
              <td>{r.group_size}</td>
              <td>{JSON.stringify(r.group_meta)}</td>
              <td>{new Date(r.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
