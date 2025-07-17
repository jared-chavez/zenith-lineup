import React, { useEffect } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import useAdminStore from '../../stores/adminStore';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminOverview from '../../components/admin/AdminOverview';
import AdminUsers from '../../components/admin/AdminUsers';
import AdminHabits from '../../components/admin/AdminHabits';
import AdminLogs from '../../components/admin/AdminLogs';
import AdminAudit from '../../components/admin/AdminAudit';
import AdminSettings from '../../components/admin/AdminSettings';

const AdminDashboardNew = () => {
    const { activeTab, isInitialized } = useAdmin();
    const { stats } = useAdminStore();

    // Render content based on active tab
    const renderContent = () => {
        switch (activeTab) {
            case 'overview':
                return <AdminOverview stats={stats} />;
            case 'users':
                return <AdminUsers />;
            case 'habits':
                return <AdminHabits />;
            case 'logs':
                return <AdminLogs />;
            case 'audit':
                return <AdminAudit />;
            case 'settings':
                return <AdminSettings />;
            default:
                return <AdminOverview stats={stats} />;
        }
    };

    if (!isInitialized) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Inicializando dashboard...</p>
                    </div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-6">
                {renderContent()}
            </div>
        </AdminLayout>
    );
};

export default AdminDashboardNew; 