import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
};

export default function Dashboard({ chamados }: { chamados: Chamado[] }) {
  const agruparPor = (campo: keyof Chamado) => {
    const contador: Record<string, number> = {};
    chamados.forEach((c) => {
      const chave = c[campo] || 'Não definido';
      contador[chave] = (contador[chave] || 0) + 1;
    });
    return Object.entries(contador).map(([nome, valor]) => ({ nome, valor }));
  };

  const cores = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6666', '#a8e6cf'];

  const porStatus = agruparPor('status');
  const porZona = agruparPor('zona');
  const porTipo = agruparPor('tipo');

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-10">
      {/* Gráfico de barras: Status */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Chamados por Status</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porStatus}>
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#3182ce" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de pizza: Zona */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-bold mb-2">Chamados por Zona</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={porZona} dataKey="valor" nameKey="nome" outerRadius={100} fill="#8884d8" label>
              {porZona.map((_, index) => (
                <Cell key={`cell-${index}`} fill={cores[index % cores.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de barras: Tipo */}
      <div className="bg-white p-4 rounded shadow col-span-full">
        <h2 className="text-lg font-bold mb-2">Chamados por Tipo</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={porTipo}>
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="valor" fill="#00C49F" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
