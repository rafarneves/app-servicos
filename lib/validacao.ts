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
