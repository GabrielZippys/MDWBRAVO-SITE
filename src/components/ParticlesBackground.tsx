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
      particles: {
        number: { value: 50 },
        size: { value: 3 },
        move: { enable: true, speed: 1 },
        color: { value: '#ffffff' },
        links: {
          enable: true,
          color: '#ffffff',
          distance: 150,
          opacity: 0.4,
          width: 1
        }
      },
      background: {
        color: { value: '#0a192f' }
      }
    }}
  />  
  );
}
