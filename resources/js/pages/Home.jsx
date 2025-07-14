import React from 'react';
import { Link } from 'react-router-dom';

// Puedes reemplazar este SVG por el logo real optimizado
const BonsaiLogo = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="36" cy="12" r="8" fill="#FACC15"/>
    <ellipse cx="20" cy="32" rx="14" ry="10" fill="#22c55e"/>
    <rect x="18" y="32" width="4" height="10" rx="2" fill="#14532d"/>
    <ellipse cx="24" cy="22" rx="10" ry="7" fill="#4ade80"/>
    <ellipse cx="30" cy="18" rx="6" ry="4" fill="#bbf7d0"/>
  </svg>
);

const features = [
  {
    icon: '📈',
    title: 'Seguimiento diario',
    desc: 'Registra y visualiza tu progreso de hábitos cada día.'
  },
  {
    icon: '🏆',
    title: 'Gamificación',
    desc: 'Desbloquea logros y gana puntos por tu constancia.'
  },
  {
    icon: '🔒',
    title: 'Seguridad',
    desc: 'Tus datos están protegidos y solo tú tienes acceso.'
  },
  {
    icon: '📊',
    title: 'Estadísticas',
    desc: 'Analiza tu avance con gráficas y reportes claros.'
  },
];

const steps = [
  {
    number: 1,
    title: 'Regístrate gratis',
    desc: 'Crea tu cuenta en segundos y accede desde cualquier dispositivo.',
    icon: '📝',
  },
  {
    number: 2,
    title: 'Crea tus hábitos personalizados',
    desc: 'Define tus metas diarias, semanales o mensuales según tus objetivos.',
    icon: '🎯',
  },
  {
    number: 3,
    title: 'Registra tu progreso fácilmente',
    desc: 'Marca tus hábitos cumplidos y añade notas o reflexiones.',
    icon: '✅',
  },
  {
    number: 4,
    title: 'Gana logros y mantente motivado',
    desc: 'Desbloquea insignias, sube de nivel y compite contigo mismo.',
    icon: '⭐',
  },
];

const benefits = [
  {
    icon: '⏰',
    title: 'Recordatorios inteligentes',
    desc: 'Recibe notificaciones para no olvidar tus hábitos.'
  },
  {
    icon: '📱',
    title: 'Sincronización multiplataforma',
    desc: 'Accede desde cualquier lugar y dispositivo.'
  },
  {
    icon: '🔐',
    title: 'Privacidad total',
    desc: 'Tus datos son solo tuyos, protegidos y cifrados.'
  },
  {
    icon: '🤝',
    title: 'Comunidad y retos',
    desc: 'Únete a retos mensuales y comparte logros.'
  },
];

const testimonials = [
  {
    quote: '“Zenith me ayudó a crear hábitos saludables y mantenerme motivado cada día.”',
    author: 'Carlos, 28 años'
  },
  {
    quote: '“Ahora soy más constante y veo mi progreso de forma clara.”',
    author: 'María, 32 años'
  },
  {
    quote: '“La gamificación me mantiene enganchado y motivado.”',
    author: 'Luis, 24 años'
  },
];

const Home = () => (
  <div className="home-bg">
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

    {/* Hero */}
    <section className="home-hero animate-fade-in">
      <div className="home-hero-content">
        <h1 className="home-hero-title">Alcanza tu mejor versión, un hábito a la vez.</h1>
        <p className="home-hero-desc">Crea, sigue y mejora tus hábitos con una experiencia moderna, motivadora y segura.</p>
        <Link to="/register" className="btn-primary home-hero-btn">Comienza ahora</Link>
      </div>
      <div className="home-hero-img">
        <BonsaiLogo />
      </div>
    </section>

    {/* Features */}
    <section className="home-features animate-fade-in">
      {features.map((f, i) => (
        <div className="feature-card animate-slide-in-up" style={{ animationDelay: `${i * 0.08}s` }} key={i}>
          <div className="feature-icon">{f.icon}</div>
          <h3 className="feature-title">{f.title}</h3>
          <p className="feature-desc">{f.desc}</p>
        </div>
      ))}
    </section>

    {/* How it works */}
    <section className="home-howitworks animate-fade-in">
      <h2 className="howitworks-title">¿Cómo funciona Zenith Lineup?</h2>
      <div className="howitworks-steps">
        {steps.map((step, i) => (
          <div className="howitworks-step animate-slide-in-up" style={{ animationDelay: `${0.1 + i * 0.08}s` }} key={i}>
            <div className="howitworks-step-icon">{step.icon}</div>
            <div className="howitworks-step-number">{step.number}</div>
            <h3 className="howitworks-step-title">{step.title}</h3>
            <p className="howitworks-step-desc">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Benefits */}
    <section className="home-benefits animate-fade-in">
      <h2 className="benefits-title">Beneficios destacados</h2>
      <div className="benefits-list">
        {benefits.map((b, i) => (
          <div className="benefit-card animate-slide-in-up" style={{ animationDelay: `${i * 0.08}s` }} key={i}>
            <div className="benefit-icon">{b.icon}</div>
            <h3 className="benefit-title">{b.title}</h3>
            <p className="benefit-desc">{b.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Testimonials */}
    <section className="home-testimonials animate-fade-in">
      <h2 className="testimonials-title">Testimonios</h2>
      <div className="testimonials-list">
        {testimonials.map((t, i) => (
          <blockquote className="testimonial-card animate-slide-in-up" style={{ animationDelay: `${i * 0.08}s` }} key={i}>
            <p className="testimonial-quote">{t.quote}</p>
            <footer className="testimonial-author">{t.author}</footer>
          </blockquote>
        ))}
      </div>
    </section>

    {/* CTA secundaria */}
    <section className="home-cta animate-fade-in">
      <h2 className="cta-title">¿Listo para transformar tu vida?</h2>
      <p className="cta-desc">Empieza gratis y únete a cientos de personas mejorando sus hábitos.</p>
      <Link to="/register" className="btn-primary home-cta-btn">Descubre cómo funciona</Link>
    </section>

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

export default Home; 