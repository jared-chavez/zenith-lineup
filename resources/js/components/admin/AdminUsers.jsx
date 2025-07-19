import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, UserCheck, UserX } from 'lucide-react';
import AdminTable from './AdminTable';
// Asegúrate de tener estos hooks implementados correctamente
import { useAdminUsers } from '../../hooks/useAdminUsers';
import { useAdminStore } from '../../stores/adminStore';
import useAuthStore from '../../stores/authStore';
import axios from 'axios'; // Added axios import for debugging

const AdminUsers = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const { users, loading, error, fetchUsers, deleteUser, updateUserStatus } = useAdminUsers();
  const { showNotification } = useAdminStore();
  
  // Debug: Verificar estado de autenticación
  const { user, token, isAuthenticated } = useAuthStore();

  // Debug: Mostrar información de autenticación
  useEffect(() => {
    console.log('========================');
  }, [token, isAuthenticated, user]);

  // Columnas de la tabla
  const userColumns = [
    {
      key: 'name',
      label: 'Nombre',
      sortable: true,
      render: (value, user) => (
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-sm font-medium text-blue-600">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{user.name || 'Sin nombre'}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rol',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value === 'admin'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-green-100 text-green-800'
        }`}>
          {value === 'admin' ? 'Administrador' : 'Usuario'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Estado',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {value ? 'Activo' : 'Inactivo'}
        </span>
      ),
    },
    {
      key: 'habits_count',
      label: 'Hábitos',
      sortable: true,
      render: (value) => <span className="text-sm text-gray-900">{value || 0}</span>,
    },
    {
      key: 'created_at',
      label: 'Fecha de registro',
      sortable: true,
      render: (value) => (
        <span className="text-sm text-gray-500">
          {new Date(value).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Acciones',
      sortable: false,
      render: (value, user) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleToggleStatus(user)}
            className={`p-1 rounded-md ${
              user.is_active ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
            }`}
            title={user.is_active ? 'Desactivar usuario' : 'Activar usuario'}
          >
            {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
          </button>
          <button
            onClick={() => handleDeleteUser(user.id)}
            className="p-1 rounded-md text-red-600 hover:bg-red-50"
            title="Eliminar usuario"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  // Cargar usuarios al montar el componente o cuando cambian filtros
  useEffect(() => {
    // Solo cargar si el usuario está autenticado y es admin
    if (isAuthenticated && user?.role === 'admin') {
      fetchUsers({
        page: currentPage,
        sort: sortColumn,
        direction: sortDirection,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    }
    // eslint-disable-next-line
  }, [currentPage, sortColumn, sortDirection, searchTerm, statusFilter, roleFilter, isAuthenticated, user]);

  // Handlers
  const handlePageChange = (page) => setCurrentPage(page);
  const handleSort = (column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  };
  const handleSelectionChange = (selectedIds) => setSelectedUsers(selectedIds);

  const handleToggleStatus = async (user) => {
    try {
      await updateUserStatus(user.id, !user.is_active);
      showNotification(`Usuario ${user.is_active ? 'desactivado' : 'activado'} exitosamente`, 'success');
      fetchUsers({
        page: currentPage,
        sort: sortColumn,
        direction: sortDirection,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    } catch (error) {
      showNotification('Error al cambiar el estado del usuario', 'error');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.')) return;
    try {
      await deleteUser(userId);
      showNotification('Usuario eliminado exitosamente', 'success');
      fetchUsers({
        page: currentPage,
        sort: sortColumn,
        direction: sortDirection,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    } catch (error) {
      showNotification('Error al eliminar el usuario', 'error');
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`¿Estás seguro de que quieres eliminar ${selectedUsers.length} usuarios? Esta acción no se puede deshacer.`)) return;
    try {
      await Promise.all(selectedUsers.map(id => deleteUser(id)));
      showNotification(`${selectedUsers.length} usuarios eliminados exitosamente`, 'success');
      setSelectedUsers([]);
      fetchUsers({
        page: currentPage,
        sort: sortColumn,
        direction: sortDirection,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    } catch (error) {
      showNotification('Error al eliminar usuarios', 'error');
    }
  };

  const handleBulkToggleStatus = async (activate) => {
    try {
      await Promise.all(selectedUsers.map(id => updateUserStatus(id, activate)));
      showNotification(`${selectedUsers.length} usuarios ${activate ? 'activados' : 'desactivados'} exitosamente`, 'success');
      setSelectedUsers([]);
      fetchUsers({
        page: currentPage,
        sort: sortColumn,
        direction: sortDirection,
        search: searchTerm,
        status: statusFilter,
        role: roleFilter,
      });
    } catch (error) {
      showNotification('Error al cambiar el estado de los usuarios', 'error');
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Nombre', 'Email', 'Rol', 'Estado', 'Hábitos', 'Fecha de registro'],
      ...(users?.data || []).map(user => [
        user.name || 'Sin nombre',
        user.email,
        user.role === 'admin' ? 'Administrador' : 'Usuario',
        user.is_active ? 'Activo' : 'Inactivo',
        user.habits_count || 0,
        new Date(user.created_at).toLocaleDateString('es-ES'),
      ]),
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mostrar error de autenticación si el usuario no es admin
  if (isAuthenticated && user?.role !== 'admin') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Acceso denegado</h3>
            <div className="mt-2 text-sm text-red-700">
              No tienes permisos de administrador para acceder a esta sección.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error si no está autenticado
  if (!isAuthenticated) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">No autenticado</h3>
            <div className="mt-2 text-sm text-yellow-700">
              Debes iniciar sesión para acceder a esta sección.
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error al cargar usuarios</h3>
            <div className="mt-2 text-sm text-red-700">{error.toString()}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Usuarios</h1>
          <p className="mt-1 text-sm text-gray-500">Administra los usuarios de la plataforma</p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-3">
          <button
            onClick={handleExport}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            {/* Búsqueda */}
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            {/* Botón de filtros */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </button>
          </div>
          {/* Filtros expandibles */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filtro de estado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>
                {/* Filtro de rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                  <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="all">Todos</option>
                    <option value="user">Usuarios</option>
                    <option value="admin">Administradores</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Acciones masivas */}
      {selectedUsers.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-blue-800">
                {selectedUsers.length} usuario(s) seleccionado(s)
              </span>
            </div>
            <div className="mt-3 sm:mt-0 flex items-center space-x-3">
              <button
                onClick={() => handleBulkToggleStatus(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <UserCheck className="h-4 w-4 mr-2" />
                Activar
              </button>
              <button
                onClick={() => handleBulkToggleStatus(false)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                <UserX className="h-4 w-4 mr-2" />
                Desactivar
              </button>
              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tabla */}
      <AdminTable
        data={users?.data || []}
        columns={userColumns}
        loading={loading}
        pagination={users?.pagination}
        selectedItems={selectedUsers}
        onSelectionChange={handleSelectionChange}
        onPageChange={handlePageChange}
        onSort={handleSort}
        sortColumn={sortColumn}
        sortDirection={sortDirection}
      />
    </div>
  );
};

export default AdminUsers; 