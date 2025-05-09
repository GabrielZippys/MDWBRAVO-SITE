import mongoose, { Schema, Document, models } from 'mongoose';

export interface IChamado extends Document {
  notionId: number | string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: Date;
  zona?: string;
  prioridade?: string;
  localizacao?: {
    lat: number;
    lng: number;
  };
}

const ChamadoSchema = new Schema<IChamado>({
  notionId: { 
    type: String, 
    required: [true, 'ID do Notion é obrigatório'],
    unique: true
  }, // Adicionado ao schema
  titulo: { type: String, required: true },
  loja: { type: String, required: true },
  status: { type: String, required: true },
  tipo: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  zona: { type: String },
  prioridade: { type: String },
  localizacao: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

// Adicione index para melhor performance nas buscas
ChamadoSchema.index({ notionId: 1 }, { unique: true });
ChamadoSchema.index({ loja: 1, status: 1 });

const Chamado = models.Chamado || mongoose.model<IChamado>('Chamado', ChamadoSchema);
export default Chamado;