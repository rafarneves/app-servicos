import { ApiError } from '../errors';
import type { Metodo } from '../http';
import { emailValido, SENHA_MINIMA, somenteDigitos } from '../validacao';
import { resumoDoTurno } from '../precos';
import type {
  AuthResponse,
  Avaliacao,
  AvaliarRequest,
  Candidatura,
  Carteira,
  Categoria,
  Contratacao,
  CriarVagaRequest,
  EmpresaResumo,
  FinanceiroEmpresa,
  LoginRequest,
  Movimentacao,
  PrestadorPerfil,
  PrestadorResumo,
  RecuperarSenhaRequest,
  RedefinirSenhaRequest,
  RegistroEmpresaRequest,
  RegistroPrestadorRequest,
  Role,
  UsuarioAtual,
  Vaga,
  VagaResumo,
  VerificarOtpRequest,
} from '../types';
import { dataLocal, db, diaRelativo, novoId, type AvaliacaoRec, type CandidaturaRec, type ContratacaoRec, type UsuarioRec, type VagaRec } from './db';

// Simulação de rede: atraso de 300 a 600 ms e uma pequena chance de falha de conexão.
export const ATRASO_MIN_MS = 300;
export const ATRASO_MAX_MS = 600;
export const TAXA_DE_FALHA = 0.05;

// Bloqueio de login: 5 falhas bloqueiam o e-mail por 15 min (429).
const MAX_FALHAS_LOGIN = 5;
const BLOQUEIO_LOGIN_MS = 15 * 60 * 1000;
const tentativasLogin = new Map<string, { falhas: number; bloqueadoAte: number }>();

// Cadastros novos ficam PENDENTE e são aprovados automaticamente depois deste tempo.
const APROVACAO_AUTOMATICA_MS = 60 * 1000;

// Código de SMS/e-mail simulado: sempre 123456. Recuperação de senha vale por 10 min.
export const CODIGO_MOCK = '123456';
const VALIDADE_CODIGO_MS = 10 * 60 * 1000;
const codigosRecuperacao = new Map<string, number>();

const ATIVAS: ContratacaoRec['status'][] = ['CONFIRMADA', 'EM_ANDAMENTO', 'AGUARDANDO_CONFIRMACAO'];

type Contexto = { params: Record<string, string>; query: Record<string, string>; body: unknown; token: string | null };
type Rota = { metodo: Metodo; padrao: string; handler: (ctx: Contexto) => unknown };

// ---------- Utilitários ----------

const esperar = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const agora = () => new Date().toISOString();
const hoje = () => diaRelativo(0);
const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim() : '');
const media = (notas: number[]) => (notas.length ? Math.round((notas.reduce((a, b) => a + b, 0) / notas.length) * 10) / 10 : null);

function erro(status: number, message: string): never {
  throw new ApiError(status, message);
}

function encontrar<T>(lista: T[], filtro: (item: T) => boolean, mensagem: string): T {
  const item = lista.find(filtro);
  if (!item) erro(404, mensagem);
  return item;
}

// ---------- Sessão ----------

function tokenPara(usuario: UsuarioRec): AuthResponse {
  return { token: `mock.${usuario.id}`, role: usuario.role, userId: usuario.id };
}

function atualizarVerificacao(usuario: UsuarioRec) {
  if (usuario.statusVerificacao === 'PENDENTE' && usuario.aprovacaoAutomaticaEm && Date.now() >= Date.parse(usuario.aprovacaoAutomaticaEm)) {
    usuario.statusVerificacao = 'APROVADO';
  }
}

function usuarioLogado(ctx: Contexto) {
  const id = ctx.token?.startsWith('mock.') ? ctx.token.slice(5) : null;
  const usuario = db.usuarios.find((u) => u.id === id);
  if (!usuario) erro(401, 'Sessão expirada. Entre novamente.');
  atualizarVerificacao(usuario);
  return usuario;
}

function exigirRole(ctx: Contexto, role: Role) {
  const usuario = usuarioLogado(ctx);
  if (usuario.role !== role) erro(403, 'Acesso negado.');
  return usuario;
}

function exigirVerificado(usuario: UsuarioRec) {
  if (usuario.statusVerificacao !== 'APROVADO') erro(403, 'Seu cadastro ainda está em análise. Você poderá fazer isso assim que for aprovado.');
}

const empresaDo = (usuario: UsuarioRec) => encontrar(db.empresas, (e) => e.usuarioId === usuario.id, 'Empresa não encontrada.');
const prestadorDo = (usuario: UsuarioRec) => encontrar(db.prestadores, (p) => p.usuarioId === usuario.id, 'Prestador não encontrado.');

// ---------- Conversão para os tipos da API ----------

const vagaDe = (id: string) => encontrar(db.vagas, (v) => v.id === id, 'Vaga não encontrada.');

function empresaResumo(empresaId: string): EmpresaResumo {
  const empresa = encontrar(db.empresas, (e) => e.id === empresaId, 'Empresa não encontrada.');
  const contratacoes = db.contratacoes.filter((c) => vagaDe(c.vagaId).empresaId === empresaId).map((c) => c.id);
  const notas = db.avaliacoes.filter((a) => a.autor === 'PRESTADOR' && contratacoes.includes(a.contratacaoId)).map((a) => a.nota);
  return { id: empresa.id, nome: empresa.nomeFantasia, notaMedia: media(notas), totalAvaliacoes: notas.length };
}

function prestadorResumo(prestadorId: string): PrestadorResumo {
  const prestador = encontrar(db.prestadores, (p) => p.id === prestadorId, 'Prestador não encontrado.');
  const contratacoes = db.contratacoes.filter((c) => c.prestadorId === prestadorId);
  const ids = contratacoes.map((c) => c.id);
  const notas = db.avaliacoes.filter((a) => a.autor === 'EMPRESA' && ids.includes(a.contratacaoId)).map((a) => a.nota);
  return {
    id: prestador.id,
    nome: prestador.nome,
    funcao: prestador.funcao,
    notaMedia: media(notas),
    totalAvaliacoes: notas.length,
    turnosConcluidos: contratacoes.filter((c) => c.status === 'CONCLUIDA').length,
  };
}

function vagaDto(vaga: VagaRec): Vaga {
  const categoria = db.categorias.find((c) => c.id === vaga.categoriaId)!;
  const empresa = db.empresas.find((e) => e.id === vaga.empresaId)!;
  return {
    id: vaga.id,
    titulo: vaga.titulo,
    descricao: vaga.descricao,
    categoria: { id: categoria.id, nome: categoria.nome },
    empresa: empresaResumo(vaga.empresaId),
    endereco: empresa.endereco,
    data: vaga.data,
    horaInicio: vaga.horaInicio,
    horaFim: vaga.horaFim,
    valorTurno: vaga.valorTurno,
    vagasDisponiveis: vaga.vagasDisponiveis,
    status: vaga.status,
    distanciaKm: vaga.distanciaKm,
    totalCandidatos: db.candidaturas.filter((c) => c.vagaId === vaga.id && c.status !== 'CANCELADA').length,
  };
}

function vagaResumo(vaga: VagaRec): VagaResumo {
  const { id, titulo, empresa, endereco, data, horaInicio, horaFim, valorTurno } = vagaDto(vaga);
  return { id, titulo, empresa, endereco, data, horaInicio, horaFim, valorTurno };
}

function candidaturaDto(candidatura: CandidaturaRec): Candidatura {
  return {
    id: candidatura.id,
    status: candidatura.status,
    criadoEm: candidatura.criadoEm,
    vaga: vagaResumo(vagaDe(candidatura.vagaId)),
    prestador: prestadorResumo(candidatura.prestadorId),
  };
}

function contratacaoDto(contratacao: ContratacaoRec): Contratacao {
  const avaliacoes = db.avaliacoes.filter((a) => a.contratacaoId === contratacao.id);
  return {
    id: contratacao.id,
    status: contratacao.status,
    vaga: vagaResumo(vagaDe(contratacao.vagaId)),
    prestador: prestadorResumo(contratacao.prestadorId),
    valorTurno: contratacao.valorTurno,
    taxaPlataforma: contratacao.taxaPlataforma,
    valorTotal: contratacao.valorTotal,
    statusPagamento: contratacao.statusPagamento,
    criadoEm: contratacao.criadoEm,
    checkInEm: contratacao.checkInEm,
    checkOutEm: contratacao.checkOutEm,
    concluidoEm: contratacao.concluidoEm,
    avaliadoPelaEmpresa: avaliacoes.some((a) => a.autor === 'EMPRESA'),
    avaliadoPeloPrestador: avaliacoes.some((a) => a.autor === 'PRESTADOR'),
  };
}

function avaliacaoDto(avaliacao: AvaliacaoRec): Avaliacao {
  const contratacao = db.contratacoes.find((c) => c.id === avaliacao.contratacaoId)!;
  const autorNome =
    avaliacao.autor === 'EMPRESA'
      ? db.empresas.find((e) => e.id === vagaDe(contratacao.vagaId).empresaId)!.nomeFantasia
      : db.prestadores.find((p) => p.id === contratacao.prestadorId)!.nome;
  return { ...avaliacao, autorNome };
}

function movimentacao(contratacao: ContratacaoRec, valor: number, contraparte: string): Movimentacao {
  const vaga = vagaDe(contratacao.vagaId);
  return {
    id: `mov-${contratacao.id}`,
    contratacaoId: contratacao.id,
    descricao: `${contraparte} • ${vaga.titulo}`,
    data: vaga.data,
    valor,
    status: contratacao.statusPagamento,
  };
}

const porDataDesc = (a: { data: string }, b: { data: string }) => b.data.localeCompare(a.data);
const soma = (lista: Movimentacao[]) => lista.reduce((total, m) => total + m.valor, 0);

function temTurnoAtivoNaData(prestadorId: string, data: string) {
  return db.contratacoes.some((c) => c.prestadorId === prestadorId && ATIVAS.includes(c.status) && vagaDe(c.vagaId).data === data);
}

function contratacaoDoPrestador(ctx: Contexto) {
  const prestador = prestadorDo(exigirRole(ctx, 'PRESTADOR'));
  const contratacao = encontrar(db.contratacoes, (c) => c.id === ctx.params.id, 'Turno não encontrado.');
  if (contratacao.prestadorId !== prestador.id) erro(403, 'Acesso negado.');
  return contratacao;
}

// ---------- Rotas ----------

const rotas: Rota[] = [
  // Auth
  {
    metodo: 'POST',
    padrao: '/auth/login',
    handler: ({ body }) => {
      const { email, senha } = (body ?? {}) as Partial<LoginRequest>;
      const chave = texto(email).toLowerCase();
      if (!chave || !senha) erro(400, 'Informe e-mail e senha.');

      const tentativa = tentativasLogin.get(chave) ?? { falhas: 0, bloqueadoAte: 0 };
      if (tentativa.bloqueadoAte > Date.now()) erro(429, 'Muitas tentativas. Tente novamente em 15 minutos.');

      const usuario = db.usuarios.find((u) => u.email === chave);
      if (!usuario || usuario.senha !== senha) {
        tentativa.falhas += 1;
        if (tentativa.falhas >= MAX_FALHAS_LOGIN) {
          tentativasLogin.set(chave, { falhas: 0, bloqueadoAte: Date.now() + BLOQUEIO_LOGIN_MS });
          erro(429, 'Muitas tentativas. Tente novamente em 15 minutos.');
        }
        tentativasLogin.set(chave, tentativa);
        erro(401, 'Credenciais inválidas');
      }

      tentativasLogin.delete(chave);
      return tokenPara(usuario);
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/registro/empresa',
    handler: ({ body }) => {
      const dados = (body ?? {}) as Partial<RegistroEmpresaRequest>;
      const usuario = novoUsuario(dados, 'EMPRESA');
      const razaoSocial = texto(dados.razaoSocial);
      const cnpj = somenteDigitos(dados.cnpj);
      if (!razaoSocial) erro(400, 'Informe o nome do estabelecimento.');
      if (cnpj.length !== 14) erro(400, 'CNPJ inválido.');
      db.usuarios.push(usuario);
      db.empresas.push({
        id: novoId('emp'),
        usuarioId: usuario.id,
        razaoSocial,
        nomeFantasia: razaoSocial,
        cnpj,
        endereco: '',
        cidade: texto(dados.cidade),
        tipoNegocio: texto(dados.tipoNegocio),
        nomeResponsavel: texto(dados.nomeResponsavel),
      });
      return tokenPara(usuario);
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/registro/prestador',
    handler: ({ body }) => {
      const dados = (body ?? {}) as Partial<RegistroPrestadorRequest>;
      const usuario = novoUsuario(dados, 'PRESTADOR');
      const nome = texto(dados.nome);
      const cpf = somenteDigitos(dados.cpf);
      if (!nome) erro(400, 'Informe seu nome.');
      if (cpf.length !== 11) erro(400, 'CPF inválido.');
      db.usuarios.push(usuario);
      db.prestadores.push({
        id: novoId('pre'),
        usuarioId: usuario.id,
        nome,
        cpf,
        funcao: texto(dados.funcao),
        cidade: texto(dados.cidade),
        experiencia: texto(dados.experiencia),
        sobre: '',
        habilidades: [],
      });
      return tokenPara(usuario);
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/otp/verificar',
    handler: (ctx) => {
      const usuario = usuarioLogado(ctx);
      const { codigo } = (ctx.body ?? {}) as Partial<VerificarOtpRequest>;
      if (somenteDigitos(codigo) !== CODIGO_MOCK) erro(400, 'Código inválido. Confira o SMS e tente de novo.');
      usuario.celularVerificado = true;
      return undefined;
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/otp/reenviar',
    handler: (ctx) => {
      usuarioLogado(ctx);
      return undefined;
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/recuperar-senha',
    handler: ({ body }) => {
      const email = texto((body as Partial<RecuperarSenhaRequest> | undefined)?.email).toLowerCase();
      if (!emailValido(email)) erro(400, 'Informe um e-mail válido.');
      // Responde igual exista ou não o e-mail; só gera código para contas reais.
      if (db.usuarios.some((u) => u.email === email)) codigosRecuperacao.set(email, Date.now() + VALIDADE_CODIGO_MS);
      return undefined;
    },
  },
  {
    metodo: 'POST',
    padrao: '/auth/redefinir-senha',
    handler: ({ body }) => {
      const dados = (body ?? {}) as Partial<RedefinirSenhaRequest>;
      const email = texto(dados.email).toLowerCase();
      const validoAte = codigosRecuperacao.get(email) ?? 0;
      if (validoAte < Date.now() || somenteDigitos(dados.codigo) !== CODIGO_MOCK) erro(400, 'Código inválido ou expirado.');
      validarSenha(dados.novaSenha);
      const usuario = db.usuarios.find((u) => u.email === email)!;
      usuario.senha = dados.novaSenha;
      codigosRecuperacao.delete(email);
      tentativasLogin.delete(email);
      return undefined;
    },
  },
  {
    metodo: 'GET',
    padrao: '/auth/me',
    handler: (ctx): UsuarioAtual => {
      const usuario = usuarioLogado(ctx);
      const empresa = db.empresas.find((e) => e.usuarioId === usuario.id) ?? null;
      const prestador = db.prestadores.find((p) => p.usuarioId === usuario.id) ?? null;
      return {
        userId: usuario.id,
        email: usuario.email,
        role: usuario.role,
        nome: empresa?.nomeFantasia ?? prestador?.nome ?? '',
        celularVerificado: usuario.celularVerificado,
        statusVerificacao: usuario.statusVerificacao,
        empresaId: empresa?.id ?? null,
        prestadorId: prestador?.id ?? null,
      };
    },
  },

  // Categorias
  { metodo: 'GET', padrao: '/categorias', handler: (): Categoria[] => db.categorias },

  // Vagas (rotas fixas antes de /vagas/:id)
  {
    metodo: 'GET',
    padrao: '/vagas/minhas',
    handler: (ctx): Vaga[] => {
      const empresa = empresaDo(exigirRole(ctx, 'EMPRESA'));
      return db.vagas.filter((v) => v.empresaId === empresa.id).sort(porDataDesc).map(vagaDto);
    },
  },
  {
    metodo: 'GET',
    padrao: '/vagas',
    handler: ({ query }): Vaga[] =>
      db.vagas
        .filter((v) => v.status === 'ABERTA' && v.data >= hoje())
        .filter((v) => !query.categoriaId || v.categoriaId === query.categoriaId)
        .sort((a, b) => `${a.data}${a.horaInicio}`.localeCompare(`${b.data}${b.horaInicio}`))
        .map(vagaDto),
  },
  { metodo: 'GET', padrao: '/vagas/:id', handler: ({ params }): Vaga => vagaDto(vagaDe(params.id)) },
  {
    metodo: 'POST',
    padrao: '/vagas',
    handler: (ctx): Vaga => {
      const usuario = exigirRole(ctx, 'EMPRESA');
      exigirVerificado(usuario);
      const empresa = empresaDo(usuario);
      // O body nunca define o valor: valorTurno vem da categoria.
      const dados = (ctx.body ?? {}) as Partial<CriarVagaRequest>;
      const categoria = db.categorias.find((c) => c.id === dados.categoriaId);
      const titulo = texto(dados.titulo);
      const data = texto(dados.data);
      const horaInicio = texto(dados.horaInicio);
      const horaFim = texto(dados.horaFim);
      const quantidade = Number(dados.vagasDisponiveis);
      if (!categoria) erro(400, 'Escolha uma categoria.');
      if (!titulo) erro(400, 'Informe o título da vaga.');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data < hoje()) erro(400, 'Informe uma data a partir de hoje.');
      if (!/^\d{2}:\d{2}$/.test(horaInicio) || !/^\d{2}:\d{2}$/.test(horaFim) || horaInicio === horaFim) erro(400, 'Informe horários de início e término válidos.');
      if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 20) erro(400, 'A quantidade de vagas deve ser de 1 a 20.');

      const vaga: VagaRec = {
        id: novoId('vag'),
        empresaId: empresa.id,
        categoriaId: categoria.id,
        titulo,
        descricao: texto(dados.descricao),
        data,
        horaInicio,
        horaFim,
        valorTurno: categoria.valorMedioSugerido,
        vagasDisponiveis: quantidade,
        status: 'ABERTA',
        distanciaKm: 1,
        criadoEm: agora(),
      };
      db.vagas.push(vaga);
      return vagaDto(vaga);
    },
  },

  // Candidaturas
  {
    metodo: 'POST',
    padrao: '/vagas/:id/candidaturas',
    handler: (ctx): Candidatura => {
      const usuario = exigirRole(ctx, 'PRESTADOR');
      exigirVerificado(usuario);
      const prestador = prestadorDo(usuario);
      const vaga = vagaDe(ctx.params.id);
      if (vaga.status !== 'ABERTA' || vaga.data < hoje()) erro(409, 'Esta vaga não está mais aberta.');
      const jaExiste = db.candidaturas.some((c) => c.vagaId === vaga.id && c.prestadorId === prestador.id && c.status !== 'CANCELADA');
      if (jaExiste) erro(409, 'Você já se candidatou a esta vaga.');
      if (temTurnoAtivoNaData(prestador.id, vaga.data)) erro(409, 'Você já tem um turno confirmado nesta data.');

      const candidatura: CandidaturaRec = { id: novoId('can'), vagaId: vaga.id, prestadorId: prestador.id, status: 'PENDENTE', criadoEm: agora() };
      db.candidaturas.push(candidatura);
      return candidaturaDto(candidatura);
    },
  },
  {
    metodo: 'GET',
    padrao: '/vagas/:id/candidaturas',
    handler: (ctx): Candidatura[] => {
      const empresa = empresaDo(exigirRole(ctx, 'EMPRESA'));
      const vaga = vagaDe(ctx.params.id);
      if (vaga.empresaId !== empresa.id) erro(403, 'Acesso negado.');
      return db.candidaturas
        .filter((c) => c.vagaId === vaga.id && c.status !== 'CANCELADA')
        .sort((a, b) => a.criadoEm.localeCompare(b.criadoEm))
        .map(candidaturaDto);
    },
  },
  {
    metodo: 'GET',
    padrao: '/candidaturas/minhas',
    handler: (ctx): Candidatura[] => {
      const prestador = prestadorDo(exigirRole(ctx, 'PRESTADOR'));
      return db.candidaturas
        .filter((c) => c.prestadorId === prestador.id)
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map(candidaturaDto);
    },
  },
  {
    metodo: 'DELETE',
    padrao: '/candidaturas/:id',
    handler: (ctx) => {
      const prestador = prestadorDo(exigirRole(ctx, 'PRESTADOR'));
      const candidatura = encontrar(db.candidaturas, (c) => c.id === ctx.params.id, 'Candidatura não encontrada.');
      if (candidatura.prestadorId !== prestador.id) erro(403, 'Acesso negado.');
      if (candidatura.status !== 'PENDENTE') erro(409, 'Só é possível desistir de candidaturas pendentes.');
      candidatura.status = 'CANCELADA';
      return undefined;
    },
  },
  {
    metodo: 'POST',
    padrao: '/candidaturas/:id/selecionar',
    handler: (ctx): Contratacao => {
      const usuario = exigirRole(ctx, 'EMPRESA');
      exigirVerificado(usuario);
      const empresa = empresaDo(usuario);
      const candidatura = encontrar(db.candidaturas, (c) => c.id === ctx.params.id, 'Candidatura não encontrada.');
      const vaga = vagaDe(candidatura.vagaId);
      if (vaga.empresaId !== empresa.id) erro(403, 'Acesso negado.');
      if (candidatura.status !== 'PENDENTE') erro(409, 'Esta candidatura não está mais pendente.');
      if (vaga.status !== 'ABERTA' || vaga.vagasDisponiveis <= 0) erro(409, 'Esta vaga não tem mais posições abertas.');
      if (temTurnoAtivoNaData(candidatura.prestadorId, vaga.data)) erro(409, 'Este profissional já tem um turno confirmado nesta data.');

      const contratacao: ContratacaoRec = {
        id: novoId('con'),
        vagaId: vaga.id,
        prestadorId: candidatura.prestadorId,
        candidaturaId: candidatura.id,
        status: 'CONFIRMADA',
        ...resumoDoTurno(vaga.valorTurno),
        statusPagamento: 'RETIDO',
        criadoEm: agora(),
        checkInEm: null,
        checkOutEm: null,
        concluidoEm: null,
      };
      db.contratacoes.push(contratacao);
      candidatura.status = 'SELECIONADA';

      vaga.vagasDisponiveis -= 1;
      if (vaga.vagasDisponiveis === 0) {
        vaga.status = 'PREENCHIDA';
        db.candidaturas.filter((c) => c.vagaId === vaga.id && c.status === 'PENDENTE').forEach((c) => (c.status = 'RECUSADA'));
      }
      // Outras candidaturas pendentes do mesmo profissional na mesma data deixam de valer.
      db.candidaturas
        .filter((c) => c.prestadorId === candidatura.prestadorId && c.status === 'PENDENTE' && vagaDe(c.vagaId).data === vaga.data)
        .forEach((c) => (c.status = 'CANCELADA'));

      return contratacaoDto(contratacao);
    },
  },

  // Contratações
  {
    metodo: 'GET',
    padrao: '/contratacoes/minhas',
    handler: (ctx): Contratacao[] => {
      const usuario = usuarioLogado(ctx);
      const lista =
        usuario.role === 'PRESTADOR'
          ? db.contratacoes.filter((c) => c.prestadorId === prestadorDo(usuario).id)
          : db.contratacoes.filter((c) => vagaDe(c.vagaId).empresaId === empresaDo(usuario).id);
      return lista.map(contratacaoDto).sort((a, b) => porDataDesc(a.vaga, b.vaga));
    },
  },
  {
    metodo: 'GET',
    padrao: '/contratacoes/:id',
    handler: (ctx): Contratacao => {
      const usuario = usuarioLogado(ctx);
      const contratacao = encontrar(db.contratacoes, (c) => c.id === ctx.params.id, 'Turno não encontrado.');
      const participa =
        usuario.role === 'PRESTADOR'
          ? contratacao.prestadorId === prestadorDo(usuario).id
          : vagaDe(contratacao.vagaId).empresaId === empresaDo(usuario).id;
      if (!participa) erro(403, 'Acesso negado.');
      return contratacaoDto(contratacao);
    },
  },
  {
    metodo: 'PATCH',
    padrao: '/contratacoes/:id/check-in',
    handler: (ctx): Contratacao => {
      const contratacao = contratacaoDoPrestador(ctx);
      if (contratacao.status !== 'CONFIRMADA') erro(409, 'O check-in não está disponível para este turno.');
      if (vagaDe(contratacao.vagaId).data !== hoje()) erro(409, 'O check-in só fica disponível no dia do turno.');
      contratacao.status = 'EM_ANDAMENTO';
      contratacao.checkInEm = agora();
      return contratacaoDto(contratacao);
    },
  },
  {
    metodo: 'PATCH',
    padrao: '/contratacoes/:id/check-out',
    handler: (ctx): Contratacao => {
      const contratacao = contratacaoDoPrestador(ctx);
      if (contratacao.status !== 'EM_ANDAMENTO') erro(409, 'Faça o check-in antes do check-out.');
      contratacao.status = 'AGUARDANDO_CONFIRMACAO';
      contratacao.checkOutEm = agora();
      return contratacaoDto(contratacao);
    },
  },
  {
    metodo: 'PATCH',
    padrao: '/contratacoes/:id/confirmar-conclusao',
    handler: (ctx): Contratacao => {
      const empresa = empresaDo(exigirRole(ctx, 'EMPRESA'));
      const contratacao = encontrar(db.contratacoes, (c) => c.id === ctx.params.id, 'Turno não encontrado.');
      if (vagaDe(contratacao.vagaId).empresaId !== empresa.id) erro(403, 'Acesso negado.');
      if (contratacao.status !== 'AGUARDANDO_CONFIRMACAO') erro(409, 'O turno ainda não teve check-out.');
      contratacao.status = 'CONCLUIDA';
      contratacao.statusPagamento = 'LIBERADO';
      contratacao.concluidoEm = agora();
      return contratacaoDto(contratacao);
    },
  },

  // Avaliações
  {
    metodo: 'POST',
    padrao: '/contratacoes/:id/avaliacao',
    handler: (ctx): Avaliacao => {
      const usuario = usuarioLogado(ctx);
      const contratacao = encontrar(db.contratacoes, (c) => c.id === ctx.params.id, 'Turno não encontrado.');
      const participa =
        usuario.role === 'PRESTADOR'
          ? contratacao.prestadorId === prestadorDo(usuario).id
          : vagaDe(contratacao.vagaId).empresaId === empresaDo(usuario).id;
      if (!participa) erro(403, 'Acesso negado.');
      if (contratacao.status !== 'CONCLUIDA') erro(409, 'Só é possível avaliar turnos concluídos.');
      if (db.avaliacoes.some((a) => a.contratacaoId === contratacao.id && a.autor === usuario.role)) erro(409, 'Você já avaliou este turno.');

      const { nota, comentario } = (ctx.body ?? {}) as Partial<AvaliarRequest>;
      if (!Number.isInteger(nota) || nota! < 1 || nota! > 5) erro(400, 'A nota deve ser de 1 a 5.');
      if (texto(comentario).length > 500) erro(400, 'O comentário deve ter até 500 caracteres.');

      const avaliacao: AvaliacaoRec = { id: novoId('ava'), contratacaoId: contratacao.id, autor: usuario.role, nota: nota!, comentario: texto(comentario), criadoEm: agora() };
      db.avaliacoes.push(avaliacao);
      return avaliacaoDto(avaliacao);
    },
  },
  {
    metodo: 'GET',
    padrao: '/empresas/:id/avaliacoes',
    handler: ({ params }): Avaliacao[] => {
      const ids = db.contratacoes.filter((c) => vagaDe(c.vagaId).empresaId === params.id).map((c) => c.id);
      return db.avaliacoes
        .filter((a) => a.autor === 'PRESTADOR' && ids.includes(a.contratacaoId))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map(avaliacaoDto);
    },
  },

  // Prestadores (rotas fixas antes de /prestadores/:id)
  {
    metodo: 'GET',
    padrao: '/prestadores/me/carteira',
    handler: (ctx): Carteira => {
      const prestador = prestadorDo(exigirRole(ctx, 'PRESTADOR'));
      const movimentacoes = db.contratacoes
        .filter((c) => c.prestadorId === prestador.id && c.status !== 'CANCELADA')
        .map((c) => movimentacao(c, c.valorTurno, db.empresas.find((e) => e.id === vagaDe(c.vagaId).empresaId)!.nomeFantasia))
        .sort(porDataDesc);
      return {
        saldoDisponivel: soma(movimentacoes.filter((m) => m.status === 'LIBERADO')),
        aReceber: soma(movimentacoes.filter((m) => m.status === 'RETIDO')),
        movimentacoes,
      };
    },
  },
  {
    metodo: 'GET',
    padrao: '/prestadores/:id',
    handler: ({ params }): PrestadorPerfil => {
      const prestador = encontrar(db.prestadores, (p) => p.id === params.id, 'Profissional não encontrado.');
      const usuario = db.usuarios.find((u) => u.id === prestador.usuarioId)!;
      const empresasAtendidas = db.contratacoes
        .filter((c) => c.prestadorId === prestador.id && c.status === 'CONCLUIDA')
        .map((c) => db.empresas.find((e) => e.id === vagaDe(c.vagaId).empresaId)!.nomeFantasia);
      return {
        ...prestadorResumo(prestador.id),
        cidade: prestador.cidade,
        experiencia: prestador.experiencia,
        sobre: prestador.sobre,
        habilidades: prestador.habilidades,
        membroDesde: usuario.criadoEm,
        empresasAtendidas: [...new Set(empresasAtendidas)],
      };
    },
  },
  {
    metodo: 'GET',
    padrao: '/prestadores/:id/avaliacoes',
    handler: ({ params }): Avaliacao[] => {
      const ids = db.contratacoes.filter((c) => c.prestadorId === params.id).map((c) => c.id);
      return db.avaliacoes
        .filter((a) => a.autor === 'EMPRESA' && ids.includes(a.contratacaoId))
        .sort((a, b) => b.criadoEm.localeCompare(a.criadoEm))
        .map(avaliacaoDto);
    },
  },

  // Financeiro da empresa
  {
    metodo: 'GET',
    padrao: '/empresas/me/financeiro',
    handler: (ctx): FinanceiroEmpresa => {
      const empresa = empresaDo(exigirRole(ctx, 'EMPRESA'));
      const contratacoes = db.contratacoes.filter((c) => vagaDe(c.vagaId).empresaId === empresa.id && c.status !== 'CANCELADA');
      const movimentacoes = contratacoes
        .map((c) => movimentacao(c, c.valorTotal, db.prestadores.find((p) => p.id === c.prestadorId)!.nome))
        .sort(porDataDesc);
      const mesAtual = hoje().slice(0, 7);
      const pagasNoMes = contratacoes.filter((c) => c.statusPagamento === 'LIBERADO' && c.concluidoEm && dataLocal(new Date(c.concluidoEm)).startsWith(mesAtual));
      return {
        valorRetido: soma(movimentacoes.filter((m) => m.status === 'RETIDO')),
        pagoNoMes: pagasNoMes.reduce((total, c) => total + c.valorTotal, 0),
        movimentacoes,
      };
    },
  },
];

function validarSenha(senha: unknown): asserts senha is string {
  if (typeof senha !== 'string' || senha.length < SENHA_MINIMA) erro(400, `A senha deve ter pelo menos ${SENHA_MINIMA} caracteres.`);
}

function novoUsuario(dados: { email?: unknown; senha?: unknown; celular?: unknown }, role: Role): UsuarioRec {
  const email = texto(dados.email).toLowerCase();
  const celular = somenteDigitos(dados.celular);
  if (!emailValido(email)) erro(400, 'Informe um e-mail válido.');
  validarSenha(dados.senha);
  if (celular.length < 10 || celular.length > 11) erro(400, 'Informe um celular válido com DDD.');
  if (db.usuarios.some((u) => u.email === email)) erro(409, 'Este e-mail já está cadastrado.');
  return {
    id: novoId('usr'),
    email,
    senha: dados.senha,
    role,
    celular,
    celularVerificado: false,
    statusVerificacao: 'PENDENTE',
    aprovacaoAutomaticaEm: new Date(Date.now() + APROVACAO_AUTOMATICA_MS).toISOString(),
    criadoEm: agora(),
  };
}

// ---------- Roteamento ----------

function casar(padrao: string, caminho: string) {
  const partesPadrao = padrao.split('/');
  const partesCaminho = caminho.split('/');
  if (partesPadrao.length !== partesCaminho.length) return null;
  const params: Record<string, string> = {};
  for (let i = 0; i < partesPadrao.length; i++) {
    if (partesPadrao[i].startsWith(':')) params[partesPadrao[i].slice(1)] = decodeURIComponent(partesCaminho[i]);
    else if (partesPadrao[i] !== partesCaminho[i]) return null;
  }
  return params;
}

function lerQuery(queryString: string) {
  const query: Record<string, string> = {};
  for (const par of queryString.split('&').filter(Boolean)) {
    const [chave, valor = ''] = par.split('=');
    query[decodeURIComponent(chave)] = decodeURIComponent(valor);
  }
  return query;
}

export async function responderMock(metodo: Metodo, caminhoCompleto: string, body: unknown, token: string | null) {
  await esperar(ATRASO_MIN_MS + Math.random() * (ATRASO_MAX_MS - ATRASO_MIN_MS));
  if (Math.random() < TAXA_DE_FALHA) erro(503, 'Não foi possível conectar. Verifique sua internet e tente novamente.');

  const [caminho, queryString = ''] = caminhoCompleto.split('?');
  for (const rota of rotas) {
    if (rota.metodo !== metodo) continue;
    const params = casar(rota.padrao, caminho);
    if (!params) continue;
    const resposta = rota.handler({ params, query: lerQuery(queryString), body, token });
    // Cópia para que as telas nunca alterem o "banco" do mock por referência.
    return resposta === undefined ? undefined : JSON.parse(JSON.stringify(resposta));
  }
  erro(404, 'Recurso não encontrado.');
}
