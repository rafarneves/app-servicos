import { request } from './http';
import type { Carteira, FinanceiroEmpresa } from './types';

// GET /prestadores/me/carteira (PRESTADOR)
export function buscarCarteira() {
  return request<Carteira>('GET', '/prestadores/me/carteira');
}

// GET /empresas/me/financeiro (EMPRESA)
export function buscarFinanceiroDaEmpresa() {
  return request<FinanceiroEmpresa>('GET', '/empresas/me/financeiro');
}
