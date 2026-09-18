import React, { useEffect } from 'react';
import { 
  CheckCircle, 
  ShieldCheck, 
  Printer, 
  RotateCcw, 
  Calendar, 
  Globe, 
  Smartphone, 
  FileCheck2, 
  Copy, 
  Check,
  Paperclip,
  Share2,
  ExternalLink
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { TermoAceite } from '../types/database.types';

interface ComprovanteSucessoProps {
  termo: TermoAceite;
  onReset: () => void;
}

export const ComprovanteSucesso: React.FC<ComprovanteSucessoProps> = ({ termo, onReset }) => {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3bb3c1', '#233c41', '#346b72', '#10b981'],
      });
    } catch {
      // Ignora erro em ambientes sem canvas
    }
  }, []);

  const formatarDataHora = (isoDate?: string) => {
    if (!isoDate) return new Date().toLocaleString('pt-BR');
    try {
      const d = new Date(isoDate);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoDate;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(termo.codigo_autenticidade);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fadeIn max-w-2xl mx-auto">
      
      {/* Banner Principal de Sucesso com Cores Nós RH (Petróleo e Turquesa) */}
      <div className="bg-nos-dark text-white rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden border border-nos-petroleo print:bg-white print:text-slate-900 print:shadow-none print:border print:border-slate-300">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-nos-primary/20 border border-nos-primary/40 flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle className="w-10 h-10 text-nos-primary print:text-teal-600" />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest bg-nos-primary/20 text-teal-300 px-3.5 py-1 rounded-full mb-2 border border-nos-primary/30">
            Acordo Formalizado
          </span>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Acordo Assinado com Sucesso!
          </h2>

          <p className="text-sm text-slate-300 max-w-md mt-2 font-medium print:text-slate-600">
            Seu termo de trabalho autônomo foi assinado eletronicamente e registrado com prova jurídica de integridade na Nós RH.
          </p>
        </div>

        {/* Círculos decorativos sutis */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-nos-primary/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-nos-petroleo/20 pointer-events-none" />
      </div>

      {/* Cartão do Recibo / Prova Digital */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho do Recibo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-nos-petroleo">
              Comprovante de Aceite Digital
            </span>
            <h3 className="text-lg font-bold text-nos-dark">
              Certificado de Autenticidade Nós RH
            </h3>
          </div>

          {/* Selo Digital */}
          <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-xl">
            <ShieldCheck className="w-4 h-4 text-nos-primary" />
            <span className="text-xs font-bold text-nos-dark">
              Válido para Fins Jurídicos
            </span>
          </div>
        </div>

        {/* Código Verificador */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              Código Verificador / Protocolo
            </span>
            <div className="font-mono text-sm sm:text-base font-extrabold text-nos-dark tracking-wide mt-0.5">
              {termo.codigo_autenticidade}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyCode}
            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-teal-600" />
                <span className="text-teal-700 font-bold">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Código</span>
              </>
            )}
          </button>
        </div>

        {/* Grade de Informações do Diarista */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Dados do(a) Profissional Diarista
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div>
              <span className="text-xs text-slate-500 block">Nome Completo:</span>
              <strong className="text-nos-dark font-semibold">{termo.nome_completo}</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">CPF:</span>
              <strong className="text-nos-dark font-mono">{termo.cpf}</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Documento (RG):</span>
              <strong className="text-nos-dark">{termo.rg}</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Idade Registrada:</span>
              <strong className="text-nos-dark">{termo.idade} anos</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Função Declarada:</span>
              <strong className="text-nos-dark">{termo.funcao}</strong>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Dias de Atuação:</span>
              <strong className="text-nos-dark">{termo.dias_trabalho}</strong>
            </div>
          </div>
        </div>

        {/* Documento Anexado e Consentimento LGPD */}
        <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Paperclip className="w-4 h-4 text-nos-petroleo shrink-0" />
              <span className="text-xs font-bold text-nos-dark">
                Documento Pessoal Anexado:
              </span>
            </div>
            <span className="text-[11px] font-bold text-teal-800 bg-teal-100 px-2 py-0.5 rounded">
              Recebido
            </span>
          </div>

          <div className="text-xs text-slate-700 flex items-center justify-between">
            <span className="font-medium truncate max-w-[280px]">
              {termo.documento_nome || 'Documento de Identidade (RG/CPF)'}
            </span>
            {termo.documento_url && (
              <a
                href={termo.documento_url}
                target="_blank"
                rel="noopener noreferrer"
                className="print:hidden text-[11px] font-bold text-nos-petroleo hover:text-nos-dark flex items-center gap-1 underline"
              >
                <span>Visualizar</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="pt-2 border-t border-teal-200/60 flex items-start gap-2 text-[11px] text-slate-600">
            <Share2 className="w-3.5 h-3.5 text-nos-petroleo shrink-0 mt-0.5" />
            <span>
              <strong>Consentimento Registrado:</strong> Autorizado o compartilhamento dos dados e documentos com clientes e parceiros tomadores da Nós RH.
            </span>
          </div>
        </div>

        {/* Metadados de Prova Jurídica */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-nos-petroleo" />
            Evidências Digitais e Carimbo Forense
          </h4>

          <div className="space-y-2.5 text-xs text-slate-700 bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Data e Hora do Registro:</strong> {formatarDataHora(termo.created_at)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                <strong>Endereço de IP:</strong> <code className="bg-slate-200/60 px-1.5 py-0.5 rounded font-mono text-[11px]">{termo.ip_address || 'Não capturado'}</code>
                {termo.geolocalizacao?.cidade && (
                  <span className="ml-2 text-slate-500">
                    ({termo.geolocalizacao.cidade} - {termo.geolocalizacao.estado})
                  </span>
                )}
              </span>
            </div>

            <div className="flex items-start gap-2">
              <Smartphone className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>
                <strong>Dispositivo / Sistema:</strong> {termo.dispositivo_resumo || termo.user_agent}
              </span>
            </div>
          </div>
        </div>

        {/* Respaldo Legal */}
        <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-500 leading-relaxed">
          <p>
            <strong>Fundamentação Legal:</strong> Assinatura eletrônica formalizada com esteio na MP nº 2.200-2/2001 e Lei nº 14.063/2020. Prestação de serviço autônomo sem vínculo empregatício e sem subordinação (Art. 442-B da CLT e Código Civil).
          </p>
        </div>

      </div>

      {/* Botões de Ação */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 print:hidden">
        <button
          type="button"
          onClick={handlePrint}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-nos-dark hover:bg-nos-darkHover text-white shadow-petroleo-glow transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4 text-nos-primary" />
          <span>Imprimir / Salvar em PDF</span>
        </button>

        <button
          type="button"
          onClick={onReset}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Novo Aceite de Diarista</span>
        </button>
      </div>

    </div>
  );
};
