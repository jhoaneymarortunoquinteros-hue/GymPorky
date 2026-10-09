// src/services/api.ts
import axios from 'axios';

// URL base del backend Django, configurable con VITE_API_URL (Fronted/.env)
// para trabajar por IP local. Si no está definida, se usa 127.0.0.1:8000.
// El `.replace(/\/+$/, '')` evita barras finales dobles (axios añade la suya).
const API_BASE: string = (
  import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: `${API_BASE}/`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;