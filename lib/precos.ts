// Só para exibição: o backend recalcula e valida. O app nunca envia preço.
export const TAXA_PLATAFORMA = 0.1;

const arredondar = (valor: number) => Math.round(valor * 100) / 100;

export function resumoDoTurno(valorTurno: number) {
  const taxaPlataforma = arredondar(valorTurno * TAXA_PLATAFORMA);
  return { valorTurno, taxaPlataforma, valorTotal: arredondar(valorTurno + taxaPlataforma) };
}

export function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
