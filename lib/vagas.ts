import { request } from './http';
import type { CriarVagaRequest, Vaga } from './types';

// GET /vagas?categoriaId= (feed: só vagas ABERTAS)
export function listarVagas(filtro: { categoriaId?: string } = {}) {
  const query = filtro.categoriaId ? `?categoriaId=${encodeURIComponent(filtro.categoriaId)}` : '';
  return request<Vaga[]>('GET', `/vagas${query}`);
}

// GET /vagas/{id}
export function buscarVaga(id: string) {
  return request<Vaga>('GET', `/vagas/${id}`);
}

// GET /vagas/minhas (EMPRESA: todas as vagas da empresa logada)
export function listarMinhasVagas() {
  return request<Vaga[]>('GET', '/vagas/minhas');
}

// POST /vagas (EMPRESA)
export function criarVaga(dados: CriarVagaRequest) {
  return request<Vaga>('POST', '/vagas', dados);
}
