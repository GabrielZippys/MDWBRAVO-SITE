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
  const [error, setError] = useState<string | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const [filtroZona, setFiltroZona] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

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

  const zonasUnicas = Array.from(new Set(chamados.map(c => c.zona)));
  const statusUnicos = Array.from(new Set(chamados.map(c => c.status)));
  const lojasUnicas = Array.from(new Set(chamados.map(c => c.loja)));
  const tiposUnicos = Array.from(new Set(chamados.map(c => c.tipo)));
  const prioridadesUnicas = Array.from(new Set(chamados.map(c => c.prioridade)));

  const STATUSES_PERMITIDOS = new Set([
    'em aberto', 'designado', 'interrompido', 'realizando'
  ]);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroLoja || c.loja === filtroLoja) &&
      (!filtroTipo || c.tipo === filtroTipo) &&
      (!filtroPrioridade || c.prioridade === filtroPrioridade) &&
      STATUSES_PERMITIDOS.has(c.status)
    );
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo, filtroPrioridade]);

  const MapaDeChamados = dynamic(
    () => import('@/components/MapaDeChamados'),
    {
      ssr: false,
      loading: () => <div className="p-4 text-center text-gray-500">Carregando mapa...</div>
    }
  );


  if (status === 'loading') return <p>Carregando sessão...</p>;
  if (!session) {
    return (
      <main className="login-container">
        <div className="neural-overlay">
          <div className="neural-network">
            {[...Array(30)].map((_, i) => {
              const angle = Math.random() * Math.PI * 2;
              const distance = Math.random() * 40;
              return (
                <div 
                  key={i}
                  className="neural-node"
                  style={{
                    '--x': `${50 + Math.cos(angle) * distance}%`,
                    '--y': `${50 + Math.sin(angle) * distance}%`,
                    '--delay': `${i * 0.1}s`,
                    '--duration': `${4 + Math.random() * 4}s`,
                    '--offset': `${Math.random() * 100}px`
                  } as React.CSSProperties}
                >
                  <div className="node-connection" />
                  <div className="node-glow" />
                </div>
              );
            })}
          </div>
          <div className="neural-glows" />
        </div>
  
        {/* Mantenha o auth-card existente sem alterações */}
        <div className="auth-card animate-slide-in">
          ...
        </div>
      </main>
    );
  }
  return (
    <main>
      <h1 className="titulo">Painel de Chamados🚨</h1>

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

        <button className="btn-filtro limpar" onClick={() => {
          setFiltroZona('');
          setFiltroStatus('');
          setFiltroLoja('');
          setFiltroTipo('');
          setFiltroPrioridade('');
        }}>🧹 Limpar Filtros</button>

        <button className="btn-filtro atualizar" onClick={fetchChamados}>🔄 Atualizar Chamados</button>
      </div>

      <Dashboard chamados={chamadosFiltrados} />

      <div className="mapa-container">
        <h2>Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  return { props: { chamadosIniciais: [] } };
};
