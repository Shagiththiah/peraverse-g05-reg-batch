const BASE_URL = "http://127.0.0.1:4000/api";
const ADMIN_URL = "http://127.0.0.1:4000/admin";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error("API error");
  return res.json();
}

const api = {
  provinces: () => request(`${BASE_URL}/provinces`),
  districts: (province) => request(`${BASE_URL}/districts?province=${province}`),
  schools: (province, district) =>
    request(`${BASE_URL}/schools?province=${province}&district=${district}`),
  universities: () => request(`${BASE_URL}/universities`),
  departments: (university) =>
    request(`${BASE_URL}/departments?university=${university}`),
  register: (data) =>
    request(`${BASE_URL}/register`, { method: "POST", body: JSON.stringify(data) }),
  getVisitors: () => request(`${ADMIN_URL}/visitors`),
};

export default api;
