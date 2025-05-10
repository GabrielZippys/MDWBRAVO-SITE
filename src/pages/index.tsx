import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { getSession } from 'next-auth/react';

type StatusType = 'em aberto' | 'realizando' | 'designado' | 'resolvido' | 'feito' | 'outros';

export type ChamadoType = {
  _id: string;
  titulo: string;
  loja: string;
  status: StatusType;
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
      if (Array.isArray(data)) {
        const ordenados = data.sort((a, b) => 
          new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()
        );
        setChamados(ordenados);
      }
    } catch (e) {
      console.error('Erro ao buscar chamados:', e);
      setError('Falha ao carregar chamados');
    }
  };

  useEffect(() => { 
    fetchChamados();
  }, []);

  const zonasUnicas = useMemo(() => Array.from(new Set(chamados.map(c => c.zona))), [chamados]);
  const statusUnicos = useMemo(() => Array.from(new Set(chamados.map(c => c.status))), [chamados]);
  const lojasUnicas = useMemo(() => Array.from(new Set(chamados.map(c => c.loja))), [chamados]);
  const tiposUnicos = useMemo(() => Array.from(new Set(chamados.map(c => c.tipo))), [chamados]);
  const prioridadesUnicas = useMemo(() => Array.from(new Set(chamados.map(c => c.prioridade))), [chamados]);

  const STATUSES_PERMITIDOS = new Set<StatusType>([
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

  const ParticlesBackground = dynamic(
    () => import('@/components/ParticlesBackground'),
    { 
      ssr: false,
      loading: () => <div className="absolute inset-0 bg-[#0a192f] z-0" />
    }
  );

  if (!session) {
    return (
      <main className="relative min-h-screen w-full overflow-hidden">
        <ParticlesBackground />
        
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          <div className="auth-card bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl p-8 w-full max-w-md animate-slide-in">
            <div className="logo-wrapper flex justify-center mb-6">
              <img
                src="/bravo.png"
                alt="MDW Bravo Logo"
                className="logo w-24 h-24 animate-pulse"
              />
            </div>

            <h1 className="text-3xl font-bold text-center text-white mb-4">
              Acesso <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-blue-600">Restrito</span>
            </h1>

            <p className="text-center text-gray-200 mb-8">
              Sistema de Gestão de Chamados Inteligente
            </p>

            <button
              className="google-btn w-full flex items-center justify-center gap-3 bg-white/10 hover:bg-white/20 transition-colors text-white rounded-lg py-3 px-6 mb-6"
              onClick={() => {
                setLoadingLogin(true);
                signIn('google');
              }}
              disabled={loadingLogin}
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a5.94 5.94 0 1 1 0-11.88c1.835 0 3.456.989 4.261 2.468l3.494-2.268A9.959 9.959 0 0 0 12.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 0 0-1-4.029l-9 5.268z"
                />
              </svg>
              {loadingLogin ? 'Carregando...' : 'Entrar com Google'}
            </button>

            <div className="footer text-center">
              <img 
                src="/Faixa Bravo.png" 
                alt="Empresa" 
                className="company-logo mx-auto h-8 mb-4" 
              />
              <p className="text-sm text-gray-300">
                <span className="mr-2">🔒</span>
                Login seguro via Google
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">
        Painel de Chamados 🚨
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <select 
          className="input-filtro"
          value={filtroZona} 
          onChange={(e) => setFiltroZona(e.target.value)}
        >
          <option value="">Todas as Zonas</option>
          {zonasUnicas.map((z) => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        <select 
          className="input-filtro"
          value={filtroStatus} 
          onChange={(e) => setFiltroStatus(e.target.value)}
        >
          <option value="">Todos os Status</option>
          {statusUnicos.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select 
          className="input-filtro"
          value={filtroLoja} 
          onChange={(e) => setFiltroLoja(e.target.value)}
        >
          <option value="">Todas as Lojas</option>
          {lojasUnicas.map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>

        <select 
          className="input-filtro"
          value={filtroTipo} 
          onChange={(e) => setFiltroTipo(e.target.value)}
        >
          <option value="">Todos os Tipos</option>
          {tiposUnicos.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select 
          className="input-filtro"
          value={filtroPrioridade} 
          onChange={(e) => setFiltroPrioridade(e.target.value)}
        >
          <option value="">Todas as Prioridades</option>
          {prioridadesUnicas.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <div className="flex gap-2 col-span-full lg:col-span-1">
          <button 
            className="btn-filtro limpar w-full"
            onClick={() => {
              setFiltroZona('');
              setFiltroStatus('');
              setFiltroLoja('');
              setFiltroTipo('');
              setFiltroPrioridade('');
            }}
          >
            🧹 Limpar
          </button>
          <button 
            className="btn-filtro atualizar w-full"
            onClick={fetchChamados}
          >
            🔄 Atualizar
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <Dashboard chamados={chamadosFiltrados} />

      <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </div>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (context) => {
  const session = await getSession(context);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  // Adicione aqui a lógica para buscar dados iniciais se necessário
  return { 
    props: { 
      chamadosIniciais: [] 
    } 
  };
};