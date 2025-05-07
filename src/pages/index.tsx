// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { format } from 'date-fns';
import Loader from '@/components/Loader';

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

const defaultFilters = {
  zona: '',
  status: '',
  loja: '',
  tipo: '',
  prioridade: ''
};

export default function Home({ chamadosIniciais }: HomeProps) {
  const { data: session, status } = useSession();
  const [chamados, setChamados] = useState<ChamadoType[]>(chamadosIniciais || []);
  const [filtros, setFiltros] = useState(defaultFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Busca client-side com tratamento de erro
  const fetchChamados = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/chamados');
      if (!res.ok) throw new Error('Erro na resposta da API');
      const data = await res.json();
      if (Array.isArray(data)) {
        setChamados(data);
        setError('');
      } else {
        throw new Error('Formato de dados inválido');
      }
    } catch (e) {
      console.error('Erro fetch /api/chamados', e);
      setError('Falha ao carregar chamados. Tente recarregar a página.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  // Opções para filtros usando useMemo
  const filterOptions = useMemo(() => ({
    zonas: Array.from(new Set(chamados.map(c => c.zona))).filter(Boolean),
    status: Array.from(new Set(chamados.map(c => c.status))).filter(Boolean),
    lojas: Array.from(new Set(chamados.map(c => c.loja))).filter(Boolean),
    tipos: Array.from(new Set(chamados.map(c => c.tipo))).filter(Boolean),
    prioridades: Array.from(new Set(chamados.map(c => c.prioridade))).filter(Boolean)
  }), [chamados]);

  // Chamados filtrados com useMemo
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      Object.entries(filtros).every(([key, value]) => 
        !value || c[key as keyof ChamadoType] === value
      )
    );
  }, [chamados, filtros]);

  const handleFilterChange = (filterType: keyof typeof filtros) => 
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setFiltros(prev => ({ ...prev, [filterType]: e.target.value }));
    };

  const MapaDeChamados = dynamic(() => import('@/components/MapaDeChamados'), { 
    ssr: false,
    loading: () => <Loader text="Carregando mapa..." />
  });

  if (status === 'loading') return <Loader fullScreen />;
  
  if (!session) {
    return (
      <main className="home flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-3xl font-bold mb-4 text-center">Acesso Restrito</h1>
        <button
          onClick={() => signIn('google')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <span className="mr-2">Entrar com Google</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" className="fill-current">
            <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a5.94 5.94 0 1 1 0-11.88c1.835 0 3.456.989 4.261 2.468l3.494-2.268A9.959 9.959 0 0 0 12.545 2C7.021 2 2.545 6.477 2.545 12s4.476 10 10 10c5.523 0 10-4.477 10-10a9.994 9.994 0 0 0-1-4.029l-9 5.268z"/>
          </svg>
        </button>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">Painel de Chamados 🚨</h1>

      {/* Seção de Filtros */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Zona</label>
            <SelectFiltro
              value={filtros.zona}
              onChange={handleFilterChange('zona')}
              options={filterOptions.zonas}
              placeholder="Todas as Zonas"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <SelectFiltro
              value={filtros.status}
              onChange={handleFilterChange('status')}
              options={filterOptions.status}
              placeholder="Todos os Status"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Loja</label>
            <SelectFiltro
              value={filtros.loja}
              onChange={handleFilterChange('loja')}
              options={filterOptions.lojas}
              placeholder="Todas as Lojas"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Tipo</label>
            <SelectFiltro
              value={filtros.tipo}
              onChange={handleFilterChange('tipo')}
              options={filterOptions.tipos}
              placeholder="Todos os Tipos"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Prioridade</label>
            <SelectFiltro
              value={filtros.prioridade}
              onChange={handleFilterChange('prioridade')}
              options={filterOptions.prioridades}
              placeholder="Todas as Prioridades"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-end">
          <button
            className="btn-secondary"
            onClick={() => setFiltros(defaultFilters)}
          >
            🧹 Limpar Filtros
          </button>
          
          <button
            className="btn-primary"
            onClick={fetchChamados}
            disabled={loading}
          >
            {loading ? '🔄 Atualizando...' : '🔄 Atualizar Chamados'}
          </button>
        </div>
      </div>

      {/* Mensagem de Erro */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabela */}
      {loading ? (
        <Loader text="Carregando chamados..." />
      ) : (
        <>
          <Dashboard chamados={chamadosFiltrados} />
          
          {/* Mapa */}
          <div className="mt-12 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Mapa Interativo</h2>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapaDeChamados chamados={chamadosFiltrados} />
            </div>
          </div>
        </>
      )}
    </main>
  );
}

// Componente auxiliar para Select
const SelectFiltro = ({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder: string;
}) => (
  <select
    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    value={value}
    onChange={onChange}
  >
    <option value="">{placeholder}</option>
    {options.map(option => (
      <option key={option} value={option}>{option}</option>
    ))}
  </select>
);

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  // Pré-carregamento opcional pode ser implementado aqui
  return { props: { chamadosIniciais: [] } };
};