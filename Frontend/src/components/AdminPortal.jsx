import React, { useEffect, useState } from "react";
import api from "../lib/api";

export default function AdminPortal() {
  const [visitors, setVisitors] = useState([]);

  useEffect(() => {
    api.getVisitors().then(setVisitors).catch(console.error);
  }, []);

  return (
    <div>
      <h2>Admin Portal</h2>
      {visitors.length === 0 ? (
        <p>No visitors registered yet.</p>
      ) : (
        <table border="1" cellPadding="6" style={{ marginTop: 10 }}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Province</th>
              <th>District</th>
              <th>School</th>
              <th>University</th>
              <th>Department</th>
              <th>Group Size</th>
            </tr>
          </thead>
          <tbody>
            {visitors.map((v) => (
              <tr key={v.id}>
                <td>{v.type}</td>
                <td>{v.province || "-"}</td>
                <td>{v.district || "-"}</td>
                <td>{v.schoolName || "-"}</td>
                <td>{v.university || "-"}</td>
                <td>{v.department || "-"}</td>
                <td>{v.group_size || 1}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
