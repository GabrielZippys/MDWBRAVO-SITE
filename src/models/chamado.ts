import mongoose, { Schema, Document, models } from 'mongoose';

export interface IChamado extends Document {
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: Date;
  zona: string;
  prioridade: string;
  localizacao?: {
    lat: number;
    lng: number;
  };
}

const ChamadoSchema = new Schema<IChamado>({
  titulo: { type: String, required: true },
  loja: { type: String, required: true },
  status: { type: String, required: true },
  tipo: { type: String, required: true },
  dataCriacao: { type: Date, default: Date.now },
  zona: { type: String },
  prioridade: { type: String },
  localizacao: {
    lat: Number,
    lng: Number,
  },
});

const Chamado = models.Chamado || mongoose.model<IChamado>('Chamado', ChamadoSchema);
export default Chamado;
