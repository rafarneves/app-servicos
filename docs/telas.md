# Telas do app

Estilo geral: iFood. Header vermelho `#EA1D2C` com cantos inferiores arredondados, fundo `#FAFAFA`, cards brancos `rounded-2xl` com sombra leve, textos `text-gray-900`/`text-gray-500`, botão principal vermelho `rounded-2xl py-4`.

## Estrutura de rotas

```
src/app/
├── _layout.tsx            raiz (Stack) e import de global.css
├── (tabs)/
│   ├── _layout.tsx        <Tabs> com Início, Buscar, Mensagens, Perfil
│   ├── index.tsx          Home
│   ├── buscar.tsx
│   ├── mensagens.tsx
│   └── perfil.tsx
├── (auth)/
│   ├── login.tsx
│   └── cadastro.tsx
├── prestador/[id].tsx
├── checkout/[prestadorId].tsx
└── vaga/nova.tsx
```

## Home (`(tabs)/index.tsx`)

- Header vermelho com localização e sino de notificações, e campo de busca branco.
- Categorias em scroll horizontal: ícone em quadrado 56x56 com fundo pastel (Repositor `#FDECEC`/`#EA1D2C`, Caixa `#E9F5EE`/`#1D9E75`, Cozinha `#FDF3E3`/`#BA7517`, Entrega `#EAEDFB`/`#534AB7`).
- Lista "Prestadores disponíveis": avatar com iniciais, nome, categoria, nota e nº de avaliações, valor `R$ x / turno`. Toque navega para `/prestador/{id}`.

## Detalhe do prestador (`prestador/[id].tsx`)

- Header vermelho com voltar e menu; card de perfil com avatar sobreposto, nome, função, nota, avaliações e turnos concluídos.
- Métricas rápidas: valor por turno, pontualidade, tempo de plataforma.
- Seções: Sobre, Habilidades (chips), Já trabalhou em (estabelecimentos), Avaliações.
- Botão fixo "Contratar para este turno" leva ao checkout.
- Hoje usa dados mockados; falta a foto de perfil real (usar `expo-image`).

## Nova vaga (`vaga/nova.tsx`, perfil EMPRESA)

- Categoria (chips), título, descrição, data e horário, valor sugerido (somente leitura, vem da categoria), quantidade de vagas (+/-), botão "Publicar vaga".
- Data/hora ainda são botões sem seletor real (usar `@react-native-community/datetimepicker`).

## Checkout (`checkout/[prestadorId].tsx`)

- Card do prestador, detalhes do turno (local, data, horário), forma de pagamento, resumo (valor do turno, taxa da plataforma, total) e botão "Confirmar e contratar".
- Valores exibidos são só visuais; o backend recalcula e valida.
- Ao confirmar: `POST /contratacoes` e navega para `/contratacao/sucesso`.

## Ainda não construídas

- Login e cadastro (empresa e prestador)
- Tela de sucesso da contratação
- Minhas contratações (prestador) e vagas publicadas (empresa)
- Buscar, Mensagens e Perfil (hoje são placeholders)
