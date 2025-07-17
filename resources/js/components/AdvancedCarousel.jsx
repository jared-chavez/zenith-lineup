import React, { useState, useEffect, useRef } from "react";
import "../../css/advanced-carousel.css";

const carouselData = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    alt: "Ensalada fresca con vegetales coloridos",
    slogan: "Nutre tu cuerpo, fortalece tu mente",
    subtitle: "Alimentos frescos para una vida saludable"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80",
    alt: "Bowl saludable con granos y vegetales",
    slogan: "Cada bocado cuenta",
    subtitle: "Construye hábitos que transforman tu vida"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=1200&q=80",
    alt: "Frutas variadas y coloridas",
    slogan: "Energía natural en cada momento",
    subtitle: "Descubre el poder de los alimentos naturales"
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=1200&q=80",
    alt: "Salmón y vegetales asados",
    slogan: "Proteína y vegetales para tu fuerza",
    subtitle: "Combina sabores, potencia tu rendimiento"
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1494859802809-d069c3b71a8a?auto=format&fit=crop&w=1200&q=80",
    alt: "Avena con frutas y semillas",
    slogan: "Desayunos que nutren tu día",
    subtitle: "Comienza cada mañana con energía renovada"
  }
];

const AdvancedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const intervalRef = useRef(null);

  const nextSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => (prev + 1) % carouselData.length);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const prevSlide = () => {
    if (!isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex((prev) => 
        prev === 0 ? carouselData.length - 1 : prev - 1
      );
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  const goToSlide = (index) => {
    if (!isTransitioning && index !== currentIndex) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 500);
    }
  };

  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [currentIndex, isTransitioning]);

  const currentSlide = carouselData[currentIndex];

  return (
    <div className="advanced-carousel">
      {/* Contenedor principal del carrusel */}
      <div className="carousel-container">
        {/* Imagen de fondo con blur */}
        <div className="carousel-background">
          <img 
            src={currentSlide.image} 
            alt={currentSlide.alt}
            className={`carousel-bg-image ${isTransitioning ? 'transitioning' : ''}`}
          />
          <div className="carousel-overlay"></div>
        </div>

        {/* Contenido del carrusel - Layout horizontal */}
        <div className="carousel-content">
          {/* Columna izquierda - Slogan */}
          <div className="carousel-left">
            <div className="carousel-slogan">
              <h2 className="slogan-text">{currentSlide.slogan}</h2>
              <p className="slogan-subtitle">{currentSlide.subtitle}</p>
            </div>
          </div>

          {/* Columna derecha - Imagen principal */}
          <div className="carousel-right">
            <div className="carousel-main-image">
              <img 
                src={currentSlide.image} 
                alt={currentSlide.alt}
                className={`main-image ${isTransitioning ? 'transitioning' : ''}`}
              />
              <div className="image-overlay"></div>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <div className="carousel-navigation">
          <button 
            onClick={prevSlide}
            className="nav-button nav-prev"
            aria-label="Imagen anterior"
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button 
            onClick={nextSlide}
            className="nav-button nav-next"
            aria-label="Siguiente imagen"
          >
            <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Indicadores */}
        <div className="carousel-indicators">
          {carouselData.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
              aria-label={`Ir a la imagen ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdvancedCarousel; 