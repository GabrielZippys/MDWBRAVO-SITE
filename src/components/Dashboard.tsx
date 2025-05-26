// components/Dashboard.tsx
'use client';
import { getZona } from '@/utils/classifyZone';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';
import type { Projeto } from '@/lib/notion'; // Importa a interface Projeto correta

// Usando Projeto diretamente como o tipo para os itens da lista de chamados
type Chamado = Projeto;

type DashboardProps = {
  chamados: Chamado[];
};

const CORES_GRAFICOS = [
  '#a8dadc', '#f4a261', '#2a9d8f', '#e76f51',
  '#457b9d', '#ffb4a2', '#d4a373', '#e9c46a',
  '#264653', '#fca311'
];

const getZonaFromLoja = (loja: string | null | undefined): string => {
    if (!loja) return 'Zona Desconhecida';
    return getZona(loja);
};

const generateNotionPageLink = (pageId: string | undefined | null): string | null => {
  if (!pageId) return null;
  const cleanId = pageId.replace(/-/g, '');
  return `https://www.notion.so/${cleanId}`;
};

// Chaves ordenáveis, incluindo numeroChamado e nome
type SortableChamadoKey = 
  | keyof Pick<Chamado, 'numeroChamado' | 'nome' | 'loja' | 'status' | 'tipo' | 'prioridade' | 'criadoEm' | 'setor' | 'cliente'> 
  | 'zona';

export default function Dashboard({ chamados }: DashboardProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortableChamadoKey; direction: 'asc' | 'desc' } | null>(null);

  const chamadosParaExibir = chamados;

  const chamadosOrdenados = useMemo(() => {
    let sortableItems = [...chamadosParaExibir];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA: any;
        let valB: any;

        if (sortConfig.key === 'zona') {
          valA = getZonaFromLoja(a.loja);
          valB = getZonaFromLoja(b.loja);
        } else {
          valA = a[sortConfig.key as keyof Chamado];
          valB = b[sortConfig.key as keyof Chamado];
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (sortConfig.key === 'criadoEm') {
          const dateA = new Date(valA as string).getTime();
          const dateB = new Date(valB as string).getTime();
          if (isNaN(dateA) && isNaN(dateB)) return 0;
          if (isNaN(dateA)) return 1; 
          if (isNaN(dateB)) return -1;
          if (dateA < dateB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (dateA > dateB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else if (typeof valA === 'number' && typeof valB === 'number') {
          if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        } else { 
          const strA = String(valA).toLowerCase();
          const strB = String(valB).toLowerCase();
          if (strA < strB) return sortConfig.direction === 'asc' ? -1 : 1;
          if (strA > strB) return sortConfig.direction === 'asc' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [chamadosParaExibir, sortConfig]);
  
  const agruparDadosParaGrafico = useCallback((
    data: Chamado[],
    campo: keyof Pick<Chamado, 'status' | 'tipo' | 'prioridade' | 'setor'> | 'zona'
  ): { nome: string; valor: number }[] => {
    const contagem: Record<string, number> = {};
    data.forEach(chamado => {
      let chave: string;
      if (campo === 'zona') {
        chave = getZonaFromLoja(chamado.loja);
      } else {
        const valorDoCampo = chamado[campo as keyof Chamado];
        chave = typeof valorDoCampo === 'string' ? valorDoCampo : String(valorDoCampo);
      }
      chave = chave || 'Não Definido';
      contagem[chave] = (contagem[chave] || 0) + 1;
    });
    return Object.entries(contagem)
      .map(([nome, valor]) => ({ nome, valor }))
      .sort((a, b) => b.valor - a.valor);
  }, []);
  
  const dadosPorStatus = useMemo(() => agruparDadosParaGrafico(chamadosParaExibir, 'status'), [chamadosParaExibir, agruparDadosParaGrafico]);
  const dadosPorTipo = useMemo(() => agruparDadosParaGrafico(chamadosParaExibir, 'tipo'), [chamadosParaExibir, agruparDadosParaGrafico]);
  const dadosPorZona = useMemo(() => agruparDadosParaGrafico(chamadosParaExibir, 'zona'), [chamadosParaExibir, agruparDadosParaGrafico]);
  const dadosPorPrioridade = useMemo(() => agruparDadosParaGrafico(chamadosParaExibir, 'prioridade'), [chamadosParaExibir, agruparDadosParaGrafico]);

  const requestSort = (key: SortableChamadoKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const renderSortArrow = (columnKey: SortableChamadoKey) => {
    if (!sortConfig || sortConfig.key !== columnKey) {
      return <span className="ml-1 opacity-0 group-hover:opacity-50">↕️</span>;
    }
    return sortConfig.direction === 'asc' ? <span className="ml-1">🔼</span> : <span className="ml-1">🔽</span>;
  };

  return (
    <div className="dashboardContainer p-4 md:p-6 lg:p-8 bg-gray-900 text-white min-h-screen">
      <div className="summaryStats mb-6 p-4 bg-gray-800 rounded-lg shadow-lg">
        <h2 className="titulo2 font-semibold">Lista de Chamados</h2>
        <p className="text-gray-300 text-center mt-1">
          Exibindo <span className="font-bold text-blue-300">{chamadosOrdenados.length}</span> de <span className="font-bold">{chamados.length}</span> chamados.
        </p>
      </div>

      <div className="table-container mb-8 bg-gray-800 p-1 sm:p-2 rounded-lg shadow-lg overflow-x-auto">
        {chamadosOrdenados.length > 0 ? (
          <table className="tabela-chamados w-full mt-4 table-fixed"> 
            <colgroup>
              {/* Coluna ID Notion (numeroChamado) */}
              <col className="w-24 md:w-28" /> 
              {/* Título (nome) - AUMENTADA */}
              <col className="w-2/5 lg:w-1/2" /> 
              {/* Loja */}
              <col className="w-20 md:w-24" /> 
              {/* Status */}
              <col className="w-32 md:w-36" /> 
              {/* Tipo - DIMINUÍDA */}
              <col className="w-28 md:w-24" /> 
              {/* Zona */}
              <col className="w-28 md:w-32" /> 
              {/* Prioridade */}
              <col className="w-24 md:w-28" /> 
              {/* Criado em */}
              <col className="w-28 md:w-32" /> 
            </colgroup>
            <thead>
              <tr>
                <th onClick={() => requestSort('numeroChamado')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  ID Notion{renderSortArrow('numeroChamado')}
                </th>
                <th onClick={() => requestSort('nome')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Título{renderSortArrow('nome')}
                </th>
                <th onClick={() => requestSort('loja')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Loja{renderSortArrow('loja')}
                </th>
                <th onClick={() => requestSort('status')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Status{renderSortArrow('status')}
                </th>
                <th onClick={() => requestSort('tipo')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Tipo{renderSortArrow('tipo')}
                </th>
                <th onClick={() => requestSort('zona')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Zona{renderSortArrow('zona')}
                </th>
                <th onClick={() => requestSort('prioridade')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Prioridade{renderSortArrow('prioridade')}
                </th>
                <th onClick={() => requestSort('criadoEm')} 
                    className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors text-left">
                  Criado em{renderSortArrow('criadoEm')}
                </th>
              </tr>
            </thead>
            <tbody>
              {chamadosOrdenados.map((chamado) => { 
                const notionLink = generateNotionPageLink(chamado.pageId);
                return (
                  <tr key={chamado.pageId} className="hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="font-mono text-xs sm:text-sm p-2 align-top truncate">
                      {notionLink && chamado.numeroChamado ? (
                        <a href={notionLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                          {chamado.numeroChamado}
                        </a>
                      ) : (
                        chamado.numeroChamado || 'N/A' 
                      )}
                    </td>
                    <td className="text-xs sm:text-sm p-2 align-top truncate hover:whitespace-normal" title={chamado.nome}>
                      {chamado.nome}
                    </td>
                    <td className="text-xs sm:text-sm p-2 align-top truncate">{chamado.loja || 'N/A'}</td>
                    <td className="p-2 align-top">
                      <span
                        className="status-badge px-2 py-0.5 text-xs font-semibold rounded-full block w-full text-center"
                        data-status={(chamado.status || '').toLowerCase().replace(/\s+/g, '-')}
                      >
                        {chamado.status || 'N/D'}
                      </span>
                    </td>
                    <td className="text-xs sm:text-sm p-2 align-top truncate">{chamado.tipo || 'N/A'}</td>
                    <td className="text-xs sm:text-sm p-2 align-top truncate">{getZonaFromLoja(chamado.loja)}</td>
                    <td className="p-2 align-top">
                      <span
                        className="prioridade-badge px-2 py-0.5 text-xs font-semibold rounded-full block w-full text-center"
                        data-prioridade={chamado.prioridade?.toLowerCase().replace(/\s+/g, '-') || 'nao-definida'}
                      >
                        {chamado.prioridade || 'N/D'}
                      </span>
                    </td>
                    <td className="text-xs sm:text-sm p-2 align-top">
                      {chamado.criadoEm && !isNaN(new Date(chamado.criadoEm).getTime())
                        ? new Date(chamado.criadoEm).toLocaleDateString('pt-BR')
                        : 'Data Inválida'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum chamado encontrado.</p>
        )}
      </div>
      
      {/* Seção de Gráficos */}
      {/* ... (código dos gráficos permanece o mesmo, mas certifique-se que os campos como 'tipo', 'setor' existem em Projeto) ... */}
      <div className="Graficos grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-blue-400 mb-3">Chamados por Status</h3>
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

        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-green-400 mb-3">Chamados por Tipo</h3>
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

        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-teal-400 mb-3">Chamados por Zona</h3>
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
                    <Cell key={`cell-pie-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
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

        <div className="graphic-container bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="titulo2 text-lg font-semibold text-amber-400 mb-3">Chamados por Prioridade</h3>
          {dadosPorPrioridade.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
               <BarChart data={dadosPorPrioridade} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <XAxis type="number" stroke="#9ca3af" fontSize={12} />
                <YAxis dataKey="nome" type="category" stroke="#9ca3af" fontSize={12} width={100} />
                <Tooltip wrapperClassName="tooltip-recharts" />
                <Legend wrapperStyle={{fontSize: "12px"}}/>
                <Bar dataKey="valor" fill="#f59e0b" radius={[0, 4, 4, 0]} barSize={20}>
                   {dadosPorPrioridade.map((_entry, index) => (
                    <Cell key={`cell-bar-${index}`} fill={CORES_GRAFICOS[index % CORES_GRAFICOS.length]} />
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