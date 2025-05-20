// pages/projetos.tsx
import { useEffect, useState } from 'react';
import { getProjetosFromNotion } from "@/lib/notion";
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface Projeto {
  id: string;
  nome: string;
  setor: string;
  status?: string;
  responsavel?: string;
  descricao?: string;
  [key: string]: any;
}

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState<Projeto | null>(null);

  useEffect(() => {
    async function fetchProjetos() {
      const todosProjetos = await getProjetosFromNotion();
      const filtrados = todosProjetos.filter((proj: Projeto) =>
        proj.setor === 'Infra' || proj.setor === 'Infra&BI'
      );
      setProjetos(filtrados);
    }
    fetchProjetos();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Projetos - Infraestrutura</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projetos.map((projeto) => (
          <Dialog key={projeto.id}>
            <DialogTrigger asChild>
              <Card
                className="cursor-pointer hover:shadow-xl transition"
                onClick={() => setProjetoSelecionado(projeto)}
              >
                <CardContent className="p-4">
                  <h2 className="text-xl font-semibold mb-2">{projeto.nome}</h2>
                  <p className="text-sm text-gray-600">Responsável: {projeto.responsavel}</p>
                  <p className="text-sm text-gray-600">Status: {projeto.status}</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent>
              <h2 className="text-2xl font-bold mb-4">{projetoSelecionado?.nome}</h2>
              <p className="mb-2"><strong>Setor:</strong> {projetoSelecionado?.setor}</p>
              <p className="mb-2"><strong>Responsável:</strong> {projetoSelecionado?.responsavel}</p>
              <p className="mb-2"><strong>Status:</strong> {projetoSelecionado?.status}</p>
              <p className="mb-2"><strong>Descrição:</strong> {projetoSelecionado?.descricao}</p>
              {/* Adicione mais campos conforme necessário */}
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
}
