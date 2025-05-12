import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/leaflet-fix.module.css';
import { ChamadoType } from '@/pages/index';

type ChamadoStatus = 'em aberto' | 'realizando' | 'designado';

const coordenadasPorSigla: Record<string, [number, number]> = {
    "BO": [-23.5575, -46.6283],
    "CA": [-23.5612, -46.6341],
    "CF": [-23.5601, -46.6325],
    "FC": [-23.5428, -46.6260],
    "LV": [-23.5680, -46.6312],
    "MO": [-23.6003, -46.6674],
    "PC": [-23.5279, -46.6235],
    "VM": [-23.5892, -46.6324],
    "PV": [-23.5310, -46.6258],
    "CB": [-23.5575, -46.6283],
    "RC": [-23.4876, -46.4987],
    "SD": [-23.4855, -46.4721],
    "CN": [-23.5118, -46.4329],
    "DJ": [-23.5210, -46.4412],
    "BB": [-23.5110, -46.8765],
    "CL": [-23.4955, -46.7543],
    "CR": [-23.6682, -46.7689],
    "HM": [-23.5321, -46.7912],
    "JS": [-23.5055, -46.8612],
    "PP": [-23.4996, -46.8509],
    "NN": [-23.5320, -46.7910],
    "NT": [-23.6612, -46.7721],
    "PI": [-23.6680, -46.7688],
    "JR": [-23.5115, -46.8710],
    "SP": [-23.6234, -46.7901],
    "TA": [-23.6255, -46.7923],
    "JB": [-23.5105, -46.8721],
    "NS": [-23.5315, -46.7905],
    "TS": [-23.6240, -46.7930],
    "JA": [-23.4912, -46.6215],
    "RP": [-23.5523, -46.7350],
    "EL": [-23.5689, -46.6578],
    "MA": [-23.5586, -46.6252],
    "JM": [-23.5318, -46.7915],
    "DD": [-23.5040, -46.8450],
    "SS": [-23.5325, -46.6120],
    "BU": [-23.5570, -46.6923]
};

interface MapaDeChamadosProps {
  chamados: Array<ChamadoType>;
}

const colorMap: Record<ChamadoStatus, string> = {
  'em aberto': 'red',
  'realizando': 'orange',
  'designado': 'orange',
};

const MapLoader = () => <div className="p-4 text-center text-gray-500">Carregando mapa...</div>;

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
      iconSize: [25, 41],
      iconAnchor: [12, 41],
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
    const coordenadasPadrao: [number, number] = [-23.5505, -46.6333];
    
    return chamados
      .map((chamado) => {
        const sigla = chamado.loja
          .match(/([A-Z]{2})(?![a-z])/)?.[0]
          ?.toUpperCase() || '';
        const coordenadas = coordenadasPorSigla[sigla] || coordenadasPadrao;
        return { ...chamado, coordenadas };
      })
      .filter((chamado) => 
        !!chamado.coordenadas && 
        chamado.coordenadas.every(coord => !isNaN(coord))
      )
      .map((chamado) => (
        <Marker
          key={chamado._id}
          position={chamado.coordenadas}
          icon={getIconByStatus(chamado.status)}
        >
          <Popup>
            <div className="min-w-[200px] space-y-2 p-2">
              <h3 className="font-bold text-lg">{chamado.titulo}</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center">
                  <span className="mr-2">🏪</span>
                  <span>{chamado.loja}</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">📌</span>
                  <span className="capitalize">{chamado.status}</span>
                </div>
                <div className="flex items-center col-span-2">
                  <span className="mr-2">📅</span>
                  <span>{new Date(chamado.dataCriacao).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ));
  }, [chamados, getIconByStatus]);

  if (!isClient) return <MapLoader />;

  return (
    <div className={styles.leafletContainer}>
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
    </div>
  );
}