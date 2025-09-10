const API_BASE = "http://localhost:4000"; // backend host

async function fetchJSON(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

const api = {
  // ===== LOOKUP =====
  provinces: () => fetchJSON(`${API_BASE}/provinces`),

  districts: (province) =>
    fetchJSON(`${API_BASE}/districts/${encodeURIComponent(province)}`),

  schools: (province, district) =>
    fetchJSON(
      `${API_BASE}/schools/${encodeURIComponent(province)}/${encodeURIComponent(district)}`
    ),

  universities: () => fetchJSON(`${API_BASE}/universities`),

  departments: (university) =>
    fetchJSON(`${API_BASE}/universities/${encodeURIComponent(university)}/departments`),

  // ===== REGISTRATION =====
  register: (payload) =>
    fetchJSON(`${API_BASE}/register`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  batchRegister: (payload) =>
    fetchJSON(`${API_BASE}/batchRegister`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  // ===== ADMIN =====
  getRegistrations: () => fetchJSON(`${API_BASE}/registrations`),
  getStats: () => fetchJSON(`${API_BASE}/admin/stats`),
  deleteRegistration: (id) => fetchJSON(`${API_BASE}/registrations/${id}`, { method: "DELETE" }),
  
  // ===== RFID MANAGEMENT =====
  getAvailableRfidTags: () => fetchJSON(`${API_BASE}/admin/rfid/available`),
  assignRfidTag: (registrationId, tagNumber) => 
    fetchJSON(`${API_BASE}/admin/rfid/assign`, {
      method: "POST",
      body: JSON.stringify({ registrationId, tagNumber }),
    }),
  deactivateRfidTag: (tagId) => 
    fetchJSON(`${API_BASE}/admin/rfid/${tagId}/deactivate`, {
      method: "PUT",
    }),
};

export default api;
