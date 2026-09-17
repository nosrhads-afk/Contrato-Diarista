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
  Check 
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
    // Efeito de celebração leve e profissional ao carregar o comprovante
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F26522', '#133B5C', '#10B981'],
      });
    } catch {
      // Ignora caso canvas não esteja disponível
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
      
      {/* Banner Principal de Sucesso */}
      <div className="bg-emerald-600 text-white rounded-3xl p-6 sm:p-8 text-center shadow-lg relative overflow-hidden print:bg-white print:text-slate-900 print:shadow-none print:border print:border-slate-300">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-3 shadow-inner">
            <CheckCircle className="w-10 h-10 text-white print:text-emerald-600" />
          </div>

          <span className="text-xs font-semibold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full mb-2">
            Acordo Formalizado
          </span>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Acordo Assinado com Sucesso!
          </h2>

          <p className="text-sm text-emerald-100 max-w-md mt-2 font-medium print:text-slate-600">
            Seu termo de trabalho autônomo foi assinado eletronicamente e registrado com prova jurídica de integridade na Nós RH.
          </p>
        </div>

        {/* Círculos decorativos sutis */}
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
      </div>

      {/* Cartão do Recibo / Prova Digital */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-6 sm:p-8 space-y-6 print:border-none print:shadow-none print:p-0">
        
        {/* Cabeçalho do Recibo */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-nos-accent">
              Comprovante de Aceite Digital
            </span>
            <h3 className="text-lg font-bold text-nos-dark">
              Certificado de Autenticidade Nós RH
            </h3>
          </div>

          {/* Selo Digital */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
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
            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copiado!</span>
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

        {/* Metadados de Prova Jurídica */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-nos-accent" />
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
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-sm bg-nos-dark hover:bg-nos-primary text-white shadow transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Printer className="w-4 h-4" />
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
