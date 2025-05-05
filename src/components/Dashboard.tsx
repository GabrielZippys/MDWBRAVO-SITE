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
  Cell
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
  <ResponsiveContainer width="100%" height={250}>
    <PieChart key={JSON.stringify(porZona)}>
      <Pie
        data={porZona}
        dataKey="valor"
        nameKey="nome"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label
        isAnimationActive={false}
      >
        {porZona.map((_, i) => (
          <Cell key={i} fill={cores[i % cores.length]} />
        ))}
      </Pie>
      <Tooltip />
    </PieChart>
  </ResponsiveContainer>
</div>
      </div>
    </div>
  );
}
