import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Target } from 'lucide-react';
import axios from 'axios';

const Habits = () => {
    const [habits, setHabits] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingHabit, setEditingHabit] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        type: 'exercise',
        description: '',
        target_goals: [],
        reminder_time: '',
        is_active: true,
        is_public: false
    });

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const response = await axios.get('/api/habits');
            setHabits(response.data.habits.data || []);
        } catch (error) {
            console.error('Error fetching habits:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Normalizar valores nulos/vacíos y formato reminder_time
            let reminderTime = formData.reminder_time;
            if (reminderTime && /^\d{2}:\d{2}$/.test(reminderTime)) {
                reminderTime = reminderTime + ':00';
            }
            const payload = {
                ...formData,
                reminder_time: reminderTime || null,
                target_goals: Array.isArray(formData.target_goals)
                    ? formData.target_goals.filter(goal => goal && goal.trim() !== '')
                    : [],
            };
            if (editingHabit) {
                await axios.put(`/api/habits/${editingHabit.id}`, payload);
            } else {
                await axios.post('/api/habits', payload);
            }
            setShowCreateModal(false);
            setEditingHabit(null);
            resetForm();
            fetchHabits();
        } catch (error) {
            console.error('Error saving habit:', error);
        }
    };

    const handleDelete = async (habitId) => {
        if (window.confirm('¿Estás seguro de que quieres eliminar este hábito?')) {
            try {
                await axios.delete(`/api/habits/${habitId}`);
                fetchHabits();
            } catch (error) {
                console.error('Error deleting habit:', error);
            }
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

    console.log('Rendering Habits component, habits state:', habits);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mis Hábitos</h1>
                    <p className="text-gray-600">Gestiona tus hábitos saludables</p>
                </div>
                <button
                    onClick={() => {
                        setEditingHabit(null);
                        resetForm();
                        setShowCreateModal(true);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo hábito
                </button>
            </div>

            {/* Habits Grid */}
            {habits.length === 0 ? (
                <div className="text-center py-12">
                    <Target className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No hay hábitos</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Comienza creando tu primer hábito para mejorar tu salud.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={() => {
                                setEditingHabit(null);
                                resetForm();
                                setShowCreateModal(true);
                            }}
                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Crear hábito
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {habits.map((habit) => (
                        <div
                            key={habit.id}
                            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-3xl">{getHabitTypeIcon(habit.type)}</span>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHabitTypeColor(habit.type)}`}>
                                        {habit.type}
                                    </span>
                                </div>
                                
                                <h3 className="text-lg font-medium text-gray-900 mb-2">{habit.name}</h3>
                                
                                {habit.description && (
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                                        {habit.description}
                                    </p>
                                )}

                                {habit.reminder_time && (
                                    <div className="text-xs text-gray-500 mb-2">
                                        ⏰ Recordatorio: {habit.reminder_time}
                                    </div>
                                )}
                                {habit.target_goals && habit.target_goals.length > 0 && (
                                    <div className="text-xs text-gray-500 mb-2">
                                        🎯 Metas: {habit.target_goals.join(', ')}
                                    </div>
                                )}

                                <div className="flex items-center justify-between mb-4">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        habit.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {habit.is_active ? 'Activo' : 'Inactivo'}
                                    </span>
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        habit.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                        {habit.is_public ? 'Público' : 'Privado'}
                                    </span>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEdit(habit)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(habit.id)}
                                        className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                        <div className="mt-3">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">
                                {editingHabit ? 'Editar hábito' : 'Crear nuevo hábito'}
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nombre del hábito
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    >
                                        <option value="water">Agua</option>
                                        <option value="sleep">Sueño</option>
                                        <option value="exercise">Ejercicio</option>
                                        <option value="nutrition">Nutrición</option>
                                        <option value="meditation">Meditación</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={3}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Hora de recordatorio
                                    </label>
                                    <input
                                        type="time"
                                        value={formData.reminder_time || ''}
                                        onChange={e => setFormData({ ...formData, reminder_time: e.target.value })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Metas/Objetivos (separados por coma)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.target_goals.join(', ')}
                                        onChange={e => setFormData({ ...formData, target_goals: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    />
                                </div>

                                <div className="flex items-center space-x-4">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Activo</span>
                                    </label>
                                    
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData({...formData, is_public: e.target.checked})}
                                            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">Público</span>
                                    </label>
                                </div>

                                <div className="flex space-x-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        {editingHabit ? 'Actualizar' : 'Crear'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            setEditingHabit(null);
                                            resetForm();
                                        }}
                                        className="flex-1 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        Cancelar
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

export default Habits; 