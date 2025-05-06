// pages/index.tsx
import { GetServerSideProps } from 'next';
import { useSession, signIn } from 'next-auth/react';
import React, { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { connectDB } from '@/lib/mongodb';
import ChamadoModel from '@/models/chamado';
import { notion } from '@/lib/notion';
import type { NextApiRequest, NextApiResponse } from 'next';

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


      {/* Lista de Chamados */}
      <section className="divmain">
        <h2 className="titulo">Lista de Chamados</h2>
        <Dashboard chamados={chamadosFiltrados} />
      </section>

      {/* Mapa */}
      <section>
        <h2 className="titulo">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </section>
    </main>
  );
}

const DATABASE_ID = process.env.NOTION_DATABASE_ID!;

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_DATABASE_ID!,
      sorts: [{ property: 'dataCriacao', direction: 'descending' }],
    });

    const chamadosIniciais = response.results.map((page) => {
      const properties = page.properties;
      return {
        _id: page.id,
        titulo: properties.titulo?.title[0]?.plain_text || '',
        loja: properties.loja?.select?.name || '',
        status: properties.status?.select?.name || '',
        tipo: properties.tipo?.select?.name || '',
        dataCriacao: properties.dataCriacao?.date?.start || '',
        zona: properties.zona?.select?.name || '',
        prioridade: properties.prioridade?.select?.name || '',
      };
    });

    return { props: { chamadosIniciais } };
  } catch (error) {
    console.error('Erro ao buscar chamados do Notion:', error);
    return { props: { chamadosIniciais: [] } };
  }
};
