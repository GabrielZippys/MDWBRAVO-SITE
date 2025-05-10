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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-2xl p-8 max-w-md w-full border border-white/20 animate-fade-in">
        {/* 🎨 Estilos aplicados na tela de LOGIN */}
        <div className="flex flex-col items-center space-y-6">
          <img
            src="/bravo.png"
            alt="MDW Bravo Logo"
            className="w-24 h-24 object-contain animate-float"
          />
          <h1 className="text-3xl font-bold text-white text-center">
            Acesso <span className="text-blue-400">Restrito</span>
          </h1>
          <p className="text-white/70 text-center">
            Gestão Inteligente de Chamados
          </p>
    
          <button
            onClick={() => signIn('google')}
            className="flex items-center justify-center gap-3 bg-white text-gray-800 font-medium px-6 py-3 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 animate-scale-in"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a5.94 5.94 0 1 1 0-11.88c1.835 0 3.456.989 4.261 2.468l3.494-2.268A9.959 9.959 0 0 0 12.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 0 0-1-4.029l-9 5.268z" />
            </svg>
            Entrar com Google
          </button>
    
          <div className="flex flex-col items-center space-y-2 mt-6">
            <img
              src="/Faixa Bravo.png"
              alt="Empresa"
              className="w-32 h-auto animate-slide-up"
            />
            <p className="text-white/60 text-sm">
              🔒 Login seguro via Google
            </p>
          </div>
        </div>
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
