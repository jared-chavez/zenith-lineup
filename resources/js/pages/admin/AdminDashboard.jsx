import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Shield, Users, Target, FileText, BarChart3, Settings, RefreshCw, LogOut } from "lucide-react";
import AdminUsersTable from "../../components/admin/AdminUsersTable";
import AdminHabitsTable from "../../components/admin/AdminHabitsTable";
import AdminLogsTable from "../../components/admin/AdminLogsTable";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";
import useAuthStore from '../../stores/authStore';

// --- HOOKS ADMIN API ---
export function useAdminStats() {
  const { token } = useAuthStore();
  const fetchStats = useCallback(async () => {
    const { data } = await axios.get('/api/admin/stats', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  return { fetchStats };
}

export function useAdminUsers() {
  const { token } = useAuthStore();
  const fetchUsers = useCallback(async () => {
    const { data } = await axios.get('/api/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const updateUser = useCallback(async (id, payload) => {
    const { data } = await axios.put(`/api/admin/users/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const deleteUser = useCallback(async (id) => {
    const { data } = await axios.delete(`/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  return { fetchUsers, updateUser, deleteUser };
}

export function useAdminHabits() {
  const { token } = useAuthStore();
  const fetchHabits = useCallback(async () => {
    const { data } = await axios.get('/api/admin/habits', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const updateHabit = useCallback(async (id, payload) => {
    const { data } = await axios.put(`/api/admin/habits/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const deleteHabit = useCallback(async (id) => {
    const { data } = await axios.delete(`/api/admin/habits/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  return { fetchHabits, updateHabit, deleteHabit };
}

export function useAdminLogs() {
  const { token } = useAuthStore();
  const fetchLogs = useCallback(async () => {
    const { data } = await axios.get('/api/admin/logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const updateLog = useCallback(async (id, payload) => {
    const { data } = await axios.put(`/api/admin/logs/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  const deleteLog = useCallback(async (id) => {
    const { data } = await axios.delete(`/api/admin/logs/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  return { fetchLogs, updateLog, deleteLog };
}

export function useAdminAuditLogs() {
  const { token } = useAuthStore();
  const fetchAuditLogs = useCallback(async () => {
    const { data } = await axios.get('/api/admin/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    return data;
  }, [token]);
  return { fetchAuditLogs };
}

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    users_count: 0,
    habits_count: 0,
    logs_count: 0,
  });
  const [loading, setLoading] = useState(true);

  const { success } = useNotificationStore();
  const { handleError } = useErrorHandler();
  const { logout, token } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setStats(response.data);
      success('Estadísticas actualizadas correctamente');
    } catch (error) {
      handleError(error, 'fetching admin stats');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", name: "Resumen", icon: BarChart3 },
    { id: "users", name: "Usuarios", icon: Users },
    { id: "habits", name: "Hábitos", icon: Target },
    { id: "logs", name: "Registros", icon: FileText },
  ];

  const renderOverview = () => (
    <div className="admin-content">
      {/* Welcome Section */}
      <div className="admin-welcome">
        <h2 className="admin-welcome-title">¡Bienvenido al Panel de Administración!</h2>
        <p className="admin-welcome-desc">Gestiona y supervisa toda la actividad de Zenith Lineup desde un solo lugar.</p>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <button
          onClick={() => setActiveTab("users")}
          className="admin-action-card"
        >
          <div className="admin-action-icon">
            <Users className="h-6 w-6" />
          </div>
          <h3 className="admin-action-title">Gestionar Usuarios</h3>
          <p className="admin-action-desc">Ver, editar y administrar usuarios registrados</p>
        </button>
        
        <button
          onClick={() => setActiveTab("habits")}
          className="admin-action-card"
        >
          <div className="admin-action-icon">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="admin-action-title">Ver Hábitos</h3>
          <p className="admin-action-desc">Administrar y revisar hábitos de usuarios</p>
        </button>
        
        <button
          onClick={() => setActiveTab("logs")}
          className="admin-action-card"
        >
          <div className="admin-action-icon">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="admin-action-title">Revisar Logs</h3>
          <p className="admin-action-desc">Explorar registros y actividad de usuarios</p>
        </button>
        
        <button
          onClick={fetchStats}
          disabled={loading}
          className="admin-action-card"
        >
          <div className="admin-action-icon">
            <RefreshCw className={`h-6 w-6 ${loading ? 'animate-spin' : ''}`} />
          </div>
          <h3 className="admin-action-title">Actualizar Stats</h3>
          <p className="admin-action-desc">Refrescar datos y estadísticas</p>
        </button>
      </div>

      {/* System Status */}
      <div className="admin-system-status">
        <h3 className="admin-status-title">
          <Settings className="h-5 w-5" />
          Estado del Sistema
        </h3>
        <div className="admin-status-item">
          <span className="admin-status-label">Servidor API</span>
          <span className="admin-status-value online">En línea</span>
        </div>
        <div className="admin-status-item">
          <span className="admin-status-label">Base de datos</span>
          <span className="admin-status-value online">Conectado</span>
        </div>
        <div className="admin-status-item">
          <span className="admin-status-label">Última actualización</span>
          <span className="admin-status-value">{new Date().toLocaleString()}</span>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="admin-content">
      <AdminUsersTable />
    </div>
  );

  const renderHabits = () => (
    <div className="admin-content">
      <AdminHabitsTable />
    </div>
  );

  const renderLogs = () => (
    <div className="admin-content">
      <AdminLogsTable />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return renderOverview();
      case "users":
        return renderUsers();
      case "habits":
        return renderHabits();
      case "logs":
        return renderLogs();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-left">
          <div className="admin-icon">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="admin-title">Panel de Administración</h1>
            <p className="admin-subtitle">Gestiona usuarios, hábitos y registros de Zenith Lineup</p>
          </div>
        </div>
        <button onClick={logout} className="admin-logout-btn">
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>

      {/* Stats */}
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Users className="h-6 w-6" />
          </div>
          <div className="admin-stat-label">Total Usuarios</div>
          <div className="admin-stat-value">{stats.users_count}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <Target className="h-6 w-6" />
          </div>
          <div className="admin-stat-label">Total Hábitos</div>
          <div className="admin-stat-value">{stats.habits_count}</div>
        </div>
        <div className="admin-stat-card">
          <div className="admin-stat-icon">
            <FileText className="h-6 w-6" />
          </div>
          <div className="admin-stat-label">Total Registros</div>
          <div className="admin-stat-value">{stats.logs_count}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default AdminDashboard; 