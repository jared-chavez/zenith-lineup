import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Filter, X } from 'lucide-react';
import axios from 'axios';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [formData, setFormData] = useState({
        habit_id: '',
        log_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        notes: '',
        data: {}
    });

    useEffect(() => {
        fetchData();
    }, [selectedDate, selectedHabit]);

    const fetchData = async () => {
        try {
            const [logsResponse, habitsResponse] = await Promise.all([
                axios.get('/api/habit-logs', {
                    params: {
                        date: selectedDate,
                        habit_id: selectedHabit || undefined
                    }
                }),
                axios.get('/api/habits')
            ]);

            setLogs(logsResponse.data.logs.data || []);
            setHabits(habitsResponse.data.habits.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLog = async (e) => {
        e.preventDefault();
        try {
            // Mapear status de texto a valor backend
            let statusValue = formData.status;
            if (statusValue === 'Terminado') statusValue = 'completed';
            else if (statusValue === 'En proceso') statusValue = 'partial';
            else if (statusValue === 'Incompleto') statusValue = 'missed';
            const payload = {
                habit_id: formData.habit_id,
                log_date: formData.log_date,
                status: statusValue,
                notes: formData.notes,
                data: formData.data || {}
            };
            await axios.post('/api/habit-logs', payload);
            setShowCreateModal(false);
            setFormData({
                habit_id: '',
                log_date: new Date().toISOString().split('T')[0],
                status: 'completed',
                notes: '',
                data: {}
            });
            fetchData();
        } catch (error) {
            console.error('Error creating log:', error);
        }
    };

    const handleEditLog = async (e) => {
        e.preventDefault();
        try {
            // Mapear status de texto a valor backend
            let statusValue = formData.status;
            if (statusValue === 'Terminado') statusValue = 'completed';
            else if (statusValue === 'En proceso') statusValue = 'partial';
            else if (statusValue === 'Incompleto') statusValue = 'missed';
            const payload = {
                habit_id: formData.habit_id,
                log_date: formData.log_date,
                status: statusValue,
                notes: formData.notes,
                data: formData.data || {}
            };
            await axios.put(`/api/habit-logs/${editingLog.id}`, payload);
            setShowEditModal(false);
            setEditingLog(null);
            setFormData({
                habit_id: '',
                log_date: new Date().toISOString().split('T')[0],
                status: 'completed',
                notes: '',
                data: {}
            });
            fetchData();
        } catch (error) {
            console.error('Error updating log:', error);
        }
    };

    const handleDeleteLog = async (logId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este registro?')) {
            try {
                await axios.delete(`/api/habit-logs/${logId}`);
                fetchData();
            } catch (error) {
                console.error('Error deleting log:', error);
            }
        }
    };

    const openEditModal = (log) => {
        // Mapear status backend a texto para el select
        let statusText = 'Terminado';
        if (log.status === 'partial') statusText = 'En proceso';
        else if (log.status === 'missed') statusText = 'Incompleto';
        setEditingLog(log);
        setFormData({
            habit_id: log.habit_id,
            log_date: log.log_date,
            status: statusText,
            notes: log.notes || '',
            data: log.data || {}
        });
        setShowEditModal(true);
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

    const clearFilters = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedHabit('');
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
                    <h1 className="text-2xl font-bold text-gray-900">Registros de hábitos</h1>
                    <p className="text-gray-600">Gestiona y revisa tus registros diarios</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo registro
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center space-x-4">
                    <Filter className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">Filtros</h3>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hábito
                        </label>
                        <select
                            value={selectedHabit}
                            onChange={(e) => setSelectedHabit(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todos los hábitos</option>
                            {habits.map((habit) => (
                                <option key={habit.id} value={habit.id}>
                                    {habit.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={clearFilters}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <X className="h-4 w-4 mr-1" />
                            Limpiar
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs List */}
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">
                        Registros ({logs.length})
                    </h3>
                </div>
                <div className="p-6">
                    {logs.length === 0 ? (
                        <div className="text-center py-8">
                            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay registros</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Comienza registrando tus hábitos para ver tu progreso.
                            </p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Crear registro
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log) => (
                                <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-2xl">
                                                {getHabitTypeIcon(log.habit?.type)}
                                            </span>
                                            <div>
                                                <h4 className="font-medium text-gray-900">
                                                    {log.habit?.name}
                                                </h4>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(log.log_date).toLocaleDateString('es-ES', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                {log.notes && (
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {log.notes}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                log.completed 
                                                    ? 'bg-green-100 text-green-800' 
                                                    : 'bg-red-100 text-red-800'
                                            }`}>
                                                {log.completed ? 'Completado' : 'Pendiente'}
                                            </span>
                                            <button
                                                onClick={() => openEditModal(log)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteLog(log.id)}
                                                className="text-gray-400 hover:text-red-600"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Crear nuevo registro
                            </h3>
                            <form onSubmit={handleCreateLog} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hábito
                                    </label>
                                    <select
                                        required
                                        value={formData.habit_id}
                                        onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccionar hábito</option>
                                        {habits.map((habit) => (
                                            <option key={habit.id} value={habit.id}>
                                                {habit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.log_date}
                                        onChange={(e) => setFormData({...formData, log_date: e.target.value})}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Opcional: añade notas sobre tu progreso..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Terminado">Terminado</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Incompleto">Incompleto</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                    >
                                        Crear
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editingLog && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                Editar registro
                            </h3>
                            <form onSubmit={handleEditLog} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Hábito
                                    </label>
                                    <select
                                        required
                                        value={formData.habit_id}
                                        onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Seleccionar hábito</option>
                                        {habits.map((habit) => (
                                            <option key={habit.id} value={habit.id}>
                                                {habit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.log_date}
                                        onChange={e => setFormData({ ...formData, log_date: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Notas
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        rows={3}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Opcional: añade notas sobre tu progreso..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estado
                                    </label>
                                    <select
                                        required
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="Terminado">Terminado</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Incompleto">Incompleto</option>
                                    </select>
                                </div>
                                <div className="flex justify-end space-x-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                                    >
                                        Actualizar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Logs; 