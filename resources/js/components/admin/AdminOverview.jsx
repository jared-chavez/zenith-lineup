import React from 'react';
import { Users, Target, FileText, TrendingUp, Activity, Shield } from 'lucide-react';

const AdminOverview = ({ stats }) => {
    const statCards = [
        {
            title: 'Total Usuarios',
            value: stats.users_count || 0,
            icon: Users,
            color: 'blue',
            change: stats.new_users_this_month || 0,
            changeLabel: 'este mes'
        },
        {
            title: 'Hábitos Activos',
            value: stats.active_habits || 0,
            icon: Target,
            color: 'green',
            change: stats.habits_count || 0,
            changeLabel: 'total'
        },
        {
            title: 'Registros',
            value: stats.logs_count || 0,
            icon: FileText,
            color: 'purple',
            change: stats.completion_rate || 0,
            changeLabel: '% completación'
        },
        {
            title: 'Usuarios Activos',
            value: stats.active_users || 0,
            icon: Activity,
            color: 'orange',
            change: stats.users_count ? Math.round((stats.active_users / stats.users_count) * 100) : 0,
            changeLabel: '% del total'
        }
    ];

    const getColorClasses = (color) => {
        const colors = {
            blue: 'bg-blue-50 text-blue-600 border-blue-200',
            green: 'bg-green-50 text-green-600 border-green-200',
            purple: 'bg-purple-50 text-purple-600 border-purple-200',
            orange: 'bg-orange-50 text-orange-600 border-orange-200'
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Resumen del Sistema</h1>
                <p className="text-gray-600 mt-1">
                    Vista general de las métricas y estadísticas de la plataforma
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                                    <p className="text-3xl font-bold text-gray-900 mt-2">
                                        {stat.value.toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {stat.change} {stat.changeLabel}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-lg border ${getColorClasses(stat.color)}`}>
                                    <Icon className="h-6 w-6" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Crecimiento de Usuarios</h3>
                    {stats.user_growth && stats.user_growth.length > 0 ? (
                        <div className="space-y-3">
                            {stats.user_growth.slice(-6).map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{item.month}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-24 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${Math.min((item.count / Math.max(...stats.user_growth.map(g => g.count))) * 100, 100)}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay datos de crecimiento disponibles</p>
                    )}
                </div>

                {/* Top Habits */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Hábitos Más Populares</h3>
                    {stats.top_habits && stats.top_habits.length > 0 ? (
                        <div className="space-y-3">
                            {stats.top_habits.slice(0, 5).map((habit, index) => (
                                <div key={habit.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{habit.name}</p>
                                            <p className="text-xs text-gray-500">{habit.type}</p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                        {habit.habit_logs_count} logs
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No hay datos de hábitos disponibles</p>
                    )}
                </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-green-600" />
                    Estado del Sistema
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">99.9%</p>
                        <p className="text-sm text-gray-600">Uptime</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">150ms</p>
                        <p className="text-sm text-gray-600">Tiempo de Respuesta</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-bold text-purple-600">0.1%</p>
                        <p className="text-sm text-gray-600">Tasa de Error</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOverview; 