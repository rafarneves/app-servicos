# Abas e Rotas do App (Expo Router)

Decisões de navegação para o app Chama, com base nas três perguntas em aberto.

## Resumo das decisões

| Pergunta | Decisão |
|---|---|
| Trocar Turnos e Carteira por Buscar e Mensagens? | **Não.** Manter Turnos e Carteira e **adicionar Buscar**. Mensagens ficam fora das abas. |
| Mover entrar e cadastro para `(auth)/`? | **Sim.** |
| Painel da empresa ganha abas próprias? | **Sim.** Um grupo de rotas por papel. |

---

## 1. Abas do profissional

Turnos e Carteira são o núcleo do ciclo (turno confirmado, check-in/out, dinheiro recebido). Buscar é a descoberta de vagas, a ação mais frequente. O chat vive dentro do contexto de uma vaga ou turno, então não precisa de aba própria.

| Aba | Conteúdo |
|---|---|
| **Buscar** | Feed de vagas + mapa + filtros (raio, especialidade) |
| **Turnos** | Agenda, candidaturas pendentes, turno ativo com check-in/out |
| **Carteira** | Saldo, extrato, saque |
| **Perfil** | Dados, especialidades, disponibilidade, avaliações |

**Mensagens:** ícone no cabeçalho (com badge de não lidas) e dentro do detalhe do turno. Se for preferível uma inbox central, usar 5 abas, mas começar com 4.

## 2. Grupo `(auth)/`

Padrão do Expo Router. Um grupo `(auth)` com Stack contendo: entrar, cadastro, OTP e recuperar senha. A área logada fica em outros grupos.

- A proteção de rotas é feita **no layout raiz** com `Stack.Protected` (ou redirect baseado no estado de sessão), evitando lógica de "se não logado, redireciona" espalhada pelas telas.
- Facilita tratar o estado de **verificação pendente** (cadastro em modo limitado enquanto os documentos são analisados).

## 3. Painel da empresa com abas próprias

Empresa e profissional têm objetivos diferentes. Usar um grupo de rotas por papel, com redirecionamento após o login conforme o papel do usuário.

| Aba | Conteúdo |
|---|---|
| **Painel** | Vagas ativas, turnos do dia, gasto do mês |
| **Vagas** | Lista de vagas; os candidatos aparecem dentro de cada vaga |
| **Turnos** | Confirmados, check-ins para validar, histórico |
| **Financeiro** | Extrato, relatórios, escrow |
| **Mais** | Unidades, equipe, favoritos, suporte |

Botão flutuante **"Nova vaga"** visível nas abas Painel e Vagas, para que publicar uma vaga urgente exija pouquíssimos toques.

---

## Estrutura de pastas sugerida

```
app/
├── _layout.tsx                 # Layout raiz: sessão + Stack.Protected
├── (auth)/
│   ├── _layout.tsx             # Stack
│   ├── entrar.tsx
│   ├── cadastro.tsx
│   ├── otp.tsx
│   └── recuperar-senha.tsx
├── (profissional)/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx         # Tabs: Buscar, Turnos, Carteira, Perfil
│       ├── buscar.tsx
│       ├── turnos.tsx
│       ├── carteira.tsx
│       └── perfil.tsx
├── (empresa)/
│   ├── _layout.tsx
│   └── (tabs)/
│       ├── _layout.tsx         # Tabs: Painel, Vagas, Turnos, Financeiro, Mais
│       ├── painel.tsx
│       ├── vagas.tsx
│       ├── turnos.tsx
│       ├── financeiro.tsx
│       └── mais.tsx
├── vaga/[id].tsx               # Detalhe da vaga (candidatos para empresa)
├── turno/[id].tsx              # Detalhe do turno (check-in/out, chat)
└── chat/[turnoId].tsx          # Conversa vinculada ao turno
```

Observação: os nomes de arquivo acima são sugestão; ajustar para a convenção já adotada no projeto.

## Redirecionamento após login

1. Sem sessão: boas-vindas (`/`) e grupo `(auth)`.
2. Sessão com papel `PRESTADOR`: `/buscar` (grupo `(profissional)`).
3. Sessão com papel `EMPRESA`: `/empresa` (Painel).
4. Cadastro com verificação pendente: acesso liberado em modo limitado, com banner de status.

## Nomenclatura (evitar confusão)

- **Check-out**: registro de saída do profissional ao fim do turno.
- **Confirmação e pagamento do turno**: etapa da empresa após o check-out. Evitar chamar de "checkout" (termo de e-commerce).
