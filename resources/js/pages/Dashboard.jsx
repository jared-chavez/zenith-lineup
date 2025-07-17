import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, TrendingUp, Calendar, Activity, BarChart3, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';
import '../../css/dashboard.css';

const Dashboard = () => {
    const [habits, setHabits] = useState([]);
    const [recentLogs, setRecentLogs] = useState([]);
    const [stats, setStats] = useState({
        totalHabits: 0,
        activeHabits: 0,
        todayLogs: 0,
        weeklyProgress: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    const { success } = useNotificationStore();
    const { handleError } = useErrorHandler();

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setIsLoading(true);
        try {
            const [habitsResponse, logsResponse] = await Promise.all([
                axios.get('/api/habits'),
                axios.get('/api/habit-logs')
            ]);

            setHabits(habitsResponse.data.habits.data || []);
            setRecentLogs(logsResponse.data.logs.data || []);

            // Calculate stats
            const totalHabits = habitsResponse.data.habits.data?.length || 0;
            const activeHabits = habitsResponse.data.habits.data?.filter(h => h.is_active).length || 0;
            const todayLogs = logsResponse.data.logs.data?.filter(log => 
                new Date(log.log_date).toDateString() === new Date().toDateString()
            ).length || 0;

            setStats({
                totalHabits,
                activeHabits,
                todayLogs,
                weeklyProgress: activeHabits > 0 ? Math.round((todayLogs / activeHabits) * 100) : 0
            });
        } catch (error) {
            handleError(error, 'fetching dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const getHabitTypeIcon = (type) => {
        const icons = {
            water: '💧',
            sleep: '😴',
            exercise: '🏃‍♂️',
            nutrition: '🥗',
            meditation: '🧘‍♀️'
        };
        return icons[type] || '📋';
    };

    const getHabitTypeColor = (type) => {
        const colors = {
            water: 'badge-info',
            sleep: 'badge-warning',
            exercise: 'badge-success',
            nutrition: 'badge-error',
            meditation: 'badge-info'
        };
        return colors[type] || 'badge-info';
    };

    // Traducción de type a label amigable
    const typeToLabel = {
      water: 'Agua',
      sleep: 'Sueño',
      exercise: 'Ejercicio',
      nutrition: 'Nutrición',
      meditation: 'Meditación'
    };

    // Agrupa los hábitos por type
    const groupedHabits = habits.reduce((groups, habit) => {
      if (!groups[habit.type]) groups[habit.type] = [];
      groups[habit.type].push(habit);
      return groups;
    }, {});

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-main-card">
                    <div className="flex items-center justify-center h-64">
                        <div className="loading-spinner w-12 h-12"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-main-card">
                {/* Header del Dashboard */}
                <div className="dashboard-header">
                    <div>
                        <h1 className="dashboard-title">Dashboard</h1>
                        <p className="dashboard-subtitle">Bienvenido de vuelta, aquí tienes un resumen de tu progreso</p>
                    </div>
                    <Link to="/habits" className="dashboard-new-habit-btn">
                        <Plus size={20} />
                        Nuevo hábito
                    </Link>
                </div>

                {/* Grid de Estadísticas */}
                <div className="dashboard-stats-grid">
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon">
                                <Target size={24} className="text-green-600" />
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Total hábitos</div>
                                <div className="stat-value">{stats.totalHabits}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon">
                                <TrendingUp size={24} className="text-blue-600" />
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Progreso semanal</div>
                                <div className="stat-value" style={{ color: '#2563eb' }}>{stats.weeklyProgress}%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon">
                                <Activity size={24} className="text-amber-600" />
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Hábitos activos</div>
                                <div className="stat-value" style={{ color: '#f59e42' }}>{stats.activeHabits}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-icon">
                                <Calendar size={24} className="text-purple-600" />
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Registros hoy</div>
                                <div className="stat-value" style={{ color: '#a21caf' }}>{stats.todayLogs}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Hábitos */}
                {habits.length === 0 ? (
                    <div className="dashboard-empty-state">
                        <div className="empty-state-icon">
                            <Target size={32} className="text-green-600" />
                        </div>
                        <h3 className="empty-state-title">No hay hábitos</h3>
                        <p className="empty-state-description">
                            Comienza creando tu primer hábito para mejorar tu salud.
                        </p>
                        <Link to="/habits" className="dashboard-new-habit-btn">
                            <Plus size={20} />
                            Crear hábito
                        </Link>
                    </div>
                ) : (
                    <>
                        {Object.keys(groupedHabits).map(type => (
                            <div key={type} className="habit-section">
                                <h2 className="habit-section-title">
                                    {getHabitTypeIcon(type)}
                                    {typeToLabel[type] || type}
                                </h2>
                                <div className="habit-grid">
                                    {groupedHabits[type].map((habit, index) => (
                                        <div
                                            key={habit.id}
                                            className="habit-card"
                                            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                                        >
                                            <div className="habit-card-header">
                                                <div className="habit-icon">{getHabitTypeIcon(habit.type)}</div>
                                            </div>
                                            <h3 className="habit-title">{habit.name}</h3>
                                            {habit.description && (
                                                <p className="habit-description">{habit.description}</p>
                                            )}
                                            <div className={`habit-status${habit.is_active ? '' : ' inactive'}`}>
                                                <CheckCircle size={16} />
                                                {habit.is_active ? 'Activo' : 'Inactivo'}
                                            </div>
                                            <Link to="/habits" className="habit-view-more-btn">
                                                Ver más
                                                <ArrowRight size={16} />
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </>
                )}

                {/* Sección de Registros Recientes */}
                <div className="dashboard-separator" />
                <div className="habit-section">
                    <h2 className="habit-section-title">
                        <Clock size={24} />
                        Registros recientes
                    </h2>
                    
                    {recentLogs.length === 0 ? (
                        <div className="dashboard-empty-state">
                            <div className="empty-state-icon">
                                <Clock size={32} className="text-gray-500" />
                            </div>
                            <h3 className="empty-state-title">No hay registros recientes</h3>
                            <p className="empty-state-description">
                                Comienza registrando tus hábitos para ver tu progreso aquí.
                            </p>
                        </div>
                    ) : (
                        <div className="habit-grid">
                            {recentLogs.slice(0, 6).map((log, index) => (
                                <div
                                    key={log.id}
                                    className="habit-card"
                                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                                >
                                    <div className="habit-card-header">
                                        <div className="habit-icon">{getHabitTypeIcon(log.habit?.type)}</div>
                                    </div>
                                    <h3 className="habit-title">{log.habit?.name}</h3>
                                    <p className="habit-description">
                                        {new Date(log.log_date).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                    <div className="habit-status">
                                        <CheckCircle size={16} />
                                        Completado
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 