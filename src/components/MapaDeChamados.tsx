import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/leaflet-fix.module.css';

type ChamadoStatus = 'em aberto' | 'realizando' | 'designado' | 'resolvido' | 'feito' | 'outros';

type Chamado = {
  _id: string;
  titulo: string;
  loja: string;
  status: ChamadoStatus;
  tipo: string;
  dataCriacao: string;
  zona: string;
};

const coordenadasPorSigla: Record<string, [number, number]> = {
  // ... mantido igual
};

interface MapaDeChamadosProps {
  chamados: Chamado[];
}

const colorMap: Record<ChamadoStatus, string> = {
  'em aberto': 'red',
  'realizando': 'orange',
  'designado': 'orange',
  'resolvido': 'green',
  'feito': 'green',
  'outros': 'blue'
};

const MapLoader = () => (
  <div className="p-4 text-center text-gray-500">
    Carregando mapa...
  </div>
);

export default function MapaDeChamados({ chamados }: MapaDeChamadosProps) {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    configureLeafletIcons();
  }, []);

  const configureLeafletIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: '/markers/marker-icon-2x.png',
      iconUrl: '/markers/marker-icon.png',
      shadowUrl: '/markers/marker-shadow.png',
    });
  };

  const getIconByStatus = useMemo(() => {
    const iconCache = new Map<string, L.Icon>();

    return (status: ChamadoStatus) => {
      const color = colorMap[status];
      
      if (!iconCache.has(color)) {
        iconCache.set(color, new L.Icon({
          iconUrl: `/markers/marker-icon-${color}.png`,
          iconRetinaUrl: `/markers/marker-icon-2x-${color}.png`,
          shadowUrl: '/markers/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        }));
      }
      
      return iconCache.get(color)!;
    };
  }, []);

  const markers = useMemo(() => {
    return chamados
      .map((chamado) => {
        const sigla = chamado.loja?.match(/[A-Z]{2,}/)?.[0]?.toUpperCase() || '';
        const coordenadas = coordenadasPorSigla[sigla];
        return coordenadas ? { ...chamado, coordenadas } : null;
      })
      .filter(Boolean)
      .map((chamado) => (
        <Marker
          key={chamado!._id}
          position={chamado!.coordenadas}
          icon={getIconByStatus(chamado!.status)}
          aria-label={`Marcador para chamado ${chamado!.titulo}`}
        >
          <Popup>
            {/* Conteúdo mantido igual */}
          </Popup>
        </Marker>
      ));
  }, [chamados, getIconByStatus]);

  if (!isClient || typeof window === 'undefined') {
    return <MapLoader />;
  }

  return (
    <div className={styles.leafletContainer}>
      <MapContainer
        center={[-23.55, -46.64]}
        zoom={11}
        scrollWheelZoom={false}
        style={{ height: '500px', width: '100%' }}
        aria-label="Mapa de chamados"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
    </div>
  );
}