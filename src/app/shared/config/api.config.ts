declare global {
  interface Window {
    __VENTA_PAPAS_CONFIG__?: { apiBaseUrl?: string };
  }
}

const configuredUrl = window.__VENTA_PAPAS_CONFIG__?.apiBaseUrl?.trim();
const localApiUrl = 'http://localhost:8090/api';

/** La imagen Docker puede cambiar esta URL al arrancar, sin recompilar Angular. */
export const API_BASE_URL = (configuredUrl || localApiUrl).replace(/\/+$/, '');
