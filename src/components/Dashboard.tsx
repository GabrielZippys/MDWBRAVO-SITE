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
  const porTipo   = agruparPor('tipo');
  const porZona   = agruparPor('zona');

  return (
    <div className="space-y-8">
      {/* Tabela de Chamados omitida para brevidade */}
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

<h3 className="titulo2">Chamados por Status</h3>
<h3 className="titulo2">Chamados por Tipo</h3>
<h3 className="titulo2">Chamados por Zona</h3>

      <div className="Graficos">
        {/* Chamados por Status */}
        
          
          <ResponsiveContainer width="50%" height={250}>
            <BarChart data={porStatus}>
              <XAxis dataKey="nome" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Bar dataKey="valor" fill={cores[0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        

        {/* Chamados por Tipo */}
        
         
          <ResponsiveContainer width="50%" height={250}>
            <BarChart data={porTipo}>
              <XAxis dataKey="nome" stroke="#555" />
              <YAxis stroke="#555" />
              <Tooltip />
              <Bar dataKey="valor" fill={cores[1]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        

        {/* Chamados por Zona */}
        
        {porZona.length > 0 ? (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={porZona}
          dataKey="valor"
          nameKey="nome"
          outerRadius={90}
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
  );
}
