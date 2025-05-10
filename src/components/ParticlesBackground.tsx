'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  // Pode tipar como `any` para evitar conflito de versões
  const particlesInit = useCallback(async (engine: any) => {
    // carrega todos os módulos core do tsparticles
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 }, // fica atrás de tudo
        background: {
          color: { value: '#0a192f' }
        },
        particles: {
          number: { value: 60, density: { enable: true, area: 800 } },
          color: { value: '#63b3ed' },
          links: { enable: true, distance: 150, color: '#63b3ed', opacity: 0.3, width: 1 },
          move: { enable: true, speed: 1.2, outModes: { default: 'out' } },
          opacity: { value: 0.5 },
          size: { value: 2 }
        },
        interactivity: {
          events: {
            onHover: { enable: true, mode: 'repulse' },
            onClick: { enable: true, mode: 'push' },
            resize: true
          },
          modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { quantity: 4 }
          }
        },
        detectRetina: true
      }}
    />
  );
}
