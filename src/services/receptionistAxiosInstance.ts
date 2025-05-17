import axios from 'axios';

const receptionistAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/receptionist',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default receptionistAxiosInstance;