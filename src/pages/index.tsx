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

  const ParticlesBackground = dynamic(() => import('@/components/ParticlesBackground'), { ssr: false });

  if (!session) {
    return (
      <main className="login-container">
      <ParticlesBackground />
        <div className="auth-card animate-slide-in">
          <div className="logo-wrapper pulse-shadow">
            <img
              src="/bravo.png"
              alt="MDW Bravo Logo"
              className="logo shadow-logo"
              width={90}
              height={90}
            />
          </div>
  
          <h1 className="title pulse-glow">
            Acesso <span className="gradient-text">Restrito</span>
          </h1>
  
          <p className="subtitle animate-fade-in-delay">
            Sistema de Gestão de Chamados Inteligente
          </p>
  
          <button
            className="google-btn shine-on-hover"
            onClick={() => signIn('google')}
          >
            <svg className="google-icon" viewBox="0 0 24 24">
              <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a5.94 5.94 0 1 1 0-11.88c1.835 0 3.456.989 4.261 2.468l3.494-2.268A9.959 9.959 0 0 0 12.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 0 0-1-4.029l-9 5.268z"/>
            </svg>
            Entrar com Google
          </button>
  
          <div className="footer animate-fade-in-delay">
            <img src="/Faixa Bravo.png" alt="Empresa" className="company-logo" />
            <p className="security-text">
              <span className="lock-icon">🔒</span> Login seguro via Google
            </p>
          </div>
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
