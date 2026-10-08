# Servicos App

Plataforma mobile de contratação de serviços temporários. Empresas (padaria, mercado, restaurante) publicam vagas de turno e contratam prestadores (repositor, caixa, cozinha, entrega). O valor do turno é pré-definido por categoria.

## Foco atual

**Somente o front.** O backend Spring Boot ainda não existe e será feito depois. Até lá o app usa dados mockados e autenticação simulada, atrás de uma camada que depois será trocada pela API real sem mexer nas telas (ver "Camada de dados").

O projeto já tem telas implementadas (criadas antes com ajuda de IA). **O código em `src/` é a fonte da verdade.** Os documentos em `docs/` descrevem o desenho pretendido e podem divergir do que está implementado. Quando divergirem, siga o código e atualize o doc. Não recrie telas que já funcionam: ajuste só o necessário.

Ao começar uma sessão: leia @docs/roadmap.md, faça o "Passo 0" (levantamento do que existe) se o checklist ainda estiver como "a verificar", e continue da próxima etapa pendente.

Documentos:
- @docs/roadmap.md (ordem de trabalho e checklist de telas)
- @docs/telas.md (desenho e estilo das telas)
- @docs/api.md (contrato futuro do backend, serve de guia para os mocks)
- @docs/modelo-de-dados.md (entidades futuras, serve de guia para os tipos)

## Stack

- Expo SDK 54 (travado nessa versão porque o Expo Go da App Store no iOS não suporta SDK mais novo)
- expo-router com file-based routing, código em `src/app`
- NativeWind (Tailwind) + TypeScript
- expo-secure-store para token JWT e role (nunca AsyncStorage)
- Ícones: `@expo/vector-icons` (Ionicons)

Backend previsto (não implementado ainda): Java, Spring Boot, JPA/PostgreSQL, JWT, springdoc. Detalhes em @docs/api.md.

## Camada de dados (mocks agora, API depois)

- Dados fake em `src/lib/mock/`; funções async em `src/lib/` (ex.: `login`, `listarVagas`, `contratar`) consumidas pelas telas.
- As funções devem ter a mesma assinatura e os mesmos tipos de retorno que a API real terá (ver @docs/api.md), com atraso simulado de 300 a 600 ms e erros possíveis simulados.
- Telas nunca importam de `src/lib/mock/` diretamente, só das funções de `src/lib/`. Assim a troca para o backend muda apenas a implementação dessa camada.
- Mesmo com mocks, siga as regras de negócio abaixo.

## Regras de negócio (valem no mock e no backend futuro)

- O app nunca envia preço. Valor do turno vem da categoria; taxa da plataforma é 10%; total = valor do turno + taxa. No front esses números são exibição, e o backend futuro recalcula e valida.
- Um prestador não pode ter duas contratações ativas (PENDENTE/CONFIRMADA) na mesma data.
- Só EMPRESA cria vaga e contrata. PRESTADOR vê as próprias contratações.
- Mensagens de login não revelam se o e-mail existe ("Credenciais inválidas").
- Bloqueio de login: 5 falhas bloqueiam o e-mail por 15 min (resposta 429). Simular no mock.

## Convenções do app

- Rotas: `src/app/(tabs)` (Início, Buscar, Mensagens, Perfil), `src/app/(auth)` (login/cadastro), `src/app/prestador/[id].tsx`, `src/app/checkout/[prestadorId].tsx`, `src/app/vaga/nova.tsx`.
- Estilo com `className` (NativeWind). Visual inspirado no iFood: cor principal `#EA1D2C`, fundo `#FAFAFA`, cards brancos `rounded-2xl` com sombra leve, categorias com ícone e fundo pastel.
- Toda tela com dados tem estados de loading, vazio e erro.
- `import "../../global.css"` fica no `_layout.tsx` raiz de `src/app`.
- Textos da interface em português do Brasil.

## Comandos

```bash
npx expo start -c            # inicia limpando cache
npx expo start --tunnel      # se o LAN falhar (firewall/rede)
npx expo install <pacote>    # sempre prefira ao npm install para libs do ecossistema Expo
```

## Armadilhas já resolvidas

- `className` sem efeito: precisa de `metro.config.js` com `withNativeWind(config, { input: "./global.css" })`, `babel.config.js` com `jsxImportSource: "nativewind"` e `tailwind.config.js` com `content` apontando para `./src/app/**` e `./src/components/**`.
- Erro `No filename found` do expo-router: `<Tabs>` precisa estar em `_layout.tsx` dentro de `src/app`, e `package.json` com `"main": "expo-router/entry"`.
- "Opening project" infinito no iPhone: perfil de rede do Windows como Privada, regra de firewall para a porta 8081 (`-Profile Any`), ou usar `--tunnel`.
- ERESOLVE ao instalar libs: apagar `node_modules` e `package-lock.json`, `npm install`, `npx expo install --fix`, depois `npx expo install nativewind tailwindcss`.
- Erro de tipo no import de `.css`: `global.d.ts` com `declare module "*.css";` e `/// <reference types="nativewind/types" />`.
- Quando o backend existir: emulador Android acessa o PC em `http://10.0.2.2:8080`; celular físico usa o IP da rede local.
