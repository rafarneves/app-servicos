import { request } from './http';
import type { Categoria } from './types';

// GET /categorias
export function listarCategorias() {
  return request<Categoria[]>('GET', '/categorias');
}
