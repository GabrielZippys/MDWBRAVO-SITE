import { useEffect, useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Dashboard from '@/components/Dashboard';
import { signIn, signOut, useSession } from "next-auth/react";
import 'leaflet/dist/leaflet.css';

const MapaDeChamados = dynamic(() => import('@/components/MapaDeChamados'), { ssr: false });

type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
};

export default function Home() {
  const { data: session, status } = useSession();
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [loading, setLoading] = useState(false);
  const [sincronizando, setSincronizando] = useState(false);

  const [filtroZona, setFiltroZona] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroLoja, setFiltroLoja] = useState('');
  const [filtroTipo, setFiltroTipo] = useState(''); // NOVO

  const fetchChamados = async () => {
    setLoading(true);
    const res = await fetch('/api/chamados');
    const data = await res.json();
    setChamados(data);
    setLoading(false);
  };

  useEffect(() => {
    const sincronizar = async () => {
      setSincronizando(true);
      await fetch('/api/sync-notion', { method: 'POST' });
      await fetchChamados();
      setSincronizando(false);
    };
    sincronizar();
  }, []);

  const zonasUnicas = Array.from(new Set(chamados.map((c) => c.zona).filter(Boolean)));
  const statusUnicos = Array.from(new Set(chamados.map((c) => c.status).filter(Boolean)));
  const lojasUnicas = Array.from(new Set(chamados.map((c) => c.loja).filter(Boolean)));
  const tiposUnicos = Array.from(new Set(chamados.map((c) => c.tipo).filter(Boolean))); // NOVO

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroLoja || c.loja === filtroLoja) &&
      (!filtroTipo || c.tipo === filtroTipo) // NOVO
    );
  }, [chamados, filtroZona, filtroStatus, filtroLoja, filtroTipo]);

  if (status === "loading") return <p className="p-8">Carregando autenticação...</p>;

  if (!session) {
    return (
      <main className="começo">
        <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
        <button onClick={() => signIn("google")} className="butoentrar">
          ENTRE COM SUA CONTA
        </button>
      </main>
    );
  }

  return (
    <main className="p-8 bg-gray-100 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="centroTitulo">Painel de Chamados 🚨</h1>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
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

      <Dashboard chamados={chamadosFiltrados} />
      <MapaDeChamados chamados={chamadosFiltrados} />
    </main>
  );
}
