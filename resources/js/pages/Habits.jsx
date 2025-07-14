import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Target, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';
import ConfirmModal from '../components/ConfirmModal';

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [habitToDelete, setHabitToDelete] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        type: 'exercise',
        description: '',
        target_goals: [],
        reminder_time: '',
        is_active: true,
        is_public: false
    });

    const { success, error: showError } = useNotificationStore();
    const { handleError } = useErrorHandler();

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await axios.get('/api/habits');
            setHabits(response.data.habits.data || []);
        } catch (error) {
            handleError(error, 'fetching habits');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const payload = {
                ...formData,
                reminder_time: formData.reminder_time || null,
                target_goals: Array.isArray(formData.target_goals)
                    ? formData.target_goals.filter(goal => goal && goal.trim() !== '')
                    : [],
            };
            
            if (editingHabit) {
                await axios.put(`/api/habits/${editingHabit.id}`, payload);
                success('Hábito actualizado correctamente');
            } else {
                await axios.post('/api/habits', payload);
                success('Hábito creado correctamente');
            }
            
            setShowCreateModal(false);
            setEditingHabit(null);
            resetForm();
            fetchHabits();
        } catch (error) {
            handleError(error, editingHabit ? 'updating habit' : 'creating habit');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteClick = (habit) => {
        setHabitToDelete(habit);
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = async () => {
        if (!habitToDelete) return;
        
        try {
            await axios.delete(`/api/habits/${habitToDelete.id}`);
            success('Hábito eliminado correctamente');
            fetchHabits();
        } catch (error) {
            handleError(error, 'deleting habit');
        } finally {
            setShowConfirmModal(false);
            setHabitToDelete(null);
        }
    };

    const handleEdit = (habit) => {
        setEditingHabit(habit);
        setFormData({
            name: habit.name,
            type: habit.type,
            description: habit.description || '',
            target_goals: habit.target_goals || [],
            reminder_time: habit.reminder_time || '',
            is_active: habit.is_active,
            is_public: habit.is_public
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setFormData({
            name: '',
            type: 'exercise',
            description: '',
            target_goals: [],
            reminder_time: '',
            is_active: true,
            is_public: false
        });
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
                                Mis Hábitos
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Gestiona tus hábitos saludables y construye una vida mejor
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                setEditingHabit(null);
                                resetForm();
                                setShowCreateModal(true);
                            }}
                            className="btn-primary layer-pressable animate-bounce-subtle"
                        >
                            <Plus className="h-5 w-5 mr-2" />
                            Nuevo hábito
                        </button>
                    </div>
                </div>
            </div>

            {/* Habits Grid - Fitia Style */}
            {habits.length === 0 ? (
                <div className="layer-surface animate-fade-in text-center py-16">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                        <Target className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">No hay hábitos</h3>
                    <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        Comienza creando tu primer hábito para mejorar tu salud y alcanzar tus metas personales.
                    </p>
                    <button
                        onClick={() => {
                            setEditingHabit(null);
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="btn-primary layer-pressable"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Crear mi primer hábito
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit, index) => (
                        <div
                            key={habit.id}
                            className="layer-elevated layer-interactive animate-fade-in"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                                        <span className="text-2xl">{getHabitTypeIcon(habit.type)}</span>
                                    </div>
                                    <span className={`${getHabitTypeColor(habit.type)}`}>
                                        {habit.type}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">{habit.name}</h3>
                                
                                {habit.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                        {habit.description}
                                    </p>
                                )}

                                {habit.reminder_time && (
                                    <div className="flex items-center text-sm text-gray-500 mb-3 bg-gray-50 px-3 py-2 rounded-lg">
                                        <Clock className="h-4 w-4 mr-2 text-green-500" />
                                        Recordatorio: {habit.reminder_time}
                                    </div>
                                )}
                                
                                {habit.target_goals && habit.target_goals.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-xs font-medium text-gray-700 mb-2 flex items-center">
                                            <Target className="h-3 w-3 mr-1" />
                                            Objetivos:
                                        </p>
                                        <div className="space-y-1">
                                            {habit.target_goals.map((goal, index) => (
                                                <div key={index} className="text-xs text-gray-600 bg-gradient-green px-3 py-2 rounded-lg">
                                                    • {goal}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        habit.is_active 
                                            ? 'badge-success' 
                                            : 'badge-error'
                                    }`}>
                                        <CheckCircle className="h-3 w-3 mr-1" />
                                        {habit.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEdit(habit)}
                                            className="btn-ghost layer-pressable p-2"
                                            aria-label="Editar hábito"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(habit)}
                                            className="btn-ghost layer-pressable p-2 text-red-500 hover:text-red-600"
                                            aria-label="Eliminar hábito"
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

            {/* Create/Edit Modal - Fitia Style */}
            {showCreateModal && (
                <div className="layer-overlay animate-fade-in">
                    <div className="layer-modal animate-zoom-in-95 max-w-lg w-full my-8">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">
                                    {editingHabit ? 'Editar hábito' : 'Nuevo hábito'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingHabit(null);
                                        resetForm();
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
                            
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre del hábito
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="input-fitia"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="input-fitia"
                                    >
                                        <option value="exercise">Ejercicio</option>
                                        <option value="nutrition">Nutrición</option>
                                        <option value="sleep">Sueño</option>
                                        <option value="water">Agua</option>
                                        <option value="meditation">Meditación</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción (opcional)
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="input-fitia"
                                        rows="3"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Hora de recordatorio (opcional)
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.reminder_time}
                                        onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                                        className="input-fitia"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_active" className="ml-3 block text-sm text-gray-900">
                                            Hábito activo
                                        </label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="is_public"
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="is_public" className="ml-3 block text-sm text-gray-900">
                                            Hábito público
                                        </label>
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-3 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingHabit(null);
                                            resetForm();
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
                                            editingHabit ? 'Actualizar' : 'Crear'
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
                    setHabitToDelete(null);
                }}
                onConfirm={handleDeleteConfirm}
                title="Eliminar hábito"
                message={`¿Estás seguro de que quieres eliminar el hábito "${habitToDelete?.name}"? Esta acción no se puede deshacer.`}
                type="danger"
                confirmText="Eliminar"
                cancelText="Cancelar"
            />
        </div>
    );
};

export default Habits; 