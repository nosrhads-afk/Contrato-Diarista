/**
 * Utilitário de máscara e validação matemática de CPF (Cadastro de Pessoas Físicas)
 * com algoritmo oficial dos dígitos verificadores (Módulo 11).
 */

export function cleanCPF(cpf: string): string {
  return cpf.replace(/\D/g, '');
}

export function formatCPF(value: string): string {
  const digits = cleanCPF(value).slice(0, 11);
  if (!digits) return '';
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function validateCPF(cpfInput: string): { isValid: boolean; message?: string } {
  const cpf = cleanCPF(cpfInput);

  if (!cpf) {
    return { isValid: false, message: 'CPF é obrigatório.' };
  }

  if (cpf.length !== 11) {
    return { isValid: false, message: 'O CPF deve conter exatamente 11 dígitos numéricos.' };
  }

  // Elimina CPFs com todos os dígitos repetidos (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return { isValid: false, message: 'CPF inválido (dígitos repetidos).' };
  }

  // Validação do 1º Dígito Verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9), 10)) {
    return { isValid: false, message: 'Dígito verificador do CPF inválido.' };
  }

  // Validação do 2º Dígito Verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i), 10) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10), 10)) {
    return { isValid: false, message: 'Dígito verificador do CPF inválido.' };
  }

  return { isValid: true };
}
