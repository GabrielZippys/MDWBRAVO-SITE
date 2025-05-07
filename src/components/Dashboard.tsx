// components/Dashboard.tsx
'use client';
import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
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

type Coordenadas = [number, number];

type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
  prioridade?: string;
  coordenadas?: Coordenadas;
};

type DashboardProps = {
  chamados: Chamado[];
};

const Map = dynamic(() => import('@/components/MapaDeChamados'), { 
  ssr: false,
  loading: () => <div className="mapa-carregando">Carregando mapa...</div>
});

const cores = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Dashboard({ chamados }: DashboardProps) {
  const [filtros, setFiltros] = useState({
    zona: '',
    status: '',
    tipo: ''
  });

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtros.zona || c.zona === filtros.zona) &&
      (!filtros.status || c.status === filtros.status) &&
      (!filtros.tipo || c.tipo === filtros.tipo)
    );
  }, [chamados, filtros]);

  const agruparPor = <K extends keyof Chamado>(campo: K): Array<{ nome: string; valor: number }> => {
    const cont: Record<string, number> = {};
    
    chamadosFiltrados.forEach(c => {
      const valor = c[campo];
      let chave: string;

      if (Array.isArray(valor)) {
        // Converte coordenadas para string única
        chave = valor.join(',');
      } else {
        chave = String(valor || 'Não definido');
      }

      cont[chave] = (cont[chave] || 0) + 1;
    });

    return Object.entries(cont).map(([nome, valor]) => ({ nome, valor }));
  };

  const dadosGraficos = {
    status: agruparPor('status'),
    tipo: agruparPor('tipo'),
    zona: agruparPor('zona'),
    coordenadas: agruparPor('coordenadas')
  };

  return (
    <div className="dashboard-container">
      {/* Seção de Filtros */}
      <div className="filtros-avancados">
        {/* Componentes de filtro mantidos */}
      </div>

      {/* Mapa Interativo */}
      <div className="mapa-section">
        <h3>Distribuição Geográfica</h3>
        <Map chamados={chamadosFiltrados} />
      </div>

      {/* Gráficos e Tabela */}
      <div className="graficos-section">
        {/* Gráficos atualizados */}
        <div className="grafico-card">
          <h4>Chamados por Localização</h4>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dadosGraficos.coordenadas}>
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="valor" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}