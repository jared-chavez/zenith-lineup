import React, { useState } from 'react';
import { Heart, Share2, MessageCircle, Eye } from 'lucide-react';

const ExampleModernCard = () => {
    const [isLiked, setIsLiked] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    return (
        <div className="space-y-6 p-6">
            {/* Ejemplo 1: Card Básica con Capas */}
            <div className="layer-elevated layer-interactive animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gradient-green font-semibold text-lg">
                            Hábito Completado
                        </h3>
                        <span className="badge-success">Nuevo</span>
                    </div>
                    <p className="text-gray-600 mb-4">
                        ¡Excelente trabajo! Has completado tu hábito de ejercicio por 7 días consecutivos.
                    </p>
                    <div className="flex space-x-3">
                        <button className="btn-primary">
                            Ver Detalles
                        </button>
                        <button className="btn-outline">
                            Compartir
                        </button>
                    </div>
                </div>
            </div>

            {/* Ejemplo 2: Card con Micro-interacciones */}
            <div className="layer-floating animate-slide-in-up">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-gray-900">
                            Estadísticas de la Semana
                        </h3>
                        <div className="loading-spinner w-6 h-6"></div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gradient-green">85%</div>
                            <div className="text-sm text-gray-600">Completado</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">12</div>
                            <div className="text-sm text-gray-600">Hábitos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600">7</div>
                            <div className="text-sm text-gray-600">Días</div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button 
                            className="btn-ghost layer-pressable"
                            onClick={() => setIsLiked(!isLiked)}
                        >
                            <Heart 
                                className={`h-5 w-5 mr-2 transition-colors ${
                                    isLiked ? 'text-red-500 fill-current' : 'text-gray-400'
                                }`}
                            />
                            {isLiked ? 'Me gusta' : 'Me gusta'}
                        </button>
                        
                        <div className="flex space-x-2">
                            <button className="btn-ghost layer-pressable">
                                <Share2 className="h-5 w-5" />
                            </button>
                            <button className="btn-ghost layer-pressable">
                                <MessageCircle className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ejemplo 3: Card Interactiva con Animaciones */}
            <div className="layer-surface layer-interactive animate-fade-in">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Progreso del Hábito
                        </h3>
                        <button 
                            className="btn-ghost layer-pressable"
                            onClick={() => setShowDetails(!showDetails)}
                        >
                            <Eye className="h-5 w-5" />
                        </button>
                    </div>
                    
                    <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                            <span>Progreso</span>
                            <span>75%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-1000"
                                style={{ width: '75%' }}
                            ></div>
                        </div>
                    </div>

                    {showDetails && (
                        <div className="animate-slide-in-down transition-opacity">
                            <div className="bg-gradient-green rounded-xl p-4 mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">
                                    Detalles del Progreso
                                </h4>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• 6 de 8 días completados</li>
                                    <li>• Mejor racha: 5 días</li>
                                    <li>• Meta semanal: 80%</li>
                                </ul>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button className="btn-primary flex-1">
                            Completar Hoy
                        </button>
                        <button className="btn-secondary">
                            Posponer
                        </button>
                    </div>
                </div>
            </div>

            {/* Ejemplo 4: Glass Morphism Card */}
            <div className="glass rounded-2xl p-6 animate-fade-in">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">Z</span>
                    </div>
                    <h3 className="text-gradient-green font-bold text-xl mb-2">
                        Zenith Lineup
                    </h3>
                    <p className="text-gray-600 mb-4">
                        Tu compañero para construir hábitos saludables y alcanzar tus metas.
                    </p>
                    <div className="flex justify-center space-x-4">
                        <span className="badge-success">Hábitos</span>
                        <span className="badge-info">Progreso</span>
                        <span className="badge-warning">Metas</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExampleModernCard; 