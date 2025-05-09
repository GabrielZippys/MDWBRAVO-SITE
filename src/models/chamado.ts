import mongoose, { Schema, Document, models } from 'mongoose';

export interface IChamado extends Document {
  notionId: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: Date;
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
    unique: true,
    index: true
  },
  titulo: { type: String, required: true },
  loja: { type: String, required: true },
  status: { type: String, required: true },
  tipo: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  prioridade: { type: String },
  localizacao: {
    lat: { type: Number },
    lng: { type: Number },
  },
});

const Chamado = models.Chamado || mongoose.model<IChamado>('Chamado', ChamadoSchema);
export default Chamado;