import React, { useState, useRef } from 'react';
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
  Check,
  UploadCloud,
  FileType,
  X,
  FileImage
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

const FORMATOS_PERMITIDOS = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
const EXTENSOES_PERMITIDAS = ['.jpg', '.jpeg', '.png', '.pdf'];

export const FormularioAceite: React.FC<FormularioAceiteProps> = ({ onSuccess }) => {
  // Estados dos Campos Pessoais
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [rg, setRg] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [documentoArquivo, setDocumentoArquivo] = useState<File | null>(null);
  
  // Estados dos Campos de Atuação
  const [funcao, setFuncao] = useState('Limpeza e Higienização');
  const [funcaoCustom, setFuncaoCustom] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>(['Segunda-feira', 'Quarta-feira', 'Sexta-feira']);
  const [termoAceito, setTermoAceito] = useState(false);

  // Estados de Validação e Envio
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [ageState, setAgeState] = useState<AgeValidationResult>({
    age: null,
    isUnderage: false,
    isValidDate: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manipulador de CPF com máscara
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCPF(e.target.value);
    setCpf(formatted);

    if (errors.cpf) {
      setErrors((prev) => ({ ...prev, cpf: '' }));
    }

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

  // Manipulador de Arquivo de Documento (RG ou CPF)
  const handleFileChange = (file: File | null) => {
    if (!file) return;

    // Validação de extensão/tipo MIME
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isExtensionValid = EXTENSOES_PERMITIDAS.includes(extension);
    const isMimeValid = FORMATOS_PERMITIDOS.includes(file.type) || isExtensionValid;

    if (!isMimeValid) {
      setErrors((prev) => ({
        ...prev,
        documento: 'Formato inválido! É permitido anexar apenas arquivos JPG, PNG ou PDF.',
      }));
      setDocumentoArquivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Limite de tamanho: 10MB
    const maxBytes = 10 * 1024 * 1024;
    if (file.size > maxBytes) {
      setErrors((prev) => ({
        ...prev,
        documento: 'O arquivo é muito grande. O limite máximo permitido é 10 MB.',
      }));
      setDocumentoArquivo(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setDocumentoArquivo(file);
    setErrors((prev) => ({ ...prev, documento: '' }));
  };

  const handleRemoveFile = () => {
    setDocumentoArquivo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Seleção múltipla de dias da semana
  const toggleDia = (dia: string) => {
    setDiasSelecionados((prev) => {
      if (prev.includes(dia)) {
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

    // 1. Validação de Nome
    const nomeLimpo = nome.trim();
    if (!nomeLimpo) {
      newErrors.nome = 'Informe seu nome completo.';
    } else if (nomeLimpo.split(' ').length < 2) {
      newErrors.nome = 'Por favor, digite seu nome e sobrenome.';
    }

    // 2. Validação de CPF
    const cpfValidation = validateCPF(cpf);
    if (!cpfValidation.isValid) {
      newErrors.cpf = cpfValidation.message || 'CPF inválido.';
    }

    // 3. Validação de RG
    if (!rg.trim()) {
      newErrors.rg = 'Informe o número do seu documento de identidade (RG).';
    }

    // 4. Validação de Idade (Bloqueio estrito se < 18)
    const ageResult = calculateAge(dataNascimento);
    if (!dataNascimento || !ageResult.isValidDate) {
      newErrors.dataNascimento = ageResult.errorMessage || 'Informe sua data de nascimento.';
    } else if (ageResult.isUnderage || (ageResult.age !== null && ageResult.age < 18)) {
      newErrors.dataNascimento = 'Cadastro não permitido para menores de 18 anos.';
    }

    // 5. Validação de Anexo Obrigatório do Documento (RG ou CPF)
    if (!documentoArquivo) {
      newErrors.documento = 'É obrigatório anexar uma foto ou PDF do seu documento (RG ou CPF).';
    }

    // 6. Validação de Função
    const funcaoFinal = funcao === 'Outra Função Operacional' ? funcaoCustom.trim() : funcao;
    if (!funcaoFinal) {
      newErrors.funcao = 'Selecione ou informe a função a ser desempenhada.';
    }

    // 7. Validação de Dias
    if (diasSelecionados.length === 0) {
      newErrors.dias = 'Selecione pelo menos um dia de disponibilidade.';
    }

    // 8. Validação de Checkbox do Termo e Compartilhamento
    if (!termoAceito) {
      newErrors.termoAceito = 'É obrigatório ler e aceitar os termos do acordo e autorizar o compartilhamento.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    if (ageResult.age === null || ageResult.age < 18) {
      setErrors((prev) => ({
        ...prev,
        dataNascimento: 'Cadastro não permitido para menores de 18 anos.',
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Upload do documento para o Supabase Storage (se houver arquivo)
      let documentoUrl: string | null = null;
      let documentoNome = documentoArquivo?.name || null;
      let documentoTamanho = documentoArquivo?.size || null;

      if (documentoArquivo) {
        try {
          const cpfLimpo = cleanCPF(cpf);
          const sanitizedName = documentoArquivo.name.replace(/[^a-zA-Z0-9.-]/g, '_');
          const filePath = `${cpfLimpo}/${Date.now()}_${sanitizedName}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('documentos-diaristas')
            .upload(filePath, documentoArquivo, {
              cacheControl: '3600',
              upsert: true,
            });

          if (!uploadError && uploadData) {
            const { data: publicUrlData } = supabase.storage
              .from('documentos-diaristas')
              .getPublicUrl(uploadData.path);
            documentoUrl = publicUrlData?.publicUrl || null;
          } else if (uploadError) {
            console.warn('Aviso no upload para Supabase Storage (verifique o bucket):', uploadError.message);
          }
        } catch (storageErr) {
          console.warn('Erro ao conectar ao storage do Supabase, prosseguindo com registro:', storageErr);
        }
      }

      // 2. Captura silenciosa de metadados forenses
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
        autoriza_compartilhamento: true,
        documento_url: documentoUrl,
        documento_nome: documentoNome,
        documento_tamanho: documentoTamanho,
        codigo_autenticidade: metadata.codigo_autenticidade,
        ip_address: metadata.ip_address,
        user_agent: metadata.user_agent,
        dispositivo_resumo: metadata.dispositivo_resumo,
        geolocalizacao: metadata.geolocalizacao,
      };

      // 3. Salva diretamente na tabela do Supabase
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

      // 4. Sucesso! Repassa o registro completo para a tela de comprovante
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
            <User className="w-5 h-5 text-nos-primary" />
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
                  : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/30'
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
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/30'
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
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/30'
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
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    ageState.isUnderage
                      ? 'bg-red-100 text-red-700 border border-red-300'
                      : 'bg-teal-50 text-teal-800 border border-teal-300'
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
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/30'
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

          {/* CAMPO OBRIGATÓRIO: ANEXO DE DOCUMENTO (RG OU CPF) */}
          <div className="sm:col-span-2 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Anexo do Documento (RG ou CPF) *
              </label>
              <span className="text-[11px] text-nos-petroleo font-semibold">
                Apenas JPG, PNG ou PDF (máx. 10MB)
              </span>
            </div>

            {/* Input oculto acionado pelo container */}
            <input
              ref={fileInputRef}
              type="file"
              id="documento-input"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            {!documentoArquivo ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileChange(e.dataTransfer.files[0]);
                  }
                }}
                className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                  errors.documento
                    ? 'border-red-400 bg-red-50/50 hover:bg-red-50'
                    : 'border-slate-300 bg-slate-50/70 hover:bg-slate-100/80 hover:border-nos-primary'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 text-nos-primary flex items-center justify-center shadow-sm">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-nos-dark block">
                      Toque para enviar a foto ou PDF do documento
                    </span>
                    <span className="text-xs text-slate-500 block mt-0.5">
                      Tire uma foto legível do seu RG ou CPF (Frente ou Verso)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      JPG
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      PNG
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200">
                      PDF
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-300 flex items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-10 h-10 rounded-xl bg-nos-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                    {documentoArquivo.type.includes('pdf') ? (
                      <FileType className="w-5 h-5" />
                    ) : (
                      <FileImage className="w-5 h-5" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-nos-dark truncate">
                      {documentoArquivo.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {(documentoArquivo.size / 1024).toFixed(0)} KB • Documento pronto para envio
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer shrink-0"
                  title="Remover documento"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {errors.documento && (
              <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                <span>⚠️</span> {errors.documento}
              </p>
            )}
          </div>

        </div>
      </div>

      {/* Cartão de Função e Disponibilidade */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card space-y-5">
        
        <div className="border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-nos-dark flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-nos-primary" />
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
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 transition focus:outline-none focus:border-nos-primary focus:ring-2 focus:ring-nos-primary/30"
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-nos-primary/30"
                />
              </div>
            )}
          </div>

          {/* Dias Pretendidos (Chips de Multi-Seleção) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-nos-petroleo" />
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
                        ? 'bg-nos-petroleo text-white shadow-sm border border-nos-petroleo scale-[1.02]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-nos-primary" />}
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

      {/* Componente do Contrato com Checkbox Obrigatório e Compartilhamento */}
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

      {/* Botão de Ação Destacado com Turquesa / Petróleo Nós RH */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || ageState.isUnderage}
          className={`w-full py-4 px-6 rounded-2xl font-bold text-base sm:text-lg text-white shadow-turquesa-glow transition-all flex items-center justify-center gap-3 ${
            isSubmitting || ageState.isUnderage
              ? 'bg-slate-400 cursor-not-allowed shadow-none'
              : 'bg-nos-primary hover:bg-nos-primaryHover active:scale-[0.99] cursor-pointer text-nos-dark font-extrabold'
          }`}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-nos-dark" />
              <span>Enviando documento e registrando acordo...</span>
            </>
          ) : (
            <>
              <span>Confirmar e Assinar Acordo</span>
              <ArrowRight className="w-5 h-5 text-nos-dark" />
            </>
          )}
        </button>

        <p className="text-center text-[11px] text-slate-500 mt-3 flex items-center justify-center gap-1.5">
          <span>🔒</span>
          Ao confirmar, geramos um protocolo criptografado com data/hora, IP e documento anexado para sua segurança.
        </p>
      </div>

    </form>
  );
};
