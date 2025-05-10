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
        background: { color: { value: '#0a192f' } },
        particles: {
          number: { 
            value: 80,
            density: { 
              enable: true, 
              value_area: 800 
            }
          },
          color: { value: '#63b3ed' },
          links: {
            enable: true,
            color: '#63b3ed',
            distance: 150,
            opacity: 0.4,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            outModes: { default: 'out' }
          }
        }
      }}
      className="particles-canvas"
    />
  );
}