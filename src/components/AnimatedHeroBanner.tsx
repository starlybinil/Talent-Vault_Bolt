import React, { useState, useEffect } from 'react';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Message {
  title: string;
  subtitle: string;
}

interface AnimatedHeroBannerProps {
  messages: Message[];
  backgroundImage: string;
  interval?: number;
  className?: string;
}

export default function AnimatedHeroBanner({
  messages,
  backgroundImage,
  interval = 5000,
  className = '',
}: AnimatedHeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (messages.length <= 1 || prefersReducedMotion) return;

    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentIndex((current) => (current + 1) % messages.length);
        setIsTransitioning(false);
      }, 500); // Match this with CSS transition duration
    }, interval);

    return () => clearInterval(timer);
  }, [messages.length, interval, prefersReducedMotion]);

  return (
    <div
      className={`relative min-h-[400px] md:min-h-[300px] flex items-center justify-center overflow-hidden ${className}`}
      style={{ height: 'calc(100vh - 64px)' }}
    >
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-asu-darker/95 to-asu-darker/80" />
      </div>

      {/* Content container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 text-center">
        <div
          className={`transition-all duration-500 ${
            isTransitioning
              ? 'opacity-0 transform translate-y-4'
              : 'opacity-100 transform translate-y-0'
          }`}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {messages[currentIndex].title}
            <span className="block mt-2 text-asu-gold">
              {messages[currentIndex].subtitle}
            </span>
          </h1>
        </div>

        {/* Pagination dots */}
        {messages.length > 1 && !prefersReducedMotion && (
          <div className="flex justify-center gap-2 mt-8">
            {messages.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    setCurrentIndex(index);
                    setIsTransitioning(false);
                  }, 500);
                }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-asu-gold w-4' : 'bg-white/30'
                }`}
                aria-label={`Go to message ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
