import axios from 'axios';

// Backend server address
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
   baseURL: API_BASE_URL, // Base URL for all requests
   headers: {
     'Content-Type': 'application/json' // Tells server we're sending JSON data
   },
   timeout: 10000 // Request timeout: 10 seconds
});

api.interceptors.request.use(
    (config) => {
        // Get access token from localStorage
        const accessToken = localStorage.getItem('accessToken');

        // If token exists, add it to Authorization header
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config; // Return modified config 
    },
    (err) => {
        return Promise.reject(err);
    }
);

export default api;
