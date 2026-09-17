import React from 'react';
import { ShieldCheck, FileCheck } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-nos-dark text-white border-b border-nos-primary/50 shadow-md">
      <div className="max-w-3xl mx-auto px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo & Marca Nós RH */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nos-accent to-nos-accentHover flex items-center justify-center shadow-orange-glow">
              <span className="font-extrabold text-white text-lg tracking-wider">NÓS</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-lg sm:text-xl tracking-tight text-white leading-tight">
                  Nós RH
                </h1>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-nos-accent/20 text-orange-300 border border-nos-accent/40">
                  Oficial
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Gestão e Formalização de Diaristas
              </p>
            </div>
          </div>

          {/* Selo de Segurança Jurídica */}
          <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15 text-xs text-slate-200">
            <ShieldCheck className="w-4 h-4 text-nos-accent shrink-0" />
            <span className="hidden md:inline font-medium">Ambiente Seguro</span>
            <span className="text-[10px] text-slate-300 md:hidden font-medium">Seguro</span>
          </div>

        </div>

        {/* Título da Aplicação */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-nos-accent" />
              Aceite acordo Diarista Nos RH
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Assinatura eletrônica simplificada do termo autônomo sem burocracia
            </p>
          </div>
        </div>

      </div>
    </header>
  );
};
