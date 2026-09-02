import React from 'react';
import { X, Brain, CheckCircle2, AlertCircle, HelpCircle, ArrowRight } from 'lucide-react';

export function ExplanationModal({ isOpen, onClose, explanation, hypothesisTitle }) {
  if (!isOpen || !explanation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="glass-panel-glow max-w-2xl w-full rounded-2xl border border-cyan-500/30 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho do Modal */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Raciocínio Clínico da IA: {hypothesisTitle || 'Diagnóstico'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Agente de Explicação • Transparência de Evidências
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conteúdo com Scroll */}
        <div className="p-5 overflow-y-auto space-y-5 text-xs text-slate-200">
          
          {/* Conclusão Principal */}
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-slate-100 leading-relaxed">
            <span className="font-bold text-cyan-300 block mb-1 text-xs uppercase tracking-wider">
              Conclusão da Análise:
            </span>
            {explanation.conclusion}
          </div>

          {/* Passos do Raciocínio (Reasoning Steps) */}
          {explanation.reasoning_steps?.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-200 mb-2 uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                Passos do Raciocínio Lógico:
              </h4>
              <div className="space-y-2">
                {explanation.reasoning_steps.map((step, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-300 leading-normal">
                    {step}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grid: Evidências a Favor vs Incertezas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Evidências Favoráveis */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-emerald-500/20">
              <h5 className="font-bold text-emerald-400 mb-2 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Evidências Favoráveis:
              </h5>
              <ul className="space-y-1.5">
                {(explanation.supporting_evidence || []).map((ev, i) => (
                  <li key={i} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Incertezas & Dados Ausentes */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-amber-500/20">
              <h5 className="font-bold text-amber-400 mb-2 flex items-center gap-1 text-[11px]">
                <HelpCircle className="w-3.5 h-3.5" />
                Incertezas & Limitações:
              </h5>
              <ul className="space-y-1.5">
                {(explanation.uncertainties || []).map((unc, i) => (
                  <li key={i} className="text-slate-300 text-[11px] flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">?</span>
                    <span>{unc}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>

        {/* Rodapé */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-900/60 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs transition shadow-md"
          >
            Entendido
          </button>
        </div>

      </div>
    </div>
  );
}
