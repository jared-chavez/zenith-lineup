import React from 'react';
import { Shield } from 'lucide-react';

const AdminAudit = () => {
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Logs de Auditoría</h1>
                <p className="text-gray-600 mt-1">
                    Revisa los logs de auditoría y cambios en el sistema
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Logs de Auditoría</h3>
                <p className="text-gray-500 mb-4">
                    Esta sección permitirá revisar logs de auditoría, ver cambios en el sistema, 
                    y monitorear actividades administrativas.
                </p>
                <p className="text-sm text-gray-400">
                    Implementación en progreso...
                </p>
            </div>
        </div>
    );
};

export default AdminAudit; 