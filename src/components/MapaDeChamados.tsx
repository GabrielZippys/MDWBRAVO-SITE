import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Corrige o ícone padrão do Leaflet (bug conhecido no React Leaflet)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const coordenadasPorSigla: Record<string, [number, number]> = {
  MA: [-23.5586, -46.6252],
  PP: [-23.4996, -46.8509],
  TS: [-23.5439, -46.8370],
  DD: [-23.4919, -46.8434],
  RP: [-23.5525, -46.6572],
  CL: [-23.5265, -46.8001],
  CB: [-23.6105, -46.7578],
  JS: [-23.5503, -46.633],
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

    if (status.toLowerCase() === 'em aberto') color = 'red';
    else if (status.toLowerCase() === 'realizando' || status.toLowerCase() === 'designado') color = 'orange';
    else if (status.toLowerCase() === 'resolvido' || status.toLowerCase() === 'feito') color = 'green';

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
    <div className="h-[500px] w-full rounded overflow-hidden shadow mb-10">
      <MapContainer center={[-23.55, -46.63]} zoom={11} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap'
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
