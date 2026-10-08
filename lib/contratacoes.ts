import { request } from './http';
import type { Contratacao } from './types';

// GET /contratacoes/minhas (PRESTADOR: os próprios turnos; EMPRESA: turnos das suas vagas)
export function listarMinhasContratacoes() {
  return request<Contratacao[]>('GET', '/contratacoes/minhas');
}

// GET /contratacoes/{id}
export function buscarContratacao(id: string) {
  return request<Contratacao>('GET', `/contratacoes/${id}`);
}

// PATCH /contratacoes/{id}/check-in (PRESTADOR do turno)
export function fazerCheckIn(id: string) {
  return request<Contratacao>('PATCH', `/contratacoes/${id}/check-in`);
}

// PATCH /contratacoes/{id}/check-out (PRESTADOR do turno)
export function fazerCheckOut(id: string) {
  return request<Contratacao>('PATCH', `/contratacoes/${id}/check-out`);
}

// PATCH /contratacoes/{id}/confirmar-conclusao (EMPRESA dona): libera o pagamento
export function confirmarConclusao(id: string) {
  return request<Contratacao>('PATCH', `/contratacoes/${id}/confirmar-conclusao`);
}
