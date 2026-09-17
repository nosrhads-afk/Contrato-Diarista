import React, { useState } from 'react';
import { 
  User, 
  CreditCard, 
  BadgeAlert, 
  Calendar, 
  Briefcase, 
  Clock, 
  ShieldAlert, 
  Loader2, 
  ArrowRight,
  Check
} from 'lucide-react';
import { formatCPF, validateCPF, cleanCPF } from '../lib/cpfValidator';
import { calculateAge, type AgeValidationResult } from '../lib/ageValidator';
import { collectLegalMetadata } from '../lib/metadataCollector';
import { TEXTO_TERMO_AUTONOMO, CONTRATO_VERSAO } from '../lib/contractText';
import { supabase } from '../lib/supabase';
import { TermoContratoBox } from './TermoContratoBox';
import type { TermoAceite } from '../types/database.types';

interface FormularioAceiteProps {
  onSuccess: (termo: TermoAceite) => void;
}

const FUNCOES_OPCOES = [
  'Limpeza e Higienização',
  'Cozinha / Preparo de Alimentos',
  'Apoio Geral Operacional',
  'Copa e Atendimento',
  'Lavadoria e Passadoria',
  'Outra Função Operacional',
];

const DIAS_OPCOES = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
  'Finais de Semana',
  'Conforme Demanda',
];

export const FormularioAceite: React.FC<FormularioAceiteProps> = ({ onSuccess }) => {
  // Estados dos Campos
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [funcao, setFuncao] = useState('Limpeza e Higienização');
  const [funcaoCustom, setFuncaoCustom] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(['Segunda-feira', 'Quarta-feira', 'Sexta-feira']);
  const [termoAceito, setTermoAceito] = useState(false);

  // Estados de Validação e Erros
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [ageState, setAgeState] = useState<AgeValidationResult>({
    age: null,
    isUnderage: false,
    isValidDate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Manipulador de CPF com máscara
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);

    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: '' }));
    }

    // Se completou 11 dígitos, valida em tempo real
    if (cleanCPF(formatted).length === 11) {
      const result = validateCPF(formatted);
      if (!result.isValid) {
        setErrors((prev) => ({ ...prev, cpf: result.message || 'CPF inválido.' }));
      }
    }
  };

  // Manipulador de Data de Nascimento com cálculo em tempo real
  const handleDataNascimentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setDataNascimento(val);
    const result = calculateAge(val);
    setAgeState(result);

    if (result.isUnderage) {
      setErrors((prev) => ({
        ...prev,
        dataNascimento: 'Cadastro não permitido para menores de 18 anos.',
      }));
    } else if (result.errorMessage) {
      setErrors((prev) => ({
        ...prev,
        dataNascimento: result.errorMessage || '',
      }));
    } else {
      setErrors((prev) => ({ ...prev, dataNascimento: '' }));
    }
  };

  // Seleção múltipla de dias da semana
  const toggleDia = (dia: string) => {
    setDiasSelecionados((prev) => {
      if (prev.includes(dia)) {
        // Não remove se for o único selecionado
        if (prev.length === 1) return prev;
        return prev.filter((d) => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
    if (errors.dias) {
      setErrors((prev) => ({ ...prev, dias: '' }));
    }
  };

  // Submissão do Formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const newErrors: { [key: string]: string } = {};

    // Validação de Nome
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      newErrors.nome = 'Informe seu nome completo.';
    } else if (nomeLimpo.split(' ').length < 2) {
      newErrors.nome = 'Por favor, digite seu nome e sobrenome.';
    }

    // Validação de CPF
    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      newErrors.cpf = cpfValidation.message || 'CPF inválido.';
    }

    // Validação de RG
    if (!rg.trim()) {
      newErrors.rg = 'Informe o número do seu documento de identidade (RG).';
    }

    // Validação de Idade (Bloqueio estrito se < 18)
    const ageResult = calculateAge(dataNascimento);
    if (!dataNascimento || !ageResult.isValidDate) {
      newErrors.dataNascimento = ageResult.errorMessage || 'Informe sua data de nascimento.';
    } else if (ageResult.isUnderage || (ageResult.age !== null && ageResult.age < 18)) {
      newErrors.dataNascimento = 'Cadastro não permitido para menores de 18 anos.';
    }

    // Validação de Função
    const funcaoFinal = funcao === 'Outra Função Operacional' ? funcaoCustom.trim() : funcao;
    if (!funcaoFinal) {
      newErrors.funcao = 'Selecione ou informe a função a ser desempenhada.';
    }

    // Validação de Dias
    if (diasSelecionados.length === 0) {
      newErrors.dias = 'Selecione pelo menos um dia de disponibilidade.';
    }

    // Validação de Checkbox do Termo
    if (!termoAceito) {
      newErrors.termoAceito = 'É obrigatório declarar ciência e aceitar os termos do acordo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Rola até o primeiro erro se houver
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // Se menor de 18 anos, aborta imediatamente
    if (ageResult.age === null || ageResult.age < 18) {
      setErrors((prev) => ({
        ...prev,
        dataNascimento: 'Cadastro não permitido para menores de 18 anos.',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Captura silenciosa de metadados forenses
      const metadata = await collectLegalMetadata();

      const registroTermo: TermoAceite = {
        nome_completo: nomeLimpo,
        cpf: formatCPF(cpf),
        rg: rg.trim().toUpperCase(),
        data_nascimento: dataNascimento,
        idade: ageResult.age,
        funcao: funcaoFinal,
        dias_trabalho: diasSelecionados.join(', '),
        termo_versao: CONTRATO_VERSAO,
        termo_texto_integral: TEXTO_TERMO_AUTONOMO,
        aceitou_termos: true,
        codigo_autenticidade: metadata.codigo_autenticidade,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
        dispositivo_resumo: metadata.dispositivo_resumo,
        geolocalizacao: metadata.geolocalizacao,
      };

      // 2. Salva diretamente na tabela do Supabase
      const { data, error } = await supabase
        .from('termos_aceite_diarista')
        .insert([registroTermo])
        .select()
        .single();

      if (error) {
        console.error('Erro ao registrar aceite no Supabase:', error);
        throw new Error(
          error.message || 'Falha ao gravar os dados de aceite no banco de dados.'
        );
      }

      // 3. Sucesso! Repassa o registro completo para a tela de comprovante
      const termoFinal = (data as TermoAceite) || {
        ...registroTermo,
        created_at: metadata.timestamp,
      };

      onSuccess(termoFinal);
    } catch (err: unknown) {
      console.error('Erro durante o envio do termo:', err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Ocorreu um erro ao processar o seu aceite. Verifique a conexão com a internet e tente novamente.';
      setSubmitError(msg);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      
      {/* Alerta Geral de Erro de Envio */}
      {submitError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-300 text-red-800 text-sm flex items-start gap-3 shadow-sm animate-shake">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold">Atenção ao registrar o acordo</h4>
            <p className="mt-0.5 text-xs text-red-700">{submitError}</p>
          </div>
        </div>
      )}

      {/* Cartão de Dados Pessoais */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-5">
        
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-nos-dark flex items-center gap-2">
            <User className="w-5 h-5 text-nos-accent" />
            Dados de Identificação do(a) Diarista
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Preencha seus dados reais para validação do acordo autônomo.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          
          {/* Nome Completo */}
          <div className="sm:col-span-2">
            <label htmlFor="nome" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Nome Completo *
            </label>
            <input
              id="nome"
              type="text"
              required
              autoComplete="name"
              placeholder="Ex: Maria da Silva Santos"
              value={nome}
              onChange={(e) => {
                setNome(e.target.value);
                if (errors.nome) setErrors((prev) => ({ ...prev, nome: '' }));
              }}
              className={`w-full px-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                errors.nome
                  ? 'border-red-400 bg-red-50/40 focus:ring-red-300'
                  : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/20'
              }`}
            />
            {errors.nome && (
              <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.nome}
              </p>
            )}
          </div>

          {/* CPF com Máscara e Validação */}
          <div>
            <label htmlFor="cpf" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>CPF *</span>
              <span className="text-[10px] text-slate-400 font-normal">Somente números</span>
            </label>
            <div className="relative">
              <input
                id="cpf"
                type="text"
                inputMode="numeric"
                required
                maxLength={14}
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm font-mono text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                  errors.cpf
                    ? 'border-red-400 bg-red-50/40 focus:ring-red-300'
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/20'
                }`}
              />
              <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.cpf && (
              <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.cpf}
              </p>
            )}
          </div>

          {/* RG */}
          <div>
            <label htmlFor="rg" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Documento de Identidade (RG) *
            </label>
            <div className="relative">
              <input
                id="rg"
                type="text"
                required
                placeholder="Ex: 12.345.678-9 ou similar"
                value={rg}
                onChange={(e) => {
                  setRg(e.target.value);
                  if (errors.rg) setErrors((prev) => ({ ...prev, rg: '' }));
                }}
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm text-slate-900 placeholder:text-slate-400 transition focus:outline-none focus:ring-2 ${
                  errors.rg
                    ? 'border-red-400 bg-red-50/40 focus:ring-red-300'
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/20'
                }`}
              />
              <BadgeAlert className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
            {errors.rg && (
              <p className="text-xs font-semibold text-red-600 mt-1 flex items-center gap-1">
                <span>⚠️</span> {errors.rg}
              </p>
            )}
          </div>

          {/* Data de Nascimento com Verificação Imediata de Idade */}
          <div className="sm:col-span-2">
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="dataNascimento" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Data de Nascimento *
              </label>
              {ageState.age !== null && ageState.isValidDate && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    ageState.isUnderage
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {ageState.age} anos {ageState.isUnderage ? '(Menor)' : '(Maior de idade)'}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                id="dataNascimento"
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                value={dataNascimento}
                onChange={handleDataNascimentoChange}
                className={`w-full pl-10 pr-3.5 py-3 rounded-xl border text-sm text-slate-900 transition focus:outline-none focus:ring-2 ${
                  errors.dataNascimento || ageState.isUnderage
                    ? 'border-red-500 bg-red-50/50 text-red-900 focus:ring-red-300'
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/20'
                }`}
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>

            {/* Mensagem Obrigatória em Vermelho para Menores de 18 Anos */}
            {(errors.dataNascimento || ageState.isUnderage) && (
              <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-700 font-semibold flex items-center gap-2 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>Cadastro não permitido para menores de 18 anos.</span>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Cartão de Função e Disponibilidade */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-5">
        
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-nos-dark flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-nos-accent" />
            Função e Disponibilidade de Trabalho
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Defina a atividade autônoma que pretende desempenhar e os dias preferenciais.
          </p>
        </div>

        <div className="space-y-4">
          {/* Função */}
          <div>
            <label htmlFor="funcao" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Função a ser desempenhada *
            </label>
            <select
              id="funcao"
              value={funcao}
              onChange={(e) => setFuncao(e.target.value)}
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 transition focus:outline-none focus:border-nos-primary focus:ring-2 focus:ring-nos-primary/20"
            >
              {FUNCOES_OPCOES.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>

            {funcao === 'Outra Função Operacional' && (
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="Especifique a função detalhada..."
                  value={funcaoCustom}
                  onChange={(e) => setFuncaoCustom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-nos-primary/20"
                />
              </div>
            )}
          </div>

          {/* Dias Pretendidos (Chips de Multi-Seleção) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-nos-primary" />
                Dias pretendidos de trabalho *
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Selecione um ou mais
              </span>
            </label>

            <div className="flex flex-wrap gap-2">
              {DIAS_OPCOES.map((dia) => {
                const isSelected = diasSelecionados.includes(dia);
                return (
                  <button
                    type="button"
                    key={dia}
                    onClick={() => toggleDia(dia)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-nos-primary text-white shadow-sm border border-nos-primary scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                    {dia}
                  </button>
                );
              })}
            </div>
            {errors.dias && (
              <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errors.dias}
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Componente do Contrato com Checkbox Obrigatório */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card">
        <TermoContratoBox
          hasRead={termoAceito}
          onToggleAccept={(checked) => {
            setTermoAceito(checked);
            if (errors.termoAceito) setErrors((prev) => ({ ...prev, termoAceito: '' }));
          }}
          errorCheckbox={!!errors.termoAceito}
        />
      </div>

      {/* Botão de Ação Destacado em Laranja */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || ageState.isUnderage}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg text-white shadow-orange-glow transition-all flex items-center justify-center gap-3 ${
            isSubmitting || ageState.isUnderage
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-nos-accent hover:bg-nos-accentHover active:scale-[0.99] cursor-pointer'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-white" />
              <span>Registrando Prova Jurídica...</span>
            </>
          ) : (
            <>
              <span>Confirmar e Assinar Acordo</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          Ao confirmar, geramos um protocolo criptografado com data/hora e IP para sua segurança.
        </p>
      </div>

    </form>
  );
};
