import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/leaflet-fix.module.css';
import { ChamadoType } from '@/pages/index';

type ChamadoStatus = 'em aberto' | 'realizando' | 'designado';

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
  "MA": [-23.5586, -46.6252],
  "PP": [-23.4996, -46.8509],
  "TS": [-23.5439, -46.8370],
  "DD": [-23.4919, -46.8434],
  "RP": [-23.5525, -46.6572],
  "CL": [-23.5265, -46.8001],
  "CB": [-23.6105, -46.7578],
  "JS": [-23.5503, -46.6330],
  "EL": [-23.5475, -46.6361],
  "JB": [-23.5563, -46.7314],
  "NT": [-23.5615, -46.6559],
  "DJ": [-23.4920, -46.8500],
  "SD": [-23.5593, -46.7358],
  "NS": [-23.5105, -46.7291],
  "BU": [-23.5405, -46.6333],
  "FC": [-23.5300, -46.6350]
};

interface MapaDeChamadosProps {
  chamados: Array<{
    _id: string
    titulo: string
    loja: string
    status: ChamadoStatus
    tipo: string
    dataCriacao: string
    zona: string
    coordenadas?: [number, number] // Adicione esta linha
  }>
}

const colorMap: Record<ChamadoStatus, string> = {
  'em aberto': 'red',
  'realizando': 'orange',
  'designado': 'orange',
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
      iconRetinaUrl: '/public/markers/marker-icon-2x.png', // "2x" minúsculo
      iconUrl: '/public/markers/marker-icon.png',
      shadowUrl: '/public/markers/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    
  };

 // components/MapaDeChamados.tsx

const getIconByStatus = useMemo(() => {
  const iconCache = new Map<string, L.Icon>();
  
  return (status: ChamadoStatus) => {
    const color = colorMap[status];
    
    if (!iconCache.has(color)) {
      const icon = new L.Icon({
        iconUrl: `/markers/marker-icon-${color}.png`,
        iconRetinaUrl: `/markers/marker-icon-2x-${color}.png`,
        shadowUrl: '/markers/marker-shadow.png',
        iconSize: [25, 41],      // Tamanho do ícone (ajuste conforme suas imagens)
        iconAnchor: [12, 41],    // Ponto de fixação do ícone
        popupAnchor: [1, -34],   // Posição do popup
        shadowSize: [41, 41]     // Tamanho da sombra
      });
      iconCache.set(color, icon);
    }
    return iconCache.get(color)!;
  };
}, []);

  const markers = useMemo(() => {
    return chamados
      .map((chamado) => {
        const sigla = chamado.loja
  ?.match(/([A-Z]{2,})|([A-Z]\d{1,2})/) // Captura siglas como "MA1" ou "PP"
  ?.[0]
  ?.replace(/[^A-Z]/g, '') // Remove números/dígitos
  ?.substring(0, 2) // Pega apenas as 2 primeiras letras
  ?.toUpperCase() || '';
        const coordenadas = coordenadasPorSigla[sigla];

        console.log('Chamado:', chamado._id, '| Sigla:', sigla, '| Coordenadas:', coordenadas);

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
        {isClient && (
          <MapContainer
            center={[-23.55, -46.64]}
            zoom={11}
            scrollWheelZoom={false}
            style={{ height: '500px', width: '100%' }}
          >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers}
      </MapContainer>
       )}
    </div>
  );
}