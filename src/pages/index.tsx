import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { signIn, signOut, useSession } from "next-auth/react";
import 'leaflet/dist/leaflet.css';
import React from 'react';
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

  const zonasUnicas = Array.from(new Set(chamados.map((c) => c.zona).filter(Boolean)));
  const statusUnicos = Array.from(new Set(chamados.map((c) => c.status).filter(Boolean)));
  const lojasUnicas = Array.from(new Set(chamados.map((c) => c.loja).filter(Boolean)));
  const tiposUnicos = Array.from(new Set(chamados.map((c) => c.tipo).filter(Boolean)));

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      const zonaOk = !filtroZona || c.zona === filtroZona;
      const statusOk = !filtroStatus || c.status === filtroStatus;
      const lojaOk = !filtroLoja || c.loja === filtroLoja;
      const tipoOk = !filtroTipo || c.tipo === filtroTipo;
      return zonaOk && statusOk && lojaOk && tipoOk;
    });
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo]);

  if (status === "loading") return <p className="p-8">Carregando autenticação...</p>;

  if (!session) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <h1 className="text-3xl font-bold mb-6">Acesso Restrito</h1>
        <button onClick={() => signIn("google")} className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
          Entrar com Google
        </button>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-center w-full">Painel de Chamados 🚨</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center justify-center">
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
      </div>

      {/* TABELA DE CHAMADOS */}
      <div className="mapa-cointainer">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Lista de Chamados</h2>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
            onClick={() => {
              setFiltroZona('');
              setFiltroStatus('');
              setFiltroLoja('');
              setFiltroTipo('');
            }}
          >
            Limpar Filtros
          </button>
        </div>
        <Dashboard chamados={chamadosFiltrados} />

      

      {/* MAPA */}
      <br /><br />
      
        <h2 className="text-xl font-semibold mb-2">Mapa Interativo</h2>
        <MapaDeChamados chamados={chamadosFiltrados} />
      </div>
    </main>
  );
}

// 👉 BUSCA OS CHAMADOS DO MONGODB NO LADO DO SERVIDOR
export const getServerSideProps: GetServerSideProps = async () => {
  await connectDB();
  const chamadosMongo = await Chamado.find().sort({ dataCriacao: -1 });
  const chamados = chamadosMongo.map((c) => ({
    _id: c._id.toString(),
    titulo: c.titulo,
    loja: c.loja,
    status: c.status,
    tipo: c.tipo,
    dataCriacao: c.dataCriacao.toISOString(),
    zona: c.zona,
  }));

  return {
    props: {
      chamadosIniciais: chamados,
    },
  };
};
