import { request } from './http';
import type { Candidatura, Contratacao } from './types';

// POST /vagas/{id}/candidaturas (PRESTADOR)
export function candidatar(vagaId: string) {
  return request<Candidatura>('POST', `/vagas/${vagaId}/candidaturas`);
}

// GET /vagas/{id}/candidaturas (EMPRESA dona da vaga)
export function listarCandidatosDaVaga(vagaId: string) {
  return request<Candidatura[]>('GET', `/vagas/${vagaId}/candidaturas`);
}

// GET /candidaturas/minhas (PRESTADOR)
export function listarMinhasCandidaturas() {
  return request<Candidatura[]>('GET', '/candidaturas/minhas');
}

// DELETE /candidaturas/{id} (PRESTADOR desiste enquanto PENDENTE)
export function desistirDaCandidatura(id: string) {
  return request<void>('DELETE', `/candidaturas/${id}`);
}

// POST /candidaturas/{id}/selecionar (EMPRESA): confirma o turno e retém o valor em escrow
export function selecionarCandidato(candidaturaId: string) {
  return request<Contratacao>('POST', `/candidaturas/${candidaturaId}/selecionar`);
}
