import axios from 'axios';

const base =
  import.meta.env.VITE_AXIOS_BASE_URL ||
  `http://${window.location.hostname}:8080`;

const instance = axios.create({
  baseURL: base,
  withCredentials:true,
  timeout: 10000,   
  headers: {
    'Content-Type': 'application/json', 
    'Accept': 'application/json',
  }
});

export default instance;