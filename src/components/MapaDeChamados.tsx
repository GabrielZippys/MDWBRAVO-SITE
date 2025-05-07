import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useMemo } from 'react';
import { format } from 'date-fns';

// Configuração de ícones
interface CustomIconOptions extends L.IconOptions {
  iconColor: string;
}

const createCustomIcon = (color: string): L.Icon => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: `leaflet-marker-custom-${color}`,
  });
};

// Configurações do mapa
const coordenadasPorSigla: Record<string, [number, number]> = {
  // ... (mantido igual ao original)
};

const DEFAULT_CENTER: [number, number] = [-23.55, -46.64];
const DEFAULT_ZOOM = 11;

// Tipagem aprimorada
type ChamadoStatus = 'em aberto' | 'realizando' | 'designado' | 'resolvido' | 'feito' | 'outros';

interface Chamado {
  _id: string;
  titulo: string;
  loja: string;
  status: ChamadoStatus;
  tipo: string;
  dataCriacao: string;
  zona: string;
}

interface MapaDeChamadosProps {
  chamados: Chamado[];
  className?: string;
}

// Componente de controle personalizado
const MapControls = () => {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={() => map.setView(DEFAULT_CENTER, DEFAULT_ZOOM)}
          className="p-2 bg-white hover:bg-gray-100"
          aria-label="Resetar vista do mapa"
        >
          ↺
        </button>
      </div>
    </div>
  );
};

// Componente principal
export default function MapaDeChamados({ chamados, className }: MapaDeChamadosProps) {
  const statusColors: Record<ChamadoStatus, string> = {
    'em aberto': 'red',
    realizando: 'orange',
    designado: 'orange',
    resolvido: 'green',
    feito: 'green',
    outros: 'blue',
  };

  const getIcon = useMemo(() => {
    const iconsCache: Record<string, L.Icon> = {};

    return (status: ChamadoStatus) => {
      const color = statusColors[status] || 'blue';
      if (!iconsCache[color]) {
        iconsCache[color] = createCustomIcon(color);
      }
      return iconsCache[color];
    };
  }, []);

  const processarChamados = useMemo(() => {
    return chamados.map(chamado => {
      const siglaMatch = chamado.loja.split('-').pop()?.trim().toUpperCase();
      const sigla = siglaMatch && coordenadasPorSigla[siglaMatch] ? siglaMatch : null;
      
      return {
        ...chamado,
        coordenadas: sigla ? coordenadasPorSigla[sigla] : null,
        dataFormatada: format(new Date(chamado.dataCriacao), 'dd/MM/yyyy HH:mm'),
      };
    }).filter(chamado => chamado.coordenadas);
  }, [chamados]);

  return (
    <div className={`map-container ${className || ''}`}>
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        style={{ height: '600px', width: '100%' }}
        aria-label="Mapa de chamados"
      >
        <MapControls />
        
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MarkerClusterGroup
          chunkedLoading
          spiderfyDistanceMultiplier={2}
          showCoverageOnHover={false}
        >
          {processarChamados.map((chamado) => (
            <Marker
              key={chamado._id}
              position={chamado.coordenadas!}
              icon={getIcon(chamado.status)}
              aria-label={`Marcador para chamado ${chamado.titulo}`}
            >
              <Popup>
                <div className="min-w-[250px] space-y-2">
                  <h3 className="font-bold text-lg">{chamado.titulo}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center">
                      <span className="emoji">🏪</span>
                      <span className="ml-2">{chamado.loja}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="emoji">📌</span>
                      <span className="ml-2 capitalize">{chamado.status}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="emoji">🧭</span>
                      <span className="ml-2">{chamado.zona || 'N/A'}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="emoji">📅</span>
                      <span className="ml-2">{chamado.dataFormatada}</span>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="emoji">📂</span>
                      <span className="ml-2">{chamado.tipo}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}