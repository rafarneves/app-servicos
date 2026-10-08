# API (Spring Boot)

Contrato do backend futuro. Hoje é implementado pelo mock em `lib/mock/server.ts`, e os tipos estão em `lib/types.ts` (manter os três em sincronia).

Base local: `http://localhost:8080`. Swagger em `/swagger-ui.html`, spec em `/v3/api-docs`.
Autenticação: header `Authorization: Bearer <jwt>` (token válido por 24h, claims `role` e `userId`). Roles: `EMPRESA` e `PRESTADOR`.

Formatos: `data` como `YYYY-MM-DD`, horas como `HH:mm`, instantes (`criadoEm`, `checkInEm`...) em ISO 8601. Valores em reais como número (BigDecimal).

Erros: sempre `{ "message": "..." }` com o status HTTP (o app lê `erro.message`). 400 validação, 401 sem sessão ou credenciais inválidas, 403 papel errado ou recurso de outro usuário, 404 não encontrado, 409 conflito de estado, 429 bloqueio de login.

## Segurança

| Rota | Acesso |
|---|---|
| `/auth/login`, `/auth/registro/**`, `/swagger-ui/**`, `/v3/api-docs/**` | público |
| `GET /categorias`, `GET /vagas`, `GET /vagas/{id}`, `GET /prestadores/{id}`, `GET /prestadores/{id}/avaliacoes`, `GET /empresas/{id}/avaliacoes` | público |
| `POST /vagas`, `GET /vagas/minhas`, `GET /vagas/{id}/candidaturas`, `POST /candidaturas/{id}/selecionar`, `PATCH /contratacoes/{id}/confirmar-conclusao`, `GET /empresas/me/financeiro` | role `EMPRESA` (e dona do recurso) |
| `POST /vagas/{id}/candidaturas`, `GET /candidaturas/minhas`, `DELETE /candidaturas/{id}`, `PATCH /contratacoes/{id}/check-in`, `PATCH /contratacoes/{id}/check-out`, `GET /prestadores/me/carteira` | role `PRESTADOR` (e dono do recurso) |
| demais (`/auth/me`, `/contratacoes/**`, avaliação) | autenticado e participante do turno |

Filtros: `RateLimitFilter` (10 req/min por IP em `/auth/login` e `/auth/registro/**`) e `JwtAuthFilter`, ambos antes de `UsernamePasswordAuthenticationFilter`.

`LoginAttemptService` (Caffeine): 5 falhas bloqueiam o e-mail por 15 min e retornam 429 (a 5ª falha já responde 429). O bloqueio vale mesmo para e-mails inexistentes, para não revelar se existem.

Verificação de cadastro: contas novas nascem com `statusVerificacao = PENDENTE` (modo limitado). Enquanto pendente, a empresa não publica vagas nem seleciona candidatos e o prestador não se candidata (403). No mock, a aprovação é automática 60 s após o cadastro.

## Auth

- `POST /auth/registro/empresa` body `{ email, senha (min 8), razaoSocial, cnpj (14 dígitos), celular (10 ou 11 dígitos), nomeResponsavel?, cidade?, tipoNegocio? }` -> `{ token, role, userId }`. 409 se o e-mail já existe.
- `POST /auth/registro/prestador` body `{ email, senha (min 8), nome, cpf (11 dígitos), celular (10 ou 11 dígitos), funcao?, cidade?, experiencia? }` -> `{ token, role, userId }`. 409 se o e-mail já existe.
- `POST /auth/login` body `{ email, senha }` -> `{ token, role, userId }` (401 "Credenciais inválidas", 429 bloqueado).
- `GET /auth/me` -> `UsuarioAtual { userId, email, role, nome, celularVerificado, statusVerificacao, empresaId, prestadorId }`.
- `POST /auth/otp/verificar` (autenticado) body `{ codigo }` -> 204 e marca o celular como verificado; 400 se o código não confere. No mock o código é sempre `123456`.
- `POST /auth/otp/reenviar` (autenticado) -> 204.
- `POST /auth/recuperar-senha` body `{ email }` -> sempre 204, exista ou não o e-mail (não revela cadastro). Gera um código válido por 10 min.
- `POST /auth/redefinir-senha` body `{ email, codigo, novaSenha (min 8) }` -> 204; 400 "Código inválido ou expirado." Também zera o bloqueio de login do e-mail.

Documentos (CPF/CNPJ) são enviados com ou sem máscara; o backend considera só os dígitos.

## Categorias

- `GET /categorias` -> `Categoria[] { id, nome, valorMedioSugerido }`.

## Vagas

- `POST /vagas` (EMPRESA) body `{ categoriaId, titulo, descricao, data, horaInicio, horaFim, vagasDisponiveis (1..20) }` -> `Vaga`. O `valorTurno` é copiado da categoria; qualquer valor no body é ignorado. Data a partir de hoje.
- `GET /vagas?categoriaId=` -> `Vaga[]`: feed, só ABERTAS com data a partir de hoje, ordenadas por data e hora.
- `GET /vagas/{id}` -> `Vaga`.
- `GET /vagas/minhas` (EMPRESA) -> `Vaga[]` da empresa logada, todas as situações.

`Vaga`: id, titulo, descricao, categoria `{ id, nome }`, empresa `{ id, nome, notaMedia, totalAvaliacoes }`, endereco, data, horaInicio, horaFim, valorTurno, vagasDisponiveis, status (`ABERTA` | `PREENCHIDA` | `CANCELADA`), distanciaKm, totalCandidatos.

## Candidaturas

- `POST /vagas/{id}/candidaturas` (PRESTADOR) -> `Candidatura` PENDENTE. 409 se a vaga não está aberta, se já se candidatou ou se já tem turno ativo na data.
- `GET /vagas/{id}/candidaturas` (EMPRESA dona) -> `Candidatura[]` (sem as canceladas), por ordem de chegada.
- `GET /candidaturas/minhas` (PRESTADOR) -> `Candidatura[]`, mais recentes primeiro.
- `DELETE /candidaturas/{id}` (PRESTADOR dono) -> 204. Só se PENDENTE; vira CANCELADA.
- `POST /candidaturas/{id}/selecionar` (EMPRESA dona) -> `Contratacao`. Transacional. Valida: candidatura PENDENTE, vaga ABERTA com `vagasDisponiveis > 0`, prestador sem turno ativo na data. Cria a contratação CONFIRMADA com pagamento RETIDO (escrow), marca a candidatura SELECIONADA, decrementa `vagasDisponiveis`; ao chegar a 0 a vaga vira PREENCHIDA e as demais candidaturas pendentes viram RECUSADA. Outras candidaturas pendentes do mesmo prestador na mesma data viram CANCELADA.

`Candidatura`: id, status (`PENDENTE` | `SELECIONADA` | `RECUSADA` | `CANCELADA`), criadoEm, vaga (`VagaResumo`), prestador (`PrestadorResumo`).

## Contratações (turnos)

Ciclo: `CONFIRMADA` -> check-in -> `EM_ANDAMENTO` -> check-out -> `AGUARDANDO_CONFIRMACAO` -> confirmação da empresa -> `CONCLUIDA` (pagamento `LIBERADO`). `CANCELADA` (pagamento `ESTORNADO`) fica para quando houver cancelamento.

- `GET /contratacoes/minhas` -> `Contratacao[]`: do prestador logado, ou das vagas da empresa logada. Mais recentes primeiro.
- `GET /contratacoes/{id}` (participante) -> `Contratacao`.
- `PATCH /contratacoes/{id}/check-in` (PRESTADOR do turno): de CONFIRMADA para EM_ANDAMENTO, só no dia do turno.
- `PATCH /contratacoes/{id}/check-out` (PRESTADOR do turno): de EM_ANDAMENTO para AGUARDANDO_CONFIRMACAO.
- `PATCH /contratacoes/{id}/confirmar-conclusao` (EMPRESA dona): de AGUARDANDO_CONFIRMACAO para CONCLUIDA e libera o pagamento.

`Contratacao`: id, status, vaga (`VagaResumo`), prestador (`PrestadorResumo`), valorTurno, taxaPlataforma (10%), valorTotal (`valorTurno * 1.10`), statusPagamento (`RETIDO` | `LIBERADO` | `ESTORNADO`), criadoEm, checkInEm, checkOutEm, concluidoEm, avaliadoPelaEmpresa, avaliadoPeloPrestador.

O prestador recebe `valorTurno`; a empresa paga `valorTotal`.

## Avaliações (bilaterais)

- `POST /contratacoes/{id}/avaliacao` (participante) body `{ nota (1..5), comentario (até 500) }` -> `Avaliacao`. Só para CONCLUIDA; uma por lado (409 se repetir). O `autor` é o papel de quem avalia.
- `GET /prestadores/{id}/avaliacoes` -> avaliações feitas pelas empresas.
- `GET /empresas/{id}/avaliacoes` -> avaliações feitas pelos prestadores.

`Avaliacao`: id, contratacaoId, autor (`EMPRESA` | `PRESTADOR`), autorNome, nota, comentario, criadoEm.

## Prestadores

- `GET /prestadores/{id}` -> `PrestadorPerfil`: `PrestadorResumo` (id, nome, funcao, notaMedia, totalAvaliacoes, turnosConcluidos) + cidade, experiencia, sobre, habilidades, membroDesde, empresasAtendidas.

## Financeiro

- `GET /prestadores/me/carteira` (PRESTADOR) -> `{ saldoDisponivel, aReceber, movimentacoes }`. `aReceber` soma os turnos RETIDOS; `saldoDisponivel` soma os LIBERADOS (ainda sem saque).
- `GET /empresas/me/financeiro` (EMPRESA) -> `{ valorRetido, pagoNoMes, movimentacoes }`.

`Movimentacao`: id, contratacaoId, descricao, data, valor, status (o `statusPagamento` da contratação).

## A implementar / revisar

- Seleção automática de candidatos (regra em aberto, ver roadmap).
- Cancelamento de vaga e de turno (com estorno do escrow).
- Saque da carteira (Pix).
- `PUT /prestadores/me` (edição do perfil) e dados complementares da empresa (endereço, unidades).
- Chat do turno.
- Refresh token.
- Queries nativas só com parâmetros (`:param` + `@Param`), nunca concatenar string.
