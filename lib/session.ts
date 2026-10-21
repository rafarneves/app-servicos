import * as SecureStore from 'expo-secure-store';
import { useEffect, useSyncExternalStore } from 'react';
import type { AuthResponse, Role } from './types';

// Token e role ficam no expo-secure-store (nunca AsyncStorage). O cache evita ler o store a cada request
// e avisa o layout raiz (useSessao) sempre que a sessão muda, para o Stack.Protected trocar de área.
const CHAVE_SESSAO = 'chama.sessao';

// undefined = ainda lendo o store na abertura do app.
let cache: AuthResponse | null | undefined;
const ouvintes = new Set<() => void>();

function definir(sessao: AuthResponse | null) {
  cache = sessao;
  ouvintes.forEach((ouvinte) => ouvinte());
}

async function carregar() {
  if (cache !== undefined) return cache;
  let salva: AuthResponse | null = null;
  try {
    const texto = await SecureStore.getItemAsync(CHAVE_SESSAO);
    salva = texto ? (JSON.parse(texto) as AuthResponse) : null;
  } catch {
    salva = null;
  }
  // Um login durante a leitura tem prioridade sobre o que estava salvo.
  if (cache === undefined) definir(salva);
  return cache ?? null;
}

export async function salvarSessao(auth: AuthResponse) {
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(auth));
  definir(auth);
}

export async function marcarCelularVerificado() {
  const atual = await carregar();
  if (atual) await salvarSessao({ ...atual, celularVerificado: true });
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
  await SecureStore.deleteItemAsync(CHAVE_SESSAO);
  definir(null);
}

function assinar(ouvinte: () => void) {
  ouvintes.add(ouvinte);
  return () => {
    ouvintes.delete(ouvinte);
  };
}

// Sessão atual para as telas e layouts: undefined enquanto carrega, null sem login.
export function useSessao() {
  const sessao = useSyncExternalStore(assinar, () => cache);
  useEffect(() => {
    void carregar();
  }, []);
  return sessao;
}
