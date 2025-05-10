'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { Engine } from 'tsparticles-engine'; // Certo!

export default function ParticlesBackground() {
    const particlesInit = useCallback(async (engine: any) => {
        await loadFull(engine);
      }, []);      

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: true, zIndex: -1 },
        background: {
          color: {
            value: '#0a192f',
          },
        },
        particles: {
          number: {
            value: 70,
            density: {
              enable: true,
              area: 800,
            },
          },
          color: {
            value: '#63b3ed',
          },
          links: {
            enable: true,
            distance: 130,
            color: '#63b3ed',
            opacity: 0.3,
            width: 1,
            triangles: {
              enable: true,
              color: '#4299e1',
              opacity: 0.05,
            },
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: 'none',
            outModes: {
              default: 'out',
            },
          },
          opacity: {
            value: 0.5,
          },
          size: {
            value: 2,
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
    />
  );
}
