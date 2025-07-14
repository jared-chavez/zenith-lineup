import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Eye, Filter, Users, Shield, Calendar, Mail } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import ConfirmModal from "../ConfirmModal";

const AdminUsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const { success, error } = useNotificationStore();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchTerm,
          role: roleFilter,
        },
      });
      setUsers(response.data.users || []);
    } catch (err) {
      handleError(err, 'fetching users');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDelete = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
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

  const handleSaveEdit = async (userData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/users/${editingUser.id}`, userData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingUser(null);
      success('Usuario actualizado correctamente');
      fetchUsers();
    } catch (err) {
      handleError(err, 'updating user');
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
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
                  placeholder="Buscar usuarios por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full pl-10 pr-4"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-modern"
              >
                <option value="">Todos los roles</option>
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </select>
              <button
                onClick={fetchUsers}
                className="btn-primary layer-pressable"
              >
                <Filter size={18} />
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-green-600" />
                      Usuario
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-green-600" />
                      Email
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Shield className="h-4 w-4 mr-2 text-green-600" />
                      Rol
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Registro
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user.id} 
                    className="layer-surface layer-interactive animate-fade-in hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">{user.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge-modern ${
                        user.role === 'admin' 
                          ? 'badge-danger' 
                          : 'badge-success'
                      }`}>
                        {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="btn-icon btn-ghost layer-pressable"
                          title="Editar usuario"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="btn-icon btn-danger layer-pressable"
                          title="Eliminar usuario"
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
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron usuarios</p>
              <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Fitia Style */}
      {showEditModal && editingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Editar Usuario</h3>
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
                email: formData.get('email'),
                role: formData.get('role'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label-modern">Nombre</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name}
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-modern">Email</label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email}
                    className="input-modern w-full"
                    required
                  />
                </div>
                <div>
                  <label className="label-modern">Rol</label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    className="input-modern w-full"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </select>
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
          setUserToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Usuario"
        message={`¿Estás seguro de que quieres eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AdminUsersTable; 