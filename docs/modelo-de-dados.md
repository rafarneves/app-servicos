# Modelo de dados

Todas as chaves primárias são `UUID` (`GenerationType.UUID`).

## Relacionamentos

- `Usuario` 1:0..1 `Empresa` e 1:0..1 `Prestador` (conforme `role`)
- `Empresa` 1:N `Vaga`
- `Categoria` 1:N `Vaga`
- `Vaga` 1:N `Contratacao`
- `Prestador` 1:N `Contratacao`
- `Contratacao` 1:N `Avaliacao` (a avaliação é de uma contratação concluída, recebida pelo prestador)
- `Prestador` N:N `Habilidade` (tabela `prestador_habilidade`)

## Entidades

**Usuario** (`usuarios`): id, email (único), senhaHash (BCrypt), role (`EMPRESA` | `PRESTADOR`), criadoEm.

**Empresa** (`empresas`): id, usuario (OneToOne), razaoSocial, cnpj, telefone.

**Prestador** (`prestadores`): id, usuario (OneToOne), nome, cpf, telefone, sobre (TEXT), habilidades (ManyToMany).

**Categoria**: id, nome (Repositor, Caixa, Cozinha, Entrega...), valorMedioSugerido (BigDecimal).

**Habilidade**: id, nome.

**Vaga** (`vagas`): id, empresa, categoria, titulo, descricao (TEXT), data, horaInicio, horaFim, valorTurno (copiado da categoria na criação), vagasDisponiveis, status (`ABERTA` | `PREENCHIDA` | `CANCELADA`).

**Contratacao** (`contratacoes`): id, vaga, prestador, status (`PENDENTE` | `CONFIRMADA` | `CONCLUIDA` | `CANCELADA`), valorTotal (valor do turno + 10% de taxa), criadoEm.

**Avaliacao**: id, contratacao, nota (int 1..5), comentario.

## Pendente no modelo

- `Prestador.notaMedia` é usado em `PrestadorResumoResponse` e na query `buscarPrestadoresCompativeis`, mas ainda não existe como campo/cálculo (derivar de `Avaliacao`).
- Entidade `Avaliacao` e `Habilidade` ainda sem repository/controller.
- Taxa da plataforma está como constante (10%); considerar mover para configuração.
