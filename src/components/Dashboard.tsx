// components/Dashboard.tsx
'use client';
import { getZona } from '@/utils/classifyZone';
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
  notionId: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
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

  const getZonaFromLoja = (loja: string) => getZona(loja);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (!filtroZona || getZonaFromLoja(c.loja) === filtroZona) &&
      (!filtroStatus || c.status === filtroStatus) &&
      (!filtroTipo || c.tipo === filtroTipo)
    );
  }, [chamados, filtroZona, filtroStatus, filtroTipo]);

  const agruparPor = (campo: keyof Chamado | 'zona') => {
    const cont: Record<string, number> = {};
    
    chamadosFiltrados.forEach(c => {
      let chave: string;
      
      if (campo === 'zona') {
        chave = getZonaFromLoja(c.loja);
      } else {
        chave = c[campo] || 'Não definido';
      }
      
      cont[chave] = (cont[chave] || 0) + 1;
    });
    
    return Object.entries(cont).map(([nome, valor]) => ({ nome, valor }));
  };

  const porStatus = agruparPor('status');
  const porTipo = agruparPor('tipo');
  const porZona = agruparPor('zona');

  return (
    <div className="dashboardContainer">
      <div className="table-container">
        <table className="tabela-chamados">
          <thead>
            <tr>
              <th>ID Notion</th>
              <th>Título</th>
              <th>Loja</th>
              <th>Status</th>
              <th>Tipo</th>
              <th>Zona</th>
              <th>Prioridade</th>
              <th>Criado em</th>
            </tr>
          </thead>
          <tbody>
            {chamadosFiltrados.map((chamado) => (
              <tr key={chamado._id}>
                <td className="font-mono">{chamado.notionId || 'N/A'}</td>
                <td className="truncate max-w-[200px]">{chamado.titulo}</td>
                <td>{chamado.loja}</td>
                <td>
                  <span 
                    className="status-badge" 
                    data-status={chamado.status.replace(/\s/g, '')}
                  >
                    {chamado.status}
                  </span>
                </td>
                <td>{chamado.tipo}</td>
                <td>{getZonaFromLoja(chamado.loja)}</td>
                <td>{chamado.prioridade || 'Não definida'}</td>
                <td>{new Date(chamado.dataCriacao).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="Graficos">
        <div>
          <h3 className="titulo2">Chamados por Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porStatus}>
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

        <div>
          <h3 className="titulo2">Chamados por Tipo</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={porTipo}>
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="valor" 
                fill="#10b981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div>
          <h3 className="titulo2">Chamados por Zona</h3>
          {porZona.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={porZona}
                  dataKey="valor"
                  nameKey="nome"
                  outerRadius={80}
                  label
                >
                  {porZona.map((_, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={cores[index % cores.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500">
              Nenhum dado disponível para zonas
            </p>
          )}
        </div>
      </div>
    </div>
  );
}