import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Eye, Filter, Users, Shield, Calendar, Mail, Download, MoreHorizontal, RefreshCw, X } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import useAuthStore from "../../stores/authStore";
import useAdminFilters from "../../hooks/useAdminFilters";
import ConfirmModal from "../ConfirmModal";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingUser, setViewingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersPerPage] = useState(10);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: 'user',
    password: ''
  });

  const { success, error } = useNotificationStore();
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
    role: '',
    two_factor_enabled: '',
    activity_status: '',
    created_from: '',
    created_to: '',
    sort_by: 'created_at',
    sort_order: 'desc'
  });

  useEffect(() => {
    fetchUsers();
  }, [debouncedFilters, currentPage]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const response = await axios.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          ...debouncedFilters,
          page: currentPage,
          per_page: usersPerPage,
        },
      });
      
      // Manejar respuesta paginada
      if (response.data.users && response.data.users.data) {
        setUsers(response.data.users.data || []);
        setTotalPages(response.data.users.last_page || 1);
        setTotalUsers(response.data.users.total || 0);
      } else {
        setUsers(response.data.users || []);
        setTotalPages(1);
        setTotalUsers(response.data.users?.length || 0);
      }
      
    } catch (err) {
      handleError(err, 'fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setEditForm({
      name: user.name || '',
      email: user.email || '',
      role: user.role || 'user',
      password: ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleView = (user) => {
    setViewingUser(user);
    setShowViewModal(true);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveEdit = async () => {
    try {
      const updateData = { ...editForm };
      if (!updateData.password) {
        delete updateData.password;
      }

      await axios.put(`/api/admin/users/${editingUser.id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingUser(null);
      setEditForm({ name: '', email: '', role: 'user', password: '' });
      success('Usuario actualizado correctamente');
      fetchUsers();
    } catch (err) {
      handleError(err, 'updating user');
    }
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(`/api/admin/users/${userToDelete.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      success('Usuario eliminado correctamente');
      fetchUsers();
    } catch (err) {
      handleError(err, 'deleting user');
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) {
      error('Selecciona al menos un usuario');
      return;
    }

    try {
      await axios.post('/api/admin/users/bulk-action', {
        action,
        user_ids: selectedUsers
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      success(`Acción ${action} aplicada a ${selectedUsers.length} usuarios`);
      setSelectedUsers([]);
      fetchUsers();
    } catch (err) {
      handleError(err, 'bulk action');
    }
  };

  const handleExport = async () => {
    try {
      const response = await axios.post('/api/admin/users/export', {
        ...debouncedFilters,
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `usuarios-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      success('Exportación completada');
    } catch (err) {
      handleError(err, 'exporting users');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="admin-table-container">
        <div className="admin-table-loading">
          <div className="admin-table-loading-spinner"></div>
          Cargando usuarios...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      {/* Header */}
      <div className="admin-table-header">
        <h2 className="admin-table-title">Usuarios Registrados</h2>
        <p className="admin-table-subtitle">
          Gestiona todos los usuarios de la plataforma ({totalUsers} usuarios)
        </p>
        
        {/* Actions */}
        <div className="admin-table-filters">
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="admin-table-btn admin-table-btn-primary"
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

      {/* Filters */}
      <div className="admin-table-filters">
        <div className="admin-table-search">
          <Search className="admin-table-search-icon" />
          <input
            type="text"
            placeholder="Buscar usuarios..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
          />
        </div>
        
        <select
          className="admin-table-select"
          value={filters.role}
          onChange={(e) => setFilters({ ...filters, role: e.target.value })}
        >
          <option value="">Todos los roles</option>
          <option value="user">Usuario</option>
          <option value="admin">Administrador</option>
        </select>

        <select
          className="admin-table-select"
          value={filters.activity_status}
          onChange={(e) => setFilters({ ...filters, activity_status: e.target.value })}
        >
          <option value="">Todos los estados</option>
          <option value="active">Activo</option>
          <option value="inactive">Inactivo</option>
          <option value="new">Nuevo</option>
        </select>

        <select
          className="admin-table-select"
          value={filters.sort_by}
          onChange={(e) => setFilters({ ...filters, sort_by: e.target.value })}
        >
          <option value="created_at">Fecha de registro</option>
          <option value="name">Nombre</option>
          <option value="email">Email</option>
          <option value="last_login_at">Último login</option>
        </select>

        <select
          className="admin-table-select"
          value={filters.sort_order}
          onChange={(e) => setFilters({ ...filters, sort_order: e.target.value })}
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
        
        <button
          onClick={resetFilters}
          className="admin-table-btn admin-table-btn-secondary"
        >
          Limpiar
        </button>
      </div>

      {/* Table Content */}
      <div className="admin-table-content">
        {users.length === 0 ? (
          <div className="admin-table-empty">
            <div className="admin-table-empty-icon">
              <Users className="h-8 w-8" />
            </div>
            <h3 className="admin-table-empty-title">No se encontraron usuarios</h3>
            <p className="admin-table-empty-desc">
              Intenta ajustar los filtros de búsqueda
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
                    checked={selectedUsers.length === users.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                  />
                </th>
                <th>Usuario</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <input
                      type="checkbox"
                      className="admin-table-checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers([...selectedUsers, user.id]);
                        } else {
                          setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                        }
                      }}
                    />
                  </td>
                  <td>
                    <div className="admin-table-user-info">
                      <div className="admin-table-user-name">
                        {user.name || 'Sin nombre'}
                      </div>
                      <div className="admin-table-user-email">
                        ID: {user.id}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-user-email">
                      {user.email}
                    </div>
                  </td>
                  <td>
                    <span className={`admin-table-badge ${user.role === 'admin' ? 'admin-table-badge-exercise' : 'admin-table-badge-nutrition'}`}>
                      {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </td>
                  <td>
                    <span className={`admin-table-badge ${user.email_verified_at ? 'admin-table-badge-water' : 'admin-table-badge-sleep'}`}>
                      {user.email_verified_at ? 'Verificado' : 'Pendiente'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-table-habit-name">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td>
                    <div className="admin-table-actions">
                      <button
                        onClick={() => handleEdit(user)}
                        className="admin-table-action-btn admin-table-action-btn-edit"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="admin-table-action-btn admin-table-action-btn-delete"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleView(user)}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="admin-table-pagination">
          <div className="admin-table-pagination-info">
            Mostrando página {currentPage} de {totalPages} ({totalUsers} usuarios total)
          </div>
          <div className="admin-table-pagination-controls">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="admin-table-btn admin-table-btn-secondary"
            >
              Anterior
            </button>
            <span className="admin-table-pagination-page">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="admin-table-btn admin-table-btn-secondary"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <div className="admin-table-pagination">
          <div className="admin-table-pagination-info">
            {selectedUsers.length} usuarios seleccionados
          </div>
          <div className="admin-table-pagination-controls">
            <button
              onClick={() => handleBulkAction('activate')}
              className="admin-table-btn admin-table-btn-primary"
            >
              Activar
            </button>
            <button
              onClick={() => handleBulkAction('deactivate')}
              className="admin-table-btn admin-table-btn-secondary"
            >
              Desactivar
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
          title="Eliminar Usuario"
          message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
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
              <h3 className="admin-modal-title">Editar Usuario</h3>
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
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => handleEditFormChange('email', e.target.value)}
                  className="admin-form-input"
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Rol</label>
                <select
                  value={editForm.role}
                  onChange={(e) => handleEditFormChange('role', e.target.value)}
                  className="admin-form-input"
                >
                  <option value="user">Usuario</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Nueva Contraseña (opcional)</label>
                <input
                  type="password"
                  value={editForm.password}
                  onChange={(e) => handleEditFormChange('password', e.target.value)}
                  className="admin-form-input"
                  placeholder="Dejar vacío para mantener la actual"
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
      {showViewModal && viewingUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="admin-modal-header">
              <h3 className="admin-modal-title">Detalles del Usuario</h3>
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
                  <span className="admin-detail-value">{viewingUser.id}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Nombre:</label>
                  <span className="admin-detail-value">{viewingUser.name || 'Sin nombre'}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Email:</label>
                  <span className="admin-detail-value">{viewingUser.email}</span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Rol:</label>
                  <span className={`admin-table-badge ${viewingUser.role === 'admin' ? 'admin-table-badge-exercise' : 'admin-table-badge-nutrition'}`}>
                    {viewingUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Estado:</label>
                  <span className={`admin-table-badge ${viewingUser.email_verified_at ? 'admin-table-badge-water' : 'admin-table-badge-sleep'}`}>
                    {viewingUser.email_verified_at ? 'Verificado' : 'Pendiente'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">2FA Habilitado:</label>
                  <span className={`admin-table-badge ${viewingUser.two_factor_enabled ? 'admin-table-badge-water' : 'admin-table-badge-sleep'}`}>
                    {viewingUser.two_factor_enabled ? 'Sí' : 'No'}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Registrado:</label>
                  <span className="admin-detail-value">
                    {new Date(viewingUser.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="admin-detail-group">
                  <label className="admin-detail-label">Último login:</label>
                  <span className="admin-detail-value">
                    {viewingUser.last_login_at ? new Date(viewingUser.last_login_at).toLocaleString() : 'Nunca'}
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
                  handleEdit(viewingUser);
                }}
                className="admin-btn admin-btn-primary"
              >
                Editar Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersTable; 