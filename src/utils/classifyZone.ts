const zonasPorSigla: Record<string, string> = {
    "BO": "Centro",
    "CA": "Centro",
    "CF": "Centro",
    "FC": "Centro",
    "LV": "Centro",
    "MO": "Sul",
    "PC": "Centro",
    "VM": "Sul",
    "PV": "Centro",
    "CB": "Centro",
    "RC": "Leste",
    "SD": "Oeste",
    "CN": "Leste",
    "DJ": "Oeste",
    "BB": "Oeste",
    "CL": "Oeste",
    "CR": "Sul",
    "HM": "Oeste",
    "JS": "Oeste",
    "PP": "Oeste",
    "NN": "Oeste",
    "NT": "Sul",
    "PI": "Sul",
    "JR": "Oeste",
    "SP": "Oeste",
    "TA": "Oeste",
    "JB": "Oeste",
    "NS": "Oeste",
    "TS": "Oeste",
    "JA": "Oeste",
    "RP": "Oeste",
    "EL": "Centro",
    "MA": "Centro",
    "JM": "Oeste",
    "DD": "Oeste",
    "SS": "Centro",
    "BU": "Centro",
  };
  
  export function getZona(nomeLoja: string): string {
    const sigla = nomeLoja?.match(/[A-Z]{2,}/)?.[0]?.toUpperCase() || '';
  
    return zonasPorSigla[sigla] || 'Não Mapeada';
  }
  