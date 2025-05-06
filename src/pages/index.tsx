// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';

export type ChamadoType = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
  prioridade: string;
};

interface HomeProps {
  chamadosIniciais: ChamadoType[];
}

export default function Home({ chamadosIniciais }: HomeProps) {
  const { data: session, status } = useSession();
  const [chamados, setChamados] = useState<ChamadoType[]>(chamadosIniciais || []);

  // Filtros
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

  // Busca client-side
  const fetchChamados = async () => {
    try {
      const res = await fetch('/api/chamados');
      const data = await res.json();
      if (Array.isArray(data)) setChamados(data);
      else console.error('Resposta inesperada:', data);
    } catch (e) {
      console.error('Erro fetch /api/chamados', e);
    }
  };

  useEffect(() => { fetchChamados(); }, []);

  // Opções para filtros
  const zonasUnicas = Array.from(new Set(chamados.map(c => c.zona)));
  const statusUnicos = Array.from(new Set(chamados.map(c => c.status)));
  const lojasUnicas = Array.from(new Set(chamados.map(c => c.loja)));
  const tiposUnicos = Array.from(new Set(chamados.map(c => c.tipo)));
  const prioridadesUnicas = Array.from(new Set(chamados.map(c => c.prioridade)));

  // Chamados filtrados
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroLoja || c.loja === filtroLoja) &&
      (!filtroTipo || c.tipo === filtroTipo) &&
      (!filtroPrioridade || c.prioridade === filtroPrioridade)
    );
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo, filtroPrioridade]);

  if (status === 'loading') return <p>Carregando sessão...</p>;
  if (!session) {
    return (
      <main className="home">
        <h1>Acesso Restrito</h1>
        <button onClick={() => signIn('google')}>Entrar com Google</button>
      </main>
    );
  }

  const MapaDeChamados = dynamic(() => import('@/components/MapaDeChamados'), { ssr: false });

  return (
    <main>
      <h1>Painel de Chamados 🚨</h1>

      {/* Filtros */}
      <div>
        <select value={filtroZona} onChange={e => setFiltroZona(e.target.value)}>
          <option value="">Todas as Zonas</option>
          {zonasUnicas.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
        {/* repita para os demais filtros... */}
        <button onClick={() => {
          setFiltroZona(''); setFiltroStatus(''); setFiltroLoja('');
          setFiltroTipo(''); setFiltroPrioridade('');
        }}>Limpar</button>

        <button onClick={fetchChamados}>Atualizar</button>
      </div>

      {/* Tabela */}
      <Dashboard chamados={chamadosFiltrados} />

      {/* Mapa */}
      <h2>Mapa Interativo</h2>
      <MapaDeChamados chamados={chamadosFiltrados} />
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // pré-carrega vazio; a fonte real é o /api/chamados
  return { props: { chamadosIniciais: [] } };
};
