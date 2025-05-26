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
  Legend,
} from 'recharts';
import { useState, useMemo, useCallback } from 'react';

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

const CORES_GRAFICOS = [
  '#a8dadc', '#f4a261', '#2a9d8f', '#e76f51',
  '#457b9d', '#ffb4a2', '#d4a373', '#e9c46a',
  '#264653', '#fca311'
];

const getZonaFromLoja = (loja: string): string => getZona(loja);

const generateNotionPageLink = (notionPageId: string | undefined | null): string | null => {
  if (!notionPageId) return null;
  const cleanId = notionPageId.replace(/-/g, '');
  return `https://www.notion.so/${cleanId}`;
};

type SortableChamadoKey = keyof Chamado | 'zona';

export default function Dashboard({ chamados }: DashboardProps) {
  const [sortConfig, setSortConfig] = useState<{ key: SortableChamadoKey; direction: 'asc' | 'desc' } | null>(null);

  const chamadosParaExibir = chamados;

  const chamadosOrdenados = useMemo(() => {
    let sortableItems = [...chamadosParaExibir];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA: string | number | undefined | null;
        let valB: string | number | undefined | null;

        if (sortConfig.key === 'zona') {
          valA = getZonaFromLoja(a.loja);
          valB = getZonaFromLoja(b.loja);
        } else {
          valA = a[sortConfig.key as keyof Chamado];
          valB = b[sortConfig.key as keyof Chamado];
        }

        if (valA === undefined || valA === null) valA = '';
        if (valB === undefined || valB === null) valB = '';

        if (sortConfig.key === 'dataCriacao') {
          const dateA = new Date(valA as string).getTime();
          const dateB = new Date(valB as string).getTime();
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
      if (chave) {
        contagem[chave] = (contagem[chave] || 0) + 1;
      } else {
        contagem['Não Definido'] = (contagem['Não Definido'] || 0) + 1;
      }
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

      <div className="table-container mb-8 bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg overflow-x-auto">
        {chamadosOrdenados.length > 0 ? (
          <table className="tabela-chamados w-full mt-4">
            <thead>
              <tr>
                {/* AQUI: Ajustes de classes. Usando `whitespace-nowrap` e `w-full` para Título */}
                <th onClick={() => requestSort('notionId')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">ID Notion{renderSortArrow('notionId')}</th>
                <th onClick={() => requestSort('titulo')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors w-full">Título{renderSortArrow('titulo')}</th>
                <th onClick={() => requestSort('loja')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Loja{renderSortArrow('loja')}</th>
                <th onClick={() => requestSort('status')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Status{renderSortArrow('status')}</th>
                <th onClick={() => requestSort('tipo')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Tipo{renderSortArrow('tipo')}</th>
                <th onClick={() => requestSort('zona')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Zona{renderSortArrow('zona')}</th>
                <th onClick={() => requestSort('prioridade')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Prioridade{renderSortArrow('prioridade')}</th>
                <th onClick={() => requestSort('dataCriacao')} className="cursor-pointer group p-2 hover:bg-gray-700 transition-colors whitespace-nowrap">Criado em{renderSortArrow('dataCriacao')}</th>
              </tr>
            </thead>
            <tbody>
              {chamadosOrdenados.map((chamado) => {
                const notionLink = generateNotionPageLink(chamado.notionId);
                return (
                  <tr key={chamado._id} className="hover:bg-gray-700/50 transition-colors duration-150">
                    <td className="font-mono text-sm p-2">
                      {notionLink ? (
                        <a href={notionLink} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 hover:underline">
                          {chamado.notionId || 'N/A'}
                        </a>
                      ) : (
                        chamado.notionId || 'N/A'
                      )}
                    </td>
                    {/* AQUI: Removido `max-w-*` para permitir que a célula cresça */}
                    <td className="text-sm p-2 truncate" title={chamado.titulo}>{chamado.titulo}</td>
                    <td className="text-sm p-2">{chamado.loja}</td>
                    <td className="p-2">
                      <span
                        className="status-badge px-2.5 py-1 text-xs font-semibold rounded-full"
                        data-status={chamado.status.toLowerCase().replace(/\s+/g, '-')}
                      >
                        {chamado.status}
                      </span>
                    </td>
                    <td className="text-sm p-2">{chamado.tipo}</td>
                    <td className="text-sm p-2">{getZonaFromLoja(chamado.loja)}</td>
                    <td className="p-2">
                      <span
                        className="prioridade-badge px-2.5 py-1 text-xs font-semibold rounded-full"
                        data-prioridade={chamado.prioridade?.toLowerCase().replace(/\s+/g, '-') || 'nao-definida'}
                      >
                        {chamado.prioridade || 'N/D'}
                      </span>
                    </td>
                    <td className="text-sm p-2">{new Date(chamado.dataCriacao).toLocaleDateString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-gray-500 py-8">Nenhum chamado encontrado.</p>
        )}
      </div>

      {/* Seção de Gráficos (sem alterações) */}
      <div className="Graficos grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráficos aqui... */}
      </div>
    </div>
  );
}