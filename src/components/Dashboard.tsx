// components/Dashboard.tsx
'use client';
// ... (outras importações e código permanecem os mesmos)
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
  Legend,
} from 'recharts';
import { useState, useMemo, ChangeEvent, useCallback } from 'react';

// Types (permanecem os mesmos)
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

// Constants (permanecem os mesmos)
const CORES_GRAFICOS = [
  '#a8dadc', '#f4a261', '#2a9d8f', '#e76f51',
  '#457b9d', '#ffb4a2', '#d4a373', '#e9c46a',
  '#264653', '#fca311'
];

// Helper Functions (permanecem os mesmos)
const getZonaFromLoja = (loja: string): string => getZona(loja);

const generateNotionPageLink = (notionPageId: string | undefined | null): string | null => {
  if (!notionPageId) return null;
  const cleanId = notionPageId.replace(/-/g, '');
  return `https://www.notion.so/${cleanId}`;
};


export default function Dashboard({ chamados }: DashboardProps) {
  // State, Memos, Handlers (permanecem os mesmos)
  const [filtroZona, setFiltroZona] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');

  const zonasUnicas = useMemo(() => {
    const todasAsLojas = chamados.map(c => c.loja);
    const lojasUnicas = Array.from(new Set(todasAsLojas));
    const zonasCalculadas = Array.from(new Set(lojasUnicas.map(loja => getZonaFromLoja(loja)).filter(Boolean)));
    return ['Todos', ...zonasCalculadas].sort();
  }, [chamados]);

  const statusUnicos = useMemo(() => (
    ['Todos', ...Array.from(new Set(chamados.map(c => c.status).filter(Boolean)))].sort()
  ), [chamados]);

  const tiposUnicos = useMemo(() => (
    ['Todos', ...Array.from(new Set(chamados.map(c => c.tipo).filter(Boolean)))].sort()
  ), [chamados]);

  const chamadosFiltrados = useMemo(() => {
    return chamados.filter(c =>
      (filtroZona === '' || filtroZona === 'Todos' || getZonaFromLoja(c.loja) === filtroZona) &&
      (filtroStatus === '' || filtroStatus === 'Todos' || c.status === filtroStatus) &&
      (filtroTipo === '' || filtroTipo === 'Todos' || c.tipo === filtroTipo)
    );
  }, [chamados, filtroZona, filtroStatus, filtroTipo]);

  const agruparDadosParaGrafico = useCallback((
    data: Chamado[],
    campo: keyof Omit<Chamado, '_id' | 'notionId' | 'titulo' | 'loja' | 'dataCriacao'> | 'zona'
  ): { nome: string; valor: number }[] => {
    const contagem: Record<string, number> = {};
    data.forEach(chamado => {
      let chave: string;
      if (campo === 'zona') {
        chave = getZonaFromLoja(chamado.loja);
      } else {
        const valorDoCampo = chamado[campo as keyof Chamado];
        chave = typeof valorDoCampo === 'string' ? valorDoCampo : String(valorDoCampo) || 'Não Definido';
      }
      contagem[chave] = (contagem[chave] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, []);

  const dadosPorStatus = useMemo(() => agruparDadosParaGrafico(chamadosFiltrados, 'status'), [chamadosFiltrados, agruparDadosParaGrafico]);
  const dadosPorTipo = useMemo(() => agruparDadosParaGrafico(chamadosFiltrados, 'tipo'), [chamadosFiltrados, agruparDadosParaGrafico]);
  const dadosPorZona = useMemo(() => agruparDadosParaGrafico(chamadosFiltrados, 'zona'), [chamadosFiltrados, agruparDadosParaGrafico]);
  const dadosPorPrioridade = useMemo(() => agruparDadosParaGrafico(chamadosFiltrados, 'prioridade'), [chamadosFiltrados, agruparDadosParaGrafico]);

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => (e: ChangeEvent<HTMLSelectElement>) => {
    setter(e.target.value === 'Todos' ? '' : e.target.value);
  };

  return (
    <div className="dashboardContainer p-4 md:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
           {/* Summary Statistics */}
      <div className="summaryStats mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
        {/* MODIFICADO AQUI 👇 */}
         <h2 className="titulo2 font-semibold">Lista de Chamados</h2>
        <p className="text-gray-300 text-center mt-1"> {/* Adicionado text-center e margem para o parágrafo também */}
            Exibindo <span className="font-bold text-blue-300">{chamadosFiltrados.length}</span> de <span className="font-bold">{chamados.length}</span> chamados.
        </p>
      </div>

      {/* Tabela de Chamados */}
      <div className="table-container mb-8 bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg overflow-x-auto">
        {/* MODIFICADO AQUI 👇 */}
       
        {chamadosFiltrados.length > 0 ? (
          <table className="tabela-chamados w-full mt-4"> {/* Adicionada margem superior à tabela */}
            {/* Conteúdo da tabela permanece o mesmo */}
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
              {chamadosFiltrados.map((chamado) => {
                const notionLink = generateNotionPageLink(chamado.notionId);
                return (
                  <tr key={chamado._id} className="hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="font-mono text-sm">
                      {notionLink ? (
                        <a href={notionLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                          {chamado.notionId || 'N/A'}
                        </a>
                      ) : (
                        chamado.notionId || 'N/A'
                      )}
                    </td>
                    <td className="truncate max-w-[150px] sm:max-w-[200px] text-sm" title={chamado.titulo}>{chamado.titulo}</td>
                    <td className="text-sm">{chamado.loja}</td>
                    <td>
                      <span
                        className="status-badge px-2.5 py-1 text-xs font-semibold rounded-full"
                        data-status={chamado.status.toLowerCase().replace(/\s+/g, '-')}
                      >
                        {chamado.status}
                      </span>
                    </td>
                    <td className="text-sm">{chamado.tipo}</td>
                    <td className="text-sm">{getZonaFromLoja(chamado.loja)}</td>
                    <td>
                      <span
                        className="prioridade-badge px-2.5 py-1 text-xs font-semibold rounded-full"
                        data-prioridade={chamado.prioridade?.toLowerCase().replace(/\s+/g, '-') || 'nao-definida'}
                      >
                        {chamado.prioridade || 'N/D'}
                      </span>
                    </td>
                    <td className="text-sm">{new Date(chamado.dataCriacao).toLocaleDateString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum chamado encontrado com os filtros aplicados.</p>
        )}
      </div>

      {/* Seção de Gráficos (permanece a mesma) */}
      <div className="Graficos grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chamados por Status */}
        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-blue-400 mb-3">Chamados por Status</h3> {/* Este já usa .titulo2 mas tem classes Tailwind adicionais */}
          {dadosPorStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPorStatus} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                <XAxis dataKey="nome" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip wrapperClassName="tooltip-recharts" />
                <Bar dataKey="valor" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">Sem dados de status.</p>}
        </div>

        {/* Chamados por Tipo */}
        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-green-400 mb-3">Chamados por Tipo</h3> {/* Este já usa .titulo2 */}
          {dadosPorTipo.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosPorTipo} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                <XAxis dataKey="nome" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip wrapperClassName="tooltip-recharts" />
                <Bar dataKey="valor" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">Sem dados de tipo.</p>}
        </div>

        {/* Chamados por Zona (Pie Chart) */}
        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-teal-400 mb-3">Chamados por Zona</h3> {/* Este já usa .titulo2 */}
          {dadosPorZona.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dadosPorZona}
                  dataKey="valor"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);
                    return (percent * 100) > 5 ? (
                      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12}>
                        {`${(percent * 100).toFixed(0)}%`}
                      </text>
                    ) : null;
                  }}
                >
                  {dadosPorZona.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{fontSize: "12px"}} />
                <Tooltip wrapperClassName="tooltip-recharts" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-gray-500 py-10">Nenhum dado disponível para zonas.</p>
          )}
        </div>

        {/* Chamados por Prioridade (Novo Gráfico) */}
        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-amber-400 mb-3">Chamados por Prioridade</h3> {/* Este já usa .titulo2 */}
          {dadosPorPrioridade.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={dadosPorPrioridade} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="nome" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                <Tooltip wrapperClassName="tooltip-recharts" />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                   {dadosPorPrioridade.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-center text-gray-500 py-10">Sem dados de prioridade.</p>}
        </div>
      </div>
    </div>
  );
}