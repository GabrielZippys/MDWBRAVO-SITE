// pages/index.tsx
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { signIn, useSession } from 'next-auth/react';
import 'leaflet/dist/leaflet.css';
import { GetServerSideProps } from 'next';
import { connectDB } from '@/lib/mongodb';
import ChamadoModel from '@/models/chamado';
import { Types } from 'mongoose';

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

  const [filtroZona, setFiltroZona] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroPrioridade, setFiltroPrioridade] = useState('');

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

  const zonasUnicas = Array.from(new Set(chamados.map(c => c.zona).filter(Boolean)));
  const statusUnicos = Array.from(new Set(chamados.map(c => c.status).filter(Boolean)));
  const lojasUnicas = Array.from(new Set(chamados.map(c => c.loja).filter(Boolean)));
  const tiposUnicos = Array.from(new Set(chamados.map(c => c.tipo).filter(Boolean)));
  const prioridadesUnicas = Array.from(new Set(chamados.map(c => c.prioridade).filter(Boolean)));

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

  if (status === 'loading') {
    return <p className="p-8">Carregando autenticação...</p>;
  }

  if (!session) {
    return (
      <main className="home p-8 flex flex-col items-center justify-center min-h-screen bg-gray-100">
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
        <h1 className="text-3xl font-bold">Painel de Chamados 🚨</h1>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-end mb-8">
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
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
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

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          onClick={fetchChamados}
        >
          Atualizar Chamados
        </button>
      </div>

      {/* Tabela de Chamados */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-4">Lista de Chamados</h2>
        <Dashboard chamados={chamadosFiltrados} />
      </section>

      {/* Mapa Interativo */}
      <section>
        <h2 className="text-2xl font-semibold mb-4">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </section>
    </main>
  );
}

// Server-side props
export const getServerSideProps: GetServerSideProps = async () => {
  await connectDB();
  const chamados = await ChamadoModel.find().lean();

  const chamadosFormatados = chamados.map((c) => ({
    _id: c._id.toString(),
    titulo: c.titulo,
    loja: c.loja,
    status: c.status,
    tipo: c.tipo,
    dataCriacao: c.dataCriacao?.toISOString() || '',
    zona: c.zona || '',
    prioridade: c.prioridade || '',
  }));  

  return {
    props: {
      chamadosIniciais: chamadosFormatados,
    },
  };
};