import React, { useEffect, useState } from "react";
import api from "../lib/api";
import "../admin.css";
import { useNavigate } from "react-router-dom";

export default function AdminPortal() {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [filterType, setFilterType] = useState("");
  const [availableRfidTags, setAvailableRfidTags] = useState([]);
  const [selectedRfidTag, setSelectedRfidTag] = useState("");

  useEffect(() => {
    Promise.all([api.getRegistrations(), api.getStats(), api.getAvailableRfidTags()]).then(([regs, s, tags]) => {
      setRegistrations(regs);
      setStats(s);
      setAvailableRfidTags(tags);
      setLoading(false);
    });
  }, []);

  if (loading) return <p>Loading data...</p>;

  const counts = registrations.reduce(
    (acc, r) => {
      acc.total++;
      acc[r.type] = (acc[r.type] || 0) + (r.count || 1);
      return acc;
    },
    { total: 0 }
  );

  const handleAssignRfidTag = async (registrationId) => {
    if (!selectedRfidTag) {
      alert("Please select an RFID tag");
      return;
    }

    try {
      await api.assignRfidTag(registrationId, selectedRfidTag);
      // Refresh data
      const [regs, s, tags] = await Promise.all([
        api.getRegistrations(),
        api.getStats(),
        api.getAvailableRfidTags()
      ]);
      setRegistrations(regs);
      setStats(s);
      setAvailableRfidTags(tags);
      setSelectedRfidTag("");
      alert("RFID tag assigned successfully!");
    } catch (error) {
      alert("Failed to assign RFID tag: " + error.message);
    }
  };

  const handleDeactivateRfidTag = async (tagId) => {
    if (!window.confirm("Are you sure you want to deactivate this RFID tag?")) return;

    try {
      await api.deactivateRfidTag(tagId);
      // Refresh data
      const [regs, s, tags] = await Promise.all([
        api.getRegistrations(),
        api.getStats(),
        api.getAvailableRfidTags()
      ]);
      setRegistrations(regs);
      setStats(s);
      setAvailableRfidTags(tags);
      alert("RFID tag deactivated successfully!");
    } catch (error) {
      alert("Failed to deactivate RFID tag: " + error.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Admin Portal</h1>
        <p>Manage registrations and RFID tags</p>
        <button type="button" className="back-btn" onClick={() => navigate("/")}>Back</button>
      </div>

      {/* Registration Statistics */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">📊</div>
          <div className="card-title">Total Records</div>
          <div className="card-value">{counts.total}</div>
        </div>
        <div className="card">
          <div className="card-icon">👥</div>
          <div className="card-title">Total People</div>
          <div className="card-value">{stats?.totalPeople ?? 0}</div>
        </div>
        <div className="card">
          <div className="card-icon">👤</div>
          <div className="card-title">Individuals</div>
          <div className="card-value">{stats?.registrationsByType?.individual || 0}</div>
        </div>
        <div className="card">
          <div className="card-icon">👥</div>
          <div className="card-title">Batch Events</div>
          <div className="card-value">{stats?.registrationsByType?.batch || 0}</div>
        </div>
      </div>

      {/* RFID Tag Statistics */}
      <div className="summary-cards">
        <div className="card">
          <div className="card-icon">🏷️</div>
          <div className="card-title">Total RFID Tags</div>
          <div className="card-value">{stats?.rfidTags?.total || 0}</div>
        </div>
        <div className="card">
          <div className="card-icon">✅</div>
          <div className="card-title">Available Tags</div>
          <div className="card-value">{stats?.rfidTags?.available || 0}</div>
        </div>
        <div className="card">
          <div className="card-icon">🔗</div>
          <div className="card-title">Assigned Tags</div>
          <div className="card-value">{stats?.rfidTags?.assigned || 0}</div>
        </div>
        <div className="card">
          <div className="card-icon">❌</div>
          <div className="card-title">Deactivated Tags</div>
          <div className="card-value">{stats?.rfidTags?.deactivated || 0}</div>
        </div>
      </div>

      {/* Registration Type Statistics */}
      {stats && (
        <div className="summary-cards">
          <div className="card">People by type (school): {stats.registrationsByType?.school || 0}</div>
          <div className="card">People by type (university): {stats.registrationsByType?.university || 0}</div>
          <div className="card">People by type (general): {stats.registrationsByType?.general || 0}</div>
        </div>
      )}

      <div className="filters">
        <label>Filter by type: </label>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          <option value="">All</option>
          <option value="school">School</option>
          <option value="university">University</option>
          <option value="general">General</option>
        </select>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Registration Management</h2>
          <div className="rfid-assignment">
            <select 
              value={selectedRfidTag} 
              onChange={(e) => setSelectedRfidTag(e.target.value)}
              className="filter-select"
            >
              <option value="">Select RFID Tag</option>
              {availableRfidTags.map(tag => (
                <option key={tag.id} value={tag.tagNumber}>
                  {tag.tagNumber}
                </option>
              ))}
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Type</th>
              <th>Province</th>
              <th>District</th>
              <th>School/University</th>
              <th>Department</th>
              <th>Age Range</th>
              <th>Sex</th>
              <th>Count</th>
              <th>RFID Tag</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {registrations
              .filter((r) => !filterType || r.type === filterType)
              .map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{r.id}</td>
                <td>{r.type}</td>
                <td>{r.province || "-"}</td>
                <td>{r.district || "-"}</td>
                <td>{r.school || r.university || "-"}</td>
                <td>{r.department || "-"}</td>
                <td>{r.ageRange || "-"}</td>
                <td>{r.sex || "-"}</td>
                <td>{r.count || 1}</td>
                <td>
                  {r.rfidTag ? (
                    <span className="rfid-tag-assigned">
                      {r.rfidTag.tagNumber}
                      <button 
                        className="btn-deactivate"
                        onClick={() => handleDeactivateRfidTag(r.rfidTag.id)}
                        title="Deactivate RFID Tag"
                      >
                        ❌
                      </button>
                    </span>
                  ) : (
                    <span className="rfid-tag-none">No Tag</span>
                  )}
                </td>
                <td>
                  <div className="action-buttons">
                    {!r.rfidTag && (
                      <button
                        className="btn-assign"
                        onClick={() => handleAssignRfidTag(r.id)}
                        disabled={!selectedRfidTag}
                        title="Assign RFID Tag"
                      >
                        🏷️ Assign
                      </button>
                    )}
                    <button
                      className="btn-delete"
                      onClick={async () => {
                        if (!window.confirm(`Delete registration ${r.id}?`)) return;
                        await api.deleteRegistration(r.id);
                        const [regs, s, tags] = await Promise.all([
                          api.getRegistrations(),
                          api.getStats(),
                          api.getAvailableRfidTags()
                        ]);
                        setRegistrations(regs);
                        setStats(s);
                        setAvailableRfidTags(tags);
                      }}
                      title="Delete Registration"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
