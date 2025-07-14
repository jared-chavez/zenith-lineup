import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Edit, Trash2, Filter, X, Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';
import ConfirmModal from '../components/ConfirmModal';

const Logs = () => {
    const [logs, setLogs] = useState([]);
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedHabit, setSelectedHabit] = useState('');
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        habit_id: '',
        log_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        notes: '',
        data: {}
    });

    const { success } = useNotificationStore();
    const { handleError } = useErrorHandler();

    useEffect(() => {
        fetchData();
    }, [selectedDate, selectedHabit]);

    const fetchData = async () => {
        setIsLoading(true);
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
            handleError(error, 'fetching logs/habits');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateLog = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
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
            success('Registro creado correctamente');
        } catch (error) {
            handleError(error, 'creating log');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditLog = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
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
            success('Registro actualizado correctamente');
        } catch (error) {
            handleError(error, 'updating log');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!logToDelete) return;
        try {
            await axios.delete(`/api/habit-logs/${logToDelete.id}`);
            fetchData();
            success('Registro eliminado correctamente');
        } catch (error) {
            handleError(error, 'deleting log');
        } finally {
            setShowConfirmModal(false);
            setLogToDelete(null);
        }
    };

    const openEditModal = (log) => {
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
            water: 'badge-info',
            sleep: 'badge-warning',
            exercise: 'badge-success',
            nutrition: 'badge-error',
            meditation: 'badge-info'
        };
        return colors[type] || 'badge-info';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'badge-success';
            case 'partial':
                return 'badge-warning';
            case 'missed':
                return 'badge-error';
            default:
                return 'badge-info';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'completed':
                return <CheckCircle className="h-4 w-4" />;
            case 'partial':
                return <Clock className="h-4 w-4" />;
            case 'missed':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <Activity className="h-4 w-4" />;
        }
    };

    const clearFilters = () => {
        setSelectedDate(new Date().toISOString().split('T')[0]);
        setSelectedHabit('');
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="loading-spinner w-12 h-12"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header - Fitia Style */}
            <div className="layer-elevated animate-fade-in">
                <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gradient-green mb-2">
                                Registros de hábitos
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Gestiona y revisa tus registros diarios
                            </p>
                        </div>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="btn-primary layer-pressable animate-bounce-subtle"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nuevo registro
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters - Fitia Style */}
            <div className="layer-elevated animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mr-3">
                            <Filter className="h-5 w-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Fecha
                            </label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={e => setSelectedDate(e.target.value)}
                                className="input-fitia"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Hábito
                            </label>
                            <select
                                value={selectedHabit}
                                onChange={e => setSelectedHabit(e.target.value)}
                                className="input-fitia"
                            >
                                <option value="">Todos los hábitos</option>
                                {habits.map(habit => (
                                    <option key={habit.id} value={habit.id}>{habit.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={clearFilters}
                                className="btn-secondary layer-pressable"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Limpiar filtros
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Grid - Fitia Style */}
            {logs.length === 0 ? (
                <div className="layer-surface animate-fade-in text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-slate-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Calendar className="h-10 w-10 text-gray-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay registros</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        No se encontraron registros para la fecha y hábito seleccionados.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="btn-primary layer-pressable"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Crear primer registro
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {logs.map((log, index) => (
                        <div
                            key={log.id}
                            className="layer-elevated layer-interactive animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">{getHabitTypeIcon(log.habit_type)}</span>
                                    </div>
                                    <span className={`${getHabitTypeColor(log.habit_type)}`}>
                                        {log.habit_type}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{log.habit_name}</h3>
                                
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-sm text-gray-500">
                                        <Calendar className="h-4 w-4 mr-2 text-green-500" />
                                        {new Date(log.log_date).toLocaleDateString('es-ES', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                    
                                    <div className="flex items-center">
                                        {getStatusIcon(log.status)}
                                        <span className={`ml-2 ${getStatusBadge(log.status)}`}>
                                            {log.status === 'completed' ? 'Completado' : 
                                             log.status === 'partial' ? 'En proceso' : 
                                             log.status === 'missed' ? 'Incompleto' : log.status}
                                        </span>
                                    </div>
                                </div>
                                
                                {log.notes && (
                                    <div className="mb-4 p-3 bg-gradient-green rounded-lg">
                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {log.notes}
                                        </p>
                                    </div>
                                )}
                                
                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => openEditModal(log)}
                                            className="btn-ghost layer-pressable p-2"
                                            aria-label="Editar registro"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(log)}
                                            className="btn-ghost layer-pressable p-2 text-red-500 hover:text-red-600"
                                            aria-label="Eliminar registro"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal - Fitia Style */}
            {showCreateModal && (
                <div className="layer-overlay animate-fade-in">
                    <div className="layer-modal animate-zoom-in-95 max-w-lg w-full my-8">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Nuevo registro</h2>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="btn-ghost layer-pressable p-2"
                                    disabled={isSubmitting}
                                >
                                    <span className="sr-only">Cerrar</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleCreateLog} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hábito
                                    </label>
                                    <select
                                        value={formData.habit_id}
                                        onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                        className="input-fitia"
                                        required
                                    >
                                        <option value="">Selecciona un hábito</option>
                                        {habits.map(habit => (
                                            <option key={habit.id} value={habit.id}>{habit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.log_date}
                                        onChange={e => setFormData({ ...formData, log_date: e.target.value })}
                                        className="input-fitia"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="input-fitia"
                                    >
                                        <option value="Terminado">Terminado</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Incompleto">Incompleto</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="input-fitia"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="btn-secondary"
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center">
                                                <div className="loading-spinner w-4 h-4 mr-2"></div>
                                                Guardando...
                                            </div>
                                        ) : (
                                            'Crear registro'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal - Fitia Style */}
            {showEditModal && (
                <div className="layer-overlay animate-fade-in">
                    <div className="layer-modal animate-zoom-in-95 max-w-lg w-full my-8">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Editar registro</h2>
                                <button
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingLog(null);
                                    }}
                                    className="btn-ghost layer-pressable p-2"
                                    disabled={isSubmitting}
                                >
                                    <span className="sr-only">Cerrar</span>
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <form onSubmit={handleEditLog} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hábito
                                    </label>
                                    <select
                                        value={formData.habit_id}
                                        onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                        className="input-fitia"
                                        required
                                    >
                                        <option value="">Selecciona un hábito</option>
                                        {habits.map(habit => (
                                            <option key={habit.id} value={habit.id}>{habit.name}</option>
                                        ))}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Fecha
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.log_date}
                                        onChange={e => setFormData({ ...formData, log_date: e.target.value })}
                                        className="input-fitia"
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                                        className="input-fitia"
                                    >
                                        <option value="Terminado">Terminado</option>
                                        <option value="En proceso">En proceso</option>
                                        <option value="Incompleto">Incompleto</option>
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Notas (opcional)
                                    </label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="input-fitia"
                                        rows="3"
                                    />
                                </div>
                                
                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setEditingLog(null);
                                        }}
                                        className="btn-secondary"
                                        disabled={isSubmitting}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="btn-primary"
                                    >
                                        {isSubmitting ? (
                                            <div className="flex items-center">
                                                <div className="loading-spinner w-4 h-4 mr-2"></div>
                                                Guardando...
                                            </div>
                                        ) : (
                                            'Actualizar registro'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={showConfirmModal}
                onClose={() => {
                    setShowConfirmModal(false);
                    setLogToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar registro"
                message={`¿Estás seguro de que quieres eliminar el registro de "${logToDelete?.habit_name}"? Esta acción no se puede deshacer.`}
                type="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default Logs; 