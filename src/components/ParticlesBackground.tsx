'use client';

import { useCallback } from 'react';
import { Particles } from '@tsparticles/react';
import { loadFull } from 'tsparticles';
import type { Engine } from '@tsparticles/engine';

const ParticlesBackground = () => {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        background: {
          color: {
              value: '#0a192f',
          },
        },
        particles: {
          number: {
              value: 80,
              density: {
                  enable: true,
                  value_area: 800,
              },
          },
          color: {
              value: '#63b3ed',
          },
          shape: {
              type: 'circle',
          },
          opacity: {
              value: 0.5,
          },
          size: {
              value: { min: 1, max: 3 },
          },
          links: {
              enable: true,
              color: '#63b3ed',
              distance: 150,
              opacity: 0.4,
              width: 1,
          },
          move: {
              enable: true,
              speed: 2,
              direction: 'none',
              outModes: {
                  default: 'out',
              },
          },
        },
        interactivity: {
          events: {
              onHover: {
                  enable: true,
                  mode: 'repulse',
              },
              resize: true,
          },
          modes: {
              repulse: {
                  distance: 100,
                  duration: 0.4,
              },
          },
        },
        detectRetina: true,
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    />
  );
};

export default ParticlesBackground;