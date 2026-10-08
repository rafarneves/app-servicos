# Telas do app

Descrição do que está implementado em `app/` (o código é a fonte da verdade). O que ainda não existe fica em "Ainda não construídas".

## Estilo geral (marca "Chama")

- Estilo com `StyleSheet.create` e tokens de `lib/theme.ts` (não usa NativeWind).
- Cores: principal laranja `#F15A3A` (`primary`), `primaryDark` `#D94228`, `primarySoft` `#FFF0EB`; fundo creme `#FFF9F5` (`cream`); vinho `#3A1720` (`wine`) para títulos e cards de destaque; texto `ink` `#271A1C` / `inkSoft` `#6F6264`; borda `#EDE4E1`; sucesso `#168A65`; aviso `#C77A14`; erro `danger` `#C2362B` / `dangerSoft` `#FDECEA`.
- Raios: `radius.sm` 12, `md` 18, `lg` 26, `pill` 999. Sombra suave `shadow` (cor vinho, opacidade 0.08).
- Cards brancos com borda `border` e `radius.lg`; títulos de tela grandes em vinho (`fontWeight: '900'`); chips/pills arredondados; cards escuros em vinho para destaque (disponibilidade, saldo).
- Sem header vermelho: as telas usam `SafeAreaView` com fundo creme e cabeçalho próprio.
- Componentes compartilhados em `components/ui.tsx`: `BrandMark` (logo chama), `PrimaryButton` (laranja, `minHeight` 56, `radius.md`, com estado `loading`), `SecondaryButton`, `BackButton`, `Field` (rótulo + input com ícone e mensagem de erro opcional), `SectionTitle` (título + ação), `Pill` (tons neutral/success/warning/primary), `Notice` (aviso em faixa colorida: erro, atenção ou sucesso), `EmptyState` (ícone, título e texto), `FloatingButton` (botão flutuante laranja, ex.: "Nova vaga") e `tabScreenOptions` (estilo da tab bar). Em `components/BannerVerificacao.tsx`: aviso de modo limitado para contas em análise.

## Estrutura de rotas

Segue @docs/abas-e-rotas.md, adaptado à convenção do projeto.

```
app/
├── _layout.tsx               raiz (Stack, sem header, fundo creme); vaga/nova como modal
├── index.tsx                 Boas-vindas (/)
├── (auth)/                   grupo sem segmento na URL
│   ├── _layout.tsx           Stack
│   ├── escolher-perfil.tsx   /escolher-perfil
│   ├── entrar.tsx            /entrar?tipo=empresa|profissional
│   ├── cadastro.tsx          /cadastro?tipo=empresa|profissional
│   ├── otp.tsx               /otp (verificação do celular)
│   └── recuperar-senha.tsx   /recuperar-senha?email=
├── (profissional)/           área do profissional, grupo sem segmento na URL
│   ├── _layout.tsx           <Tabs>: Buscar, Turnos, Carteira, Perfil
│   ├── buscar.tsx            /buscar (feed de vagas)
│   ├── turnos.tsx            /turnos
│   ├── carteira.tsx          /carteira
│   └── perfil.tsx            /perfil
├── empresa/                  área da empresa (segmento real na URL)
│   ├── _layout.tsx           <Tabs>: Painel, Vagas, Turnos, Financeiro, Mais
│   ├── index.tsx             /empresa (Painel)
│   ├── vagas.tsx             /empresa/vagas
│   ├── turnos.tsx            /empresa/turnos
│   ├── financeiro.tsx        /empresa/financeiro
│   └── mais.tsx              /empresa/mais
└── vaga/
    └── nova.tsx              /vaga/nova (modal, empresa)
```

- As duas áreas usam a mesma configuração de tab bar (`tabScreenOptions` em `components/ui.tsx`).
- A área da empresa é `empresa/` (e não o grupo `(empresa)`) para que `/empresa/turnos` não colida com `/turnos` do profissional.
- A home do profissional é `/buscar` (e não `/`), que fica para a tela de boas-vindas.
- Mensagens não têm aba: o chat fica no detalhe do turno e num ícone do cabeçalho.

Rotas previstas (ainda não criadas): `vaga/[id]` (detalhe; candidatar-se para o profissional, candidatos para a empresa), `profissional/[id]`, `turno/[id]` (check-in/out, conclusão), `chat/[turnoId]`. Ver @docs/roadmap.md.

## Boas-vindas (`index.tsx`)

- Topo com `BrandMark` e link "Entrar" (vai para `/entrar`).
- Ilustração de um card de turno (empresa, função, data, horário, valor, "Aceitar turno") e selo "Pagamento seguro".
- Título "O turno certo, na hora certa.", chips de áreas (Cozinha, Pizzaria, Cafeteria), botão "Começar agora" para `/escolher-perfil`.

## Escolher perfil (`(auth)/escolher-perfil.tsx`)

- Dois cards: "Quero trabalhar" (profissional, destacado como "MAIS ESCOLHIDO") e "Quero contratar" (empresa). Ambos levam a `/entrar?tipo=...`.

## Login (`(auth)/entrar.tsx`)

- Texto muda conforme `tipo` (empresa/profissional). Campos "E-mail" e "Senha" (mostrar/ocultar), "Esqueci minha senha" (abre `/recuperar-senha` com o e-mail digitado), botão "Entrar", botões Apple/Google ("Em breve"), link "Criar conta" e alternância "Entrar como empresa/profissional".
- Valida e-mail e senha preenchida; erros por campo e erro da API (credenciais inválidas, bloqueio, conexão) num `Notice` acima do botão.
- Após entrar: celular não verificado vai para `/otp`; senão `/empresa` ou `/buscar` conforme o papel da conta (o `tipo` da tela só muda os textos).

## Cadastro (`(auth)/cadastro.tsx`)

- Duas etapas com barra de progresso. Etapa 1: nome, celular (máscara), e-mail, senha (mínimo 8). Etapa 2 empresa: nome do estabelecimento e CNPJ (obrigatórios), cidade e tipo de negócio (opcionais). Etapa 2 profissional: profissão, cidade e experiência (opcionais) e CPF (obrigatório). Máscaras de CPF, CNPJ e celular.
- Valida cada etapa antes de avançar; erros da API (ex.: e-mail já cadastrado) num `Notice`.
- Ao concluir, cria a conta (em análise) e vai para `/otp`.

## Verificação do celular (`(auth)/otp.tsx`)

- Campo de código de 6 dígitos, "Verificar", "Reenviar código" com espera de 30 s e "Sair e usar outra conta".
- Em desenvolvimento mostra a dica do código de teste (`123456`).
- Após verificar, vai para a área do papel.

## Recuperar senha (`(auth)/recuperar-senha.tsx`)

- Etapa 1: e-mail (pré-preenchido vindo do login) e "Enviar código". A resposta é a mesma exista ou não a conta.
- Etapa 2: código, nova senha e confirmação; ao salvar, alerta de sucesso e volta para o login.

## Buscar (`(profissional)/buscar.tsx`)

- Feed de vagas (antiga Home do profissional, conteúdo inalterado).
- `BannerVerificacao` no topo enquanto a conta está em análise.
- Saudação e localização, botão de notificações.
- Card vinho "Você está disponível" com switch.
- Resumo: turnos no mês e valor a receber.
- "Oportunidades perto de você": chips de categoria (Todos, Cozinha, Padaria, Salão) e cards de vaga (empresa, nota, distância, função, pill "Começa logo", data, horário, valor, "Ver turno").
- Dados fixos no componente; o chip de categoria não filtra a lista; "Ver turno" não navega. Mapa e filtros de raio/especialidade ainda não existem.

## Turnos do profissional (`(profissional)/turnos.tsx`)

- Segmento "Próximos" / "Histórico". Próximos: card de turno confirmado (função, empresa, horário, valor, endereço, "Ver rota e detalhes") e aviso de check-in. Histórico: estado vazio.
- Dados fixos. Candidaturas pendentes e turno ativo com check-in/out entram depois.

## Carteira (`(profissional)/carteira.tsx`)

- Card vinho com saldo, próximo repasse e "Sacar via Pix"; estatísticas do mês; movimentações; ajuda.
- Dados fixos. Não prevista em `api.md` (não há endpoint de pagamentos).

## Perfil do profissional (`(profissional)/perfil.tsx`)

- Card com avatar de iniciais, nome, função, nota; barra de completude do perfil; menu (dados pessoais, experiência, documentos, notificações, privacidade, ajuda); "Sair da conta" (hoje só volta para `/`).

## Painel da empresa (`empresa/index.tsx`)

- Cabeçalho com logo, notificações e avatar (toque volta para `/`).
- `BannerVerificacao` no topo enquanto a conta está em análise.
- Card laranja "Publicar novo turno" (abre `/vaga/nova`), estatísticas (turnos ativos, candidaturas, nota), "Turnos em andamento" (card com profissional confirmado) e "Candidaturas recentes".
- Botão flutuante "Nova vaga" (também na aba Vagas).
- Dados fixos.

## Demais abas da empresa

- Vagas (`empresa/vagas.tsx`), Turnos (`empresa/turnos.tsx`) e Financeiro (`empresa/financeiro.tsx`): título, subtítulo e `EmptyState` (placeholders).
- Mais (`empresa/mais.tsx`): menu no padrão do Perfil do profissional (dados da empresa, unidades, equipe, profissionais favoritos, ajuda; itens ainda sem destino) e "Sair da conta" (hoje só volta para `/`).

## Novo turno (`vaga/nova.tsx`, modal, empresa)

- Chips de função (Padeiro(a), Cozinheiro(a), Auxiliar, Garçom), data, início e término (campos de texto), valor do turno e quantidade (campos de texto), observações, "Uniforme e requisitos", estimativa do turno e botão "Revisar e publicar" (mostra `Alert`).
- Pendências em relação às regras: o valor do turno é editável (deveria vir da categoria, somente leitura); data/hora sem seletor real (usar `@react-native-community/datetimepicker`).

## Ainda não construídas

- Detalhe da vaga (`vaga/[id]`: candidatar-se para o profissional, candidatos para a empresa), perfil do profissional (`profissional/[id]`), confirmação da seleção com escrow e sucesso, detalhe do turno (`turno/[id]`), avaliação bilateral e chat do turno (`chat/[turnoId]`).
- Conteúdo real das abas Vagas, Turnos, Financeiro e Mais da empresa.
- Proteção de rotas por `role` no layout raiz (etapa 4).
