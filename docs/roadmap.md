# Roadmap

## Foco atual: somente o front

O backend (Spring Boot) será feito depois, com ajuda do Claude. Por enquanto o app roda 100% com dados mockados e autenticação simulada. O contrato futuro da API está em @docs/api.md e o modelo em @docs/modelo-de-dados.md, e serve de guia para o formato dos mocks.

O projeto já tem uma parte implementada (telas criadas anteriormente com ajuda de IA). Este roadmap é de continuidade: não recriar o que já existe.

## Passo 0: levantamento do que já existe (fazer primeiro)

Antes de qualquer mudança, o Claude Code deve:

1. Listar tudo em `src/app` e `src/components` (rotas, layouts, componentes).
2. Registrar abaixo, na seção "Checklist de telas", o que já está feito, parcial ou ausente.
3. Apontar divergências entre o código e @docs/telas.md (o código manda; atualizar o doc, não o contrário).
4. Não reescrever telas que já funcionam. Ajustar só o necessário (ex.: trocar dados fixos por chamadas à camada de mock).

## Ordem de execução

1. **Rotas**: garantir a estrutura `(tabs)`, `(auth)` e telas soltas (`prestador/[id]`, `checkout/[prestadorId]`, `vaga/nova`), com `_layout.tsx` raiz em Stack. Só mover/ajustar o que estiver fora do lugar.
2. **Camada de dados fake**: criar `src/lib/mock/` (categorias, prestadores, vagas, contratações) e funções async em `src/lib/` com a MESMA assinatura que o `api.ts` real terá. Incluir pequeno atraso simulado (300 a 600 ms) para exercitar loading e erro. Trocar para o backend depois deve mudar só essa camada, nunca as telas.
3. **Login e cadastro** (empresa e prestador) em `(auth)`: validação de formulário, resposta simulada `{ token, role, userId }`, token e role guardados com `expo-secure-store`. Simular também os erros: credenciais inválidas e bloqueio após 5 tentativas (429).
4. **Guarda de rota por `role`**: sem token vai para `(auth)`; EMPRESA e PRESTADOR veem abas/telas diferentes (empresa: publicar vaga e contratar; prestador: ver vagas e minhas contratações). Logout em Perfil.
5. **Conectar telas existentes aos mocks**: Home, detalhe do prestador, nova vaga, checkout. Estados de loading, vazio e erro em todas.
6. **Tela de sucesso da contratação** (`contratacao/sucesso`).
7. **Telas que faltam**: Buscar (com filtro por categoria), Minhas contratações (prestador), Vagas publicadas (empresa), Mensagens (placeholder aceitável), Perfil (dados do usuário e logout).
8. **Perfil do prestador completo**: foto (`expo-image`), sobre, habilidades, histórico, avaliações; edição do próprio perfil.
9. **Seletores reais** de data e hora na criação de vaga (`@react-native-community/datetimepicker`).
10. **Avaliação pós-turno** (nota e comentário) e exibição no perfil.
11. **Polimento**: skeletons de loading, tratamento de sessão expirada, acessibilidade básica, ícone e splash.

## Checklist de telas (preencher no Passo 0)

| Tela | Rota | Estado |
|---|---|---|
| Home | `(tabs)/index` | a verificar |
| Buscar | `(tabs)/buscar` | a verificar |
| Mensagens | `(tabs)/mensagens` | a verificar |
| Perfil | `(tabs)/perfil` | a verificar |
| Login | `(auth)/login` | a verificar |
| Cadastro | `(auth)/cadastro` | a verificar |
| Detalhe do prestador | `prestador/[id]` | a verificar |
| Nova vaga | `vaga/nova` | a verificar |
| Checkout | `checkout/[prestadorId]` | a verificar |
| Sucesso da contratação | `contratacao/sucesso` | a verificar |
| Minhas contratações | a definir | a verificar |
| Vagas publicadas (empresa) | a definir | a verificar |

Estados: feita, parcial (dados fixos no componente), ausente.

## Quando o backend existir

- Trocar a implementação da camada `src/lib` de mock para `fetch` real (`src/lib/api.ts`), mantendo as assinaturas.
- Base URL: emulador Android `http://10.0.2.2:8080`; celular físico usa o IP da máquina na rede local.
- Remover `src/lib/mock/` ou mantê-lo apenas para testes.

## Decisões em aberto

- Quem inicia a contratação: hoje a empresa escolhe o prestador; avaliar fluxo em que o prestador se candidata à vaga.
- Taxa da plataforma fixa em 10% ou configurável.
- Valor por região (a UI diz "média da região"; o backend previsto usa só o valor da categoria).
- Pagamento real (no checkout o cartão é só visual).
- Notificações push (`expo-notifications`) para avisar o prestador quando for contratado.
- iOS fora do Expo Go: development build via EAS, quando necessário.
