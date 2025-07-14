import React, { useState, useEffect } from "react";
import axios from "axios";
import { Shield, Users, Target, FileText, BarChart3, Settings, RefreshCw } from "lucide-react";
import AdminUsersTable from "../../components/admin/AdminUsersTable";
import AdminHabitsTable from "../../components/admin/AdminHabitsTable";
import AdminLogsTable from "../../components/admin/AdminLogsTable";
import useNotificationStore from "../../stores/notificationStore";
import useErrorHandler from "../../hooks/useErrorHandler";

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

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
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
    <div className="space-y-8">
      {/* Stats Cards - Fitia Style */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="layer-elevated layer-interactive animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-blue-600">
                  {loading ? (
                    <div className="loading-spinner w-6 h-6"></div>
                  ) : (
                    stats.users_count
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="layer-elevated layer-interactive animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Hábitos</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? (
                    <div className="loading-spinner w-6 h-6"></div>
                  ) : (
                    stats.habits_count
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="layer-elevated layer-interactive animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">Total Registros</p>
                <p className="text-2xl font-bold text-purple-600">
                  {loading ? (
                    <div className="loading-spinner w-6 h-6"></div>
                  ) : (
                    stats.logs_count
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Settings className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Acciones Rápidas</h3>
            </div>
            <button
              onClick={fetchStats}
              className="btn-ghost layer-pressable"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => setActiveTab("users")}
              className="layer-surface layer-interactive animate-fade-in p-6 rounded-xl text-center hover:shadow-md transition-all duration-200"
              style={{ animationDelay: '0.4s' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <p className="font-medium text-gray-900">Gestionar Usuarios</p>
              <p className="text-sm text-gray-500 mt-1">Ver y editar usuarios</p>
            </button>
            
            <button
              onClick={() => setActiveTab("habits")}
              className="layer-surface layer-interactive animate-fade-in p-6 rounded-xl text-center hover:shadow-md transition-all duration-200"
              style={{ animationDelay: '0.5s' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <p className="font-medium text-gray-900">Ver Hábitos</p>
              <p className="text-sm text-gray-500 mt-1">Administrar hábitos</p>
            </button>
            
            <button
              onClick={() => setActiveTab("logs")}
              className="layer-surface layer-interactive animate-fade-in p-6 rounded-xl text-center hover:shadow-md transition-all duration-200"
              style={{ animationDelay: '0.6s' }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <p className="font-medium text-gray-900">Revisar Logs</p>
              <p className="text-sm text-gray-500 mt-1">Ver registros</p>
            </button>
            
            <button
              onClick={fetchStats}
              className="layer-surface layer-interactive animate-fade-in p-6 rounded-xl text-center hover:shadow-md transition-all duration-200"
              style={{ animationDelay: '0.7s' }}
              disabled={loading}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <RefreshCw className={`h-6 w-6 text-amber-600 ${loading ? 'animate-spin' : ''}`} />
              </div>
              <p className="font-medium text-gray-900">Actualizar Stats</p>
              <p className="text-sm text-gray-500 mt-1">Refrescar datos</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="layer-elevated animate-fade-in">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Usuarios</h3>
          </div>
          <p className="text-gray-600">
            Aquí podrás ver, editar y gestionar todos los usuarios registrados en la plataforma.
          </p>
        </div>
      </div>
      <AdminUsersTable />
    </div>
  );

  const renderHabits = () => (
    <div className="space-y-6">
      <div className="layer-elevated animate-fade-in">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <Target className="h-5 w-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Hábitos</h3>
          </div>
          <p className="text-gray-600">
            Administra todos los hábitos creados en la plataforma por los usuarios.
          </p>
        </div>
      </div>
      <AdminHabitsTable />
    </div>
  );

  const renderLogs = () => (
    <div className="space-y-6">
      <div className="layer-elevated animate-fade-in">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <FileText className="h-5 w-5 text-purple-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Gestión de Registros</h3>
          </div>
          <p className="text-gray-600">
            Revisa y filtra todos los registros de hábitos de los usuarios de la plataforma.
          </p>
        </div>
      </div>
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
    <div className="space-y-8">
      {/* Header - Fitia Style */}
      <div className="layer-elevated animate-fade-in">
        <div className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gradient-green mb-2">
                Panel de Administración
              </h1>
              <p className="text-gray-600 text-lg">
                Gestiona usuarios, hábitos y registros de Zenith Lineup
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs - Fitia Style */}
      <div className="layer-surface animate-fade-in">
        <div className="p-2">
          <nav className="flex space-x-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="animate-fade-in">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard; 