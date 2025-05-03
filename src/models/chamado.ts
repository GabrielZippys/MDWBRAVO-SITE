import mongoose from 'mongoose';

const ChamadoSchema = new mongoose.Schema({
  titulo: String,
  loja: String,
  status: String,
  tipo: String,
  dataCriacao: Date,
  zona: String,
});

export default mongoose.models.Chamado || mongoose.model('Chamado', ChamadoSchema);
