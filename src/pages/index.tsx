// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { connectDB } from '@/lib/mongodb';
import ChamadoModel from '@/models/chamado';

const MapaDeChamados = dynamic(() => import('@/components/MapaDeChamados'), { ssr: false });

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
  chamadosIniciais: ChamadoType[];  // sempre um array
}

export default function Home({ chamadosIniciais }: HomeProps) {
  // 1. Valor padrão vazio caso venha undefined
  const [chamados, setChamados] = useState<ChamadoType[]>(chamadosIniciais || []);

  const { data: session, status } = useSession();

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
      // 2. Verifica se é array antes de atualizar
      if (Array.isArray(data)) {
        setChamados(data);
      } else {
        console.error('Payload inesperado de /api/chamados:', data);
      }
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  // Arrays únicos para filtros
  const zonasUnicas = Array.from(new Set(chamados.map(c => c.zona).filter(Boolean)));
  const statusUnicos = Array.from(new Set(chamados.map(c => c.status).filter(Boolean)));
  const lojasUnicas = Array.from(new Set(chamados.map(c => c.loja).filter(Boolean)));
  const tiposUnicos = Array.from(new Set(chamados.map(c => c.tipo).filter(Boolean)));
  const prioridadesUnicas = Array.from(new Set(chamados.map(c => c.prioridade).filter(Boolean)));

  // Aplica filtros
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c => {
      const okZona = !filtroZona || c.zona === filtroZona;
      const okStatus = !filtroStatus || c.status === filtroStatus;
      const okLoja = !filtroLoja || c.loja === filtroLoja;
      const okTipo = !filtroTipo || c.tipo === filtroTipo;
      const okPrio = !filtroPrioridade || c.prioridade === filtroPrioridade;
      return okZona && okStatus && okLoja && okTipo && okPrio;
    });
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo, filtroPrioridade]);

  if (status === 'loading') {
    return <p className="p-8">Carregando autenticação...</p>;
  }
  if (!session) {
    return (
      <main className="home p-8 flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Acesso Restrito</h1>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Entrar com Google
        </button>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-center">Painel de Chamados 🚨</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 mb-8">
        {/* ... seus selects e botões ... */}
      </div>

      {/* Lista de Chamados */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Lista de Chamados</h2>
        <Dashboard chamados={chamadosFiltrados} />
      </section>

      {/* Mapa */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </section>
    </main>
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  await connectDB();

  // Busca todos os chamados e sempre retorna um array (mesmo vazio)
  const raw = await ChamadoModel.find().sort({ dataCriacao: -1 }).lean();
  const chamadosIniciais = Array.isArray(raw)
    ? raw.map(c => ({
        _id: c._id.toString(),
        titulo: c.titulo,
        loja: c.loja,
        status: c.status,
        tipo: c.tipo,
        dataCriacao: c.dataCriacao?.toISOString() ?? '',
        zona: c.zona ?? '',
        prioridade: c.prioridade ?? '',
      }))
    : [];

  return { props: { chamadosIniciais } };
};
