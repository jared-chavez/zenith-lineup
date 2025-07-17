import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Home, Target, User, Menu, X, Activity, Shield, Star } from 'lucide-react';
import useAuthStore from '../stores/authStore';
import { useState } from 'react';

const Layout = () => {
    const { logout, user } = useAuthStore();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: Home },
        { name: 'Hábitos', href: '/habits', icon: Target },
        { name: 'Registros', href: '/logs', icon: Activity },
        { name: 'Perfil', href: '/profile', icon: User },
    ];

    // Add admin navigation for admin users
    const adminNavigation = user?.role === 'admin' ? [
        { name: 'Admin', href: '/admin', icon: Shield },
    ] : [];

    const handleLogout = async () => {
        await logout();
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="user-layout-container">
            {/* Mobile menu button */}
            <div className="user-mobile-menu-btn">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="user-mobile-menu-btn"
                >
                    {isMobileMenuOpen ? <X size={24} className="text-green-600" /> : <Menu size={24} className="text-green-600" />}
                </button>
            </div>

            {/* Sidebar */}
            <aside className={`user-sidebar ${isMobileMenuOpen ? 'mobile-visible' : 'mobile-hidden'}`}>
                {/* Logo */}
                <div className="user-sidebar-logo">
                    <div className="user-logo-container">
                        <div className="user-logo-icon">
                            <Star className="h-6 w-6 text-white" strokeWidth={2.5} />
                        </div>
                        <h1 className="user-logo-text">
                            Zenith Lineup
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="user-navigation">
                    <div className="user-nav-section">
                        <h2 className="user-nav-section-title">
                            Navegación
                        </h2>
                        <div className="user-nav-links">
                            {navigation.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.href}
                                        className={`user-nav-link ${isActive(item.href) ? 'active' : ''}`}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        <Icon size={22} className="user-nav-icon" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    
                    {adminNavigation.length > 0 && (
                        <div className="user-nav-section">
                            <h2 className="user-nav-section-title">
                                Administración
                            </h2>
                            <div className="user-nav-links">
                                {adminNavigation.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <Link
                                            key={item.name}
                                            to={item.href}
                                            className={`user-nav-link admin ${isActive(item.href) ? 'active' : ''}`}
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Icon size={22} className="user-nav-icon" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </nav>

                {/* User info and logout */}
                <div className="user-info-section">
                    <div className="user-info-container">
                        <div className="user-avatar">
                            <span className="user-avatar-text">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                        </div>
                        <div className="user-details">
                            <p className="user-name">{user?.name}</p>
                            <p className="user-email">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="user-logout-btn"
                    >
                        <LogOut size={20} className="user-logout-icon" />
                        Cerrar sesión
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="user-main-content">
                {/* Mobile overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="user-mobile-overlay"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />
                )}
                <main className="user-main-wrapper">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout; 