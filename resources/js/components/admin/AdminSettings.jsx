import React from 'react';
import { Settings } from 'lucide-react';

const AdminSettings = () => {
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600 mt-1">
                    Configura parámetros y ajustes del sistema
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Configuración del Sistema</h3>
                <p className="text-gray-500 mb-4">
                    Esta sección permitirá configurar parámetros del sistema, 
                    ajustes de seguridad, notificaciones y más.
                </p>
                <p className="text-sm text-gray-400">
                    Implementación en progreso...
                </p>
            </div>
        </div>
    );
};

export default AdminSettings; 