'use client';

import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
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
    return chamados.filter((c) =>
      (!filtroZona || c.zona === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroTipo || c.tipo === filtroTipo)
    );
  }, [chamados, filtroZona, filtroStatus, filtroTipo]);

  const agruparPor = (campo: keyof Chamado) => {
    const contador: Record<string, number> = {};
    chamadosFiltrados.forEach((c) => {
      const chave = c[campo] || 'Não definido';
      contador[chave] = (contador[chave] || 0) + 1;
    });
    return Object.entries(contador).map(([nome, valor]) => ({ nome, valor }));
  };

  const porStatus = agruparPor('status');
  const porZona = agruparPor('zona');
  const porTipo = agruparPor('tipo');

  const opcoesUnicas = (campo: keyof Chamado) =>
    [...new Set(chamados.map((c) => c[campo] || 'Não definido'))];

    return (
      <div className="space-y-6">
      
  
        {/* Tabela de Chamados */}
        <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {chamados.map((c) => (
                <tr key={c._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.titulo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.loja}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.status}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.tipo}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(c.dataCriacao).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.zona}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
  
        {/* Gráficos (existentes) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <GraficoBarras titulo="Chamados por Status" dados={porStatus} cor="#a8dadc" />
          <GraficoBarras titulo="Chamados por Tipo" dados={porTipo} cor="#f4a261" />
          <GraficoPizza  titulo="Chamados por Zona"  dados={porZona} />
        </div>
      </div>
    );
  }
  
function Filtro({
  label, valor, opcoes, onChange
}: {
  label: string;
  valor: string | null;
  opcoes: string[];
  onChange: (val: string | null) => void;
}) {
  return (
    <div className="min-w-[150px]">
      <label className="block text-sm font-medium text-white mb-1">{label}</label>
      <select
        value={valor || ''}
        onChange={(e) => onChange(e.target.value || null)}
        className="bg-gray-700 text-white border border-gray-600 px-3 py-2 rounded-lg text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Todos</option>
        {opcoes.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );
}

function GraficoBarras({
  titulo,
  dados,
  cor
}: {
  titulo: string;
  dados: { nome: string; valor: number }[];
  cor: string;
}) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md transition hover:shadow-lg">
      <h2 className="text-lg font-bold mb-2 text-white">{titulo}</h2>
      <ResponsiveContainer width="100%" height={500}>
        <BarChart data={dados}>
          <XAxis dataKey="nome" stroke="#fff" />
          <YAxis stroke="#fff" />
          <Tooltip />
          <Legend />
          <Bar dataKey="valor" fill={cor} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function GraficoPizza({
  titulo,
  dados
}: {
  titulo: string;
  dados: { nome: string; valor: number }[];
}) {
  return (
    <div className="bg-gray-800 p-4 rounded-xl shadow-md transition hover:shadow-lg col-span-1 md:col-span-2">
      <h2 className="text-lg font-bold mb-2 text-white">{titulo}</h2>
      <ResponsiveContainer width="100%" height={500}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            outerRadius={100}
            label
          >
            {dados.map((_, index) => (
              <Cell key={index} fill={cores[index % cores.length]} />
            ))}
          </Pie>
          <Legend />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
