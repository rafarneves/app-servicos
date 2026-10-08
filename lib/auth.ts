import { request } from './http';
import { limparSessao, salvarSessao } from './session';
import type {
  AuthResponse,
  LoginRequest,
  RecuperarSenhaRequest,
  RedefinirSenhaRequest,
  RegistroEmpresaRequest,
  RegistroPrestadorRequest,
  UsuarioAtual,
  VerificarOtpRequest,
} from './types';

// POST /auth/login -> 401 "Credenciais inválidas", 429 após 5 falhas
export async function login(dados: LoginRequest) {
  const auth = await request<AuthResponse>('POST', '/auth/login', dados);
  await salvarSessao(auth);
  return auth;
}

// POST /auth/registro/empresa
export async function registrarEmpresa(dados: RegistroEmpresaRequest) {
  const auth = await request<AuthResponse>('POST', '/auth/registro/empresa', dados);
  await salvarSessao(auth);
  return auth;
}

// POST /auth/registro/prestador
export async function registrarPrestador(dados: RegistroPrestadorRequest) {
  const auth = await request<AuthResponse>('POST', '/auth/registro/prestador', dados);
  await salvarSessao(auth);
  return auth;
}

// GET /auth/me
export function buscarUsuarioAtual() {
  return request<UsuarioAtual>('GET', '/auth/me');
}

// POST /auth/otp/verificar (código enviado por SMS ao celular do cadastro)
export function verificarOtp(dados: VerificarOtpRequest) {
  return request<void>('POST', '/auth/otp/verificar', dados);
}

// POST /auth/otp/reenviar
export function reenviarOtp() {
  return request<void>('POST', '/auth/otp/reenviar');
}

// POST /auth/recuperar-senha -> sempre 204, exista ou não o e-mail
export function solicitarRecuperacaoDeSenha(dados: RecuperarSenhaRequest) {
  return request<void>('POST', '/auth/recuperar-senha', dados);
}

// POST /auth/redefinir-senha
export function redefinirSenha(dados: RedefinirSenhaRequest) {
  return request<void>('POST', '/auth/redefinir-senha', dados);
}

export async function logout() {
  await limparSessao();
}
