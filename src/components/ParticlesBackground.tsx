// components/ParticlesBackground.tsx
'use client';
import { useCallback } from 'react';
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { loadSlim } from 'tsparticles-slim';
import type { Engine } from 'tsparticles-engine';

export default function ParticlesBackground() {
  const init = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);

  return (
    <Particles
      init={init}
      options={{
        background: { color: { value: '#0a192f' } },
        particles: {
          color: { value: '#63b3ed' },
          links: { enable: true, color: '#63b3ed', distance: 120, opacity: 0.5 },
          move: { enable: true, speed: 1 },
          number: { value: 40 },
          size: { value: 3 },
        },
      }}
    />
  );
}
