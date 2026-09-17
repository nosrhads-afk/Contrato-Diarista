import type { CapturedMetadata, GeolocationData } from '../types/database.types';

/**
 * Analisa o User Agent para extrair uma descrição amigável de sistema e navegador
 */
export function parseDeviceSummary(userAgent: string): string {
  let os = 'Desconhecido';
  let device = 'Computador';
  let browser = 'Navegador Web';

  // Detecção de Sistema Operacional
  if (/Android/i.test(userAgent)) {
    os = 'Android';
    device = 'Smartphone/Tablet Android';
  } else if (/iPhone/i.test(userAgent)) {
    os = 'iOS';
    device = 'Apple iPhone';
  } else if (/iPad/i.test(userAgent)) {
    os = 'iPadOS';
    device = 'Apple iPad';
  } else if (/Windows NT 10.0/i.test(userAgent)) {
    os = 'Windows 10/11';
    device = 'Computador Windows';
  } else if (/Macintosh|Mac OS X/i.test(userAgent)) {
    os = 'macOS';
    device = 'Computador Apple Mac';
  } else if (/Linux/i.test(userAgent)) {
    os = 'Linux';
    device = 'Computador Linux';
  }

  // Detecção de Navegador
  if (/Edg\//i.test(userAgent)) {
    browser = 'Microsoft Edge';
  } else if (/Chrome\//i.test(userAgent) && !/Edg\//i.test(userAgent)) {
    browser = 'Google Chrome';
  } else if (/Firefox\//i.test(userAgent)) {
    browser = 'Mozilla Firefox';
  } else if (/Safari\//i.test(userAgent) && !/Chrome\//i.test(userAgent)) {
    browser = 'Apple Safari';
  } else if (/Opera|OPR\//i.test(userAgent)) {
    browser = 'Opera';
  }

  return `${device} (${os}) • ${browser}`;
}

/**
 * Gera um código verificador único e rastreável de autenticidade jurídica
 */
export function generateAuthenticityCode(): string {
  const prefix = 'NOS';
  const year = new Date().getFullYear();
  const randPart1 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const randPart2 = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timePart = Date.now().toString(36).toUpperCase().slice(-4);
  return `${prefix}-${year}-${randPart1}-${randPart2}${timePart}`;
}

/**
 * Busca IP e geolocalização aproximada através de APIs públicas com fallback
 */
async function fetchIpAndGeo(): Promise<{ ip: string; geo: GeolocationData }> {
  // Provedor 1: ipapi.co (excelente retorno com cidade/estado do Brasil)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        return {
          ip: data.ip,
          geo: {
            cidade: data.city || 'Não identificada',
            estado: data.region || data.region_code || 'UF',
            pais: data.country_name || 'Brasil',
            latitude: data.latitude ? Number(data.latitude) : null,
            longitude: data.longitude ? Number(data.longitude) : null,
            provedor: 'ipapi.co',
            precisao: 'Aproximada por IP',
            ip_lookup: data.ip,
          },
        };
      }
    }
  } catch (err) {
    console.debug('Fallback de IP 1 acionado...', err);
  }

  // Provedor 2: ipwho.is
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);
    const res = await fetch('https://ipwho.is/', { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.ip) {
        return {
          ip: data.ip,
          geo: {
            cidade: data.city || 'Não identificada',
            estado: data.region || data.region_code || 'UF',
            pais: data.country || 'Brasil',
            latitude: data.latitude ? Number(data.latitude) : null,
            longitude: data.longitude ? Number(data.longitude) : null,
            provedor: 'ipwho.is',
            precisao: 'Aproximada por IP',
            ip_lookup: data.ip,
          },
        };
      }
    }
  } catch (err) {
    console.debug('Fallback de IP 2 acionado...', err);
  }

  // Provedor 3: api.ipify.org (apenas IP simples)
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const data = await res.json();
      return {
        ip: data.ip || '127.0.0.1',
        geo: {
          cidade: 'Localização via Provedor',
          estado: 'BR',
          pais: 'Brasil',
          latitude: null,
          longitude: null,
          provedor: 'api.ipify.org',
          precisao: 'IP Público',
          ip_lookup: data.ip,
        },
      };
    }
  } catch {
    // Fallback offline / local
  }

  return {
    ip: 'Indisponível no momento do aceite',
    geo: {
      cidade: 'Não identificada',
      estado: 'N/A',
      pais: 'Brasil',
      latitude: null,
      longitude: null,
      provedor: 'Fallback Local',
      precisao: 'Indisponível',
    },
  };
}

/**
 * Tenta obter a localização de precisão pelo navegador (HTML5 Geolocation), se concedido pelo usuário
 */
function getBrowserCoordinates(): Promise<{ latitude: number; longitude: number } | null> {
  return new Promise((resolve) => {
    if (!('geolocation' in navigator)) {
      return resolve(null);
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        // Se usuário recusou ou demorou, não interrompe o fluxo
        resolve(null);
      },
      { timeout: 2500, maximumAge: 60000, enableHighAccuracy: false }
    );
  });
}

/**
 * Coleta todos os metadados forenses silenciosamente para garantir prova jurídica
 */
export async function collectLegalMetadata(): Promise<CapturedMetadata> {
  const userAgent = navigator.userAgent || 'UserAgent não informado';
  const dispositivo_resumo = parseDeviceSummary(userAgent);
  const now = new Date();
  const timestamp = now.toISOString();
  const codigo_autenticidade = generateAuthenticityCode();

  // Executa coleta de IP e Geolocation em paralelo
  const [ipAndGeo, browserCoords] = await Promise.all([
    fetchIpAndGeo(),
    getBrowserCoordinates(),
  ]);

  const finalGeo: GeolocationData = {
    ...ipAndGeo.geo,
  };

  // Se o navegador forneceu coordenadas com consentimento, enriquece a prova
  if (browserCoords) {
    finalGeo.latitude = browserCoords.latitude;
    finalGeo.longitude = browserCoords.longitude;
    finalGeo.precisao = 'Coordenadas GPS/Dispositivo (Consentido) + IP';
  }

  return {
    ip_address: ipAndGeo.ip,
    user_agent: userAgent,
    dispositivo_resumo,
    geolocalizacao: finalGeo,
    timestamp,
    codigo_autenticidade,
  };
}
