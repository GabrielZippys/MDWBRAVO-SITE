// components/Dashboard.tsx
'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { useState, useMemo } from 'react';

type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
  prioridade?: string;
};

type DashboardProps = {
  chamados: Chamado[];
};

const cores = ['#a8dadc', '#f4a261', '#2a9d8f', '#e76f51', '#457b9d', '#ffb4a2', '#d4a373'];

export default function Dashboard({ chamados }: DashboardProps) {
  const [filtroZona, setFiltroZona] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroTipo || c.tipo === filtroTipo)
    );
  }, [chamados, filtroZona, filtroStatus, filtroTipo]);

  const agruparPor = (campo: keyof Chamado) => {
    const cont: Record<string, number> = {};
    chamadosFiltrados.forEach(c => {
      const chave = c[campo] || 'Não definido';
      cont[chave] = (cont[chave] || 0) + 1;
    });
    return Object.entries(cont).map(([nome, valor]) => ({ nome, valor }));
  };

  const porStatus = agruparPor('status');
  const porTipo = agruparPor('tipo');
  const porZona = agruparPor('zona');

  const zonasDisponiveis = Array.from(new Set(chamados.map(c => c.zona)));
  const statusDisponiveis = Array.from(new Set(chamados.map(c => c.status)));
  const tiposDisponiveis = Array.from(new Set(chamados.map(c => c.tipo)));

  return (
    <div className="space-y-8">
      {/* Filtros */}
      <div className="flex flex-wrap gap-4 items-center">
        <select
          className="border p-2 rounded"
          value={filtroZona || ''}
          onChange={(e) => setFiltroZona(e.target.value || null)}
        >
          <option value="">Todas as Zonas</option>
          {zonasDisponiveis.map(z => (
            <option key={z} value={z}>{z}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={filtroStatus || ''}
          onChange={(e) => setFiltroStatus(e.target.value || null)}
        >
          <option value="">Todos os Status</option>
          {statusDisponiveis.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={filtroTipo || ''}
          onChange={(e) => setFiltroTipo(e.target.value || null)}
        >
          <option value="">Todos os Tipos</option>
          {tiposDisponiveis.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        {(filtroZona || filtroStatus || filtroTipo) && (
          <button
            onClick={() => {
              setFiltroZona(null);
              setFiltroStatus(null);
              setFiltroTipo(null);
            }}
            className="text-sm text-blue-600 hover:underline"
          >
            Limpar Filtros
          </button>
        )}
      </div>

      {/* Tabela de Chamados */}
      <table className="min-w-full bg-white rounded-xl shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Título</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Loja</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Status</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Zona</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prioridade</th>
            <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Criado em</th>
          </tr>
        </thead>
        <tbody>
          {chamadosFiltrados.map((chamado) => (
            <tr key={chamado._id} className="border-t">
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.titulo}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.loja}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.status}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.tipo}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.zona}</td>
              <td className="px-4 py-2 text-sm text-gray-800">{chamado.prioridade || 'Não definida'}</td>
              <td className="px-4 py-2 text-sm text-gray-800">
                {new Date(chamado.dataCriacao).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chamados por Status */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Chamados por Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porStatus}>
              <XAxis dataKey="nome" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Bar dataKey="valor" fill={cores[0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chamados por Tipo */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Chamados por Tipo</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={porTipo}>
              <XAxis dataKey="nome" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Bar dataKey="valor" fill={cores[1]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Chamados por Zona */}
        <div className="bg-white p-4 rounded-xl shadow">
          <h3 className="text-lg font-semibold mb-2">Chamados por Zona</h3>
          {porZona.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={porZona}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label
                >
                  {porZona.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">Nenhum dado disponível para zonas.</p>
          )}
        </div>
      </div>
    </div>
  );
}
