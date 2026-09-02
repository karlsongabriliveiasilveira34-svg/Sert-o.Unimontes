import React from 'react';
import { Microscope, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export function ExamsAnalysisView({ exams }) {
  if (!exams) return null;

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl">
      <div className="flex items-center gap-2 mb-1">
        <Microscope className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Interpretação Laboratorial e de Imagem
        </h3>
      </div>

      {/* Resultados Relevantes */}
      {exams.relevant_results?.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Resultados Relevantes Identificados:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {exams.relevant_results.map((res, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-2"
              >
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">{res.exam}</h4>
                  <p className="text-xs text-slate-300 mt-0.5">{res.finding}</p>
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                    res.status === 'crítico'
                      ? 'bg-rose-950 text-rose-300 border-rose-500/50'
                      : 'bg-amber-950 text-amber-300 border-amber-500/50'
                  }`}
                >
                  {res.status || 'alterado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Correlações Clínicas */}
      {exams.clinical_correlations?.length > 0 && (
        <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/80">
          <span className="text-xs font-semibold text-cyan-400 block mb-1.5">
            Correlações Clínicas com as Hipóteses:
          </span>
          <ul className="space-y-1">
            {exams.clinical_correlations.map((cor, idx) => (
              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5">
                <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0 mt-0.5" />
                <span>{cor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Exames Adicionais Sugeridos */}
      {exams.additional_exams_to_consider?.length > 0 && (
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-400 block mb-1">
            Exames Adicionais Sugeridos pelo Agente:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {exams.additional_exams_to_consider.map((ex, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700/60 text-slate-300 text-xs font-mono"
              >
                + {ex}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
