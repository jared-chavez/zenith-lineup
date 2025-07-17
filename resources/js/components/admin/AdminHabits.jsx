import React from 'react';
import { Target } from 'lucide-react';

const AdminHabits = () => {
    return (
        <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Hábitos</h1>
                <p className="text-gray-600 mt-1">
                    Administra hábitos, tipos y configuraciones del sistema
                </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Gestión de Hábitos</h3>
                <p className="text-gray-500 mb-4">
                    Esta sección permitirá gestionar hábitos, ver estadísticas, 
                    editar tipos y administrar configuraciones.
                </p>
                <p className="text-sm text-gray-400">
                    Implementación en progreso...
                </p>
            </div>
        </div>
    );
};

export default AdminHabits; 