import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Edit, Trash2, Filter, Calendar, CheckCircle, XCircle, Clock, FileText, User, Target } from "lucide-react";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import ConfirmModal from "../ConfirmModal";

const AdminLogsTable = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [editingLog, setEditingLog] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [logToDelete, setLogToDelete] = useState(null);

  const { success } = useNotificationStore();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/api/admin/logs", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          search: searchTerm,
          status: statusFilter,
          date: dateFilter,
        },
      });
      setLogs(response.data.logs || []);
    } catch (err) {
      handleError(err, 'fetching logs');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setShowEditModal(true);
  };

  const handleDelete = (log) => {
    setLogToDelete(log);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      const token = localStorage.getItem("token");
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

  const handleSaveEdit = async (logData) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/api/admin/logs/${editingLog.id}`, logData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowEditModal(false);
      setEditingLog(null);
      success('Registro actualizado correctamente');
      fetchLogs();
    } catch (err) {
      handleError(err, 'updating log');
    }
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

  const getStatusColor = (status) => {
    const colors = {
      'completed': 'badge-success',
      'missed': 'badge-danger',
      'partial': 'badge-warning',
      'pending': 'badge-secondary'
    };
    return colors[status] || 'badge-secondary';
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.habit?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || log.status === statusFilter;
    const matchesDate = !dateFilter || log.log_date === dateFilter;
    return matchesSearch && matchesStatus && matchesDate;
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
                  placeholder="Buscar registros por hábito, usuario o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-modern w-full pl-10 pr-4"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-modern"
              >
                <option value="">Todos los estados</option>
                <option value="completed">Completado</option>
                <option value="missed">Perdido</option>
                <option value="partial">Parcial</option>
                <option value="pending">Pendiente</option>
              </select>
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="input-modern"
              />
              <button
                onClick={fetchLogs}
                className="btn-primary layer-pressable"
              >
                <Filter size={18} />
                Filtrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-green-50 to-emerald-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-green-600" />
                      Registro
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
                      <Target className="h-4 w-4 mr-2 text-green-600" />
                      Hábito
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-green-600" />
                      Fecha
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Datos
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredLogs.map((log, index) => (
                  <tr 
                    key={log.id} 
                    className="layer-surface layer-interactive animate-fade-in hover:shadow-md transition-all duration-200"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                          <FileText className="h-5 w-5 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-gray-900">#{log.id}</div>
                          <div className="text-sm text-gray-600">{log.notes || 'Sin notas'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.user?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{log.user?.email || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{log.habit?.name || 'N/A'}</div>
                      <div className="text-sm text-gray-600">{log.habit?.type || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className={`badge-modern ml-2 ${getStatusColor(log.status)}`}>
                          {getStatusLabel(log.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(log.log_date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700">
                        {log.data ? (
                          <div className="space-y-1">
                            {Object.entries(JSON.parse(log.data)).map(([key, value]) => (
                              <div key={key} className="text-xs">
                                <span className="font-medium">{key}:</span> {value}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">Sin datos</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="btn-icon btn-ghost layer-pressable"
                          title="Editar registro"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(log)}
                          className="btn-icon btn-danger layer-pressable"
                          title="Eliminar registro"
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
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No se encontraron registros</p>
              <p className="text-gray-400 text-sm">Intenta ajustar los filtros de búsqueda</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal - Fitia Style */}
      {showEditModal && editingLog && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div className="flex items-center">
                <Edit className="h-5 w-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Editar Registro</h3>
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
                status: formData.get('status'),
                notes: formData.get('notes'),
                data: formData.get('data'),
                log_date: formData.get('log_date'),
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="label-modern">Estado</label>
                  <select
                    name="status"
                    defaultValue={editingLog.status}
                    className="input-modern w-full"
                  >
                    <option value="completed">Completado</option>
                    <option value="missed">Perdido</option>
                    <option value="partial">Parcial</option>
                    <option value="pending">Pendiente</option>
                  </select>
                </div>
                <div>
                  <label className="label-modern">Notas</label>
                  <textarea
                    name="notes"
                    defaultValue={editingLog.notes}
                    className="input-modern w-full"
                    rows="3"
                    placeholder="Notas adicionales sobre el registro..."
                  />
                </div>
                <div>
                  <label className="label-modern">Datos (JSON)</label>
                  <textarea
                    name="data"
                    defaultValue={editingLog.data}
                    className="input-modern w-full"
                    rows="4"
                    placeholder='{"duration": 30, "intensity": "medium"}'
                  />
                </div>
                <div>
                  <label className="label-modern">Fecha del Registro</label>
                  <input
                    type="date"
                    name="log_date"
                    defaultValue={editingLog.log_date}
                    className="input-modern w-full"
                  />
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
          setLogToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Eliminar Registro"
        message={`¿Estás seguro de que quieres eliminar este registro? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="danger"
      />
    </div>
  );
};

export default AdminLogsTable; 