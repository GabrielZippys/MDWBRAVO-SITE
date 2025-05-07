'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

type MapaProps = {
  chamados: Array<{
    coordenadas?: [number, number];
    titulo: string;
    status: string;
  }>;
};

export default function MapaDeChamados({ chamados }: MapaProps) {
  return (
    <MapContainer 
      center={[-23.5505, -46.6333]} 
      zoom={12} 
      className="h-[500px] w-full rounded-lg"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />

      {chamados.map((chamado, index) => (
        chamado.coordenadas && (
          <Marker key={index} position={chamado.coordenadas}>
            <Popup>
              <div className="popup-content">
                <h3 className="font-bold">{chamado.titulo}</h3>
                <p>Status: {chamado.status}</p>
              </div>
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  );
}