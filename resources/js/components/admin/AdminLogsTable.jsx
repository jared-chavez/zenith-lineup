import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Filter, Calendar, CheckCircle, XCircle, Clock, FileText, User, Target, Eye, RefreshCw, X } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import useAuthStore from "../../stores/authStore";
import useAdminFilters from "../../hooks/useAdminFilters";
import ConfirmModal from "../ConfirmModal";

const AdminLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingLog, setEditingLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingLog, setViewingLog] = useState(null);
  const [logToDelete, setLogToDelete] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [logsPerPage] = useState(10);
  const [editForm, setEditForm] = useState({
    log_date: '',
    status: 'completed',
    notes: '',
    completed_at: ''
  });

  const { success } = useNotificationStore();
  const { handleError } = useErrorHandler();
  const { token } = useAuthStore();

  // Usar el hook de filtros
  const {
    filters,
    setFilters,
    debouncedFilters,
    resetFilters,
    filterOptions
  } = useAdminFilters({
    search: '',
    status: '',
    habit_type: '',
    user_id: '',
    date_from: '',
    date_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  useEffect(() => {
    fetchLogs();
  }, [debouncedFilters, currentPage]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get("/api/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ...debouncedFilters,
          page: currentPage,
          per_page: logsPerPage,
        },
      });
      
      // Manejar respuesta paginada
      if (response.data.logs && response.data.logs.data) {
        setLogs(response.data.logs.data || []);
        setTotalPages(response.data.logs.last_page || 1);
        setTotalLogs(response.data.logs.total || 0);
      } else {
        setLogs(response.data.logs || []);
        setTotalPages(1);
        setTotalLogs(response.data.logs?.length || 0);
      }
      
    } catch (err) {
      handleError(err, 'fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setEditForm({
      log_date: log.log_date ? log.log_date.split('T')[0] : '',
      status: log.status || 'completed',
      notes: log.notes || '',
      completed_at: log.completed_at ? log.completed_at.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (log) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  const handleView = (log) => {
    setViewingLog(log);
    setShowViewModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/logs/${logToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      success('Registro eliminado correctamente');
      fetchLogs();
    } catch (err) {
      handleError(err, 'deleting log');
    } finally {
      setShowDeleteModal(false);
      setLogToDelete(null);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await axios.put(`/api/admin/logs/${editingLog.id}`, editForm, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingLog(null);
      setEditForm({ log_date: '', status: 'completed', notes: '', completed_at: '' });
      success('Registro actualizado correctamente');
      fetchLogs();
    } catch (err) {
      handleError(err, 'updating log');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'missed':
        return <XCircle className="text-red-500" size={16} />;
      case 'partial':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'completed': 'Completado',
      'missed': 'Perdido',
      'partial': 'Parcial',
      'pending': 'Pendiente'
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      'completed': 'admin-logs-status-completed',
      'missed': 'admin-logs-status-missed',
      'partial': 'admin-logs-status-partial',
      'pending': 'admin-logs-status-pending'
    };
    return classes[status] || 'admin-logs-status-pending';
  };

  if (loading) {
    return (
      <div className="admin-logs-container">
        <div className="admin-logs-loading">
          <div className="admin-logs-loading-spinner"></div>
          Cargando registros...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-logs-container">
      {/* Header */}
      <div className="admin-logs-header">
        <h2 className="admin-logs-title">Registros de Actividad</h2>
        <p className="admin-logs-subtitle">
          Gestiona y supervisa todos los registros de hábitos de los usuarios ({totalLogs} registros)
        </p>
        
        {/* Actions */}
        <div className="admin-logs-filters">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="admin-logs-btn admin-logs-btn-primary"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-logs-filters">
        <div className="admin-logs-search">
          <Search className="admin-logs-search-icon" />
          <input
            type="text"
            placeholder="Buscar registros por hábito, usuario o notas..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select
          className="admin-logs-select"
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="completed">Completado</option>
          <option value="missed">Perdido</option>
          <option value="partial">Parcial</option>
          <option value="pending">Pendiente</option>
        </select>

        <select
          className="admin-logs-select"
          value={filters.habit_type}
          onChange={(e) => setFilters({ ...filters, habit_type: e.target.value })}
        >
          <option value="">Todos los tipos</option>
          <option value="exercise">Ejercicio</option>
          <option value="nutrition">Nutrición</option>
          <option value="sleep">Sueño</option>
          <option value="water">Agua</option>
          <option value="meditation">Meditación</option>
        </select>

        <input
          type="date"
          className="admin-logs-date"
          value={filters.date_from}
          onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
          placeholder="Desde"
        />

        <input
          type="date"
          className="admin-logs-date"
          value={filters.date_to}
          onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
          placeholder="Hasta"
        />

        <select
          className="admin-logs-select"
          value={filters.sort_by}
          onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
        >
          <option value="created_at">Fecha de creación</option>
          <option value="log_date">Fecha del registro</option>
          <option value="status">Estado</option>
          <option value="habit_id">Hábito</option>
        </select>

        <select
          className="admin-logs-select"
          value={filters.sort_order}
          onChange={(e) => setFilters({ ...filters, sort_order: e.target.value })}
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
        
        <button
          onClick={resetFilters}
          className="admin-logs-btn admin-logs-btn-secondary"
        >
          Limpiar
        </button>
      </div>

      {/* Table Content */}
      <div className="admin-logs-content">
        {logs.length === 0 ? (
          <div className="admin-logs-empty">
            <div className="admin-logs-empty-icon">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="admin-logs-empty-title">No se encontraron registros</h3>
            <p className="admin-logs-empty-desc">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        ) : (
          <table className="admin-logs-table">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Hábito</th>
                <th>Fecha</th>
                <th>Estado</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div className="admin-logs-user-info">
                      <div className="admin-logs-user-name">
                        {log.habit?.user?.name || 'Usuario no encontrado'}
                      </div>
                      <div className="admin-logs-user-email">
                        {log.habit?.user?.email || 'Email no disponible'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-logs-habit-info">
                      <div className="admin-logs-habit-name">
                        {log.habit?.name || 'Hábito no encontrado'}
                      </div>
                      <div className="admin-logs-habit-type">
                        {log.habit?.type || 'Tipo no disponible'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-logs-date-info">
                      {new Date(log.log_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-logs-status ${getStatusClass(log.status)}`}>
                      {getStatusIcon(log.status)}
                      {getStatusLabel(log.status)}
                    </span>
                  </td>
                  <td>
                    <div className="admin-logs-notes">
                      {log.notes || 'Sin notas'}
                    </div>
                  </td>
                  <td>
                    <div className="admin-logs-actions">
                      <button
                        onClick={() => handleEdit(log)}
                        className="admin-logs-action-btn admin-logs-action-btn-edit"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(log)}
                        className="admin-logs-action-btn admin-logs-action-btn-delete"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleView(log)}
                        className="admin-logs-action-btn admin-logs-action-btn-view"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-logs-pagination">
          <div className="admin-logs-pagination-info">
            Mostrando página {currentPage} de {totalPages} ({totalLogs} registros total)
          </div>
          <div className="admin-logs-pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-logs-btn admin-logs-btn-secondary"
            >
              Anterior
            </button>
            <span className="admin-logs-pagination-page">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-logs-btn admin-logs-btn-secondary"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {showDeleteModal && (
        <ConfirmModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={confirmDelete}
          title="Eliminar Registro"
          message={`¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.`}
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
              <h3 className="admin-modal-title">Editar Registro</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="admin-modal-close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Fecha del Registro</label>
                <input
                  type="date"
                  value={editForm.log_date}
                  onChange={(e) => handleEditFormChange('log_date', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Estado</label>
                <select
                  value={editForm.status}
                  onChange={(e) => handleEditFormChange('status', e.target.value)}
                  className="admin-form-input"
                >
                  <option value="completed">Completado</option>
                  <option value="missed">Perdido</option>
                  <option value="partial">Parcial</option>
                  <option value="pending">Pendiente</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Fecha de Completado</label>
                <input
                  type="date"
                  value={editForm.completed_at}
                  onChange={(e) => handleEditFormChange('completed_at', e.target.value)}
                  className="admin-form-input"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Notas</label>
                <textarea
                  value={editForm.notes}
                  onChange={(e) => handleEditFormChange('notes', e.target.value)}
                  className="admin-form-input"
                  placeholder="Notas adicionales sobre el registro"
                  rows="3"
                />
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
      {showViewModal && viewingLog && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Detalles del Registro</h3>
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
                  <span className="admin-detail-value">{viewingLog.id}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Usuario:</label>
                  <span className="admin-detail-value">
                    {viewingLog.habit?.user?.name || 'N/A'} ({viewingLog.habit?.user?.email})
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Hábito:</label>
                  <span className="admin-detail-value">
                    {viewingLog.habit?.name || 'N/A'} ({viewingLog.habit?.type})
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Fecha del Registro:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingLog.log_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Estado:</label>
                  <span className={`admin-logs-status ${getStatusClass(viewingLog.status)}`}>
                    {getStatusIcon(viewingLog.status)}
                    {getStatusLabel(viewingLog.status)}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Fecha de Completado:</label>
                  <span className="admin-detail-value">
                    {viewingLog.completed_at ? new Date(viewingLog.completed_at).toLocaleDateString() : 'No completado'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Notas:</label>
                  <span className="admin-detail-value">
                    {viewingLog.notes || 'Sin notas'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Creado:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingLog.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Actualizado:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingLog.updated_at).toLocaleString()}
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
                  handleEdit(viewingLog);
                }}
                className="admin-btn admin-btn-primary"
              >
                Editar Registro
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogsTable; 