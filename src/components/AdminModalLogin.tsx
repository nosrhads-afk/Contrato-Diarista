import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle } from 'lucide-react';

interface AdminModalLoginProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: () => void;
}

export const AdminModalLogin: React.FC<AdminModalLoginProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Senha estática solicitada: "nosrh2026"
    if (password === 'nosrh2026') {
      setError(false);
      setPassword('');
      onAuthenticated();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-nos-dark/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 relative"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-modal-title"
      >
        
        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 rounded-lg"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Topo com Ícone */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-nos-primary/10 text-nos-primary flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 id="admin-modal-title" className="font-bold text-base text-nos-dark">
              Acesso Administrativo
            </h3>
            <p className="text-xs text-slate-500">
              Painel de Gestão e Auditoria Nós RH
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label 
              htmlFor="admin-password" 
              className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5"
            >
              Senha de Acesso
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type="password"
                autoFocus
                required
                placeholder="Digite a senha..."
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl border text-sm text-slate-900 transition focus:outline-none focus:ring-2 ${
                  error
                    ? 'border-red-400 bg-red-50/40 focus:ring-red-300'
                    : 'border-slate-300 focus:border-nos-primary focus:ring-nos-primary/20'
                }`}
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
            
            {error && (
              <p className="text-xs font-semibold text-red-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                Senha incorreta. Tente novamente.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-nos-primary hover:bg-nos-dark transition cursor-pointer shadow-sm"
            >
              Entrar no Painel
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
