'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      id="tech-background"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        fpsLimit: 60,
        background: {
          color: '#0a192f', // mesmo fundo do login
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: { value: '#63b3ed' }, // azul ciano
          shape: { type: 'circle' },
          opacity: {
            value: 0.6,
            anim: {
              enable: true,
              speed: 0.2,
              opacity_min: 0.2,
              sync: false,
            },
          },
          size: {
            value: { min: 1, max: 4 },
          },
          links: {
            enable: true,
            distance: 130,
            color: '#63b3ed',
            opacity: 0.3,
            width: 1,
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: 'none',
            outModes: 'out',
            random: true,
            straight: false,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab', // 'grab' puxa as linhas ao mouse
            },
            resize: true,
          },
          modes: {
            grab: {
              distance: 140,
              links: {
                opacity: 0.5,
              },
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
}
