import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useState } from 'react';
import styles from '@/styles/leaflet-fix.module.css';
import { ChamadoType } from '@/pages/index';

type ChamadoStatus = 'em aberto' | 'realizando' | 'designado' | 'iterrompido';

const coordenadasPorSigla: Record<string, [number, number]> = {
    "BO": [-23.563173210271877, -46.6201345329807],
    "CA": [-23.55248969634154, -46.6275420685588],
    "CF": [-23.563323125401148, -46.632673367366245],
    "FC": [-23.541629236194847, -46.6302283980326],
    "LV": [-23.574945767076315, -46.62344839307898],
    "MO": [-23.601859263804343, -46.67020241792281],
    "PC": [-23.528122672402876, -46.612729723171974],
    "VM": [-23.587861731020876, -46.62991395223008],
    "PV": [-23.52560366927577, -46.6259003705322],
    "CB": [-23.56322043238581, -46.61954296304027],
    "RC": [-23.56481022685545, -46.41561688606509],
    "SD": [-23.55027504342889, -46.4449229122604],
    "CN": [-23.505694559776362, -46.382292130245254],
    "DJ": [-23.52106404748947, -46.39986050655916],
    "BB": [-23.546928997899148, -46.88493858942049],
    "CL": [-23.63279503897649, -46.75843262996158],
    "CR": [-23.658172387178976, -46.76542402729218],
    "HM": [-23.50245612363188, -46.7904758329826],
    "JS": [-23.524641697255326, -46.89289985242364],
    "PP": [-23.534017633873333, -46.801580044217864],
    "NN": [-23.54806837262902, -46.78417910414391],
    "NT": [-23.634163633938126, -46.776010138580794],
    "PI": [-23.643925272473872, -46.779432397538855],
    "JR": [-23.595666226661717, -46.789067549579805],
    "SP": [-23.608656755662057, -46.77703038914954],
    "TA": [-23.630018149279014, -46.78235050782512],
    "JB": [-23.509558638299584, -46.89135641797583],
    "NS": [-23.558051175570053, -46.800229260871994],
    "TS": [-23.621995578057344, -46.78870860443483],
    "JA": [-23.57212469874679, -46.77922853329807],
    "RP": [-23.566373940349177, -46.75317817826914],
    "EL": [-23.570802734918775, -46.655657856263524],
    "MA": [-23.61155408749787, -46.66489417740244],
    "JM": [-23.497039822023844, -46.810281575306824],
    "DD": [-23.50650005802688, -46.85044682655856],
    "SS": [-23.543362011648853, -46.606723011404824],
    "BU": [-23.57067106637271, -46.69816731099681]
};

interface MapaDeChamadosProps {
  chamados: Array<ChamadoType>;
}

const colorMap: Record<ChamadoStatus, string> = {
  'em aberto': 'red',
  'realizando': 'orange',
  'designado': 'orange',
  'iterrompido' : 'black'
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