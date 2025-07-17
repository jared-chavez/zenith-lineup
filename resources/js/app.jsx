import React from 'react';
import { createRoot } from 'react-dom/client';
import MainApp from './MainApp.jsx';
import '../css/app.css';
import './bootstrap';

// Error boundary component
function ErrorBoundary({ children }) {
    return (
        <div>
            {children}
        </div>
    );
}

// Main app with error handling
function App() {
    return (
        <ErrorBoundary>
            <MainApp />
        </ErrorBoundary>
    );
}

// Mount with error handling
const root = createRoot(document.getElementById('app'));
root.render(<App />);