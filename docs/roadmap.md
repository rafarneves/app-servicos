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
4. [ ] **Proteção de rotas no layout raiz** com `Stack.Protected` (sem lógica de redirecionamento espalhada pelas telas): sem sessão só boas-vindas e `(auth)`; PRESTADOR vai para `/buscar`; EMPRESA vai para `/empresa` (Painel); sem acesso cruzado. Logout em Perfil (profissional) e Mais (empresa) limpando a sessão.
5. [ ] **Conectar telas existentes aos mocks**: Buscar (feed com filtro de categoria funcionando), Turnos, Carteira, Perfil, Painel da empresa, `vaga/nova` (valor somente leitura vindo da categoria). Estados de loading, vazio e erro em todas.
6. [ ] **Candidatura** (profissional): detalhe da vaga `vaga/[id]` a partir de "Ver turno", com botão de candidatar-se; candidaturas pendentes aparecem em Turnos.
7. [ ] **Candidatos e seleção** (empresa): Vagas (lista de vagas publicadas), `vaga/[id]` mostrando os candidatos para a empresa, perfil do profissional `profissional/[id]`, seleção manual ou automática, confirmação com resumo (valor do turno, taxa de 10%, total retido em escrow) e sucesso.
8. [ ] **Execução do turno**: `turno/[id]` com check-in e check-out (profissional), validação de check-in e confirmação e pagamento do turno (empresa, aba Turnos), liberando o valor na Carteira do profissional e no Financeiro da empresa.
9. [ ] **Avaliação bilateral** (nota e comentário) e exibição nos perfis.
10. [ ] **Mensagens**: chat vinculado ao turno (`chat/[turnoId]`), acessado pelo detalhe do turno e por ícone no cabeçalho com badge de não lidas (sem aba própria).
11. [ ] **Telas restantes**: Financeiro e itens de Mais (empresa), edição do perfil do profissional (foto com `expo-image`, especialidades, disponibilidade), mapa e filtros de raio/especialidade em Buscar.
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
| Buscar (feed de vagas) | `(profissional)/buscar` | parcial (vagas fixas; filtro de categoria não filtra; "Ver turno" não navega) |
| Turnos (profissional) | `(profissional)/turnos` | parcial (um turno fixo; histórico só com estado vazio) |
| Carteira | `(profissional)/carteira` | parcial (dados fixos) |
| Perfil (profissional) | `(profissional)/perfil` | parcial (dados fixos; "Sair" só volta para `/`) |
| Painel da empresa | `empresa/index` | parcial (dados fixos) |
| Vagas (empresa) | `empresa/vagas` | parcial (placeholder com estado vazio) |
| Turnos (empresa) | `empresa/turnos` | parcial (placeholder com estado vazio) |
| Financeiro (empresa) | `empresa/financeiro` | parcial (placeholder com estado vazio) |
| Mais (empresa) | `empresa/mais` | parcial (menu sem destino; "Sair" só volta para `/`) |
| Nova vaga | `vaga/nova` (modal) | parcial (dados fixos; "Valor do turno" editável viola a regra de preço; publica com `Alert`) |
| Detalhe da vaga (candidatar-se / candidatos) | `vaga/[id]` | ausente |
| Perfil do profissional (visto pela empresa) | `profissional/[id]` | ausente |
| Confirmação da seleção (escrow) e sucesso | a definir na etapa 7 | ausente |
| Detalhe do turno (check-in/out, conclusão) | `turno/[id]` | ausente |
| Avaliação | a definir na etapa 9 | ausente |
| Chat do turno | `chat/[turnoId]` | ausente |

Estados: feita, parcial (dados fixos no componente ou placeholder), ausente.

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
