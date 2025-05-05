// pages/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { signIn, useSession } from 'next-auth/react';
import 'leaflet/dist/leaflet.css';
import { GetServerSideProps } from 'next';
import { connectDB } from '@/lib/mongodb';
import Chamado from '@/models/chamado';

const MapaDeChamados = dynamic(() => import('@/components/MapaDeChamados'), { ssr: false });

type ChamadoType = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
  prioridade: string;
};

type HomeProps = {
  chamadosIniciais: ChamadoType[];
};

export default function Home({ chamadosIniciais }: HomeProps) {
  const { data: session, status } = useSession();
  const [chamados, setChamados] = useState<ChamadoType[]>(chamadosIniciais);

  // Filtros
  const [filtroZona, setFiltroZona] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

  // Busca atualizada de chamados (client-side)
  const fetchChamados = async () => {
    try {
      const res = await fetch("/api/chamados");
      const data = await res.json();
      setChamados(data);
    } catch (error) {
      console.error("Erro ao buscar chamados:", error);
    }
  };

  useEffect(() => {
    fetchChamados();
  }, []);

  // Geração de listas únicas para os filtros
  const zonasUnicas = Array.from(new Set(chamados.map(c => c.zona).filter(Boolean)));
  const statusUnicos = Array.from(new Set(chamados.map(c => c.status).filter(Boolean)));
  const lojasUnicas = Array.from(new Set(chamados.map(c => c.loja).filter(Boolean)));
  const tiposUnicos = Array.from(new Set(chamados.map(c => c.tipo).filter(Boolean)));
  const prioridadesUnicas = Array.from(new Set(chamados.map(c => c.prioridade).filter(Boolean)));

  // Aplicar filtros
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      const zonaOk = !filtroZona || c.zona === filtroZona;
      const statusOk = !filtroStatus || c.status === filtroStatus;
      const lojaOk = !filtroLoja || c.loja === filtroLoja;
      const tipoOk = !filtroTipo || c.tipo === filtroTipo;
      const prioridadeOk = !filtroPrioridade || c.prioridade === filtroPrioridade;
      return zonaOk && statusOk && lojaOk && tipoOk && prioridadeOk;
    });
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo, filtroPrioridade]);

  // Enquanto carrega sessão
  if (status === 'loading') {
    return <p className="p-8">Carregando autenticação...</p>;
  }

  // Se não estiver logado
  if (!session) {
    return (
      <main className="home">
        <h1 className="text-3xl font-bold mb-6">Acesso Restrito</h1>
        <button
          onClick={() => signIn('google')}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
        >
          Entrar com Google
        </button>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="titulo">Painel de Chamados 🚨</h1>
      </div>

      {/* Filtros */}
      <div className="titulobarras flex flex-wrap gap-4 mb-6">
        <select className="px-4 py-2 rounded border" value={filtroZona} onChange={(e) => setFiltroZona(e.target.value)}>
          <option value="">Todas as Zonas</option>
          {zonasUnicas.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>

        <select className="px-4 py-2 rounded border" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
          <option value="">Todos os Status</option>
          {statusUnicos.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="px-4 py-2 rounded border" value={filtroLoja} onChange={(e) => setFiltroLoja(e.target.value)}>
          <option value="">Todas as Lojas</option>
          {lojasUnicas.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>

        <select className="px-4 py-2 rounded border" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
          <option value="">Todos os Tipos</option>
          {tiposUnicos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="px-4 py-2 rounded border" value={filtroPrioridade} onChange={(e) => setFiltroPrioridade(e.target.value)}>
          <option value="">Todas as Prioridades</option>
          {prioridadesUnicas.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        <button
          className="ml-auto bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          onClick={() => {
            setFiltroZona('');
            setFiltroStatus('');
            setFiltroLoja('');
            setFiltroTipo('');
            setFiltroPrioridade('');
          }}
        >
          Limpar Filtros
        </button>

        <button onClick={fetchChamados}>Atualizar Chamados</button>

      </div>

      {/* Tabela de Chamados */}
      <section className="mb-10">
        <h2 className="titulo mb-4">Lista de Chamados</h2>
        <Dashboard chamados={chamadosFiltrados} />
      </section>

      {/* Mapa Interativo */}
      <section>
        <h2 className="titulo mb-4">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </section>
    </main>
  );
}

// Server-side props (pré-carrega chamados)
export const getServerSideProps: GetServerSideProps = async () => {
  await connectDB();

  const chamadosMongo = await Chamado.find().lean();

  const chamadosIniciais = chamadosMongo.map((chamado: any) => ({
    _id: chamado._id.toString(),
    titulo: chamado.titulo || '',
    loja: chamado.loja || '',
    status: chamado.status || '',
    tipo: chamado.tipo || '',
    dataCriacao: chamado.dataCriacao?.toISOString() || '',
    zona: chamado.zona || '',
    prioridade: chamado.prioridade || '',
  }));

  return {
    props: { chamadosIniciais },
  };
};
