/**
 * Utilitário para cálculo de idade exata com base na data de nascimento
 * e verificação de maioridade legal (18 anos).
 */

export interface AgeValidationResult {
  age: number | null;
  isUnderage: boolean;
  isValidDate: boolean;
  errorMessage?: string;
}

export function calculateAge(birthDateString: string): AgeValidationResult {
  if (!birthDateString) {
    return {
      age: null,
      isUnderage: false,
      isValidDate: false,
    };
  }

  const birthDate = new Date(birthDateString + 'T00:00:00');
  if (isNaN(birthDate.getTime())) {
    return {
      age: null,
      isUnderage: false,
      isValidDate: false,
      errorMessage: 'Data de nascimento inválida.',
    };
  }

  const today = new Date();
  
  // Data no futuro
  if (birthDate > today) {
    return {
      age: null,
      isUnderage: true,
      isValidDate: false,
      errorMessage: 'Data de nascimento não pode ser no futuro.',
    };
  }

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  // Idade humanamente plausível (ex: até 115 anos)
  if (age > 115) {
    return {
      age,
      isUnderage: false,
      isValidDate: false,
      errorMessage: 'Por favor, informe uma data de nascimento válida.',
    };
  }

  const isUnderage = age < 18;

  return {
    age,
    isUnderage,
    isValidDate: true,
    errorMessage: isUnderage ? 'Cadastro não permitido para menores de 18 anos.' : undefined,
  };
}
