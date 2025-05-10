'use client';

import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1
        },
        background: {
          color: {
            value: '#0a192f' // Fundo escuro elegante
          }
        },
        particles: {
          number: {
            value: 80,
            density: {
              enable: true,
              area: 800
            }
          },
          color: {
            value: '#63b3ed'
          },
          links: {
            enable: true,
            distance: 140,
            color: '#63b3ed',
            opacity: 0.4,
            width: 1.2
          },
          move: {
            enable: true,
            speed: 1.2,
            direction: 'none',
            outModes: {
              default: 'out'
            }
          },
          opacity: {
            value: 0.5
          },
          size: {
            value: 2.5
          }
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: 'grab'
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 150,
              line_linked: {
                opacity: 0.5
              }
            }
          }
        },
        detectRetina: true
      }}
    />
  );
}
