import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import TwoFactorVerificationModal from '../components/TwoFactorVerificationModal';

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

const Login = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [show2FAModal, setShow2FAModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState('');
    const { login, complete2FALogin, isLoading, error, clearError } = useAuthStore();
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const onSubmit = async (data) => {
        clearError();
        const result = await login(data);
        if (result.success) {
            navigate('/dashboard');
        } else if (result.requires2FA) {
            setPendingEmail(data.email);
            setShow2FAModal(true);
        }
    };

    const handle2FASuccess = (data) => {
        setShow2FAModal(false);
        navigate('/dashboard');
    };

    return (
      <div className="auth-bg-gradient min-h-screen flex items-center justify-center py-12 px-4">
        <div className="auth-container grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full max-w-4xl animate-fade-in">
          {/* Plato animado */}
          <div className="hidden md:flex flex-col items-center justify-center">
            <PlateSpinnerSVG />
            <h1 className="text-3xl font-bold text-gradient-green mt-8 mb-2 animate-slide-in-up">Bienvenido de nuevo</h1>
            <p className="text-gray-600 text-lg text-center animate-fade-in" style={{animationDelay: '0.2s'}}>Alcanza tu mejor versión, un hábito a la vez.</p>
          </div>

          {/* Card de login */}
          <div className="layer-elevated p-8 rounded-2xl shadow-xl w-full max-w-md animate-slide-in-up">
            <h2 className="text-2xl font-bold text-center mb-2 text-gradient-green">Iniciar sesión</h2>
            <p className="text-center text-gray-500 mb-6">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="text-green-600 font-semibold hover:underline">Regístrate aquí</Link>
            </p>
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md animate-fade-in">
                  {error}
                </div>
              )}
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
                    autoComplete="current-password"
                    {...register('password', {
                      required: 'La contraseña es requerida',
                      minLength: {
                        value: 8,
                        message: 'La contraseña debe tener al menos 8 caracteres'
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
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full py-2 text-lg font-semibold rounded-lg shadow-sm transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-5 w-5" />
                  ) : (
                    'Iniciar sesión'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        <TwoFactorVerificationModal
          isOpen={show2FAModal}
          onClose={() => setShow2FAModal(false)}
          onSuccess={handle2FASuccess}
          email={pendingEmail}
        />
      </div>
    );
};

export default Login; 