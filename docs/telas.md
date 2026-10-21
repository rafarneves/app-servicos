# Telas do app

Descrição do que está implementado em `app/` (o código é a fonte da verdade). O que ainda não existe fica em "Ainda não construídas".

## Estilo geral (marca "Chama")

- Estilo com `StyleSheet.create` e tokens de `lib/theme.ts` (não usa NativeWind).
- Cores: principal laranja `#F15A3A` (`primary`), `primaryDark` `#D94228`, `primarySoft` `#FFF0EB`; fundo creme `#FFF9F5` (`cream`); vinho `#3A1720` (`wine`) para títulos e cards de destaque; texto `ink` `#271A1C` / `inkSoft` `#6F6264`; borda `#EDE4E1`; sucesso `#168A65`; aviso `#C77A14`; erro `danger` `#C2362B` / `dangerSoft` `#FDECEA`; estrela `star` `#F5A623`.
- Raios: `radius.sm` 12, `md` 18, `lg` 26, `pill` 999. Sombra suave `shadow` (cor vinho, opacidade 0.08).
- Cards brancos com borda `border` e `radius.lg`; títulos de tela grandes em vinho (`fontWeight: '900'`); chips/pills arredondados; cards escuros em vinho para destaque (disponibilidade, saldo, escrow).
- Sem header vermelho: as telas usam `SafeAreaView` com fundo creme e cabeçalho próprio.
- Componentes compartilhados em `components/ui.tsx`: `BrandMark`, `PrimaryButton` (com `loading`), `SecondaryButton` (com `loading`), `BackButton`, `Field`, `SectionTitle` (título + ação), `Pill` (tons neutral/success/warning/primary), `Notice` (faixa de erro, atenção ou sucesso), `EmptyState`, `LoadingState`, `ErrorState` (com "Tentar de novo"), `ScreenHeader` (voltar + título + ação à direita, nas telas de detalhe), `Segmented` (Próximos/Histórico, Abertas/Encerradas...), `Avatar` (iniciais), `Stars` (exibição e seletor de nota), `ValueRow` (linha de valor/taxa/total), `FloatingButton`, `tabScreenOptions`, `confirmarSaida` (logout com confirmação) e `avisarEmBreve` (alerta para recursos ainda não feitos). Em `components/BannerVerificacao.tsx`: aviso de modo limitado para contas em análise.
- Telas com dados usam `useDados` (`lib/useDados.ts`), que recarrega quando a tela volta ao foco, e mostram `LoadingState`, `ErrorState` ou `EmptyState`. Formatação de datas, notas e status em `lib/formato.ts`; valores em `lib/precos.ts`.

## Estrutura de rotas

Segue @docs/abas-e-rotas.md, adaptado à convenção do projeto.

```
app/
├── _layout.tsx               raiz (Stack + Stack.Protected por sessão e papel)
├── index.tsx                 Boas-vindas (/), só sem sessão
├── (auth)/                   grupo sem segmento na URL
│   ├── _layout.tsx           Stack; sem sessão: telas de acesso; com sessão: só o OTP
│   ├── escolher-perfil.tsx   /escolher-perfil
│   ├── entrar.tsx            /entrar?tipo=empresa|profissional
│   ├── cadastro.tsx          /cadastro?tipo=empresa|profissional
│   ├── otp.tsx               /otp (verificação do celular)
│   └── recuperar-senha.tsx   /recuperar-senha?email=
├── (profissional)/           PRESTADOR, grupo sem segmento na URL
│   ├── _layout.tsx           <Tabs>: Buscar, Turnos, Carteira, Perfil
│   ├── buscar.tsx            /buscar (feed de vagas)
│   ├── turnos.tsx            /turnos
│   ├── carteira.tsx          /carteira
│   └── perfil.tsx            /perfil
├── empresa/                  EMPRESA (segmento real na URL)
│   ├── _layout.tsx           <Tabs>: Painel, Vagas, Turnos, Financeiro, Mais
│   ├── index.tsx             /empresa (Painel)
│   ├── vagas.tsx             /empresa/vagas
│   ├── turnos.tsx            /empresa/turnos
│   ├── financeiro.tsx        /empresa/financeiro
│   └── mais.tsx              /empresa/mais
├── vaga/
│   ├── nova.tsx              /vaga/nova (modal, EMPRESA)
│   └── [id].tsx              /vaga/:id (os dois papéis)
├── selecao/[candidaturaId].tsx   /selecao/:id?vagaId= (modal, EMPRESA)
├── profissional/[id].tsx     /profissional/:id?candidaturaId=&vagaId= (os dois papéis)
├── turno/[id].tsx            /turno/:id (os dois papéis, participante do turno)
└── avaliacao/[turnoId].tsx   /avaliacao/:turnoId (modal, os dois papéis)
```

- Proteção: o layout raiz lê a sessão com `useSessao()` e cada grupo fica dentro de um `Stack.Protected`. Login, cadastro, OTP e logout só mudam a sessão; o Stack leva para a primeira tela disponível (boas-vindas, OTP, `/buscar` ou `/empresa`). Nenhuma tela faz redirecionamento por conta própria.
- As duas áreas usam a mesma configuração de tab bar (`tabScreenOptions`).
- A área da empresa é `empresa/` (e não o grupo `(empresa)`) para que `/empresa/turnos` não colida com `/turnos` do profissional.
- Mensagens não têm aba: o chat fica no detalhe do turno e num ícone do cabeçalho (ainda "Em breve").

## Boas-vindas (`index.tsx`)

- Topo com `BrandMark` e link "Entrar" (vai para `/entrar`).
- Ilustração de um card de turno e selo "Pagamento seguro".
- Título "O turno certo, na hora certa.", chips de áreas, botão "Começar agora" para `/escolher-perfil`.

## Escolher perfil (`(auth)/escolher-perfil.tsx`)

- Dois cards: "Quero trabalhar" (profissional, "MAIS ESCOLHIDO") e "Quero contratar" (empresa). Ambos levam a `/entrar?tipo=...`.

## Login (`(auth)/entrar.tsx`)

- Texto muda conforme `tipo`. Campos "E-mail" e "Senha" (mostrar/ocultar), "Esqueci minha senha" (abre `/recuperar-senha` com o e-mail digitado), "Entrar", Apple/Google ("Em breve"), "Criar conta" e alternância "Entrar como empresa/profissional".
- Valida e-mail e senha; erros por campo e erro da API (credenciais inválidas, bloqueio, conexão) num `Notice`.
- Após entrar, o layout leva para `/otp` (celular não verificado) ou para a área do papel da conta (o `tipo` da tela só muda os textos).

## Cadastro (`(auth)/cadastro.tsx`)

- Duas etapas com barra de progresso. Etapa 1: nome, celular, e-mail, senha (mínimo 8). Etapa 2 empresa: estabelecimento e CNPJ (obrigatórios), cidade e tipo de negócio. Etapa 2 profissional: profissão, cidade, experiência e CPF (obrigatório). Máscaras de CPF, CNPJ e celular.
- Ao concluir, cria a conta (em análise) e o layout leva para `/otp`.

## Verificação do celular (`(auth)/otp.tsx`)

- Código de 6 dígitos, "Verificar", "Reenviar código" com espera de 30 s e "Sair e usar outra conta". Em desenvolvimento mostra a dica do código `123456`.
- Ao verificar, a sessão é marcada como verificada e o layout leva para a área do papel.

## Recuperar senha (`(auth)/recuperar-senha.tsx`)

- Etapa 1: e-mail e "Enviar código" (mesma resposta exista ou não a conta). Etapa 2: código, nova senha e confirmação; ao salvar, volta para o login.

## Buscar (`(profissional)/buscar.tsx`)

- Saudação pelo horário com o primeiro nome e a cidade do perfil; botão de notificações ("Em breve").
- `BannerVerificacao` enquanto a conta está em análise.
- Card vinho "Você está disponível" com switch (estado local).
- Resumo: turnos no mês e valor a receber (carteira); tocar abre Turnos ou Carteira.
- "Oportunidades perto de você": "Ver mapa" ("Em breve"), chips "Todos" + categorias de `GET /categorias` que filtram o feed (`GET /vagas?categoriaId=`), cards de vaga (empresa, nota, distância, função, "Começa logo" para hoje/amanhã, data, horário, valor, favorito local). O card e "Ver turno" abrem `vaga/[id]`.

## Turnos do profissional (`(profissional)/turnos.tsx`)

- Segmento "Próximos" / "Histórico".
- Próximos: turnos ativos (confirmado, em andamento, aguardando confirmação) por data, com "Ver rota e detalhes" abrindo `turno/[id]`; aviso de que o check-in abre no dia; "Candidaturas enviadas" (pendentes) abrindo `vaga/[id]`.
- Histórico: turnos concluídos/cancelados, com destaque "Avalie a empresa" quando falta a avaliação.

## Carteira (`(profissional)/carteira.tsx`)

- Card vinho com saldo disponível (liberado) e a receber (em escrow); "Sacar via Pix" ("Em breve").
- Estatísticas do mês (valor liberado e quantidade de turnos/agendados), movimentações (4 primeiras, "Ver todas"), cada uma abre o turno; ajuda ("Em breve").

## Perfil do profissional (`(profissional)/perfil.tsx`)

- Card com iniciais, nome, função e cidade, nota e total de avaliações; selo de verificado quando aprovado.
- Barra de completude calculada (função, cidade, experiência, sobre, habilidades).
- Menu: "Ver meu perfil público" (abre `profissional/[id]`); os demais itens e o botão de configurações mostram "Em breve" (edição do perfil é a etapa 11).
- "Sair da conta" com confirmação.

## Painel da empresa (`empresa/index.tsx`)

- Cabeçalho com logo, notificações ("Em breve") e avatar com as iniciais (abre Mais).
- `BannerVerificacao`, saudação com o nome da empresa, card "Publicar novo turno".
- Estatísticas: turnos ativos, candidaturas pendentes (abrem Turnos e Vagas) e nota da empresa.
- "Turnos em andamento" (até 2, abrem `turno/[id]`; chat "Em breve") e "Candidaturas recentes" (até 3 pendentes, abrem `profissional/[id]` com a opção de selecionar).
- Botão flutuante "Nova vaga".

## Vagas da empresa (`empresa/vagas.tsx`)

- Segmento "Abertas" / "Encerradas" (preenchidas, canceladas ou com data passada). Card com status, categoria, função, data, horário, candidatos, valor e posições abertas; abre `vaga/[id]`. Botão flutuante "Nova vaga".

## Turnos da empresa (`empresa/turnos.tsx`)

- Segmento "Em aberto" / "Histórico". Turnos aguardando confirmação aparecem primeiro, com borda de atenção e aviso no topo. Card com status (ou "Avalie o profissional"), total, função, data, horário e profissional; abre `turno/[id]`.

## Financeiro da empresa (`empresa/financeiro.tsx`)

- Card vinho com o valor retido em escrow e o pago no mês; movimentações (profissional, função, data, valor total e status do pagamento), cada uma abre o turno.

## Mais (`empresa/mais.tsx`)

- Card com nome e e-mail da conta; menu (dados da empresa, unidades, equipe, favoritos, ajuda) com "Em breve"; "Sair da conta" com confirmação.

## Novo turno (`vaga/nova.tsx`, modal, empresa)

- Categoria (chips de `GET /categorias`), função (sugerida pela categoria), data `DD/MM/AAAA`, início e término `HH:MM` (máscaras), quantidade (1 a 20) e observações.
- "Valor do turno" somente leitura, vindo da categoria; total estimado com a taxa de 10%.
- "Revisar e publicar" valida os campos e mostra o resumo (valor, taxa, total); ao publicar, oferece "Ver vaga" ou fechar. Erros da API (ex.: conta em análise) num `Notice`.

## Detalhe da vaga (`vaga/[id].tsx`)

- Card com empresa, nota, distância, status, função, categoria, data, horário, endereço e descrição.
- Profissional: "Você recebe" com o valor do turno; "Quero este turno" (candidatar); com candidatura pendente, aviso e "Desistir da candidatura"; selecionado, atalho "Ver meu turno"; vaga fechada, aviso. Mostra até 3 avaliações da empresa.
- Empresa: valor do turno, taxa, total por profissional e posições abertas; lista de candidatos com "Ver perfil" e "Selecionar" (abre `selecao/[candidaturaId]`) ou "Ver turno" para o selecionado.

## Confirmação da seleção (`selecao/[candidaturaId].tsx`, modal, empresa)

- Profissional, turno, valor do turno, taxa de 10% e total retido em escrow, com explicação do escrow. "Confirmar e reter R$ ..." chama `POST /candidaturas/{id}/selecionar`.
- Sucesso: "Turno confirmado!" com "Ver turno" e "Voltar para a vaga".

## Perfil do profissional (`profissional/[id].tsx`)

- Iniciais, nome, função e cidade, nota; turnos concluídos, experiência e "no Chama desde"; sobre, habilidades, empresas atendidas e avaliações das empresas.
- Vindo de uma candidatura pendente (empresa), botão "Selecionar para o turno".

## Detalhe do turno (`turno/[id].tsx`)

- Status, função, empresa, data, horário e endereço ("Ver rota" abre o mapa). Para a empresa, card do profissional (abre o perfil). Pagamento: o profissional vê o que recebe; a empresa vê valor, taxa e total; pill do status do pagamento. Linha do tempo: confirmado, check-in, check-out, conclusão.
- Profissional: "Fazer check-in" (só no dia do turno; antes disso, aviso), "Fazer check-out" com confirmação, aviso enquanto aguarda a empresa.
- Empresa: aviso enquanto aguarda o check-in ou durante o turno; "Confirmar conclusão e pagar" com confirmação, liberando o pagamento.
- Concluído: "Avaliar ..." (abre `avaliacao/[turnoId]`) ou aviso de já avaliado. Ícone de chat no cabeçalho ("Em breve").

## Avaliação (`avaliacao/[turnoId].tsx`, modal)

- "Como foi com ...?", seletor de 1 a 5 estrelas, comentário opcional (até 500 caracteres, com contador) e "Enviar avaliação".

## Ainda não construídas

- Chat do turno (`chat/[turnoId]`) e notificações.
- Edição do perfil do profissional e itens do Mais da empresa; mapa e filtros de raio/especialidade em Buscar.
- Seletores reais de data e hora em `vaga/nova` e seleção automática de candidatos.
