// Tipos do contrato da API (ver docs/api.md). Datas em ISO: `data` como YYYY-MM-DD,
// horas como HH:mm e instantes (criadoEm, checkInEm...) como ISO 8601 completo.

export type Role = 'EMPRESA' | 'PRESTADOR';
export type StatusVerificacao = 'PENDENTE' | 'APROVADO';
export type VagaStatus = 'ABERTA' | 'PREENCHIDA' | 'CANCELADA';
export type CandidaturaStatus = 'PENDENTE' | 'SELECIONADA' | 'RECUSADA' | 'CANCELADA';
export type ContratacaoStatus = 'CONFIRMADA' | 'EM_ANDAMENTO' | 'AGUARDANDO_CONFIRMACAO' | 'CONCLUIDA' | 'CANCELADA';
export type StatusPagamento = 'RETIDO' | 'LIBERADO' | 'ESTORNADO';

// Auth

export type AuthResponse = { token: string; role: Role; userId: string };

export type LoginRequest = { email: string; senha: string };

export type RegistroEmpresaRequest = {
  email: string;
  senha: string;
  razaoSocial: string;
  cnpj: string;
  celular: string;
  nomeResponsavel?: string;
  cidade?: string;
  tipoNegocio?: string;
};

export type RegistroPrestadorRequest = {
  email: string;
  senha: string;
  nome: string;
  cpf: string;
  celular: string;
  funcao?: string;
  cidade?: string;
  experiencia?: string;
};

export type UsuarioAtual = {
  userId: string;
  email: string;
  role: Role;
  nome: string;
  celularVerificado: boolean;
  statusVerificacao: StatusVerificacao;
  empresaId: string | null;
  prestadorId: string | null;
};

export type VerificarOtpRequest = { codigo: string };

export type RecuperarSenhaRequest = { email: string };

export type RedefinirSenhaRequest = { email: string; codigo: string; novaSenha: string };

// Catálogo

export type Categoria = { id: string; nome: string; valorMedioSugerido: number };

// Pessoas

export type EmpresaResumo = { id: string; nome: string; notaMedia: number | null; totalAvaliacoes: number };

export type PrestadorResumo = {
  id: string;
  nome: string;
  funcao: string;
  notaMedia: number | null;
  totalAvaliacoes: number;
  turnosConcluidos: number;
};

export type PrestadorPerfil = PrestadorResumo & {
  cidade: string;
  experiencia: string;
  sobre: string;
  habilidades: string[];
  membroDesde: string;
  empresasAtendidas: string[];
};

// Vagas

export type Vaga = {
  id: string;
  titulo: string;
  descricao: string;
  categoria: { id: string; nome: string };
  empresa: EmpresaResumo;
  endereco: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  valorTurno: number;
  vagasDisponiveis: number;
  status: VagaStatus;
  distanciaKm: number | null;
  totalCandidatos: number;
};

export type VagaResumo = Pick<Vaga, 'id' | 'titulo' | 'empresa' | 'endereco' | 'data' | 'horaInicio' | 'horaFim' | 'valorTurno'>;

// O body nunca leva valor: o valorTurno vem da categoria.
export type CriarVagaRequest = {
  categoriaId: string;
  titulo: string;
  descricao: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  vagasDisponiveis: number;
};

// Candidaturas

export type Candidatura = {
  id: string;
  status: CandidaturaStatus;
  criadoEm: string;
  vaga: VagaResumo;
  prestador: PrestadorResumo;
};

// Contratações (turno confirmado)

export type Contratacao = {
  id: string;
  status: ContratacaoStatus;
  vaga: VagaResumo;
  prestador: PrestadorResumo;
  valorTurno: number;
  taxaPlataforma: number;
  valorTotal: number;
  statusPagamento: StatusPagamento;
  criadoEm: string;
  checkInEm: string | null;
  checkOutEm: string | null;
  concluidoEm: string | null;
  avaliadoPelaEmpresa: boolean;
  avaliadoPeloPrestador: boolean;
};

// Avaliações

export type Avaliacao = {
  id: string;
  contratacaoId: string;
  autor: Role;
  autorNome: string;
  nota: number;
  comentario: string;
  criadoEm: string;
};

export type AvaliarRequest = { nota: number; comentario: string };

// Financeiro

export type Movimentacao = {
  id: string;
  contratacaoId: string;
  descricao: string;
  data: string;
  valor: number;
  status: StatusPagamento;
};

export type Carteira = { saldoDisponivel: number; aReceber: number; movimentacoes: Movimentacao[] };

export type FinanceiroEmpresa = { valorRetido: number; pagoNoMes: number; movimentacoes: Movimentacao[] };
