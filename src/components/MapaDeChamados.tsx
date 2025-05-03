import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige o ícone padrão do Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Coordenadas por sigla da loja
const coordenadasPorSigla: Record<string, [number, number]> = {
  MA: [-23.5586, -46.6252],
  PP: [-23.4996, -46.8509],
  TS: [-23.5439, -46.8370],
  DD: [-23.4919, -46.8434],
  RP: [-23.5525, -46.6572],
  CL: [-23.5265, -46.8001],
  CB: [-23.6105, -46.7578],
  JS: [-23.5503, -46.6330],
  EL: [-23.5475, -46.6361],
  JB: [-23.5563, -46.7314],
  NT: [-23.5615, -46.6559],
  DJ: [-23.4920, -46.8500],
  SD: [-23.5593, -46.7358],
  NS: [-23.5105, -46.7291],
  BU: [-23.5405, -46.6333],
  FC: [-23.5300, -46.6350],
  // Adicione mais siglas conforme necessário
};

// Tipo do chamado
type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: string;
  tipo: string;
  dataCriacao: string;
  zona: string;
};

export default function MapaDeChamados({ chamados }: { chamados: Chamado[] }) {
  // Ícones personalizados por status
  const getIconByStatus = (status: string) => {
    let color = 'blue';

    const statusLower = status.toLowerCase();

    if (statusLower === 'em aberto') color = 'red';
    else if (statusLower === 'realizando' || statusLower === 'designado') color = 'orange';
    else if (statusLower === 'resolvido' || statusLower === 'feito') color = 'green';

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
  };

  return (
    <div className="my-6">
      <h2 className="text-xl font-bold mb-2">🗺️ Mapa Interativo</h2>
      <MapContainer
        center={[-23.55, -46.64]} // Região de São Paulo
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '500px', width: '100%', maxWidth: '1000px' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {chamados.map((chamado) => {
          const sigla = chamado.loja?.match(/[A-Z]{2,}/)?.[0]?.toUpperCase();
          const coordenadas = coordenadasPorSigla[sigla || ''];

          if (!coordenadas) return null;

          return (
            <Marker
              key={chamado._id}
              position={coordenadas}
              icon={getIconByStatus(chamado.status)}
            >
              <Popup>
                <strong>{chamado.titulo}</strong><br />
                🏪 Loja: {chamado.loja}<br />
                🧭 Zona: {chamado.zona}<br />
                📅 {new Date(chamado.dataCriacao).toLocaleDateString('pt-BR')}<br />
                📌 Status: {chamado.status}<br />
                📂 Tipo: {chamado.tipo}
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
