import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  FileCheck2, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Monitor, 
  User, 
  FileText 
} from 'lucide-react';
import type { TermoAceite } from '../types/database.types';

interface ModalProvaJuridicaProps {
  termo: TermoAceite | null;
  onClose: () => void;
}

export const ModalProvaJuridica: React.FC<ModalProvaJuridicaProps> = ({ termo, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!termo) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(termo, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const formatarData = (d?: string) => {
    if (!d) return 'N/A';
    try {
      return new Date(d).toLocaleString('pt-BR');
    } catch {
      return d;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-nos-dark/70 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Cabeçalho do Dossiê */}
        <div className="p-5 sm:p-6 bg-nos-dark text-white flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-nos-accent flex items-center justify-center shadow-orange-glow text-white">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                  Dossiê de Prova Jurídica Forense
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-emerald-400/30">
                  Autêntico
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono mt-0.5">
                Protocolo: {termo.codigo_autenticidade}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              title="Imprimir laudo pericial"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Corpo Rolável do Dossiê */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 text-sm">
          
          {/* Seção 1: Identificação do Profissional */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-nos-primary flex items-center gap-1.5">
                <User className="w-4 h-4 text-nos-accent" />
                1. Qualificação do(a) Diarista
              </h4>
              <span className="text-[11px] font-semibold text-slate-500">
                Idade no aceite: {termo.idade} anos
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Nome Completo:</span>
                <strong className="text-nos-dark font-bold text-base">{termo.nome_completo}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">CPF (Validado no ato):</span>
                <strong className="font-mono text-nos-dark">{termo.cpf}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">RG / Documento:</span>
                <strong className="text-nos-dark">{termo.rg}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Data de Nascimento:</span>
                <strong className="text-nos-dark">{termo.data_nascimento}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Função Acordada:</span>
                <strong className="text-nos-dark">{termo.funcao}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs">Dias de Disponibilidade:</span>
                <strong className="text-nos-dark">{termo.dias_trabalho}</strong>
              </div>
            </div>
          </div>

          {/* Seção 2: Metadados Técnicos de Integridade e Rastreabilidade */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-nos-primary flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-nos-accent" />
                2. Metadados de Autenticidade e Carimbo de Tempo
              </h4>
              <span className="text-[11px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Auditado
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500">Timestamp do Servidor / Banco (UTC):</span>
                  <div className="font-mono font-semibold text-nos-dark mt-0.5">
                    {formatarData(termo.created_at)} ({termo.created_at})
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500">Endereço IP & Geolocalização:</span>
                  <div className="font-mono font-semibold text-nos-dark mt-0.5">
                    IP: {termo.ip_address || 'Não registrado'}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Localização Estimada: {termo.geolocalizacao?.cidade || 'Cidade não resolvida'}, {termo.geolocalizacao?.estado || 'UF'} - {termo.geolocalizacao?.pais || 'Brasil'}
                    {termo.geolocalizacao?.latitude && (
                      <span className="ml-2 font-mono text-slate-500">
                        [Lat: {termo.geolocalizacao.latitude}, Long: {termo.geolocalizacao.longitude}]
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Monitor className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500">Dispositivo & Agente de Navegação (User Agent):</span>
                  <div className="font-semibold text-nos-dark mt-0.5">
                    {termo.dispositivo_resumo || 'Dispositivo Padrão'}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 break-all bg-white p-2 rounded border border-slate-200 mt-1">
                    {termo.user_agent}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Seção 3: Texto Integral do Contrato no Momento do Aceite */}
          <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-slate-50/50 space-y-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-nos-primary flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-nos-accent" />
                3. Texto Integral do Termo Aceito (Versão {termo.termo_versao})
              </h4>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700 max-h-56 overflow-y-auto leading-relaxed whitespace-pre-wrap">
              {termo.termo_texto_integral}
            </div>
            <p className="text-[11px] text-slate-500">
              * O texto acima corresponde ao teor imutável gravado no momento em que o(a) diarista confirmou o aceite eletrônico.
            </p>
          </div>

        </div>

        {/* Rodapé do Modal com Ações */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={handleCopyJSON}
            className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">JSON Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Registro JSON</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrint}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-nos-primary hover:bg-nos-dark transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Salvar PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-200 transition cursor-pointer"
            >
              Fechar
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
