import axios from 'axios';

const api = axios.create({
  // baseURL: 'http://localhost:4000',
 baseURL: 'https://communication-production-a104.up.railway.app', 
});

export default api;
