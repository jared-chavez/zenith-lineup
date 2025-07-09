import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Target, TrendingUp, Calendar, Activity } from 'lucide-react';
import axios from 'axios';

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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
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
                weeklyProgress: Math.round((todayLogs / activeHabits) * 100) || 0
            });
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
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
            water: 'bg-blue-100 text-blue-800',
            sleep: 'bg-purple-100 text-purple-800',
            exercise: 'bg-green-100 text-green-800',
            nutrition: 'bg-orange-100 text-orange-800',
            meditation: 'bg-indigo-100 text-indigo-800'
        };
        return colors[type] || 'bg-gray-100 text-gray-800';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Bienvenido de vuelta, aquí tienes un resumen de tu progreso</p>
                </div>
                <Link
                    to="/habits"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo hábito
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Target className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Total de hábitos
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.totalHabits}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Activity className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Hábitos activos
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.activeHabits}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <Calendar className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Registros hoy
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.todayLogs}
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <TrendingUp className="h-6 w-6 text-gray-400" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">
                                        Progreso semanal
                                    </dt>
                                    <dd className="text-lg font-medium text-gray-900">
                                        {stats.weeklyProgress}%
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Habits */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Hábitos recientes</h3>
                </div>
                <div className="p-6">
                    {habits.length === 0 ? (
                        <div className="text-center py-8">
                            <Target className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay hábitos</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza creando tu primer hábito para mejorar tu salud.
                            </p>
                            <div className="mt-6">
                                <Link
                                    to="/habits"
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear hábito
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {habits.slice(0, 6).map((habit) => (
                                <div
                                    key={habit.id}
                                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-2xl">{getHabitTypeIcon(habit.type)}</span>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHabitTypeColor(habit.type)}`}>
                                            {habit.type}
                                        </span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-1">{habit.name}</h4>
                                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                                        {habit.description || 'Sin descripción'}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            habit.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {habit.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <Link
                                            to={`/habits/${habit.id}`}
                                            className="text-sm text-blue-600 hover:text-blue-500"
                                        >
                                            Ver detalles →
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Actividad reciente</h3>
                </div>
                <div className="p-6">
                    {recentLogs.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay actividad</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza registrando tu progreso en tus hábitos.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentLogs.slice(0, 5).map((log) => (
                                <div key={log.id} className="flex items-center space-x-4">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">{getHabitTypeIcon(log.habit?.type)}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {log.habit?.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {new Date(log.log_date).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            log.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            log.status === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {log.status === 'completed' ? 'Completado' :
                                             log.status === 'partial' ? 'Parcial' : 'Pendiente'}
                                        </span>
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