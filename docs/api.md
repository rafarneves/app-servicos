# API (Spring Boot)

Base local: `http://localhost:8080`. Swagger em `/swagger-ui.html`, spec em `/v3/api-docs`.
Autenticação: header `Authorization: Bearer <jwt>` (token válido por 24h, claims `role` e `userId`).

## Segurança

| Rota | Acesso |
|---|---|
| `/auth/**`, `/swagger-ui/**`, `/v3/api-docs/**` | público |
| `GET /vagas/**`, `GET /prestadores/**` | público |
| demais `/vagas/**` | role `EMPRESA` |
| `/contratacoes/**` e resto | autenticado |

Filtros: `RateLimitFilter` (10 req/min por IP em `/auth/login` e `/auth/registro/**`) e `JwtAuthFilter`, ambos antes de `UsernamePasswordAuthenticationFilter`.

`LoginAttemptService` (Caffeine): 5 falhas bloqueiam o e-mail por 15 min e retornam 429.

## Auth

- `POST /auth/registro/empresa` body `{ email, senha (min 6), razaoSocial, cnpj }` -> `{ token, role, userId }`
- `POST /auth/registro/prestador` body `{ email, senha (min 6), nome, cpf }` -> `{ token, role, userId }`
- `POST /auth/login` body `{ email, senha }` -> `{ token, role, userId }` (401 credenciais inválidas, 429 bloqueado)

## Vagas

- `POST /vagas` (EMPRESA) body `{ categoriaId, titulo, descricao, data, horaInicio, horaFim, vagasDisponiveis }`. O `valorTurno` vem da categoria, nunca do body.
- `GET /vagas?categoriaId=` lista vagas ABERTAS.
- `GET /vagas/{id}/prestadores-disponiveis` prestadores da mesma categoria sem conflito de data (`PrestadorResumoResponse`: id, nome, categoria, notaMedia, valorTurno).

## Contratações

- `POST /contratacoes` (EMPRESA) body `{ vagaId, prestadorId }`. Valida: vaga é da empresa, vaga ABERTA com vagas > 0, prestador sem compromisso na data. Calcula `valorTotal = valorTurno * 1.10`, decrementa `vagasDisponiveis` e marca PREENCHIDA quando chega a 0. Transacional.
- `PATCH /contratacoes/{id}/confirmar` muda status para CONFIRMADA.
- `GET /contratacoes/minhas` (PRESTADOR) contratações do prestador logado.

## A implementar / revisar

- `PATCH /contratacoes/{id}/confirmar` não valida quem está confirmando (deveria ser o prestador da contratação).
- Endpoints de prestador: `GET /prestadores/{id}` (perfil completo: sobre, habilidades, histórico, avaliações), `PUT /prestadores/me`.
- Avaliações: `POST /contratacoes/{id}/avaliacao`, `GET /prestadores/{id}/avaliacoes`.
- Listagem de categorias: `GET /categorias` (o app precisa dos ids e valores sugeridos).
- Handler global de erros devolvendo `{ "message": "..." }` (o app lê `erro.message`).
- Refresh token.
- Queries nativas só com parâmetros (`:param` + `@Param`), nunca concatenar string.
