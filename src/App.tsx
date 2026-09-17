import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { FormularioAceite } from './components/FormularioAceite';
import { ComprovanteSucesso } from './components/ComprovanteSucesso';
import { AdminModalLogin } from './components/AdminModalLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { Footer } from './components/Footer';
import type { TermoAceite } from './types/database.types';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'form' | 'success' | 'admin'>('form');
  const [comprovante, setComprovante] = useState<TermoAceite | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  useEffect(() => {
    // Recupera sessão do admin se já logado na aba atual
    const authStatus = sessionStorage.getItem('nosrh_admin_auth');
    if (authStatus === 'true') {
      setIsAdminAuthenticated(true);
    }
  }, []);

  const handleAceiteSuccess = (termo: TermoAceite) => {
    setComprovante(termo);
    setCurrentView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setComprovante(null);
    setCurrentView('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenAdmin = () => {
    if (isAdminAuthenticated) {
      setCurrentView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleAuthenticated = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('nosrh_admin_auth', 'true');
    setIsLoginModalOpen(false);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('nosrh_admin_auth');
    setCurrentView('form');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between text-slate-800">
      
      {/* Topo Institucional */}
      <Header />

      {/* Conteúdo Central */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        
        {currentView === 'form' && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card text-xs text-slate-600 flex items-start gap-3">
              <span className="text-base">📋</span>
              <div>
                <strong className="text-nos-dark font-bold text-sm block">
                  Adesão de Prestador Autônomo
                </strong>
                <p className="mt-0.5">
                  Preencha os campos abaixo com atenção. Este acordo formaliza a prestação de serviços por diária sem subordinação e sem vínculo de emprego.
                </p>
              </div>
            </div>

            <FormularioAceite onSuccess={handleAceiteSuccess} />
          </div>
        )}

        {currentView === 'success' && comprovante && (
          <ComprovanteSucesso termo={comprovante} onReset={handleReset} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard
            onBackToForm={() => setCurrentView('form')}
            onLogout={handleAdminLogout}
          />
        )}

      </main>

      {/* Rodapé com Link Discreto */}
      <Footer onOpenAdmin={handleOpenAdmin} />

      {/* Modal com Senha Estática */}
      <AdminModalLogin
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAuthenticated={handleAuthenticated}
      />

    </div>
  );
};

export default App;
