import React, { useState, useEffect } from "react";

const images = [
  {
    url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
    alt: "Ensalada fresca"
  },
  {
    url: "https://images.unsplash.com/photo-1516685018646-5499d0a7d42f",
    alt: "Bowl saludable"
  },
  {
    url: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0",
    alt: "Frutas variadas"
  },
  {
    url: "https://images.unsplash.com/photo-1502741338009-cac2772e18bc",
    alt: "Salmón y vegetales"
  },
  {
    url: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c",
    alt: "Avena y frutas"
  }
];

const captions = [
  "¡Come fresco, vive mejor!",
  "Inspírate a comer saludable cada día",
  "Frutas y colores para tu energía",
  "Proteína y vegetales para tu fuerza",
  "Desayunos que nutren tu día"
];

const HealthyFoodCarousel = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="mb-4 text-xl md:text-2xl font-semibold text-green-700 text-center animate-fade-in">
        {captions[current]}
      </div>
      <div className="relative w-full max-w-xl rounded-3xl overflow-hidden shadow-xl bg-white/60 backdrop-blur-lg">
        <img
          src={images[current].url + "?auto=format&fit=crop&w=800&q=80"}
          alt={images[current].alt}
          className="w-full h-56 md:h-72 object-cover transition-all duration-700"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {images.map((_, idx) => (
            <button
              key={idx}
              className={`w-4 h-4 rounded-full border-2 ${current === idx ? "bg-green-500 border-green-600 scale-110" : "bg-white/70 border-green-300"} transition`}
              onClick={() => setCurrent(idx)}
              aria-label={`Ir a la imagen ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HealthyFoodCarousel; 