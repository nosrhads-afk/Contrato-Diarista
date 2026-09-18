import React, { useState, useEffect } from 'react';
import { 
  Search, 
  FileText, 
  Eye, 
  ArrowLeft, 
  RefreshCw, 
  Users, 
  CalendarCheck, 
  ShieldCheck, 
  LogOut,
  Paperclip
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { TermoAceite } from '../types/database.types';
import { ModalProvaJuridica } from './ModalProvaJuridica';

interface AdminDashboardProps {
  onBackToForm: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onBackToForm,
  onLogout,
}) => {
  const [termos, setTermos] = useState<TermoAceite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTermo, setSelectedTermo] = useState<TermoAceite | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchTermos = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase
        .from('termos_aceite_diarista')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setTermos((data as TermoAceite[]) || []);
    } catch (err: unknown) {
      console.error('Erro ao buscar termos:', err);
      const msg = err instanceof Error ? err.message : 'Falha ao conectar com o Supabase.';
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTermos();
  }, []);

  // Filtro de pesquisa em tempo real por Nome ou CPF
  const filteredTermos = termos.filter((t) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    const nomeMatch = t.nome_completo?.toLowerCase().includes(term);
    const cpfMatch = t.cpf?.toLowerCase().includes(term);
    return nomeMatch || cpfMatch;
  });

  const formatarData = (d?: string) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return d;
    }
  };

  // Contagem de hoje
  const hojeString = new Date().toISOString().split('T')[0];
  const totalHoje = termos.filter(
    (t) => t.created_at && t.created_at.startsWith(hojeString)
  ).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Topo do Painel Administrativo */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-teal-50 text-nos-petroleo border border-teal-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Painel Restrito
            </span>
            <span className="text-xs text-slate-500 font-medium">Nós RH</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-nos-dark mt-1">
            Gestão de Acordos de Diaristas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Consulta forense, documentos anexados e auditoria de assinaturas eletrônicas
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onBackToForm}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Ver Formulário</span>
          </button>
          
          <button
            onClick={onLogout}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-600 transition flex items-center justify-center gap-1.5 cursor-pointer"
            title="Sair da área administrativa"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Cartões de Indicadores Rápidos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-nos-petroleo flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total de Acordos</span>
            <div className="text-2xl font-black text-nos-dark mt-0.5">{termos.length}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-nos-primary/15 text-nos-dark flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Assinados Hoje</span>
            <div className="text-2xl font-black text-nos-dark mt-0.5">{totalHoje}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conformidade Legal</span>
            <div className="text-sm font-bold text-teal-800 mt-0.5">100% Auditável (LGPD)</div>
          </div>
        </div>

      </div>

      {/* Barra de Pesquisa e Ações */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-card flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar instantaneamente por Nome ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-nos-primary focus:ring-2 focus:ring-nos-primary/30 transition"
          />
        </div>

        <button
          onClick={fetchTermos}
          disabled={isLoading}
          className="px-4 py-2.5 rounded-xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-nos-primary' : ''}`} />
          <span>Atualizar</span>
        </button>

      </div>

      {/* Mensagem de Erro se houver */}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          <strong>Aviso:</strong> {errorMsg}
          <p className="mt-1">
            Certifique-se de que a tabela <code>termos_aceite_diarista</code> foi criada no Supabase usando o script fornecido.
          </p>
        </div>
      )}

      {/* Tabela de Listagem dos Termos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card overflow-hidden">
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Data do Aceite</th>
                <th className="py-3.5 px-4 sm:px-6">Nome</th>
                <th className="py-3.5 px-4 sm:px-6">CPF</th>
                <th className="py-3.5 px-4 sm:px-6">Função</th>
                <th className="py-3.5 px-4 sm:px-6 text-center">Doc.</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Ações</th>
              </tr>
            </thead>
            
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin text-nos-primary" />
                      <span>Carregando termos assinados...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTermos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-semibold">Nenhum termo encontrado.</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {searchTerm ? 'Nenhum resultado corresponde à busca.' : 'Ainda não há registros no banco de dados.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTermos.map((termo, index) => (
                  <tr 
                    key={termo.id || index}
                    className="hover:bg-slate-50/80 transition"
                  >
                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-600 whitespace-nowrap">
                      {formatarData(termo.created_at)}
                    </td>
                    
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-nos-dark">
                      {termo.nome_completo}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 font-mono text-xs text-slate-600">
                      {termo.cpf}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                        {termo.funcao}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-center">
                      {termo.documento_nome ? (
                        <span 
                          title={`Documento anexado: ${termo.documento_nome}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded"
                        >
                          <Paperclip className="w-3 h-3" />
                          <span>Anexo</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        onClick={() => setSelectedTermo(termo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-nos-dark bg-nos-primary hover:bg-nos-primaryHover transition shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visualizar Prova</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da tabela com contagem */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Exibindo <strong>{filteredTermos.length}</strong> de <strong>{termos.length}</strong> registros</span>
          <span className="text-[11px] text-slate-400">Banco de Dados Supabase</span>
        </div>

      </div>

      {/* Modal de Detalhes da Prova Jurídica */}
      <ModalProvaJuridica
        termo={selectedTermo}
        onClose={() => setSelectedTermo(null)}
      />

    </div>
  );
};
