import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Target, Clock, CheckCircle } from 'lucide-react';
import axios from 'axios';
import useNotificationStore from '../stores/notificationStore';
import useErrorHandler from '../hooks/useErrorHandler';
import ConfirmModal from '../components/ConfirmModal';

const HabitSpinner = () => (
  <div className="habits-loading">
    <svg className="habit-ring-spinner" width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle
        className="opacity-20"
        cx="28"
        cy="28"
        r="24"
        stroke="#22c55e"
        strokeWidth="6"
      />
      <circle
        className="habit-ring-spinner-arc"
        cx="28"
        cy="28"
        r="24"
        stroke="#22c55e"
        strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray="60 120"
      />
    </svg>
  </div>
);

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
            water: 'water',
            sleep: 'sleep',
            exercise: 'exercise',
            nutrition: 'nutrition',
            meditation: 'meditation'
        };
        return colors[type] || 'exercise';
    };

    if (isLoading) {
        return (
            <div className="habits-container">
                <HabitSpinner />
            </div>
        );
    }

    return (
        <div className="habits-container">
            {/* Header */}
            <div className="habits-header">
                <div className="habits-header-content">
                    <div>
                        <h1 className="habits-title">
                            Mis Hábitos
                        </h1>
                        <p className="habits-subtitle">
                            Gestiona tus hábitos saludables y construye una vida mejor
                        </p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingHabit(null);
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="habits-new-btn"
                    >
                        <Plus className="h-5 w-5" />
                        Nuevo hábito
                    </button>
                </div>
            </div>

            {/* Habits Grid */}
            {habits.length === 0 ? (
                <div className="habits-empty">
                    <div className="habits-empty-icon">
                        <Target className="h-10 w-10" />
                    </div>
                    <h3 className="habits-empty-title">No hay hábitos</h3>
                    <p className="habits-empty-desc">
                        Comienza creando tu primer hábito para mejorar tu salud y alcanzar tus metas personales.
                    </p>
                    <button
                        onClick={() => {
                            setEditingHabit(null);
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="habits-empty-btn"
                    >
                        <Plus className="h-5 w-5" />
                        Crear mi primer hábito
                    </button>
                </div>
            ) : (
                <div className="habits-grid">
                    {habits.map((habit, index) => (
                        <div
                            key={habit.id}
                            className="habit-card"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="habit-card-header">
                                <div className="habit-icon">
                                    <span>{getHabitTypeIcon(habit.type)}</span>
                                </div>
                                <span className={`habit-type-badge ${getHabitTypeColor(habit.type)}`}>
                                    {habit.type}
                                </span>
                            </div>
                            
                            <h3 className="habit-title">{habit.name}</h3>
                            
                            {habit.description && (
                                <p className="habit-description">
                                    {habit.description}
                                </p>
                            )}

                            {habit.reminder_time && (
                                <div className="habit-reminder">
                                    <Clock className="habit-reminder-icon h-4 w-4" />
                                    Recordatorio: {habit.reminder_time}
                                </div>
                            )}
                            
                            {habit.target_goals && habit.target_goals.length > 0 && (
                                <div className="habit-goals">
                                    <p className="habit-goals-title">
                                        <Target className="habit-goals-title-icon h-3 w-3" />
                                        Objetivos:
                                    </p>
                                    <div>
                                        {habit.target_goals.map((goal, index) => (
                                            <div key={index} className="habit-goal-item">
                                                • {goal}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="habit-footer">
                                <span className={`habit-status ${habit.is_active ? 'active' : 'inactive'}`}>
                                    <CheckCircle className="habit-status-icon h-3 w-3" />
                                    {habit.is_active ? 'Activo' : 'Inactivo'}
                                </span>
                                
                                <div className="habit-actions">
                                    <button
                                        onClick={() => handleEdit(habit)}
                                        className="habit-action-btn edit"
                                        aria-label="Editar hábito"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(habit)}
                                        className="habit-action-btn delete"
                                        aria-label="Eliminar hábito"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="habits-modal-overlay">
                    <div className="habits-modal">
                        <div className="habits-modal-header">
                            <h2 className="habits-modal-title">
                                {editingHabit ? 'Editar hábito' : 'Nuevo hábito'}
                            </h2>
                            <button
                                onClick={() => {
                                    setShowCreateModal(false);
                                    setEditingHabit(null);
                                    resetForm();
                                }}
                                className="habits-modal-close"
                                disabled={isSubmitting}
                            >
                                <span className="sr-only">Cerrar</span>
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="habits-modal-body">
                            <div className="habits-form-group">
                                <label className="habits-form-label">
                                    Nombre del hábito
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    className="habits-form-input"
                                    required
                                />
                            </div>

                            <div className="habits-form-group">
                                <label className="habits-form-label">
                                    Tipo
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="habits-form-input"
                                >
                                    <option value="exercise">Ejercicio</option>
                                    <option value="nutrition">Nutrición</option>
                                    <option value="sleep">Sueño</option>
                                    <option value="water">Agua</option>
                                    <option value="meditation">Meditación</option>
                                </select>
                            </div>

                            <div className="habits-form-group">
                                <label className="habits-form-label">
                                    Descripción (opcional)
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    className="habits-form-input habits-form-textarea"
                                    rows="3"
                                />
                            </div>

                            <div className="habits-form-group">
                                <label className="habits-form-label">
                                    Hora de recordatorio (opcional)
                                </label>
                                <input
                                    type="time"
                                    value={formData.reminder_time}
                                    onChange={(e) => setFormData({...formData, reminder_time: e.target.value})}
                                    className="habits-form-input"
                                />
                            </div>

                            <div className="habits-form-group">
                                <div className="habits-form-checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                        className="habits-form-checkbox"
                                    />
                                    <label htmlFor="is_active" className="habits-form-checkbox-label">
                                        Hábito activo
                                    </label>
                                </div>

                                <div className="habits-form-checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        checked={formData.is_public}
                                        onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                                        className="habits-form-checkbox"
                                    />
                                    <label htmlFor="is_public" className="habits-form-checkbox-label">
                                        Hábito público
                                    </label>
                                </div>
                            </div>

                            <div className="habits-modal-footer">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setEditingHabit(null);
                                        resetForm();
                                    }}
                                    className="habits-modal-btn habits-modal-btn-secondary"
                                    disabled={isSubmitting}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="habits-modal-btn habits-modal-btn-primary"
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