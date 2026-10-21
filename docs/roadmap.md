# Roadmap

## Foco atual: somente o front

O backend (Spring Boot) será feito depois, com ajuda do Claude. Por enquanto o app roda 100% com dados mockados e autenticação simulada. O contrato futuro da API está em @docs/api.md e o modelo em @docs/modelo-de-dados.md, e serve de guia para o formato dos mocks. Navegação e abas seguem @docs/abas-e-rotas.md.

O projeto já tem uma parte implementada (telas criadas anteriormente com ajuda de IA). Este roadmap é de continuidade: não recriar o que já existe.

## Fluxo do produto (decidido em 2026-10-08)

1. A empresa publica a vaga.
2. O profissional vê a vaga no feed e aceita (na prática, é uma candidatura).
3. A empresa recebe a lista de candidatos.
4. A empresa seleciona um profissional, manualmente ou por regra automática.
5. O turno é confirmado e o valor fica retido em escrow.
6. Check-in, trabalho, check-out.
7. A empresa confirma a conclusão e o pagamento é liberado.
8. Avaliação bilateral (empresa avalia o profissional e o profissional avalia a empresa).

Nomenclatura: "check-out" é a saída do profissional ao fim do turno; a etapa da empresa depois disso é "confirmação e pagamento do turno" (nunca "checkout").

## Passo 0: levantamento do que já existe

Feito em 2026-10-08. Resultado na seção "Checklist de telas".

## Ordem de execução

1. [x] **Rotas** (2026-10-08): grupo `(auth)` (Stack), grupo `(profissional)` com abas Buscar, Turnos, Carteira, Perfil; área `empresa/` com abas Painel, Vagas, Turnos, Financeiro, Mais e botão flutuante "Nova vaga" no Painel e em Vagas; `vaga/nova` como modal; `_layout.tsx` raiz em Stack. Ver estrutura em @docs/telas.md.
2. [x] **Camada de dados fake** (2026-10-08): @docs/api.md e @docs/modelo-de-dados.md atualizados para o fluxo de candidatura. Tipos em `lib/types.ts`; funções por domínio em `lib/` (`auth`, `categorias`, `vagas`, `candidaturas`, `contratacoes`, `avaliacoes`, `prestadores`, `financeiro`); todas passam por `request()` em `lib/http.ts`, que hoje responde com `lib/mock/server.ts` (rotas, regras de negócio, atraso de 300 a 600 ms e 5% de falha de conexão) sobre os dados de `lib/mock/db.ts`. Sessão em memória em `lib/session.ts` (vai para `expo-secure-store` na etapa 3). Exibição de valores com `lib/precos.ts`.
3. [x] **Login e cadastro** (2026-10-08): `entrar` e `cadastro` com estado, validação (senha mínima de 8 caracteres, máscaras de CPF/CNPJ/celular), carregamento e erros da API (credenciais inválidas, bloqueio 429, e-mail já cadastrado, falha de conexão). Sessão `{ token, role, userId }` no `expo-secure-store`. Novas telas `(auth)/otp` (verificação do celular, obrigatória após o cadastro) e `(auth)/recuperar-senha` (código + nova senha). Contas em análise veem o banner de modo limitado (`BannerVerificacao`) em Buscar e no Painel. Login com Apple/Google mostra "Em breve".
4. [x] **Proteção de rotas no layout raiz** (2026-10-21): `Stack.Protected` em `app/_layout.tsx` com a sessão reativa (`useSessao` em `lib/session.ts`). Sem sessão: boas-vindas e `(auth)`; com sessão e celular não verificado: só `(auth)/otp` (guard aninhado em `(auth)/_layout.tsx`); PRESTADOR: `(profissional)`; EMPRESA: `empresa/`, `vaga/nova` e `selecao/[candidaturaId]`; os dois: `vaga/[id]`, `profissional/[id]`, `turno/[id]`, `avaliacao/[turnoId]`. As telas de login, cadastro e OTP não redirecionam mais (o layout troca de área quando a sessão muda). A sessão passou a guardar `celularVerificado` (vem no `AuthResponse`). Logout com confirmação em Perfil e Mais. Um 401 com token salvo encerra a sessão (`lib/http.ts`).
5. [x] **Conectar telas existentes aos mocks** (2026-10-21): Buscar (saudação, cidade e resumo reais; chips de categoria vindos de `GET /categorias` filtrando o feed; card abre `vaga/[id]`), Turnos, Carteira, Perfil, Painel, Vagas, Turnos e Financeiro da empresa, `vaga/nova` (categorias da API, valor somente leitura, máscaras de data/hora, revisão com valor, taxa e total antes de publicar). Loading, vazio e erro (com "Tentar de novo") via `useDados` + `LoadingState`/`ErrorState`/`EmptyState`.
6. [x] **Candidatura** (2026-10-21): `vaga/[id]` com "Quero este turno", candidatura pendente com "Desistir", aviso de selecionado com atalho para o turno e avaliações da empresa. Candidaturas pendentes aparecem em Turnos.
7. [x] **Candidatos e seleção** (2026-10-21, só manual): Vagas (abertas/encerradas), `vaga/[id]` com os candidatos para a empresa, `profissional/[id]` (perfil, habilidades, avaliações e botão de selecionar quando vem de uma candidatura), modal `selecao/[candidaturaId]` com valor do turno, taxa de 10% e total retido em escrow, e tela de sucesso. A seleção automática depende da regra (ver "Decisões em aberto").
8. [x] **Execução do turno** (2026-10-21): `turno/[id]` com linha do tempo, check-in (só no dia do turno) e check-out do profissional, e "Confirmar conclusão e pagar" da empresa, que libera o valor (Carteira e Financeiro refletem o novo status). Botão "Ver rota" abre o endereço no mapa.
9. [x] **Avaliação bilateral** (2026-10-21): modal `avaliacao/[turnoId]` (1 a 5 estrelas e comentário até 500), acessado pelo turno concluído; avaliações exibidas em `profissional/[id]` e, para a empresa, no detalhe da vaga.
10. [ ] **Mensagens**: chat vinculado ao turno (`chat/[turnoId]`), acessado pelo detalhe do turno e por ícone no cabeçalho com badge de não lidas (sem aba própria).
11. [ ] **Telas restantes**: itens de Mais (empresa), edição do perfil do profissional (foto com `expo-image`, especialidades, disponibilidade), mapa e filtros de raio/especialidade em Buscar.
12. [ ] **Seletores reais** de data e hora na criação de vaga (`@react-native-community/datetimepicker`).
13. [ ] **Polimento**: skeletons de loading, tratamento de sessão expirada, acessibilidade básica, ícone e splash.

## Checklist de telas

| Tela | Rota | Estado |
|---|---|---|
| Boas-vindas | `index` | feita (estática) |
| Escolher perfil | `(auth)/escolher-perfil` | feita (estática) |
| Login | `(auth)/entrar?tipo=` | feita (mock) |
| Cadastro | `(auth)/cadastro?tipo=` | feita (mock) |
| OTP | `(auth)/otp` | feita (mock) |
| Recuperar senha | `(auth)/recuperar-senha` | feita (mock) |
| Buscar (feed de vagas) | `(profissional)/buscar` | feita (mock; sem mapa e filtros de raio) |
| Turnos (profissional) | `(profissional)/turnos` | feita (mock) |
| Carteira | `(profissional)/carteira` | feita (mock; saque "Em breve") |
| Perfil (profissional) | `(profissional)/perfil` | feita (mock; itens do menu "Em breve", exceto o perfil público) |
| Painel da empresa | `empresa/index` | feita (mock) |
| Vagas (empresa) | `empresa/vagas` | feita (mock) |
| Turnos (empresa) | `empresa/turnos` | feita (mock) |
| Financeiro (empresa) | `empresa/financeiro` | feita (mock) |
| Mais (empresa) | `empresa/mais` | parcial (itens do menu "Em breve"; "Sair" funciona) |
| Nova vaga | `vaga/nova` (modal) | feita (mock; data/hora digitadas, sem seletor) |
| Detalhe da vaga (candidatar-se / candidatos) | `vaga/[id]` | feita (mock) |
| Perfil do profissional (visto pela empresa) | `profissional/[id]` | feita (mock) |
| Confirmação da seleção (escrow) e sucesso | `selecao/[candidaturaId]` (modal) | feita (mock; só seleção manual) |
| Detalhe do turno (check-in/out, conclusão) | `turno/[id]` | feita (mock) |
| Avaliação | `avaliacao/[turnoId]` (modal) | feita (mock) |
| Chat do turno | `chat/[turnoId]` | ausente (botões de chat mostram "Em breve") |

Estados: feita, parcial (dados fixos no componente ou placeholder), ausente.

Botões com "Em breve" (via `avisarEmBreve`): notificações (Buscar e Painel), "Ver mapa", saque via Pix, suporte financeiro, configurações e itens do Perfil e do Mais, chat (Painel e turno). O favorito (coração) do feed e o switch de disponibilidade são só estado local, sem API.

### Decisões do Passo 0 (2026-10-08)

- Pastas: mantidas `app/`, `components/` e `lib/` na raiz (sem `src/`).
- Expo SDK 57 mantido.
- Estilo com `StyleSheet` + `lib/theme.ts` e identidade visual "Chama" mantidos (sem NativeWind).
- Abas e rotas conforme @docs/abas-e-rotas.md, com dois ajustes à convenção do projeto: a área da empresa usa o segmento real `empresa/` (URLs `/empresa`, `/empresa/vagas`...) em vez do grupo `(empresa)`, para não colidir com `/turnos` do profissional; e o Painel é `empresa/index.tsx` (URL `/empresa`).
- Removidos os placeholders do template (`sobre`, `clientes`, `contato`).

## Quando o backend existir

- Trocar a implementação da camada `lib/` de mock para `fetch` real (`lib/api.ts`), mantendo as assinaturas.
- Base URL: emulador Android `http://10.0.2.2:8080`; celular físico usa o IP da máquina na rede local.
- Remover `lib/mock/` ou mantê-lo apenas para testes.

## Decisões em aberto

- Nome do app: `app.json` e as telas usam "Chama"; @docs/abas-e-rotas.md fala em "Turno".
- Nome do papel: docs de backend usam `PRESTADOR`; @docs/abas-e-rotas.md usa `PROFISSIONAL` (a UI usa "profissional").
- Regra da seleção automática de candidatos (ex.: primeiro a se candidatar, maior nota, mais próximo).
- Taxa da plataforma fixa em 10% ou configurável.
- Valor por região (a UI diz "média da região"; o backend previsto usa só o valor da categoria).
- Pagamento real e escrow (no front tudo é simulado).
- Check-in por geolocalização (a UI diz "liberado quando você estiver próximo") ou manual.
- Notificações push (`expo-notifications`) para avisar o profissional quando for selecionado.
- iOS fora do Expo Go: development build via EAS, quando necessário.
