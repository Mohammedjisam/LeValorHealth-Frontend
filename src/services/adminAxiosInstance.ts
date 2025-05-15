import axios from 'axios';

const adminAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default adminAxiosInstance;