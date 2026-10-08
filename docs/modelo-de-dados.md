# Modelo de dados

Todas as chaves primárias são `UUID` (`GenerationType.UUID`). O mock (`lib/mock/db.ts`) segue o mesmo desenho, com ids em texto.

## Relacionamentos

- `Usuario` 1:0..1 `Empresa` e 1:0..1 `Prestador` (conforme `role`)
- `Empresa` 1:N `Vaga`
- `Categoria` 1:N `Vaga`
- `Vaga` 1:N `Candidatura`
- `Prestador` 1:N `Candidatura`
- `Candidatura` 1:0..1 `Contratacao` (criada quando a empresa seleciona o candidato)
- `Vaga` 1:N `Contratacao` e `Prestador` 1:N `Contratacao`
- `Contratacao` 1:0..2 `Avaliacao` (no máximo uma de cada lado: empresa avalia o prestador, prestador avalia a empresa)
- `Prestador` N:N `Habilidade` (tabela `prestador_habilidade`)

## Entidades

**Usuario** (`usuarios`): id, email (único), senhaHash (BCrypt), celular, celularVerificado, role (`EMPRESA` | `PRESTADOR`), statusVerificacao (`PENDENTE` | `APROVADO`), criadoEm.

**Empresa** (`empresas`): id, usuario (OneToOne), razaoSocial, nomeFantasia, cnpj, nomeResponsavel, endereco, cidade, tipoNegocio.

**Prestador** (`prestadores`): id, usuario (OneToOne), nome, cpf, funcao, cidade, experiencia, sobre (TEXT), habilidades (ManyToMany).

**Categoria**: id, nome (Padaria, Cozinha, Salão, Sushi, Caixa, Entrega...), valorMedioSugerido (BigDecimal).

**Habilidade**: id, nome.

**Vaga** (`vagas`): id, empresa, categoria, titulo, descricao (TEXT), data, horaInicio, horaFim, valorTurno (copiado da categoria na criação), vagasDisponiveis, status (`ABERTA` | `PREENCHIDA` | `CANCELADA`), criadoEm.

**Candidatura** (`candidaturas`): id, vaga, prestador, status (`PENDENTE` | `SELECIONADA` | `RECUSADA` | `CANCELADA`), criadoEm. Única por (vaga, prestador) entre as não canceladas.

**Contratacao** (`contratacoes`), o turno confirmado: id, vaga, prestador, candidatura, status (`CONFIRMADA` | `EM_ANDAMENTO` | `AGUARDANDO_CONFIRMACAO` | `CONCLUIDA` | `CANCELADA`), valorTurno, taxaPlataforma (10%), valorTotal (valorTurno + taxa), statusPagamento (`RETIDO` | `LIBERADO` | `ESTORNADO`), criadoEm, checkInEm, checkOutEm, concluidoEm.

**Avaliacao** (`avaliacoes`): id, contratacao, autor (`EMPRESA` | `PRESTADOR`), nota (int 1..5), comentario, criadoEm. Única por (contratacao, autor).

## Regras derivadas

- Contratação ativa = `CONFIRMADA`, `EM_ANDAMENTO` ou `AGUARDANDO_CONFIRMACAO`. Um prestador não pode ter duas ativas na mesma data.
- `notaMedia` e `totalAvaliacoes` do prestador são calculados das avaliações com autor EMPRESA nas contratações dele; os da empresa, das avaliações com autor PRESTADOR. `turnosConcluidos` conta as contratações CONCLUIDAS.
- Movimentações financeiras são derivadas das contratações (não há tabela própria por enquanto).

## Pendente no modelo

- Entidade `Habilidade` ainda sem repository/controller.
- Taxa da plataforma está como constante (10%); considerar mover para configuração.
- Pagamento real (gateway, saque, estorno) e tabela de movimentações.
- Mensagens do chat do turno.
