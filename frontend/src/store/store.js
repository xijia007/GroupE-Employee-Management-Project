// store.js - Redux Store Configuration

import { configureStore } from "@reduxjs/toolkit";
import authReducer from '../features/auth/authSlice.js';

const store = configureStore({
    // Reducer configuration
    reducer: {
        auth: authReducer, // 'auth' is the state slice name, Access in components: state.auth.user
    },

    // Middleware configuration
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false // Disable serializable check for localStorage
        })
});

export default store;