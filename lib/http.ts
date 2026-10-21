import { ApiError } from './errors';
import { responderMock } from './mock/server';
import { limparSessao, obterToken } from './session';

export type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// Ponto único de saída para a API. Hoje responde com o mock; quando o backend existir,
// troque o corpo por um fetch(`${BASE_URL}${caminho}`) com header Authorization: Bearer <token>
// e lance ApiError(status, body.message) quando !response.ok. As funções de lib/ não mudam.
export async function request<T>(metodo: Metodo, caminho: string, body?: unknown): Promise<T> {
  const token = await obterToken();
  try {
    return (await responderMock(metodo, caminho, body, token)) as T;
  } catch (erro) {
    // Token recusado (expirado, ou o mock reiniciou): encerra a sessão e o layout raiz volta para o início.
    if (token && erro instanceof ApiError && erro.status === 401) await limparSessao();
    throw erro;
  }
}
