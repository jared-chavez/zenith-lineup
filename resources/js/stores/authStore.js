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

            // Login
            login: async (credentials) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await axios.post('/api/auth/login', credentials);
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
                        await axios.post('/api/auth/logout');
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
                    set({ isAuthenticated: false });
                    return;
                }

                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get('/api/auth/me');
                    set({
                        user: response.data.user,
                        isAuthenticated: true
                    });
                } catch (error) {
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false
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
            })
        }
    )
);

export default useAuthStore; 