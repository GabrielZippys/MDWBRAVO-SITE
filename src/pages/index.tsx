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
  status: 'em aberto' | 'realizando' | 'designado' | 'resolvido' | 'feito' | 'outros';
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
  const STATUSES_PERMITIDOS = new Set([
    'em aberto',
    'designado',
    'interrompido', // Adicionei o novo status
    'realizando'
  ]);
  // Chamados filtrados
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroLoja || c.loja === filtroLoja) &&
      (!filtroTipo || c.tipo === filtroTipo) &&
      (!filtroPrioridade || c.prioridade === filtroPrioridade) &&
      STATUSES_PERMITIDOS.has(c.status) // Filtro global
    );
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo, filtroPrioridade]);

  if (status === 'loading') return <p>Carregando sessão...</p>;
  if (!session) {
    return (
      <main className="login-page">
      <div className="login-box">
        <div className="logo-bounce">
          <img src="/bravo.png" alt="Logo MDW Bravo" className="login-logo" />
        </div>
        <h1 className="login-title">Bem-vindo ao <span className="gradient-text">MDW-BRAVO</span></h1>
        <p className="login-subtitle">Sistema inteligente de gestão de chamados</p>
    
        <button className="login-google-btn" onClick={() => signIn('google')}>
          <img src="/google-icon.svg" alt="Google" className="google-icon" />
          Entrar com Google
        </button>
    
        <footer className="login-footer">
          <p><span className="lock-icon">🔒</span> Login seguro com autenticação via Google</p>
          <img src="/Faixa Bravo.png" alt="Bravo" className="footer-banner" />
        </footer>
      </div>
    </main>
    
    );
  }

  const MapaDeChamados = dynamic(
    () => import('@/components/MapaDeChamados'),
    { 
      ssr: false,
      loading: () => (
        <div className="p-4 text-center text-gray-500">
          Carregando mapa...
        </div>
      )
    }
  );

  return (
    <main>
       <h1 className="titulo">Painel de Chamados🚨</h1>

      {/* Filtros */}
      <div className="butaofiltro">
        <select className="px-4 py-2 rounded border bg-white" value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}>
          <option value="">Todas as Zonas</option>
          {zonasUnicas.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>

        <select className="px-4 py-2 rounded border bg-white" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os Status</option>
          {statusUnicos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="px-4 py-2 rounded border bg-white" value={filtroLoja} onChange={(e) => setFiltroLoja(e.target.value)}>
          <option value="">Todas as Lojas</option>
          {lojasUnicas.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select className="px-4 py-2 rounded border bg-white" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos os Tipos</option>
          {tiposUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="px-4 py-2 rounded border bg-white" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
          <option value="">Todas as Prioridades</option>
          {prioridadesUnicas.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <button
          className="btn-filtro limpar"
          onClick={() => {
            setFiltroZona('');
            setFiltroStatus('');
            setFiltroLoja('');
            setFiltroTipo('');
            setFiltroPrioridade('');
          }}
        >
          🧹Limpar Filtros
        </button>

        <button
          className="btn-filtro atualizar"
          onClick={fetchChamados}
        >
          🔄 Atualizar Chamados
        </button>
      </div>

      {/* Tabela */}
      <Dashboard chamados={chamadosFiltrados} />

      {/* Mapa */}
      <div className="mapa-container">
      <h2>Mapa Interativo</h2>
      <MapaDeChamados chamados={chamadosFiltrados} />
    </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // pré-carrega vazio; a fonte real é o /api/chamados
  return { props: { chamadosIniciais: [] } };
};
