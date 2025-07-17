# Infraestructura Backend del Frontend - Dashboard Admin

## 📁 Estructura de Archivos

```
resources/js/
├── hooks/
│   ├── useAdminAPI.js          # Hooks para APIs admin
│   └── index.js               # Exportaciones centralizadas
├── stores/
│   └── adminStore.js          # Estado global del admin
├── contexts/
│   └── AdminContext.jsx       # Contexto de autorización admin
├── components/
│   ├── LoadingSpinner.jsx     # Componente de carga
│   └── admin/
│       ├── AdminLayout.jsx    # Layout principal del admin
│       ├── AdminSidebar.jsx   # Barra lateral de navegación
│       ├── AdminHeader.jsx    # Header con controles
│       ├── AdminOverview.jsx  # Vista de resumen
│       ├── AdminUsers.jsx     # Gestión de usuarios (placeholder)
│       ├── AdminHabits.jsx    # Gestión de hábitos (placeholder)
│       ├── AdminLogs.jsx      # Registros de actividad (placeholder)
│       ├── AdminAudit.jsx     # Logs de auditoría (placeholder)
│       └── AdminSettings.jsx  # Configuración (placeholder)
└── pages/admin/
    └── AdminDashboardNew.jsx  # Dashboard principal
```

## 🎯 Componentes Principales

### 1. **Hooks de API (`useAdminAPI.js`)**
- **`useAdminAPI`**: Hook base para requests autenticados
- **`useAdminStats`**: Estadísticas del dashboard
- **`useAdminUsers`**: Gestión de usuarios
- **`useAdminHabits`**: Gestión de hábitos
- **`useAdminLogs`**: Gestión de logs
- **`useAdminAuditLogs`**: Logs de auditoría

### 2. **Store Global (`adminStore.js`)**
- Estado centralizado para toda la aplicación admin
- Manejo de filtros, paginación y selecciones
- Estado de UI (sidebar, tabs, etc.)

### 3. **Contexto de Admin (`AdminContext.jsx`)**
- Autorización y verificación de admin
- Inicialización automática del dashboard
- Auto-refresh de estadísticas
- Navegación automática

### 4. **Layout y Navegación**
- **`AdminLayout`**: Layout principal con sidebar y header
- **`AdminSidebar`**: Navegación colapsable
- **`AdminHeader`**: Header con controles y info de usuario

## 🔧 Características Implementadas

### ✅ **Infraestructura Backend Completa**
- Hooks para todas las APIs admin
- Manejo de errores y loading states
- Notificaciones automáticas
- Estado global centralizado

### ✅ **Autorización y Seguridad**
- Verificación automática de rol admin
- Redirección automática si no es admin
- Manejo de tokens y autenticación

### ✅ **UI/UX Moderna**
- Sidebar colapsable responsive
- Header con controles de refresh
- Loading states y spinners
- Diseño consistente con Tailwind

### ✅ **Funcionalidades Avanzadas**
- Auto-refresh configurable
- Filtros y paginación preparados
- Selección múltiple de elementos
- Exportación de datos

## 🚀 Uso Básico

```jsx
import { AdminProvider } from './contexts/AdminContext';
import AdminDashboardNew from './pages/admin/AdminDashboardNew';

function App() {
    return (
        <AdminProvider>
            <AdminDashboardNew />
        </AdminProvider>
    );
}
```

## 📊 Estado del Proyecto

### ✅ **Completado**
- [x] Hooks de API para todas las funcionalidades
- [x] Store global con estado completo
- [x] Contexto de autorización
- [x] Layout y navegación
- [x] Componente de overview funcional
- [x] Placeholders para todas las secciones

### 🔄 **En Progreso**
- [ ] Implementación de tablas de datos
- [ ] Filtros y búsqueda avanzada
- [ ] Exportación de datos
- [ ] Gráficos y visualizaciones

### 📋 **Próximos Pasos**
1. Implementar tablas de usuarios con paginación
2. Agregar filtros y búsqueda
3. Implementar gestión de hábitos
4. Agregar gráficos al overview
5. Implementar logs de auditoría
6. Configuración del sistema

## 🔗 Integración con Backend

La infraestructura está completamente integrada con las APIs que ya funcionan:

- ✅ `/api/admin/stats` - Estadísticas del dashboard
- ✅ `/api/admin/users` - Gestión de usuarios
- ✅ `/api/admin/habits` - Gestión de hábitos
- ✅ `/api/admin/logs` - Registros de actividad
- ✅ `/api/admin/audit-logs` - Logs de auditoría

## 🎨 Personalización

### Temas y Colores
- Sistema de colores consistente
- Fácil personalización con Tailwind
- Soporte para temas claro/oscuro

### Componentes Reutilizables
- `LoadingSpinner` con diferentes tamaños
- Cards de estadísticas configurables
- Layout responsive y accesible

## 📝 Notas de Desarrollo

- Todos los componentes usan Tailwind CSS
- Estado manejado con Zustand para performance
- Hooks personalizados para reutilización
- Contexto para autorización y estado global
- Componentes modulares y escalables 