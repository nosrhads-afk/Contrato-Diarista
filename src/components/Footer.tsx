import React from 'react';
import { Lock } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  return (
    <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-400 print:hidden">
      <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        
        <div>
          <p>© {new Date().getFullYear()} Nós RH • Todos os direitos reservados.</p>
          <p className="text-[11px] text-slate-400/80 mt-0.5">
            Segurança jurídica e conformidade trabalhista (Art. 442-B CLT).
          </p>
        </div>

        {/* Link/Botão Minúsculo e Discreto de Acesso Restrito */}
        <div>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="group flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-nos-petroleo transition p-1.5 rounded cursor-pointer select-none"
            title="Área Administrativa Restrita"
          >
            <Lock className="w-3 h-3 text-slate-400 group-hover:text-nos-primary transition" />
            <span className="opacity-80 group-hover:opacity-100 font-medium">Acesso Restrito</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
