import axios from 'axios';
const url = process.env.BACKEND_URL || 'http://localhost:5000';
const API = axios.create({ baseURL: url, timeout: 10000 });
export default API;
