'use client';

import { useCallback } from 'react';
import { Particles } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { Engine } from '@tsparticles/engine';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false, zIndex: -1 }, // Alterado para false
        background: {
          color: '#0a192f',
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              area: 800,
            }
          },
          color: {
            value: '#63b3ed',
          },
          links: {
            enable: true,
            distance: 130,
            color: '#63b3ed',
            opacity: 0.4,
            width: 1,
          },
          move: {
            enable: true,
            speed: 1.6,
            outModes: {
              default: 'out',
            },
          },
          opacity: {
            value: 0.5,
          },
          size: {
            value: { min: 1, max: 3 },
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'repulse',
            },
            resize: {
              enable: true,
              delay: 0.5,
            },
          },
          modes: {
            repulse: {
              distance: 120,
              duration: 0.4,
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
