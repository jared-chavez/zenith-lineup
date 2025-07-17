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
            water: 'water',
            sleep: 'sleep',
            exercise: 'exercise',
            nutrition: 'nutrition',
            meditation: 'meditation'
        };
        return colors[type] || 'exercise';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return 'completed';
            case 'partial':
                return 'partial';
            case 'missed':
                return 'missed';
            default:
                return 'completed';
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
            <div className="logs-container">
                <div className="logs-loading">
                    <div className="loading-spinner w-12 h-12"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="logs-container">
            {/* Header */}
            <div className="logs-header">
                <div className="logs-header-content">
                    <div>
                        <h1 className="logs-title">
                            Registros de hábitos
                        </h1>
                        <p className="logs-subtitle">
                            Gestiona y revisa tus registros diarios
                        </p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="logs-new-btn"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo registro
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="logs-filters">
                <div className="logs-filters-header">
                    <div className="logs-filters-icon">
                        <Filter className="h-5 w-5" />
                    </div>
                    <h3 className="logs-filters-title">Filtros</h3>
                </div>
                <div className="logs-filters-grid">
                    <div className="logs-filter-group">
                        <label className="logs-filter-label">
                            Fecha
                        </label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={e => setSelectedDate(e.target.value)}
                            className="logs-filter-input"
                        />
                    </div>
                    <div className="logs-filter-group">
                        <label className="logs-filter-label">
                            Hábito
                        </label>
                        <select
                            value={selectedHabit}
                            onChange={e => setSelectedHabit(e.target.value)}
                            className="logs-filter-input"
                        >
                            <option value="">Todos los hábitos</option>
                            {habits.map(habit => (
                                <option key={habit.id} value={habit.id}>{habit.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="logs-filter-group">
                        <button
                            onClick={clearFilters}
                            className="logs-clear-btn"
                        >
                            <X className="h-4 w-4" />
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            </div>

            {/* Logs Grid */}
            {logs.length === 0 ? (
                <div className="logs-empty">
                    <div className="logs-empty-icon">
                        <Calendar className="h-10 w-10" />
                    </div>
                    <h3 className="logs-empty-title">No hay registros</h3>
                    <p className="logs-empty-desc">
                        No se encontraron registros para la fecha y hábito seleccionados.
                    </p>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="logs-empty-btn"
                    >
                        <Plus className="h-5 w-5" />
                        Crear primer registro
                    </button>
                </div>
            ) : (
                <div className="logs-grid">
                    {logs.map((log, index) => (
                        <div
                            key={log.id}
                            className="log-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="log-card-header">
                                <div className="log-icon">
                                    <span>{getHabitTypeIcon(log.habit_type)}</span>
                                </div>
                                <span className={`log-type-badge ${getHabitTypeColor(log.habit_type)}`}>
                                    {log.habit_type}
                                </span>
                            </div>
                            
                            <h3 className="log-title">{log.habit_name}</h3>
                            
                            <div className="log-info">
                                <div className="log-date">
                                    <Calendar className="log-date-icon h-4 w-4" />
                                    {new Date(log.log_date).toLocaleDateString('es-ES', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                                
                                <div className="log-status">
                                    {getStatusIcon(log.status)}
                                    <span className={`log-status-badge ${getStatusBadge(log.status)}`}>
                                        {log.status === 'completed' ? 'Completado' : 
                                         log.status === 'partial' ? 'En proceso' : 
                                         log.status === 'missed' ? 'Incompleto' : log.status}
                                    </span>
                                </div>
                            </div>
                            
                            {log.notes && (
                                <div className="log-notes">
                                    <p className="log-notes-text">
                                        {log.notes}
                                    </p>
                                </div>
                            )}
                            
                            <div className="log-footer">
                                <div className="log-actions">
                                    <button
                                        onClick={() => openEditModal(log)}
                                        className="log-action-btn edit"
                                        aria-label="Editar registro"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(log)}
                                        className="log-action-btn delete"
                                        aria-label="Eliminar registro"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="logs-modal-overlay">
                    <div className="logs-modal">
                        <div className="logs-modal-header">
                            <h2 className="logs-modal-title">Nuevo registro</h2>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="logs-modal-close"
                                disabled={isSubmitting}
                            >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateLog} className="logs-modal-body">
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Hábito
                                </label>
                                <select
                                    value={formData.habit_id}
                                    onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                    className="logs-form-input"
                                    required
                                >
                                    <option value="">Selecciona un hábito</option>
                                    {habits.map(habit => (
                                        <option key={habit.id} value={habit.id}>{habit.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={formData.log_date}
                                    onChange={e => setFormData({ ...formData, log_date: e.target.value })}
                                    className="logs-form-input"
                                    required
                                />
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Estado
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="logs-form-input"
                                >
                                    <option value="Terminado">Terminado</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Incompleto">Incompleto</option>
                                </select>
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="logs-form-input logs-form-textarea"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="logs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="logs-modal-btn logs-modal-btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="logs-modal-btn logs-modal-btn-primary"
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
            )}

            {/* Edit Modal */}
            {showEditModal && (
                <div className="logs-modal-overlay">
                    <div className="logs-modal">
                        <div className="logs-modal-header">
                            <h2 className="logs-modal-title">Editar registro</h2>
                            <button
                                onClick={() => {
                                    setShowEditModal(false);
                                    setEditingLog(null);
                                }}
                                className="logs-modal-close"
                                disabled={isSubmitting}
                            >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleEditLog} className="logs-modal-body">
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Hábito
                                </label>
                                <select
                                    value={formData.habit_id}
                                    onChange={e => setFormData({ ...formData, habit_id: e.target.value })}
                                    className="logs-form-input"
                                    required
                                >
                                    <option value="">Selecciona un hábito</option>
                                    {habits.map(habit => (
                                        <option key={habit.id} value={habit.id}>{habit.name}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Fecha
                                </label>
                                <input
                                    type="date"
                                    value={formData.log_date}
                                    onChange={e => setFormData({ ...formData, log_date: e.target.value })}
                                    className="logs-form-input"
                                    required
                                />
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Estado
                                </label>
                                <select
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                    className="logs-form-input"
                                >
                                    <option value="Terminado">Terminado</option>
                                    <option value="En proceso">En proceso</option>
                                    <option value="Incompleto">Incompleto</option>
                                </select>
                            </div>
                            
                            <div className="logs-form-group">
                                <label className="logs-form-label">
                                    Notas (opcional)
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="logs-form-input logs-form-textarea"
                                    rows="3"
                                />
                            </div>
                            
                            <div className="logs-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingLog(null);
                                    }}
                                    className="logs-modal-btn logs-modal-btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="logs-modal-btn logs-modal-btn-primary"
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