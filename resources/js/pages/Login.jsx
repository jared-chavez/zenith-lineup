import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import TwoFactorVerificationModal from '../components/TwoFactorVerificationModal';
import '../../css/auth-forms.css';

// SVG animado de plato estilo Fitia
const PlateSpinnerSVG = () => (
  <div className="auth-logo">
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="60" cy="60" rx="50" ry="50" fill="#fff" stroke="#e5e7eb" strokeWidth="4"/>
      <ellipse cx="60" cy="60" rx="35" ry="35" fill="#f1f5f9" stroke="#22c55e" strokeWidth="3"/>
      <ellipse cx="60" cy="60" rx="20" ry="20" fill="#bbf7d0" stroke="#16a34a" strokeWidth="2"/>
      <ellipse cx="60" cy="60" rx="8" ry="8" fill="#fff" stroke="#22c55e" strokeWidth="1"/>
      <ellipse cx="80" cy="45" rx="5" ry="3" fill="#facc15"/>
      <ellipse cx="45" cy="75" rx="4" ry="2" fill="#4ade80"/>
      <ellipse cx="75" cy="80" rx="3" ry="1.5" fill="#f87171"/>
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
            const { user } = useAuthStore.getState();
            if (user && user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
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
      <div className="auth-container">
        <div className="auth-card">
          {/* Logo animado */}
          <PlateSpinnerSVG />
          
          {/* Header */}
          <div className="auth-header">
            <h1 className="auth-title">Bienvenido de nuevo</h1>
            <p className="auth-subtitle">Alcanza tu mejor versión, un hábito a la vez.</p>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="auth-error mb-4">
                {error}
              </div>
            )}
            
            <div className="auth-form-group">
              <label htmlFor="email" className="auth-label">Correo electrónico</label>
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
                className={`auth-input ${errors.email ? 'error' : ''}`}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <div className="auth-error">{errors.email.message}</div>
              )}
            </div>

            <div className="auth-form-group">
              <label htmlFor="password" className="auth-label">Contraseña</label>
              <div className="auth-input-container">
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
                  className={`auth-input pr-12 ${errors.password ? 'error' : ''}`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="auth-input-icon"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <div className="auth-error">{errors.password.message}</div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="auth-button"
            >
              {isLoading ? (
                <div className="auth-spinner" />
              ) : (
                'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Enlace de registro */}
          <div className="text-center mt-6">
            <p className="auth-subtitle">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="auth-nav-link">
                Regístrate aquí
              </Link>
            </p>
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