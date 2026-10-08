# Servicos App

Plataforma mobile de contratação de serviços temporários. Empresas (padaria, mercado, restaurante) publicam vagas de turno e contratam prestadores (repositor, caixa, cozinha, entrega). O valor do turno é pré-definido por categoria. Nome do app: **Chama**.

## Foco atual

**Somente o front.** O backend Spring Boot ainda não existe e será feito depois. Até lá o app usa dados mockados e autenticação simulada, atrás de uma camada que depois será trocada pela API real sem mexer nas telas (ver "Camada de dados").

O projeto já tem telas implementadas (criadas antes com ajuda de IA). **O código em `app/`, `components/` e `lib/` é a fonte da verdade.** Os documentos em `docs/` descrevem o desenho pretendido e podem divergir do que está implementado. Quando divergirem, siga o código e atualize o doc. Não recrie telas que já funcionam: ajuste só o necessário.

Ao começar uma sessão: leia @docs/roadmap.md e continue da próxima etapa pendente da "Ordem de execução".

Documentos:
- @docs/roadmap.md (ordem de trabalho e checklist de telas)
- @docs/telas.md (desenho e estilo das telas)
- @docs/api.md (contrato futuro do backend, serve de guia para os mocks)
- @docs/modelo-de-dados.md (entidades futuras, serve de guia para os tipos)

## Stack

- Expo SDK 57 (o Expo Go usado nos testes precisa ser compatível com essa versão)
- expo-router com file-based routing, rotas em `app/` (na raiz do projeto, não existe `src/`)
- React Native `StyleSheet` + TypeScript (não usa NativeWind/Tailwind)
- expo-secure-store para token JWT e role (nunca AsyncStorage)
- Ícones: `@expo/vector-icons` (Ionicons)

Backend previsto (não implementado ainda): Java, Spring Boot, JPA/PostgreSQL, JWT, springdoc. Detalhes em @docs/api.md.

## Estrutura de pastas

- `app/`: rotas (expo-router). `app/_layout.tsx` é o Stack raiz; `(auth)/` login, cadastro, OTP e recuperar senha; `(profissional)/` abas do profissional; `empresa/` abas da empresa (ver @docs/abas-e-rotas.md); `vaga/nova` modal.
- `components/ui.tsx`: componentes compartilhados (`BrandMark`, `PrimaryButton`, `SecondaryButton`, `BackButton`, `Field`, `SectionTitle`, `Pill`, `Notice`, `EmptyState`, `FloatingButton`, `tabScreenOptions`); `components/BannerVerificacao.tsx`: aviso de conta em análise.
- `lib/theme.ts`: tokens de cor, raio e sombra.
- `lib/validacao.ts`: regras e máscaras de formulário (senha mínima de 8, e-mail, CPF, CNPJ, celular); `lib/rotas.ts`: destino após login/cadastro conforme o papel.
- `lib/session.ts`: sessão `{ token, role, userId }` no `expo-secure-store`.
- `lib/`: camada de dados (funções async consumidas pelas telas); `lib/mock/`: dados fake.

## Camada de dados (mocks agora, API depois)

- Funções async por domínio em `lib/` (`auth`, `categorias`, `vagas`, `candidaturas`, `contratacoes`, `avaliacoes`, `prestadores`, `financeiro`), consumidas pelas telas. Tipos do contrato em `lib/types.ts`.
- Todas chamam `request(metodo, caminho, body)` de `lib/http.ts`, com os mesmos caminhos da API (ver @docs/api.md). Hoje `request` responde com `lib/mock/server.ts`; quando o backend existir, só `lib/http.ts` passa a usar `fetch`.
- O mock (`lib/mock/server.ts` + dados em `lib/mock/db.ts`) aplica as regras de negócio, atraso de 300 a 600 ms e 5% de falha de conexão (`TAXA_DE_FALHA`). Erros chegam como `ApiError` (`lib/errors.ts`) com `status` e `message`.
- Contas de teste do mock (senha `chama123`): `empresa@chama.app` (Padaria Aurora) e `prestador@chama.app` (Rafael Silva); outras em `lib/mock/db.ts`. Código de OTP e de recuperação de senha no mock: `123456`.
- Telas nunca importam de `lib/mock/` diretamente, só das funções de `lib/`. Ao mudar um endpoint, atualize juntos `docs/api.md`, `lib/types.ts`, a função em `lib/` e a rota no mock.
- Mesmo com mocks, siga as regras de negócio abaixo.

## Regras de negócio (valem no mock e no backend futuro)

- O app nunca envia preço. Valor do turno vem da categoria; taxa da plataforma é 10%; total = valor do turno + taxa. No front esses números são exibição, e o backend futuro recalcula e valida.
- Fluxo: empresa publica a vaga, prestador se candidata, empresa seleciona um candidato (turno confirmado, valor retido em escrow), check-in e check-out do prestador, empresa confirma a conclusão (pagamento liberado), avaliação dos dois lados. Detalhes em @docs/roadmap.md e @docs/api.md.
- Um prestador não pode ter duas contratações ativas (CONFIRMADA/EM_ANDAMENTO/AGUARDANDO_CONFIRMACAO) na mesma data.
- Só EMPRESA cria vaga e seleciona candidatos. Só PRESTADOR se candidata e faz check-in/check-out. Cada um vê só os próprios turnos.
- Contas com verificação PENDENTE ficam em modo limitado (não publicam, não selecionam, não se candidatam).
- Mensagens de login não revelam se o e-mail existe ("Credenciais inválidas").
- Bloqueio de login: 5 falhas bloqueiam o e-mail por 15 min (resposta 429). Simular no mock.

## Convenções do app

- Estilo com `StyleSheet.create` usando os tokens de `lib/theme.ts` (`colors`, `radius`, `shadow`); nada de cores soltas quando existir token.
- Visual "Chama": principal laranja `#F15A3A`, fundo creme `#FFF9F5`, vinho `#3A1720` para títulos e cards de destaque, cards brancos com borda e `radius.lg`. Detalhes em @docs/telas.md.
- Reaproveite os componentes de `components/ui.tsx` antes de criar novos.
- Telas usam `SafeAreaView` de `react-native-safe-area-context` com fundo `colors.cream`; o Stack raiz não mostra header.
- Toda tela com dados tem estados de loading, vazio e erro.
- Textos da interface em português do Brasil.

## Comandos

```bash
npx expo start -c            # inicia limpando cache
npx expo start --tunnel      # se o LAN falhar (firewall/rede)
npx expo install <pacote>    # sempre prefira ao npm install para libs do ecossistema Expo
npx tsc --noEmit             # verificação de tipos
```

## Armadilhas já resolvidas

- Erro `No filename found` do expo-router: `<Tabs>` precisa estar em `_layout.tsx` dentro de `app/`, e `package.json` com `"main": "expo-router/entry"`.
- "Opening project" infinito no iPhone: perfil de rede do Windows como Privada, regra de firewall para a porta 8081 (`-Profile Any`), ou usar `--tunnel`.
- ERESOLVE ao instalar libs: primeiro veja qual peer conflita. O caso já visto era `react-dom@19.3.0` (peer opcional) contra `react@19.2.3`; resolvido fixando `react-dom` na versão do SDK (`npx expo install react-dom`). Não use `--legacy-peer-deps`: ele remove do `node_modules` peers instalados automaticamente (`@react-native/babel-preset`, `react-native-reanimated`...). Último recurso: apagar `node_modules` e `package-lock.json`, `npm install`, `npx expo install --fix`.
- Quando o backend existir: emulador Android acessa o PC em `http://10.0.2.2:8080`; celular físico usa o IP da rede local.
