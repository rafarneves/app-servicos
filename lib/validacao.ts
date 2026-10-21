// Regras de formulário compartilhadas pelas telas (e espelhadas pelo backend).
export const SENHA_MINIMA = 8;

export const somenteDigitos = (valor: unknown) => String(valor ?? '').replace(/\D/g, '');

export const emailValido = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const celularValido = (celular: string) => {
  const digitos = somenteDigitos(celular);
  return digitos.length === 10 || digitos.length === 11;
};

export const cpfValido = (cpf: string) => somenteDigitos(cpf).length === 11;

export const cnpjValido = (cnpj: string) => somenteDigitos(cnpj).length === 14;

// Máscaras simples para exibição enquanto o usuário digita.
function mascarar(valor: string, padrao: string) {
  const digitos = somenteDigitos(valor);
  let resultado = '';
  let i = 0;
  for (const caractere of padrao) {
    if (i >= digitos.length) break;
    resultado += caractere === '#' ? digitos[i++] : caractere;
  }
  return resultado;
}

export const mascaraCpf = (valor: string) => mascarar(valor, '###.###.###-##');
export const mascaraCnpj = (valor: string) => mascarar(valor, '##.###.###/####-##');
export const mascaraCelular = (valor: string) =>
  mascarar(valor, somenteDigitos(valor).length > 10 ? '(##) #####-####' : '(##) ####-####');
export const mascaraData = (valor: string) => mascarar(valor, '##/##/####');
export const mascaraHora = (valor: string) => mascarar(valor, '##:##');

// "DD/MM/AAAA" -> "YYYY-MM-DD", ou null se a data não existe.
export function dataBrParaIso(valor: string) {
  const [dia, mes, ano] = valor.split('/').map(Number);
  if (!dia || !mes || !ano || ano < 1000) return null;
  const data = new Date(ano, mes - 1, dia);
  if (data.getDate() !== dia || data.getMonth() !== mes - 1) return null;
  return `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
}

export const horaValida = (hora: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(hora);
