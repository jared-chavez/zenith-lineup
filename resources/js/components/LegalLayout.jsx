import React from 'react';
import { Link } from 'react-router-dom';
import { BonsaiLogo } from '../pages/Home';

export const LegalLayout = ({ children }) => (
  <div className="home-bg min-h-screen flex flex-col">
    {/* Header */}
    <header className="home-header">
      <div className="home-header-left">
        <BonsaiLogo />
        <span className="home-title">Zenith Lineup</span>
      </div>
      <nav className="home-nav">
        <Link to="/login" className="btn-secondary">Iniciar sesión</Link>
        <Link to="/register" className="btn-primary">Registrarse</Link>
      </nav>
    </header>

    {/* Main legal content */}
    <main className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      {children}
    </main>

    {/* Footer actualizado */}
    <footer className="home-footer">
      <div>
        <span>© {new Date().getFullYear()} Zenith Lineup</span>
        <span className="footer-links">
          <Link to="/login">Ingresa por primera vez</Link> · <Link to="/terminos">Términos y Condiciones</Link> · <Link to="/privacidad">Política de Privacidad</Link>
        </span>
      </div>
    </footer>
  </div>
); 