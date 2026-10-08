import { request } from './http';
import type { PrestadorPerfil } from './types';

// GET /prestadores/{id}
export function buscarPrestador(id: string) {
  return request<PrestadorPerfil>('GET', `/prestadores/${id}`);
}
