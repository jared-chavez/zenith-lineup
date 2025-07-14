import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, TrendingUp, Calendar, Activity, BarChart3, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';

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
            <div className="flex items-center justify-center h-64">
                <div className="loading-spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-bg">
          <div className="dashboard-card">
            {/* Header - Fitia Style */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 animate-fade-in">
              <div>
                <h1 className="dashboard-title">Dashboard</h1>
                <p className="dashboard-subtitle">Bienvenido de vuelta, aquí tienes un resumen de tu progreso</p>
              </div>
              <Link
                to="/habits"
                className="btn-primary layer-pressable animate-bounce-subtle"
              >
                <Plus className="h-5 w-5 mr-2" />
                Nuevo hábito
              </Link>
            </div>

            {/* Stats Grid - Fitia Style */}
            <div className="dashboard-stats">
              <div className="stat-card animate-fade-in">
                <div className="stat-icon"><Target className="h-8 w-8 text-green-600" /></div>
                <div className="stat-info">
                  <div className="stat-label">Total hábitos</div>
                  <div className="stat-value">{stats.totalHabits}</div>
                </div>
              </div>
              <div className="stat-card animate-fade-in">
                <div className="stat-icon"><TrendingUp className="h-8 w-8 text-blue-600" /></div>
                <div className="stat-info">
                  <div className="stat-label">Progreso semanal</div>
                  <div className="stat-value" style={{ color: '#2563eb' }}>{stats.weeklyProgress}%</div>
                </div>
              </div>
              <div className="stat-card animate-fade-in">
                <div className="stat-icon"><Activity className="h-8 w-8 text-amber-600" /></div>
                <div className="stat-info">
                  <div className="stat-label">Hábitos activos</div>
                  <div className="stat-value" style={{ color: '#f59e42' }}>{stats.activeHabits}</div>
                </div>
              </div>
              <div className="stat-card animate-fade-in">
                <div className="stat-icon"><Calendar className="h-8 w-8 text-purple-600" /></div>
                <div className="stat-info">
                  <div className="stat-label">Registros hoy</div>
                  <div className="stat-value" style={{ color: '#a21caf' }}>{stats.todayLogs}</div>
                </div>
              </div>
            </div>

            {/* Recent Habits - Agrupados por type */}
            <div className="habit-separator" />
            <div className="animate-fade-in">
              {habits.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay hábitos</h3>
                  <p className="text-gray-600 mb-6">
                    Comienza creando tu primer hábito para mejorar tu salud.
                  </p>
                  <Link
                    to="/habits"
                    className="btn-primary layer-pressable"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear hábito
                  </Link>
                </div>
              ) : (
                <>
                  {Object.keys(groupedHabits).map(type => (
                    <div key={type} className="habit-group">
                      <div className="group-title">{typeToLabel[type] || type}</div>
                      <div className="habit-list">
                        {groupedHabits[type].map((habit, index) => (
                          <div
                            key={habit.id}
                            className="habit-item animate-fade-in"
                            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                          >
                            <div className="habit-icon">{getHabitTypeIcon(habit.type)}</div>
                            <div className="habit-title">{habit.name}</div>
                            {habit.description && (
                              <div className="habit-desc">{habit.description}</div>
                            )}
                            <div className={`habit-status${habit.is_active ? '' : ' inactive'}`}> 
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {habit.is_active ? 'Activo' : 'Inactivo'}
                            </div>
                            <div className="habit-actions">
                              <Link
                                to="/habits"
                                className="btn-ghost layer-pressable text-xs"
                              >
                                Ver más
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Recent Logs - Fitia Style */}
            <div className="habit-separator" />
            <div className="animate-fade-in">
              <div className="px-2 py-2 mb-2 flex items-center">
                <Clock className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Registros recientes</h3>
              </div>
              <div>
                {recentLogs.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-gray-500" />
                    </div>
                    <p className="text-gray-600">No hay registros recientes</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentLogs.slice(0, 5).map((log, index) => (
                      <div
                        key={log.id}
                        className="habit-item animate-fade-in"
                        style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                      >
                        <div className="flex items-center">
                          <div className="habit-icon mr-3">{getHabitTypeIcon(log.habit?.type)}</div>
                          <div>
                            <div className="habit-title">{log.habit?.name}</div>
                            <div className="habit-desc">{new Date(log.log_date).toLocaleDateString()}</div>
                          </div>
                          <div className="ml-auto habit-status">
                            Completado
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    );
};

export default Dashboard; 