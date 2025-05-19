import axios from 'axios';

const scannerAxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/scanner',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default scannerAxiosInstance;