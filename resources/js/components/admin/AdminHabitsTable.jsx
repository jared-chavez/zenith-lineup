import React, { useState, useEffect } from "react";
import axios from "axios";
import { Target, Search, Edit, Trash2, Filter, Calendar, User, Tag, Download, RefreshCw, Eye, X } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import useAuthStore from "../../stores/authStore";
import useAdminFilters from "../../hooks/useAdminFilters";
import ConfirmModal from "../ConfirmModal";

const AdminHabitsTable = () => {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingHabit, setEditingHabit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingHabit, setViewingHabit] = useState(null);
  const [habitToDelete, setHabitToDelete] = useState(null);
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    type: 'water',
    frequency: 1,
    frequency_unit: 'day',
    reminder_time: '',
    is_active: true
  });

  const { success } = useNotificationStore();
  const { handleError } = useErrorHandler();
  const { token } = useAuthStore();

  // Initialize filters
  const {
    filters,
    debouncedFilters,
    isFiltering,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    getApiFilters,
    getFrontendFilters,
    hasActiveFilters,
    getFilterCount,
    setIsFiltering
  } = useAdminFilters({
    search: '',
    type: '',
    user: '',
    status: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    fetchHabits();
  }, [debouncedFilters]); // Refetch when debounced filters change

  const fetchHabits = async () => {
    try {
      setLoading(true);
      setIsFiltering(true);
      
      const response = await axios.get("/api/admin/habits", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: getApiFilters(),
      });
      
      setHabits(response.data.habits || []);
    } catch (err) {
      handleError(err, 'fetching habits');
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  };

  // Frontend filtering for additional features
  const getFilteredHabits = () => {
    let filtered = habits;

    // Apply frontend filters if needed
    const frontendFilters = getFrontendFilters();
    
    if (frontendFilters.search) {
      const searchTerm = frontendFilters.search.toLowerCase();
      filtered = filtered.filter(habit => 
        habit.name?.toLowerCase().includes(searchTerm) ||
        habit.description?.toLowerCase().includes(searchTerm) ||
        habit.user?.name?.toLowerCase().includes(searchTerm)
      );
    }

    return filtered;
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setEditForm({
      name: habit.name || '',
      description: habit.description || '',
      type: habit.type || 'water',
      frequency: habit.frequency || 1,
      frequency_unit: habit.frequency_unit || 'day',
      reminder_time: habit.reminder_time || '',
      is_active: habit.is_active !== undefined ? habit.is_active : true
    });
    setShowEditModal(true);
  };

  const handleView = (habit) => {
    setViewingHabit(habit);
    setShowViewModal(true);
  };

  const handleDelete = (habit) => {
    setHabitToDelete(habit);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
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

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/admin/habits/${editingHabit.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingHabit(null);
      setEditForm({ name: '', description: '', type: 'water', frequency: 1, frequency_unit: 'day', reminder_time: '', is_active: true });
      success('Hábito actualizado correctamente');
      fetchHabits();
    } catch (err) {
      handleError(err, 'updating habit');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/admin/habits/export', {
        search: filters.search,
        type: filters.type,
        user: filters.user,
        status: filters.status,
        date_from: filters.date_from,
        date_to: filters.date_to,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `habitos-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Exportación completada');
    } catch (err) {
      handleError(err, 'exporting habits');
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
      'water': 'admin-table-badge-water',
      'sleep': 'admin-table-badge-sleep',
      'exercise': 'admin-table-badge-exercise',
      'nutrition': 'admin-table-badge-nutrition',
      'meditation': 'admin-table-badge-meditation'
    };
    return colors[type] || 'admin-table-badge-water';
  };

  const handleSearch = (e) => {
    updateFilter('search', e.target.value);
  };

  const handleTypeFilter = (e) => {
    updateFilter('type', e.target.value);
  };

  const handleUserFilter = (e) => {
    updateFilter('user', e.target.value);
  };

  const handleStatusFilter = (e) => {
    updateFilter('status', e.target.value);
  };

  const handleDateFromFilter = (e) => {
    updateFilter('date_from', e.target.value);
  };

  const handleDateToFilter = (e) => {
    updateFilter('date_to', e.target.value);
  };

  const handleApplyFilters = () => {
    fetchHabits();
  };

  const handleClearFilters = () => {
    resetFilters();
  };

  const handleClearFilter = (filterKey) => {
    clearFilter(filterKey);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const filteredHabits = getFilteredHabits();

  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-table-loading-spinner"></div>
          {isFiltering ? 'Aplicando filtros...' : 'Cargando hábitos...'}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      {/* Header */}
      <div className="admin-table-header">
        <h2 className="admin-table-title">Hábitos Registrados</h2>
        <p className="admin-table-subtitle">Gestiona todos los hábitos creados por los usuarios</p>
        
        {/* Actions */}
        <div className="admin-table-filters">
          <button 
            onClick={fetchHabits} 
            className="admin-table-btn admin-table-btn-primary"
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          
          <button 
            onClick={handleExport} 
            className="admin-table-btn admin-table-btn-secondary"
          >
            <Download className="h-4 w-4" />
            Exportar
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="admin-table-filters">
        <div className="admin-table-search">
          <Search className="admin-table-search-icon" />
          <input
            type="text"
            placeholder="Buscar hábitos, usuarios o descripción..."
            value={filters.search}
            onChange={handleSearch}
            onKeyPress={(e) => e.key === 'Enter' && handleApplyFilters()}
          />
        </div>
        
        <select 
          className="admin-table-select"
          value={filters.type}
          onChange={handleTypeFilter}
        >
          <option value="">Todos los tipos</option>
          <option value="water">Agua</option>
          <option value="sleep">Sueño</option>
          <option value="exercise">Ejercicio</option>
          <option value="nutrition">Nutrición</option>
          <option value="meditation">Meditación</option>
        </select>

        <select 
          className="admin-table-select"
          value={filters.status}
          onChange={handleStatusFilter}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="completed">Completado</option>
        </select>

        <input
          type="date"
          className="admin-table-date"
          value={filters.date_from}
          onChange={handleDateFromFilter}
          placeholder="Desde"
        />

        <input
          type="date"
          className="admin-table-date"
          value={filters.date_to}
          onChange={handleDateToFilter}
          placeholder="Hasta"
        />
        
        <button 
          onClick={handleApplyFilters} 
          className="admin-table-btn admin-table-btn-primary"
          disabled={loading}
        >
          <Filter className="h-4 w-4" />
          Aplicar
        </button>

        {hasActiveFilters() && (
          <button 
            onClick={handleClearFilters} 
            className="admin-table-btn admin-table-btn-secondary"
          >
            <X className="h-4 w-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters() && (
        <div className="admin-table-active-filters">
          <span className="admin-table-filter-label">Filtros activos:</span>
          {Object.entries(filters).map(([key, value]) => {
            if (value && value !== '') {
              return (
                <span key={key} className="admin-table-filter-tag">
                  {key}: {value}
                  <button 
                    onClick={() => handleClearFilter(key)}
                    className="admin-table-filter-remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              );
            }
            return null;
          })}
          <span className="admin-table-filter-count">
            ({getFilterCount()} filtros)
          </span>
        </div>
      )}

      {/* Table Content */}
      <div className="admin-table-content">
        {filteredHabits.length === 0 ? (
          <div className="admin-table-empty">
            <div className="admin-table-empty-icon">
              <Target className="h-8 w-8" />
            </div>
            <h3 className="admin-table-empty-title">
              {hasActiveFilters() ? 'No se encontraron hábitos con los filtros aplicados' : 'No se encontraron hábitos'}
            </h3>
            <p className="admin-table-empty-desc">
              {hasActiveFilters() ? 'Intenta ajustar los filtros de búsqueda' : 'No hay hábitos registrados en el sistema'}
            </p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    className="admin-table-checkbox"
                    checked={selectedHabits.length === filteredHabits.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedHabits(filteredHabits.map(h => h.id));
                      } else {
                        setSelectedHabits([]);
                      }
                    }}
                  />
                </th>
                <th>Hábito</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Frecuencia</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredHabits.map((habit) => (
                <tr key={habit.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="admin-table-checkbox"
                      checked={selectedHabits.includes(habit.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedHabits([...selectedHabits, habit.id]);
                        } else {
                          setSelectedHabits(selectedHabits.filter(id => id !== habit.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-table-habit-info">
                      <div className="admin-table-habit-icon" style={{
                        background: `linear-gradient(135deg, ${getTypeColor(habit.type).includes('water') ? '#3b82f6' : 
                                                           getTypeColor(habit.type).includes('sleep') ? '#8b5cf6' :
                                                           getTypeColor(habit.type).includes('exercise') ? '#ef4444' :
                                                           getTypeColor(habit.type).includes('nutrition') ? '#22c55e' :
                                                           getTypeColor(habit.type).includes('meditation') ? '#f59e0b' : '#6b7280'}, 
                                                           ${getTypeColor(habit.type).includes('water') ? '#06b6d4' : 
                                                           getTypeColor(habit.type).includes('sleep') ? '#6366f1' :
                                                           getTypeColor(habit.type).includes('exercise') ? '#ec4899' :
                                                           getTypeColor(habit.type).includes('nutrition') ? '#10b981' :
                                                           getTypeColor(habit.type).includes('meditation') ? '#f97316' : '#9ca3af'})`
                      }}>
                        {getTypeIcon(habit.type)}
                      </div>
                      <div>
                        <div className="admin-table-habit-name">{habit.name}</div>
                        <div className="admin-table-habit-desc">
                          {habit.description?.substring(0, 50)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-user-info">
                      <div className="admin-table-user-name">
                        {habit.user?.name || 'N/A'}
                      </div>
                      <div className="admin-table-user-email">
                        {habit.user?.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-table-badge ${getTypeColor(habit.type)}`}>
                      {getTypeLabel(habit.type)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-habit-name">
                      {habit.frequency} veces por {habit.frequency_unit}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-habit-name">
                      {new Date(habit.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        onClick={() => handleEdit(habit)}
                        className="admin-table-action-btn admin-table-action-btn-edit"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(habit)}
                        className="admin-table-action-btn admin-table-action-btn-delete"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleView(habit)}
                        className="admin-table-action-btn admin-table-action-btn-view"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Results Summary */}
      {filteredHabits.length > 0 && (
        <div className="admin-table-pagination">
          <div className="admin-table-pagination-info">
            Mostrando {filteredHabits.length} de {habits.length} hábitos
            {hasActiveFilters() && ` (filtrados de ${habits.length} total)`}
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Eliminar Hábito"
          message={`¿Estás seguro de que quieres eliminar el hábito "${habitToDelete?.name}"? Esta acción no se puede deshacer.`}
          confirmText="Eliminar"
          cancelText="Cancelar"
          type="danger"
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Editar Hábito</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="admin-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Nombre</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="admin-form-input"
                  placeholder="Nombre del hábito"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Descripción</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  className="admin-form-input"
                  placeholder="Descripción del hábito"
                  rows="3"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Tipo</label>
                <select
                  value={editForm.type}
                  onChange={(e) => handleEditFormChange('type', e.target.value)}
                  className="admin-form-input"
                >
                  <option value="water">Agua</option>
                  <option value="sleep">Sueño</option>
                  <option value="exercise">Ejercicio</option>
                  <option value="nutrition">Nutrición</option>
                  <option value="meditation">Meditación</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Frecuencia</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    value={editForm.frequency}
                    onChange={(e) => handleEditFormChange('frequency', parseInt(e.target.value))}
                    className="admin-form-input"
                    style={{ flex: 1 }}
                    min="1"
                  />
                  <select
                    value={editForm.frequency_unit}
                    onChange={(e) => handleEditFormChange('frequency_unit', e.target.value)}
                    className="admin-form-input"
                    style={{ flex: 1 }}
                  >
                    <option value="day">Día</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                  </select>
                </div>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Hora de Recordatorio</label>
                <input
                  type="time"
                  value={editForm.reminder_time}
                  onChange={(e) => handleEditFormChange('reminder_time', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  <input
                    type="checkbox"
                    checked={editForm.is_active}
                    onChange={(e) => handleEditFormChange('is_active', e.target.checked)}
                    style={{ marginRight: '8px' }}
                  />
                  Hábito Activo
                </label>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                onClick={() => setShowEditModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEdit}
                className="admin-btn admin-btn-primary"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && viewingHabit && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Detalles del Hábito</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="admin-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-user-details">
                <div className="admin-detail-group">
                  <label className="admin-detail-label">ID:</label>
                  <span className="admin-detail-value">{viewingHabit.id}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Nombre:</label>
                  <span className="admin-detail-value">{viewingHabit.name}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Descripción:</label>
                  <span className="admin-detail-value">{viewingHabit.description || 'Sin descripción'}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Tipo:</label>
                  <span className={`admin-table-badge ${getTypeColor(viewingHabit.type)}`}>
                    {getTypeLabel(viewingHabit.type)}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Frecuencia:</label>
                  <span className="admin-detail-value">
                    {viewingHabit.frequency} veces por {viewingHabit.frequency_unit}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Recordatorio:</label>
                  <span className="admin-detail-value">
                    {viewingHabit.reminder_time ? viewingHabit.reminder_time : 'No configurado'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Estado:</label>
                  <span className={`admin-table-badge ${viewingHabit.is_active ? 'admin-table-badge-water' : 'admin-table-badge-sleep'}`}>
                    {viewingHabit.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Usuario:</label>
                  <span className="admin-detail-value">
                    {viewingHabit.user?.name || 'N/A'} ({viewingHabit.user?.email})
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Creado:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingHabit.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Actualizado:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingHabit.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="admin-modal-footer">
              <button
                onClick={() => setShowViewModal(false)}
                className="admin-btn admin-btn-secondary"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  handleEdit(viewingHabit);
                }}
                className="admin-btn admin-btn-primary"
              >
                Editar Hábito
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHabitsTable; 