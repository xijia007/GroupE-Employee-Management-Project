import axios from 'axios';

// Backend server address
const API_BASE_URL = 'http://localhost:3001/api';

const api = axios.create({
   baseURL: API_BASE_URL, // Base URL for all requests
   withCredentials: true, // Send cookies with requests
   headers: {
     'Content-Type': 'application/json' // Tells server we're sending JSON data
   },
   timeout: 10000 // Request timeout: 10 seconds
});

// ============================================
// Request Interceptor - Add Access Token
// ============================================
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

// ============================================
// Response Interceptor - Handle 401 & Auto Refresh
// ============================================
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // If it's a 401 error
        if (error.response?.status === 401 && !originalRequest._retry) {
            
            // If the refresh request itself failed, logout immediately
            if (originalRequest.url === '/auth/refresh') {
                console.log('🔴 Refresh token expired, logging out...');
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(error);
            }

            // If already refreshing, add request to queue
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                console.log('🔄 Access token expired, refreshing...');
                
                // Call refresh endpoint (sends httpOnly cookie automatically)
                const response = await axios.post(
                    `${API_BASE_URL}/auth/refresh`,
                    {},
                    { withCredentials: true }  // Send httpOnly refresh token cookie
                );

                const newAccessToken = response.data.accessToken;
                localStorage.setItem('accessToken', newAccessToken);

                console.log('✅ Token refreshed successfully');

                // Process queued requests
                processQueue(null, newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);

            } catch (refreshError) {
                console.log('🔴 Refresh failed, logging out...');
                
                // Refresh failed, clear everything and redirect to login
                processQueue(refreshError, null);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

export default api;
