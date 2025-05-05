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
  prioridade: string; // campo "prioridade" adicionado
};

type DashboardProps = {
  chamados: Chamado[];
};

const cores = ['#a8dadc', '#f4a261', '#2a9d8f', '#e76f51', '#457b9d', '#ffb4a2', '#d4a373'];

export default function Dashboard({ chamados }: DashboardProps) {
  const [filtroZona, setFiltroZona] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);

  // Função para obter opções únicas de cada campo
  const opcoesUnicas = (campo: keyof Chamado) =>
    [...new Set(chamados.map((c) => c[campo] || 'Não definido'))] as string[];

  // Filtra os chamados conforme os filtros internos do Dashboard
  const chamadosFiltrados = useMemo(() => {
    return chamados.filter((c) => {
      const zonaOk = !filtroZona || c.zona === filtroZona;
      const statusOk = !filtroStatus || c.status === filtroStatus;
      const tipoOk = !filtroTipo || c.tipo === filtroTipo;
      return zonaOk && statusOk && tipoOk;
    });
  }, [chamados, filtroZona, filtroStatus, filtroTipo]);

  // Função para agrupar chamados por campo
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

  return (
    <div className="">

      {/* Tabela de Chamados */}
      <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray- 50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Loja</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Criação</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Zona</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {chamadosFiltrados.map((c) => (
              <tr key={c._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.titulo}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.loja}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{c.status}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
  c.prioridade?.toLowerCase() === 'baixa' ? 'bg-green-200 text-green-800' :
  c.prioridade?.toLowerCase() === 'média' ? 'bg-yellow-200 text-yellow-800' :
  c.prioridade?.toLowerCase() === 'alta' ? 'bg-orange-200 text-orange-800' :
  c.prioridade?.toLowerCase() === 'crítica' ? 'bg-red-200 text-red-800' :
  ''
}`}>{c.prioridade || 'Não definida'}</td>

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

      {/* Gráficos */}
      <div className="Graficos">
        <GraficoBarras titulo="Chamados por Status" dados={porStatus} cor="#a8dadc"/>
        <GraficoBarras titulo="Chamados por Tipo" dados={porTipo} cor="#f4a261" />
        <GraficoPizza titulo="Chamados por Zona" dados={porZona} />
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
        className="bg-gray-700 text-white border border-gray-600 rounded-md px-2 py-1 text-sm shadow focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="Graficos">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados}>
          <XAxis dataKey="nome" />
          <YAxis />
          <Tooltip />
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
    <div className="Graficos">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{titulo}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {dados.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
