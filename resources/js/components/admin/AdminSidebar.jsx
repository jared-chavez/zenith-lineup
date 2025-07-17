import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
    BarChart3, 
    Users, 
    Target, 
    FileText, 
    Shield, 
    Settings, 
    Menu,
    X,
    LogOut
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import useAuthStore from '../../stores/authStore';

const AdminSidebar = () => {
    const location = useLocation();
    const { sidebarCollapsed, toggleSidebar, activeTab, setActiveTab } = useAdmin();
    const { logout } = useAuthStore();

    const navigation = [
        { 
            id: 'overview', 
            name: 'Resumen', 
            icon: BarChart3, 
            href: '/admin',
            description: 'Vista general del sistema'
        },
        { 
            id: 'users', 
            name: 'Usuarios', 
            icon: Users, 
            href: '/admin/users',
            description: 'Gestión de usuarios'
        },
        { 
            id: 'habits', 
            name: 'Hábitos', 
            icon: Target, 
            href: '/admin/habits',
            description: 'Administrar hábitos'
        },
        { 
            id: 'logs', 
            name: 'Registros', 
            icon: FileText, 
            href: '/admin/logs',
            description: 'Ver registros de actividad'
        },
        { 
            id: 'audit', 
            name: 'Auditoría', 
            icon: Shield, 
            href: '/admin/audit',
            description: 'Logs de auditoría'
        },
        { 
            id: 'settings', 
            name: 'Configuración', 
            icon: Settings, 
            href: '/admin/settings',
            description: 'Configuración del sistema'
        }
    ];

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <>
            {/* Mobile sidebar backdrop */}
            <div 
                className={`fixed inset-0 z-40 lg:hidden ${sidebarCollapsed ? 'hidden' : 'block'}`}
                onClick={toggleSidebar}
            >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
            </div>

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
                ${sidebarCollapsed ? '-translate-x-full' : 'translate-x-0'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="ml-2 text-xl font-semibold text-gray-900">
                                Admin Panel
                            </span>
                        </div>
                        <button
                            onClick={toggleSidebar}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeTab === item.id;
                            
                            return (
                                <Link
                                    key={item.id}
                                    to={item.href}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`
                                        group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                                        ${isActive 
                                            ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }
                                    `}
                                    title={item.description}
                                >
                                    <Icon className={`
                                        mr-3 h-5 w-5 flex-shrink-0
                                        ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                                    `} />
                                    <span className="truncate">{item.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Footer */}
                    <div className="flex-shrink-0 p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="group flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200"
                        >
                            <LogOut className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                            <span>Cerrar Sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-md bg-white shadow-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                    <Menu className="h-5 w-5" />
                </button>
            </div>
        </>
    );
};

export default AdminSidebar; 