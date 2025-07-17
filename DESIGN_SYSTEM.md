# Zenith Lineup - Design System

## 🎨 Sistema de Diseño Moderno Inspirado en Fitia

### 📋 Resumen
Este sistema de diseño implementa un enfoque moderno con **capas**, **animaciones** y un **tema verde inspirado en Fitia** para crear una experiencia de usuario consistente y atractiva.

---

## 🏗️ Sistema de Capas

### Clases Base de Capas
```css
.layer-base          /* Posicionamiento relativo */
.layer-surface       /* Superficie básica con sombra suave */
.layer-elevated      /* Superficie elevada con sombra media */
.layer-floating      /* Elemento flotante con sombra grande */
.layer-modal         /* Modal con sombra extra grande */
.layer-overlay       /* Overlay con blur de fondo */
```

### Estados Interactivos
```css
.layer-interactive   /* Hover: escala + sombra, Active: escala reducida */
.layer-pressable     /* Active: escala reducida (para botones) */
```

### Uso Recomendado
- **Cards y contenedores**: `.layer-surface` o `.layer-elevated`
- **Modales y dropdowns**: `.layer-floating` o `.layer-modal`
- **Botones y elementos interactivos**: `.layer-interactive`
- **Overlays**: `.layer-overlay`

---

## ✨ Sistema de Animaciones

### Animaciones de Entrada
```css
.animate-fade-in         /* Fade in suave */
.animate-slide-in-up     /* Deslizar desde abajo */
.animate-slide-in-down   /* Deslizar desde arriba */
.animate-slide-in-left   /* Deslizar desde la izquierda */
.animate-slide-in-right  /* Deslizar desde la derecha */
.animate-zoom-in         /* Zoom in */
.animate-zoom-in-95      /* Zoom in sutil (95%) */
.animate-scale-in        /* Escala in */
```

### Animaciones de Salida
```css
.animate-fade-out        /* Fade out */
.animate-slide-out-up    /* Deslizar hacia arriba */
.animate-slide-out-down  /* Deslizar hacia abajo */
.animate-slide-out-left  /* Deslizar hacia la izquierda */
.animate-slide-out-right /* Deslizar hacia la derecha */
.animate-zoom-out        /* Zoom out */
.animate-scale-out       /* Escala out */
```

### Micro-interacciones
```css
.animate-bounce-subtle   /* Bounce sutil */
.animate-pulse-subtle    /* Pulse sutil */
.animate-shimmer         /* Efecto shimmer */
```

---

## 🎯 Sistema de Transiciones

### Transiciones Base
```css
.transition-base     /* 200ms ease-out */
.transition-fast     /* 150ms ease-out */
.transition-slow     /* 300ms ease-out */
.transition-bounce   /* 200ms ease-bounce */
```

### Transiciones Específicas
```css
.transition-opacity   /* Solo opacidad */
.transition-transform /* Solo transformaciones */
.transition-colors    /* Solo colores */
.transition-shadow    /* Solo sombras */
.transition-scale     /* Solo escala */
```

---

## 🌿 Tema Fitia - Colores y Estilos

### Paleta de Colores Verde
```css
--fitia-green-50: #f0fdf4   /* Verde muy claro */
--fitia-green-100: #dcfce7  /* Verde claro */
--fitia-green-500: #22c55e  /* Verde principal */
--fitia-green-600: #16a34a  /* Verde oscuro */
--fitia-green-900: #14532d  /* Verde muy oscuro */
```

### Componentes Estilizados

#### Botones
```css
.btn-primary      /* Gradiente verde */
.btn-secondary    /* Gris con hover */
.btn-danger       /* Gradiente rojo */
.btn-outline      /* Borde verde, texto verde */
.btn-ghost        /* Transparente con hover */
```

#### Inputs
```css
.input-fitia      /* Borde redondeado, focus verde */
```

#### Badges
```css
.badge-success    /* Verde con gradiente */
.badge-warning    /* Ámbar con gradiente */
.badge-error      /* Rojo con gradiente */
.badge-info       /* Azul con gradiente */
```

#### Efectos Especiales
```css
.glass            /* Glass morphism */
.gradient-green   /* Fondo verde gradiente */
.text-gradient-green /* Texto con gradiente verde */
```

---

## 🔧 Uso Práctico

### Ejemplo de Card Moderna
```html
<div class="layer-elevated layer-interactive animate-fade-in">
    <div class="p-6">
        <h3 class="text-gradient-green font-semibold">Título</h3>
        <p class="text-gray-600">Contenido...</p>
        <button class="btn-primary">Acción</button>
    </div>
</div>
```

### Ejemplo de Modal
```html
<div class="layer-overlay animate-fade-in">
    <div class="layer-modal animate-zoom-in-95">
        <!-- Contenido del modal -->
    </div>
</div>
```

### Ejemplo de Notificación
```html
<div class="notification-toast-base notification-toast-success animate-slide-in-right">
    <!-- Contenido de notificación -->
</div>
```

---

## 📱 Responsive y Accesibilidad

### Breakpoints
- **Mobile**: `< 768px`
- **Tablet**: `768px - 1024px`
- **Desktop**: `> 1024px`

### Accesibilidad
- **Focus rings**: Verde (`focus:ring-green-500`)
- **Contraste**: Cumple WCAG AA
- **Animaciones**: Respetan `prefers-reduced-motion`

---

## 🚀 Mejores Prácticas

### ✅ Recomendado
- Usar capas apropiadas para el contexto
- Combinar animaciones con transiciones
- Mantener consistencia en colores
- Usar gradientes para elementos importantes

### ❌ Evitar
- Múltiples animaciones simultáneas
- Colores que no están en la paleta
- Capas inconsistentes
- Transiciones muy largas (>500ms)

---

## 🎨 Personalización

### Variables CSS Disponibles
```css
:root {
    --fitia-green-50: #f0fdf4;
    --fitia-green-500: #22c55e;
    --fitia-light-bg: #ffffff;
    --fitia-light-text: #1e293b;
    /* ... más variables */
}
```

### Extensión del Sistema
Para agregar nuevos componentes:
1. Seguir la nomenclatura existente
2. Usar las variables CSS disponibles
3. Incluir estados hover/focus
4. Agregar animaciones apropiadas

---

## 📚 Recursos

- **Tailwind CSS**: Base del sistema
- **Lucide Icons**: Iconografía consistente
- **CSS Variables**: Para personalización
- **Keyframes**: Para animaciones complejas

---

*Este sistema de diseño está diseñado para evolucionar con las necesidades del proyecto mientras mantiene la consistencia visual y la experiencia de usuario.* 