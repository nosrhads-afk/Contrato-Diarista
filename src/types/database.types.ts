export interface TermoAceite {
  id?: string;
  created_at?: string;
  nome_completo: string;
  cpf: string;
  rg: string;
  data_nascimento: string;
  idade: number;
  funcao: string;
  dias_trabalho: string;
  termo_versao: string;
  termo_texto_integral: string;
  aceitou_termos: boolean;
  autoriza_compartilhamento: boolean;
  documento_url?: string | null;
  documento_nome?: string | null;
  documento_tamanho?: number | null;
  codigo_autenticidade: string;
  ip_address: string;
  user_agent: string;
  dispositivo_resumo: string;
  geolocalizacao: {
    cidade?: string;
    estado?: string;
    pais?: string;
    latitude?: number | null;
    longitude?: number | null;
    provedor?: string;
    precisao?: string;
    ip_lookup?: string;
  };
}

export interface GeolocationData {
  cidade: string;
  estado: string;
  pais: string;
  latitude: number | null;
  longitude: number | null;
  provedor: string;
  precisao: string;
  ip_lookup?: string;
}

export interface CapturedMetadata {
  ip_address: string;
  user_agent: string;
  dispositivo_resumo: string;
  geolocalizacao: GeolocationData;
  timestamp: string;
  codigo_autenticidade: string;
}
