//  Manage authentication state using Redux Toolkit

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Backend API base URL
const API_URL = 'http://localhost:3001/api';

// Initial State. This is the default state of the auth slice
const initialState = {
    user: JSON.parse(localStorage.getItem('user')) || null,
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'), // Boolean: true if logged in 
    loading: false,
    error: null
};

export const loginUser = createAsyncThunk(
    'auth/login',
    async ({ username, password }, { rejectWithValue }) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                username,
                password
            });

            localStorage.setItem('accessToken', response.data.accessToken);
            localStorage.setItem('refreshToken', response.data.refreshToken);
            localStorage.setItem('user', JSON.stringify(response.data.user));

            return response.data;

        } catch (err) {
            const message = err.response?.data?.message || 'Login failed';
            return rejectWithValue(message);
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async(_, { rejectWithValue }) => {
        try {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');

            return null;

        } catch (err) {
            return rejectWithValue('Logout failed');
        }
    }
)

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action) => {
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('user', JSON.stringify(state.user));
            
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.accessToken = action.payload.accessToken;
                state.refreshToken = action.payload.refreshToken;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.error = action.payload;
            });
        builder
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.error = null;
            });
    }
});

export const selectAuth = (state) => state.auth; // Get entire auth state

export const selectUser = (state) => state.auth.user; // Get current user 

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated; // Get authentication status

export const selectAuthLoading = (state) => state.auth.loading; // Get loading status 

export const selectAuthError = (state) => state.auth.error; // Get error message 

export const { clearError, updateUser } = authSlice.actions;

export default authSlice.reducer;