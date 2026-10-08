import * as SecureStore from 'expo-secure-store';
import type { AuthResponse, Role } from './types';

// Token e role ficam no expo-secure-store (nunca AsyncStorage). O cache evita ler o store a cada request.
const CHAVE_SESSAO = 'chama.sessao';

let cache: AuthResponse | null | undefined;

async function carregar() {
  if (cache !== undefined) return cache;
  const salvo = await SecureStore.getItemAsync(CHAVE_SESSAO);
  try {
    cache = salvo ? (JSON.parse(salvo) as AuthResponse) : null;
  } catch {
    cache = null;
  }
  return cache;
}

export async function salvarSessao(auth: AuthResponse) {
  cache = auth;
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(auth));
}

export async function obterSessao() {
  return carregar();
}

export async function obterToken(): Promise<string | null> {
  return (await carregar())?.token ?? null;
}

export async function obterRole(): Promise<Role | null> {
  return (await carregar())?.role ?? null;
}

export async function limparSessao() {
  cache = null;
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
}
