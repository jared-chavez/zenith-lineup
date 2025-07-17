import { useCallback } from 'react';
import { useAdminAPI } from './useAdminAPI';
import useAdminStore from '../stores/adminStore';
import useNotificationStore from '../stores/notificationStore';

export const useAdminUsers = () => {
  const { makeAdminRequest, loading } = useAdminAPI();
  const { success, error } = useNotificationStore();
  const {
    users: storeUsers,
    setUsers: setStoreUsers,
    setUserFilters,
    setUserPagination,
    clearUserSelection
  } = useAdminStore();

  // Cargar usuarios
  const fetchUsers = useCallback(async ({
    page = 1,
    per_page = 10,
    sort = 'created_at',
    direction = 'desc',
    search = '',
    status = 'all',
    role = 'all',
  } = {}) => {
    try {
      const params = new URLSearchParams({
        page,
        per_page,
        sort,
        direction,
      });
      if (search) params.append('search', search);
      if (status !== 'all') params.append('status', status);
      if (role !== 'all') params.append('role', role);
      const response = await makeAdminRequest('GET', `/users?${params}`);
      setStoreUsers({
        data: response.data || [],
        pagination: response.pagination || {},
        loading: false
      });
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al cargar usuarios');
      throw err;
    }
  }, [makeAdminRequest, setStoreUsers, error]);

  // Actualizar estado de usuario
  const updateUserStatus = useCallback(async (userId, isActive) => {
    try {
      const response = await makeAdminRequest('PUT', `/users/${userId}/status`, { is_active: isActive });
      success(`Usuario ${isActive ? 'activado' : 'desactivado'} correctamente`);
      await fetchUsers();
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al actualizar estado del usuario');
      throw err;
    }
  }, [makeAdminRequest, success, error, fetchUsers]);

  // Eliminar usuario
  const deleteUser = useCallback(async (userId) => {
    try {
      const response = await makeAdminRequest('DELETE', `/users/${userId}`);
      success('Usuario eliminado correctamente');
      await fetchUsers();
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al eliminar usuario');
      throw err;
    }
  }, [makeAdminRequest, success, error, fetchUsers]);

  // Actualizar usuario
  const updateUser = useCallback(async (userId, userData) => {
    try {
      const response = await makeAdminRequest('PUT', `/users/${userId}`, userData);
      success('Usuario actualizado correctamente');
      await fetchUsers();
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al actualizar usuario');
      throw err;
    }
  }, [makeAdminRequest, success, error, fetchUsers]);

  // Obtener usuario específico
  const fetchUser = useCallback(async (userId) => {
    try {
      const response = await makeAdminRequest('GET', `/users/${userId}`);
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al cargar usuario');
      throw err;
    }
  }, [makeAdminRequest, error]);

  // Acciones masivas
  const bulkAction = useCallback(async (action, userIds) => {
    try {
      const response = await makeAdminRequest('POST', '/users/bulk-action', { action, user_ids: userIds });
      success(`Acción masiva ${action} aplicada correctamente`);
      clearUserSelection();
      await fetchUsers();
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al aplicar acción masiva');
      throw err;
    }
  }, [makeAdminRequest, success, error, clearUserSelection, fetchUsers]);

  // Exportar usuarios
  const exportUsers = useCallback(async (format = 'csv', filters = {}) => {
    try {
      const response = await makeAdminRequest('POST', '/users/export', { format, filters });
      success('Exportación iniciada correctamente');
      return response;
    } catch (err) {
      error(err.response?.data?.message || 'Error al exportar usuarios');
      throw err;
    }
  }, [makeAdminRequest, success, error]);

  // Filtros y paginación
  const setFilters = useCallback((filters) => setUserFilters(filters), [setUserFilters]);
  const setPagination = useCallback((pagination) => setUserPagination(pagination), [setUserPagination]);

  return {
    users: storeUsers.data || [],
    pagination: storeUsers.pagination,
    loading,
    fetchUsers,
    fetchUser,
    updateUser,
    updateUserStatus,
    deleteUser,
    bulkAction,
    exportUsers,
    setFilters,
    setPagination,
  };
}; 