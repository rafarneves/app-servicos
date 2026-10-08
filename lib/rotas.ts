import { buscarUsuarioAtual } from './auth';
import type { Role } from './types';

export const rotaInicial = (role: Role) => (role === 'EMPRESA' ? '/empresa' : '/buscar');

// Depois de entrar ou se cadastrar: celular não verificado vai para o OTP; senão, para a área do papel.
export async function destinoAposAutenticar() {
  const usuario = await buscarUsuarioAtual();
  return usuario.celularVerificado ? rotaInicial(usuario.role) : '/otp';
}
