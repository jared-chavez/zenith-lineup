import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';

// SVG animado de plato estilo Fitia
const PlateSpinnerSVG = () => (
  <div className="plate-spinner-outer">
    <svg className="plate-spinner" width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="90" cy="90" rx="80" ry="80" fill="#fff" stroke="#e5e7eb" strokeWidth="6"/>
      <ellipse cx="90" cy="90" rx="60" ry="60" fill="#f1f5f9" stroke="#22c55e" strokeWidth="4"/>
      <ellipse cx="90" cy="90" rx="35" ry="35" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
      <ellipse cx="90" cy="90" rx="15" ry="15" fill="#fff" stroke="#22c55e" strokeWidth="1.5"/>
      <ellipse cx="120" cy="70" rx="8" ry="5" fill="#facc15"/>
      <ellipse cx="65" cy="110" rx="6" ry="3" fill="#4ade80"/>
      <ellipse cx="110" cy="120" rx="5" ry="2.5" fill="#f87171"/>
    </svg>
  </div>
);

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const { register: registerUser, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
    } = useForm();

    const password = watch('password');

    const onSubmit = async (data) => {
        clearError();
        const result = await registerUser(data);
        if (result.success) {
            navigate('/dashboard');
        }
    };

    return (
      <div className="auth-bg-gradient min-h-screen flex items-center justify-center py-12 px-4">
        <div className="auth-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-4xl animate-fade-in">
          {/* Plato animado */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <PlateSpinnerSVG />
            <h1 className="text-3xl font-bold text-gradient-green mt-8 mb-2 animate-slide-in-up">Crea tu cuenta</h1>
            <p className="text-gray-600 text-lg text-center animate-fade-in" style={{animationDelay: '0.2s'}}>Empieza gratis y únete a Zenith Lineup.</p>
          </div>

          {/* Card de registro */}
          <div className="layer-elevated p-8 rounded-2xl shadow-xl w-full max-w-md animate-slide-in-up">
            <h2 className="text-2xl font-bold text-center mb-2 text-gradient-green">Crear cuenta</h2>
            <p className="text-center text-gray-500 mb-6">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="text-green-600 font-semibold hover:underline">Inicia sesión aquí</Link>
            </p>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-fade-in">
                  {error}
                </div>
              )}
              <div className="form-group">
                <label htmlFor="name" className="form-label">Nombre completo</label>
                <input
                  id="name"
                  type="text"
                  autoComplete="name"
                  {...register('name', {
                    required: 'El nombre es requerido',
                    minLength: {
                      value: 2,
                      message: 'El nombre debe tener al menos 2 caracteres'
                    }
                  })}
                  className={`input-fitia w-full ${errors.name ? 'border-red-300' : ''}`}
                  placeholder="Tu nombre completo"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">Correo electrónico</label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'El correo electrónico es requerido',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Correo electrónico inválido'
                    }
                  })}
                  className={`input-fitia w-full ${errors.email ? 'border-red-300' : ''}`}
                  placeholder="tu@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <div className="mt-1 relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres'
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial'
                      }
                    })}
                    className={`input-fitia w-full pr-10 ${errors.password ? 'border-red-300' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="password_confirmation" className="form-label">Confirmar contraseña</label>
                <div className="mt-1 relative">
                  <input
                    id="password_confirmation"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    {...register('password_confirmation', {
                      required: 'Debes confirmar la contraseña',
                      validate: value => value === password || 'Las contraseñas no coinciden'
                    })}
                    className={`input-fitia w-full pr-10 ${errors.password_confirmation ? 'border-red-300' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-600">{errors.password_confirmation.message}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-2 text-lg font-semibold rounded-lg shadow-sm transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    'Crear cuenta'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
};

export default Register; 