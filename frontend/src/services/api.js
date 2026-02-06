import axios from 'axios';

// Backend server address
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
   baseURL: API_BASE_URL, // Base URL for all requests
   withCredentials: true,
   headers: {
     'Content-Type': 'application/json' // Tells server we're sending JSON data
   },
   timeout: 10000 // Request timeout: 10 seconds
});

// 在每个请求发送前自动添加 token
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

// 处理响应错误（特别是 401 未授权错误）
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (err) => {
        if (err.response && err.response.status === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            window.location.href = '/login'
        }

        return Promise.reject(err);
    }
)

export default api;
