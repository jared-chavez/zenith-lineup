import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Filter, Target, User, Clock, Calendar, Zap } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import ConfirmModal from "../ConfirmModal";

const AdminHabitsTable = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingHabit, setEditingHabit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState(null);

  const { success } = useNotificationStore();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/habits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchTerm,
          type: typeFilter,
        },
      });
      setHabits(response.data.habits || []);
    } catch (err) {
      handleError(err, 'fetching habits');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleDelete = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/habits/${habitToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      success('Hábito eliminado correctamente');
      fetchHabits();
    } catch (err) {
      handleError(err, 'deleting habit');
    } finally {
      setShowDeleteModal(false);
      setHabitToDelete(null);
    }
  };

  const handleSaveEdit = async (habitData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/habits/${editingHabit.id}`, habitData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingHabit(null);
      success('Hábito actualizado correctamente');
      fetchHabits();
    } catch (err) {
      handleError(err, 'updating habit');
    }
  };

  const getTypeLabel = (type) => {
    const types = {
      'water': 'Agua',
      'sleep': 'Sueño',
      'exercise': 'Ejercicio',
      'nutrition': 'Nutrición',
      'meditation': 'Meditación'
    };
    return types[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'water': '💧',
      'sleep': '😴',
      'exercise': '💪',
      'nutrition': '🍎',
      'meditation': '🧘'
    };
    return icons[type] || '🎯';
  };

  const getTypeColor = (type) => {
    const colors = {
      'water': 'from-blue-500 to-cyan-500',
      'sleep': 'from-purple-500 to-indigo-500',
      'exercise': 'from-red-500 to-pink-500',
      'nutrition': 'from-green-500 to-emerald-500',
      'meditation': 'from-yellow-500 to-orange-500'
    };
    return colors[type] || 'from-gray-500 to-slate-500';
  };

  const getStatusColor = (status) => {
    const colors = {
      'active': 'badge-success',
      'inactive': 'badge-secondary',
      'paused': 'badge-warning'
    };
    return colors[status] || 'badge-secondary';
  };

  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         habit.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !typeFilter || habit.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner w-8 h-8"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar hábitos por nombre o descripción..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full pl-10 pr-4"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="input-modern"
              >
                <option value="">Todos los tipos</option>
                <option value="water">Agua</option>
                <option value="sleep">Sueño</option>
                <option value="exercise">Ejercicio</option>
                <option value="nutrition">Nutrición</option>
                <option value="meditation">Meditación</option>
              </select>
              <button
                onClick={fetchHabits}
                className="btn-primary layer-pressable"
              >
                <Filter size={18} />
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Habits Table - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      Hábito
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-green-600" />
                      Usuario
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-green-600" />
                      Tipo
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-green-600" />
                      Recordatorio
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Creado
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredHabits.map((habit, index) => (
                  <tr 
                    key={habit.id} 
                    className="layer-surface layer-interactive animate-fade-in hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-gradient-to-br ${getTypeColor(habit.type)} rounded-xl flex items-center justify-center`}>
                          <span className="text-white text-lg">{getTypeIcon(habit.type)}</span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{habit.name}</div>
                          <div className="text-sm text-gray-600">{habit.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{habit.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{habit.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="badge-modern badge-primary">
                        {getTypeLabel(habit.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge-modern ${getStatusColor(habit.status)}`}>
                        {habit.status === 'active' ? 'Activo' : 
                         habit.status === 'inactive' ? 'Inactivo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {habit.reminder_time ? 
                        new Date(`2000-01-01T${habit.reminder_time}`).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 
                        'Sin recordatorio'
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(habit.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(habit)}
                          className="btn-icon btn-ghost layer-pressable"
                          title="Editar hábito"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(habit)}
                          className="btn-icon btn-danger layer-pressable"
                          title="Eliminar hábito"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredHabits.length === 0 && (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron hábitos</p>
              <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Fitia Style */}
      {showEditModal && editingHabit && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Editar Hábito</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="btn-icon btn-ghost"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleSaveEdit({
                name: formData.get('name'),
                description: formData.get('description'),
                type: formData.get('type'),
                status: formData.get('status'),
                reminder_time: formData.get('reminder_time'),
                target_goals: formData.get('target_goals'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label-modern">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingHabit.name}
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-modern">Descripción</label>
                  <textarea
                    name="description"
                    defaultValue={editingHabit.description}
                    className="input-modern w-full"
                    rows="3"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Tipo</label>
                    <select
                      name="type"
                      defaultValue={editingHabit.type}
                      className="input-modern w-full"
                    >
                      <option value="water">Agua</option>
                      <option value="sleep">Sueño</option>
                      <option value="exercise">Ejercicio</option>
                      <option value="nutrition">Nutrición</option>
                      <option value="meditation">Meditación</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-modern">Estado</label>
                    <select
                      name="status"
                      defaultValue={editingHabit.status}
                      className="input-modern w-full"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                      <option value="paused">Pausado</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-modern">Hora de Recordatorio</label>
                    <input
                      type="time"
                      name="reminder_time"
                      defaultValue={editingHabit.reminder_time}
                      className="input-modern w-full"
                    />
                  </div>
                  <div>
                    <label className="label-modern">Metas Objetivo</label>
                    <input
                      type="number"
                      name="target_goals"
                      defaultValue={editingHabit.target_goals}
                      className="input-modern w-full"
                      placeholder="Ej: 8 horas"
                    />
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setHabitToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Hábito"
        message={`¿Estás seguro de que quieres eliminar el hábito "${habitToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AdminHabitsTable; 