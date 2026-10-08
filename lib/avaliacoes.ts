import { request } from './http';
import type { Avaliacao, AvaliarRequest } from './types';

// POST /contratacoes/{id}/avaliacao (empresa ou prestador do turno, uma vez cada, após CONCLUIDA)
export function avaliarContratacao(contratacaoId: string, dados: AvaliarRequest) {
  return request<Avaliacao>('POST', `/contratacoes/${contratacaoId}/avaliacao`, dados);
}

// GET /prestadores/{id}/avaliacoes
export function listarAvaliacoesDoPrestador(prestadorId: string) {
  return request<Avaliacao[]>('GET', `/prestadores/${prestadorId}/avaliacoes`);
}

// GET /empresas/{id}/avaliacoes
export function listarAvaliacoesDaEmpresa(empresaId: string) {
  return request<Avaliacao[]>('GET', `/empresas/${empresaId}/avaliacoes`);
}
