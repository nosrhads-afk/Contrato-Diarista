import React, { useRef, useState } from 'react';
import { FileText, ScrollText, CheckCircle2, Share2 } from 'lucide-react';
import { TEXTO_TERMO_AUTONOMO, CONTRATO_VERSAO } from '../lib/contractText';

interface TermoContratoBoxProps {
  hasRead: boolean;
  onToggleAccept: (accepted: boolean) => void;
  errorCheckbox?: boolean;
}

export const TermoContratoBox: React.FC<TermoContratoBoxProps> = ({
  hasRead,
  onToggleAccept,
  errorCheckbox,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 30) {
      setHasScrolledToEnd(true);
    }
  };

  return (
    <div className="space-y-3">
      {/* Topo do Box do Contrato */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm font-bold text-nos-dark">
          <FileText className="w-4 h-4 text-nos-primary" />
          Termo de Adesão de Trabalho Autônomo
          <span className="text-xs font-normal text-slate-500">
            (Versão {CONTRATO_VERSAO})
          </span>
        </label>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          <ScrollText className="w-3.5 h-3.5 text-nos-petroleo" />
          <span>Role para ler tudo</span>
        </div>
      </div>

      {/* Caixa de Texto Rolável */}
      <div className="relative rounded-xl border border-slate-300 bg-slate-50 shadow-inner overflow-hidden focus-within:ring-2 focus-within:ring-nos-primary/40">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Texto do contrato de trabalho autônomo"
          className="h-64 sm:h-72 p-4 overflow-y-auto text-xs sm:text-[13px] leading-relaxed text-slate-700 font-mono whitespace-pre-wrap selection:bg-teal-100 selection:text-nos-dark scroll-smooth focus:outline-none"
        >
          {TEXTO_TERMO_AUTONOMO}
        </div>

        {/* Indicador sutil de rolagem inferior */}
        {!hasScrolledToEnd && (
          <div className="pointer-events-none absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-100/90 to-transparent flex items-end justify-center pb-1 text-[11px] text-slate-500 font-sans">
            Role para o final para confirmar a leitura ↓
          </div>
        )}
      </div>

      {/* Checkbox de Aceite Obrigatório com Autorização de Compartilhamento de Dados */}
      <div
        className={`p-4 rounded-xl border transition-all ${
          errorCheckbox
            ? 'border-red-400 bg-red-50/70 ring-2 ring-red-200'
            : hasRead
            ? 'border-nos-primary bg-teal-50/50 shadow-sm'
            : 'border-slate-200 bg-white hover:border-slate-300'
        }`}
      >
        <label className="flex items-start gap-3 cursor-pointer select-none">
          <div className="relative flex items-center pt-0.5">
            <input
              type="checkbox"
              id="aceite-termo"
              checked={hasRead}
              onChange={(e) => onToggleAccept(e.target.checked)}
              className="peer w-5 h-5 rounded border-slate-300 text-nos-primary focus:ring-nos-primary focus:ring-offset-1 transition cursor-pointer accent-nos-primary"
            />
          </div>
          <div className="text-xs sm:text-sm text-slate-800 leading-snug space-y-2">
            <div>
              <span className="font-bold text-nos-dark">
                Li, compreendo e aceito os termos do acordo de trabalho autônomo.
              </span>
              <p className="text-xs text-slate-600 mt-1 font-sans">
                Declaro que as informações prestadas são verdadeiras e que atuo com total autonomia e sem qualquer subordinação jurídica ou vínculo de emprego.
              </p>
            </div>

            {/* Aviso Expresso de Compartilhamento de Dados com Parceiros */}
            <div className="flex items-start gap-2 pt-1 border-t border-slate-200/60 text-[11px] text-slate-700 bg-slate-50/80 p-2.5 rounded-lg">
              <Share2 className="w-3.5 h-3.5 text-nos-petroleo shrink-0 mt-0.5" />
              <div>
                <strong className="text-nos-dark block font-semibold">
                  Consentimento para Compartilhamento de Dados (LGPD):
                </strong>
                <span className="text-slate-600">
                  Estou ciente e autorizo expressamente o compartilhamento dos meus dados cadastrais e documentos anexados com parceiros, clientes e tomadores finais da <strong>Nós RH</strong> para fins exclusivos de intermediação, liberação de acesso aos locais de trabalho e gestão das oportunidades de serviços.
                </span>
              </div>
            </div>
          </div>
        </label>

        {errorCheckbox && (
          <p className="text-xs font-semibold text-red-600 mt-2 pl-8 flex items-center gap-1">
            <span>⚠️</span> É obrigatório ler e marcar o aceite dos termos e autorização para prosseguir.
          </p>
        )}
      </div>

      {hasRead && (
        <div className="flex items-center gap-1.5 text-xs font-medium text-teal-800 bg-teal-50 px-3 py-2 rounded-lg border border-teal-200 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-nos-primary shrink-0" />
          <span>Termos e autorização de compartilhamento aceitos. Pronto para assinar.</span>
        </div>
      )}
    </div>
  );
};
