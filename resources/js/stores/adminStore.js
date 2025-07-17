import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useAdminStore = create(
    devtools(
        (set, get) => ({
            // Dashboard Stats
            stats: {
                users_count: 0,
                habits_count: 0,
                logs_count: 0,
                active_users: 0,
                admin_users: 0,
                users_with_2fa: 0,
                new_users_this_month: 0,
                user_growth: [],
                active_habits: 0,
                habits_by_type: [],
                habits_by_status: [],
                top_habits: [],
                logs_this_month: 0,
                completed_logs: 0,
                completion_rate: 0,
                daily_activity: [],
                recent_logs: [],
                recent_users: [],
                system_health: {}
            },
            
            // Users Management
            users: {
                data: [],
                pagination: {
                    current_page: 1,
                    per_page: 10,
                    total: 0,
                    last_page: 1
                },
                filters: {
                    search: '',
                    role: '',
                    status: '',
                    date_from: '',
                    date_to: ''
                },
                selectedUsers: [],
                loading: false
            },
            
            // Habits Management
            habits: {
                data: [],
                pagination: {
                    current_page: 1,
                    per_page: 10,
                    total: 0,
                    last_page: 1
                },
                filters: {
                    search: '',
                    type: '',
                    status: '',
                    user_id: ''
                },
                selectedHabits: [],
                loading: false
            },
            
            // Logs Management
            logs: {
                data: [],
                pagination: {
                    current_page: 1,
                    per_page: 10,
                    total: 0,
                    last_page: 1
                },
                filters: {
                    search: '',
                    status: '',
                    habit_id: '',
                    user_id: '',
                    date_from: '',
                    date_to: ''
                },
                selectedLogs: [],
                loading: false
            },
            
            // Audit Logs
            auditLogs: {
                data: [],
                pagination: {
                    current_page: 1,
                    per_page: 10,
                    total: 0,
                    last_page: 1
                },
                filters: {
                    action: '',
                    model_type: '',
                    user_id: '',
                    date_from: '',
                    date_to: ''
                },
                selectedAuditLogs: [],
                loading: false
            },
            
            // UI State
            ui: {
                activeTab: 'overview',
                sidebarCollapsed: false,
                theme: 'light',
                refreshInterval: 30000, // 30 seconds
                lastRefresh: null
            },
            
            // Actions
            setStats: (stats) => set((state) => ({
                stats: { ...state.stats, ...stats }
            })),
            
            setUsers: (users) => set((state) => ({
                users: { ...state.users, ...users }
            })),
            
            setHabits: (habits) => set((state) => ({
                habits: { ...state.habits, ...habits }
            })),
            
            setLogs: (logs) => set((state) => ({
                logs: { ...state.logs, ...logs }
            })),
            
            setAuditLogs: (auditLogs) => set((state) => ({
                auditLogs: { ...state.auditLogs, ...auditLogs }
            })),
            
            setUI: (ui) => set((state) => ({
                ui: { ...state.ui, ...ui }
            })),
            
            // User Management Actions
            setUserFilters: (filters) => set((state) => ({
                users: {
                    ...state.users,
                    filters: { ...state.users.filters, ...filters },
                    pagination: { ...state.users.pagination, current_page: 1 }
                }
            })),
            
            setUserPagination: (pagination) => set((state) => ({
                users: {
                    ...state.users,
                    pagination: { ...state.users.pagination, ...pagination }
                }
            })),
            
            toggleUserSelection: (userId) => set((state) => {
                const selectedUsers = state.users.selectedUsers.includes(userId)
                    ? state.users.selectedUsers.filter(id => id !== userId)
                    : [...state.users.selectedUsers, userId];
                
                return {
                    users: {
                        ...state.users,
                        selectedUsers
                    }
                };
            }),
            
            clearUserSelection: () => set((state) => ({
                users: {
                    ...state.users,
                    selectedUsers: []
                }
            })),
            
            // Habit Management Actions
            setHabitFilters: (filters) => set((state) => ({
                habits: {
                    ...state.habits,
                    filters: { ...state.habits.filters, ...filters },
                    pagination: { ...state.habits.pagination, current_page: 1 }
                }
            })),
            
            setHabitPagination: (pagination) => set((state) => ({
                habits: {
                    ...state.habits,
                    pagination: { ...state.habits.pagination, ...pagination }
                }
            })),
            
            toggleHabitSelection: (habitId) => set((state) => {
                const selectedHabits = state.habits.selectedHabits.includes(habitId)
                    ? state.habits.selectedHabits.filter(id => id !== habitId)
                    : [...state.habits.selectedHabits, habitId];
                
                return {
                    habits: {
                        ...state.habits,
                        selectedHabits
                    }
                };
            }),
            
            clearHabitSelection: () => set((state) => ({
                habits: {
                    ...state.habits,
                    selectedHabits: []
                }
            })),
            
            // Log Management Actions
            setLogFilters: (filters) => set((state) => ({
                logs: {
                    ...state.logs,
                    filters: { ...state.logs.filters, ...filters },
                    pagination: { ...state.logs.pagination, current_page: 1 }
                }
            })),
            
            setLogPagination: (pagination) => set((state) => ({
                logs: {
                    ...state.logs,
                    pagination: { ...state.logs.pagination, ...pagination }
                }
            })),
            
            toggleLogSelection: (logId) => set((state) => {
                const selectedLogs = state.logs.selectedLogs.includes(logId)
                    ? state.logs.selectedLogs.filter(id => id !== logId)
                    : [...state.logs.selectedLogs, logId];
                
                return {
                    logs: {
                        ...state.logs,
                        selectedLogs
                    }
                };
            }),
            
            clearLogSelection: () => set((state) => ({
                logs: {
                    ...state.logs,
                    selectedLogs: []
                }
            })),
            
            // Audit Log Actions
            setAuditLogFilters: (filters) => set((state) => ({
                auditLogs: {
                    ...state.auditLogs,
                    filters: { ...state.auditLogs.filters, ...filters },
                    pagination: { ...state.auditLogs.pagination, current_page: 1 }
                }
            })),
            
            setAuditLogPagination: (pagination) => set((state) => ({
                auditLogs: {
                    ...state.auditLogs,
                    pagination: { ...state.auditLogs.pagination, ...pagination }
                }
            })),
            
            toggleAuditLogSelection: (logId) => set((state) => {
                const selectedAuditLogs = state.auditLogs.selectedAuditLogs.includes(logId)
                    ? state.auditLogs.selectedAuditLogs.filter(id => id !== logId)
                    : [...state.auditLogs.selectedAuditLogs, logId];
                
                return {
                    auditLogs: {
                        ...state.auditLogs,
                        selectedAuditLogs
                    }
                };
            }),
            
            clearAuditLogSelection: () => set((state) => ({
                auditLogs: {
                    ...state.auditLogs,
                    selectedAuditLogs: []
                }
            })),
            
            // UI Actions
            setActiveTab: (tab) => set((state) => ({
                ui: { ...state.ui, activeTab: tab }
            })),
            
            toggleSidebar: () => set((state) => ({
                ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed }
            })),
            
            setTheme: (theme) => set((state) => ({
                ui: { ...state.ui, theme }
            })),
            
            setRefreshInterval: (interval) => set((state) => ({
                ui: { ...state.ui, refreshInterval: interval }
            })),
            
            updateLastRefresh: () => set((state) => ({
                ui: { ...state.ui, lastRefresh: new Date().toISOString() }
            })),
            
            // Utility Actions
            resetFilters: () => set((state) => ({
                users: {
                    ...state.users,
                    filters: {
                        search: '',
                        role: '',
                        status: '',
                        date_from: '',
                        date_to: ''
                    },
                    pagination: { ...state.users.pagination, current_page: 1 }
                },
                habits: {
                    ...state.habits,
                    filters: {
                        search: '',
                        type: '',
                        status: '',
                        user_id: ''
                    },
                    pagination: { ...state.habits.pagination, current_page: 1 }
                },
                logs: {
                    ...state.logs,
                    filters: {
                        search: '',
                        status: '',
                        habit_id: '',
                        user_id: '',
                        date_from: '',
                        date_to: ''
                    },
                    pagination: { ...state.logs.pagination, current_page: 1 }
                },
                auditLogs: {
                    ...state.auditLogs,
                    filters: {
                        action: '',
                        model_type: '',
                        user_id: '',
                        date_from: '',
                        date_to: ''
                    },
                    pagination: { ...state.auditLogs.pagination, current_page: 1 }
                }
            })),
            
            clearAllSelections: () => set((state) => ({
                users: { ...state.users, selectedUsers: [] },
                habits: { ...state.habits, selectedHabits: [] },
                logs: { ...state.logs, selectedLogs: [] },
                auditLogs: { ...state.auditLogs, selectedAuditLogs: [] }
            }))
        }),
        {
            name: 'admin-store',
            enabled: process.env.NODE_ENV === 'development'
        }
    )
);

export default useAdminStore; 