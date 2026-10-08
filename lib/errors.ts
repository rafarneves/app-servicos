// Erro padrão da camada de dados. O backend devolve { "message": "..." } com o status HTTP.
export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export function mensagemDeErro(erro: unknown) {
  return erro instanceof Error ? erro.message : 'Algo deu errado. Tente novamente.';
}
