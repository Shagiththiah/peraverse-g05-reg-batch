import axios from 'axios';
const http = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' });
export const api = {
  provinces: () => http.get('/provinces').then(r => r.data),
  districts: (province) => http.get('/districts', { params: { province } }).then(r => r.data),
  schools:   (province, district) => http.get('/schools', { params: { province, district } }).then(r => r.data),
  universities: () => http.get('/universities').then(r => r.data),
  departments:  (university) => http.get('/departments', { params: { university } }).then(r => r.data),
  register:  (payload) => http.post('/register', payload).then(r => r.data),
};
