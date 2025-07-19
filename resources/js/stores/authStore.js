import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            isInitialized: false,

            // Initialize auth state
            initialize: async () => {
                const token = localStorage.getItem('auth-storage') ? 
                    JSON.parse(localStorage.getItem('auth-storage')).state?.token : null;
                
                if (token) {
                    // Restore token in axios headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    // Token set successfully
                    
                    try {
                        // Verifica si el token es válido
                        const response = await axios.get('/api/auth/me');
                        set({
                            user: response.data.user,
                            isAuthenticated: true,
                            isInitialized: true
                        });
                    } catch (error) {
                        console.error('Auth check failed:', error.response?.data);
                        // Token inválido: limpiar todo
                        localStorage.clear();
                        set({
                            user: null,
                            token: null,
                            isAuthenticated: false,
                            isInitialized: true
                        });
                        delete axios.defaults.headers.common['Authorization'];
                    }
                } else {
                    set({ isInitialized: true, isAuthenticated: false });
                }
            },

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/api/auth/login', credentials);
                    
                    // Check if 2FA is required
                    if (response.data.requires_2fa) {
                        set({ isLoading: false });
                        return { 
                            success: false, 
                            requires2FA: true, 
                            email: credentials.email 
                        };
                    }
                    
                    const { user, token } = response.data;
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    // Set token for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Login failed';
                    set({
                        isLoading: false,
                        error: message
                    });
                    return { success: false, error: message };
                }
            },

            // Complete 2FA login
            complete2FALogin: async (email, code) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/api/auth/2fa/verify', {
                        email,
                        code
                    });
                    
                    const { user, token } = response.data;
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    // Set token for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || '2FA verification failed';
                    set({
                        isLoading: false,
                        error: message
                    });
                    return { success: false, error: message };
                }
            },

            // Register
            register: async (userData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/api/auth/register', userData);
                    const { user, token } = response.data;
                    
                    set({
                        user,
                        token,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null
                    });

                    // Set token for future requests
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    return { success: true };
                } catch (error) {
                    const message = error.response?.data?.message || 'Registration failed';
                    set({
                        isLoading: false,
                        error: message
                    });
                    return { success: false, error: message };
                }
            },

            // Logout
            logout: async () => {
                try {
                    if (get().token) {
                        await axios.post('/api/auth/logout', {}, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Accept': 'application/json'
                            }
                        });
                    }
                } catch (error) {
                    console.error('Logout error:', error);
                } finally {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isLoading: false,
                        error: null
                    });
                    
                    // Remove token from headers
                    delete axios.defaults.headers.common['Authorization'];
                }
            },

            // Check authentication status
            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isAuthenticated: false, isInitialized: true });
                    return;
                }

                try {
                    // Ensure token is set in headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get('/api/auth/me');
                    set({
                        user: response.data.user,
                        isAuthenticated: true,
                        isInitialized: true
                    });
                } catch (error) {
                    console.error('Auth check failed:', error);
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        isInitialized: true
                    });
                    delete axios.defaults.headers.common['Authorization'];
                }
            },

            // Clear error
            clearError: () => set({ error: null })
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
            onRehydrateStorage: () => (state) => {
                // This runs after the store is rehydrated from localStorage
                if (state && state.token) {
                    // Restore token in axios headers
                    axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
                }
            }
        }
    )
);

export default useAuthStore; 