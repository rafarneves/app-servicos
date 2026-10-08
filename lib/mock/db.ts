import { resumoDoTurno } from '../precos';
import type { CandidaturaStatus, ContratacaoStatus, Role, StatusPagamento, StatusVerificacao, VagaStatus } from '../types';

// "Banco" em memória do mock. Reinicia a cada reload do app.
// Contas de teste (senha chama123): empresa@chama.app (Padaria Aurora) e prestador@chama.app (Rafael Silva).

export type UsuarioRec = {
  id: string;
  email: string;
  senha: string;
  role: Role;
  celular: string;
  celularVerificado: boolean;
  statusVerificacao: StatusVerificacao;
  aprovacaoAutomaticaEm?: string;
  criadoEm: string;
};
export type EmpresaRec = {
  id: string;
  usuarioId: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  endereco: string;
  cidade?: string;
  tipoNegocio?: string;
  nomeResponsavel?: string;
};
export type PrestadorRec = {
  id: string;
  usuarioId: string;
  nome: string;
  cpf: string;
  funcao: string;
  cidade: string;
  experiencia: string;
  sobre: string;
  habilidades: string[];
};
export type CategoriaRec = { id: string; nome: string; valorMedioSugerido: number };
export type VagaRec = {
  id: string;
  empresaId: string;
  categoriaId: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  valorTurno: number;
  vagasDisponiveis: number;
  status: VagaStatus;
  distanciaKm: number;
  criadoEm: string;
};
export type CandidaturaRec = { id: string; vagaId: string; prestadorId: string; status: CandidaturaStatus; criadoEm: string };
export type ContratacaoRec = {
  id: string;
  vagaId: string;
  prestadorId: string;
  candidaturaId: string;
  status: ContratacaoStatus;
  valorTurno: number;
  taxaPlataforma: number;
  valorTotal: number;
  statusPagamento: StatusPagamento;
  criadoEm: string;
  checkInEm: string | null;
  checkOutEm: string | null;
  concluidoEm: string | null;
};
export type AvaliacaoRec = { id: string; contratacaoId: string; autor: Role; nota: number; comentario: string; criadoEm: string };

let sequencia = 1000;
export const novoId = (prefixo: string) => `${prefixo}-${++sequencia}`;

const pad = (n: number) => String(n).padStart(2, '0');

// Data local no formato YYYY-MM-DD.
export function dataLocal(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Data local deslocada em dias a partir de hoje.
export function diaRelativo(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return dataLocal(d);
}

// Instante ISO em uma data/hora local.
export function instante(data: string, hora: string) {
  return new Date(`${data}T${hora}:00`).toISOString();
}

const categorias: CategoriaRec[] = [
  { id: 'cat-padaria', nome: 'Padaria', valorMedioSugerido: 180 },
  { id: 'cat-cozinha', nome: 'Cozinha', valorMedioSugerido: 150 },
  { id: 'cat-salao', nome: 'Salão', valorMedioSugerido: 140 },
  { id: 'cat-sushi', nome: 'Sushi', valorMedioSugerido: 240 },
  { id: 'cat-caixa', nome: 'Caixa', valorMedioSugerido: 130 },
  { id: 'cat-entrega', nome: 'Entrega', valorMedioSugerido: 120 },
];

const usuarios: UsuarioRec[] = [
  { id: 'usr-empresa-1', email: 'empresa@chama.app', senha: 'chama123', role: 'EMPRESA', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-200), '09:00') },
  { id: 'usr-empresa-2', email: 'bistro@chama.app', senha: 'chama123', role: 'EMPRESA', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-150), '09:00') },
  { id: 'usr-empresa-3', email: 'nori@chama.app', senha: 'chama123', role: 'EMPRESA', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-90), '09:00') },
  { id: 'usr-prestador-1', email: 'prestador@chama.app', senha: 'chama123', role: 'PRESTADOR', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-180), '09:00') },
  { id: 'usr-prestador-2', email: 'mariana@chama.app', senha: 'chama123', role: 'PRESTADOR', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-120), '09:00') },
  { id: 'usr-prestador-3', email: 'lucas@chama.app', senha: 'chama123', role: 'PRESTADOR', celular: '11999990000', celularVerificado: true, statusVerificacao: 'APROVADO', criadoEm: instante(diaRelativo(-60), '09:00') },
  { id: 'usr-prestador-4', email: 'joana@chama.app', senha: 'chama123', role: 'PRESTADOR', celular: '11999990000', celularVerificado: true, statusVerificacao: 'PENDENTE', criadoEm: instante(diaRelativo(-5), '09:00') },
];

const empresas: EmpresaRec[] = [
  { id: 'emp-aurora', usuarioId: 'usr-empresa-1', razaoSocial: 'Padaria Aurora Ltda', nomeFantasia: 'Padaria Aurora', cnpj: '12345678000190', endereco: 'Rua das Flores, 241 • São Paulo' },
  { id: 'emp-bistro', usuarioId: 'usr-empresa-2', razaoSocial: 'Bistrô da Praça Ltda', nomeFantasia: 'Bistrô da Praça', cnpj: '22345678000190', endereco: 'Praça Benedito Calixto, 80 • São Paulo' },
  { id: 'emp-nori', usuarioId: 'usr-empresa-3', razaoSocial: 'Nori Sushi Bar Ltda', nomeFantasia: 'Nori Sushi Bar', cnpj: '32345678000190', endereco: 'Rua Augusta, 1500 • São Paulo' },
];

const prestadores: PrestadorRec[] = [
  {
    id: 'pre-rafael', usuarioId: 'usr-prestador-1', nome: 'Rafael Silva', cpf: '12345678901', funcao: 'Padeiro(a)', cidade: 'São Paulo, SP', experiencia: '6 anos',
    sobre: 'Padeiro há 6 anos, com experiência em fermentação natural e produção de madrugada.',
    habilidades: ['Fermentação natural', 'Forno lastro', 'Confeitaria básica'],
  },
  {
    id: 'pre-mariana', usuarioId: 'usr-prestador-2', nome: 'Mariana Costa', cpf: '22345678901', funcao: 'Auxiliar de cozinha', cidade: 'São Paulo, SP', experiencia: '3 anos',
    sobre: 'Auxiliar de cozinha em bistrôs e restaurantes de alto movimento.',
    habilidades: ['Mise en place', 'Cozinha fria', 'Higiene alimentar'],
  },
  {
    id: 'pre-lucas', usuarioId: 'usr-prestador-3', nome: 'Lucas Andrade', cpf: '32345678901', funcao: 'Garçom', cidade: 'São Paulo, SP', experiencia: '4 anos',
    sobre: 'Garçom com experiência em eventos e atendimento de salão.',
    habilidades: ['Atendimento', 'Vinhos', 'Eventos'],
  },
  {
    id: 'pre-joana', usuarioId: 'usr-prestador-4', nome: 'Joana Lima', cpf: '42345678901', funcao: 'Atendente de caixa', cidade: 'São Paulo, SP', experiencia: '1 ano',
    sobre: 'Começando na plataforma.',
    habilidades: ['Caixa', 'Atendimento'],
  },
];

const valorDa = (categoriaId: string) => categorias.find((c) => c.id === categoriaId)!.valorMedioSugerido;

function vaga(id: string, empresaId: string, categoriaId: string, titulo: string, dias: number, horaInicio: string, horaFim: string, vagasDisponiveis: number, distanciaKm: number, descricao: string): VagaRec {
  return {
    id, empresaId, categoriaId, titulo, descricao, data: diaRelativo(dias), horaInicio, horaFim, vagasDisponiveis, distanciaKm,
    valorTurno: valorDa(categoriaId),
    status: vagasDisponiveis > 0 ? 'ABERTA' : 'PREENCHIDA',
    criadoEm: instante(diaRelativo(Math.min(dias, 0) - 3), '10:00'),
  };
}

const vagas: VagaRec[] = [
  // Abertas (feed)
  vaga('vag-1', 'emp-bistro', 'cat-cozinha', 'Auxiliar de cozinha', 2, '17:00', '23:00', 2, 2.8, 'Apoio na produção do jantar e na montagem dos pratos.'),
  vaga('vag-2', 'emp-nori', 'cat-sushi', 'Sushiman', 3, '18:00', '23:59', 1, 4.1, 'Preparo de sushis e sashimis no balcão.'),
  vaga('vag-3', 'emp-aurora', 'cat-caixa', 'Atendente de caixa', 1, '07:00', '13:00', 2, 1.2, 'Atendimento no caixa no horário de pico da manhã.'),
  vaga('vag-4', 'emp-aurora', 'cat-padaria', 'Padeiro(a)', 4, '04:00', '10:00', 1, 1.2, 'Produção de pães franceses e de fermentação natural.'),
  vaga('vag-5', 'emp-bistro', 'cat-salao', 'Garçom', 2, '18:00', '23:59', 2, 2.8, 'Atendimento de salão no jantar de sábado.'),
  // Preenchidas (turnos confirmados e histórico)
  vaga('vag-6', 'emp-aurora', 'cat-padaria', 'Padeiro(a)', 1, '06:00', '12:00', 0, 1.2, 'Produção da manhã.'),
  vaga('vag-7', 'emp-aurora', 'cat-padaria', 'Padeiro(a)', -6, '06:00', '12:00', 0, 1.2, 'Produção da manhã.'),
  vaga('vag-8', 'emp-bistro', 'cat-cozinha', 'Auxiliar de cozinha', -10, '17:00', '23:00', 0, 2.8, 'Apoio no jantar.'),
  vaga('vag-9', 'emp-bistro', 'cat-cozinha', 'Auxiliar de cozinha', -8, '17:00', '23:00', 0, 2.8, 'Apoio no jantar.'),
  vaga('vag-10', 'emp-nori', 'cat-salao', 'Garçom', -5, '18:00', '23:59', 0, 4.1, 'Atendimento de salão.'),
];

const candidaturas: CandidaturaRec[] = [
  { id: 'can-1', vagaId: 'vag-3', prestadorId: 'pre-mariana', status: 'PENDENTE', criadoEm: instante(diaRelativo(-1), '15:20') },
  { id: 'can-2', vagaId: 'vag-3', prestadorId: 'pre-joana', status: 'PENDENTE', criadoEm: instante(diaRelativo(-1), '16:05') },
  { id: 'can-3', vagaId: 'vag-4', prestadorId: 'pre-lucas', status: 'PENDENTE', criadoEm: instante(diaRelativo(0), '08:10') },
  { id: 'can-4', vagaId: 'vag-1', prestadorId: 'pre-rafael', status: 'PENDENTE', criadoEm: instante(diaRelativo(0), '09:30') },
  { id: 'can-5', vagaId: 'vag-6', prestadorId: 'pre-rafael', status: 'SELECIONADA', criadoEm: instante(diaRelativo(-2), '11:00') },
  { id: 'can-6', vagaId: 'vag-7', prestadorId: 'pre-rafael', status: 'SELECIONADA', criadoEm: instante(diaRelativo(-9), '11:00') },
  { id: 'can-7', vagaId: 'vag-8', prestadorId: 'pre-rafael', status: 'SELECIONADA', criadoEm: instante(diaRelativo(-13), '11:00') },
  { id: 'can-8', vagaId: 'vag-9', prestadorId: 'pre-mariana', status: 'SELECIONADA', criadoEm: instante(diaRelativo(-11), '11:00') },
  { id: 'can-9', vagaId: 'vag-10', prestadorId: 'pre-lucas', status: 'SELECIONADA', criadoEm: instante(diaRelativo(-7), '11:00') },
];

function contratacao(id: string, candidaturaId: string, concluida: boolean): ContratacaoRec {
  const cand = candidaturas.find((c) => c.id === candidaturaId)!;
  const v = vagas.find((x) => x.id === cand.vagaId)!;

  return {
    id, candidaturaId, vagaId: v.id, prestadorId: cand.prestadorId,
    status: concluida ? 'CONCLUIDA' : 'CONFIRMADA',
    ...resumoDoTurno(v.valorTurno),
    statusPagamento: concluida ? 'LIBERADO' : 'RETIDO',
    criadoEm: cand.criadoEm,
    checkInEm: concluida ? instante(v.data, v.horaInicio) : null,
    checkOutEm: concluida ? instante(v.data, v.horaFim) : null,
    concluidoEm: concluida ? instante(v.data, v.horaFim) : null,
  };
}

const contratacoes: ContratacaoRec[] = [
  contratacao('con-1', 'can-5', false),
  contratacao('con-2', 'can-6', true),
  contratacao('con-3', 'can-7', true),
  contratacao('con-4', 'can-8', true),
  contratacao('con-5', 'can-9', true),
];

const avaliacoes: AvaliacaoRec[] = [
  { id: 'ava-1', contratacaoId: 'con-2', autor: 'EMPRESA', nota: 5, comentario: 'Pontual e caprichoso. Os pães saíram perfeitos.', criadoEm: instante(diaRelativo(-6), '13:00') },
  { id: 'ava-2', contratacaoId: 'con-2', autor: 'PRESTADOR', nota: 5, comentario: 'Equipe acolhedora e tudo organizado.', criadoEm: instante(diaRelativo(-6), '14:00') },
  { id: 'ava-3', contratacaoId: 'con-3', autor: 'EMPRESA', nota: 5, comentario: 'Ótimo ritmo no jantar.', criadoEm: instante(diaRelativo(-10), '23:30') },
  { id: 'ava-4', contratacaoId: 'con-4', autor: 'EMPRESA', nota: 5, comentario: 'Muito organizada.', criadoEm: instante(diaRelativo(-8), '23:30') },
  { id: 'ava-5', contratacaoId: 'con-4', autor: 'PRESTADOR', nota: 4, comentario: 'Cozinha bem equipada, jantar puxado.', criadoEm: instante(diaRelativo(-7), '10:00') },
  { id: 'ava-6', contratacaoId: 'con-5', autor: 'EMPRESA', nota: 4, comentario: 'Bom atendimento, chegou em cima da hora.', criadoEm: instante(diaRelativo(-5), '23:59') },
];

export const db = { categorias, usuarios, empresas, prestadores, vagas, candidaturas, contratacoes, avaliacoes };
