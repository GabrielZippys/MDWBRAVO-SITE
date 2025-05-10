'use client';
import { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

export default function ParticlesBackground() {
  const particlesInit = useCallback(async (engine: any) => {
    await loadFull(engine);
  }, []);

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: { enable: false },
        background: { color: 'transparent' },
        particles: {
          number: { value: 80, density: { enable: true, area: 800 } },
          color: { value: '#63b3ed' },
          shape: { type: 'circle' },
          opacity: { value: 0.2 },
          size: { value: 3 },
          move: {
            enable: true,
            speed: 1,
            direction: 'none',
            outModes: { default: 'bounce' }
          }
        },
        interactivity: {
          events: { onHover: { enable: true, mode: 'repulse' } },
          modes: { repulse: { distance: 100 } }
        },
        detectRetina: true
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 0,
        width: '100%',
        height: '100%'
      }}
    />
  );
}
