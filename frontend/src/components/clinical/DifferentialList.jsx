import React from 'react';
import { GitBranch, Check, X, FilePlus } from 'lucide-react';

export function DifferentialList({ differential }) {
  if (!differential || !differential.hypotheses) return null;

  const getPriorityBadge = (p) => {
    switch (p?.toLowerCase()) {
      case 'alta':
        return 'bg-rose-950/80 text-rose-300 border-rose-500/50';
      case 'moderada':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Diagnósticos Diferenciais Estruturados
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {differential.hypotheses.map((hyp, idx) => (
          <div
            key={idx}
            className="glass-panel rounded-2xl p-4.5 border border-slate-800 hover:border-slate-700 flex flex-col justify-between shadow-lg"
          >
            <div>
              {/* Header do Card */}
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <h4 className="text-sm font-bold text-white leading-snug">
                  {hyp.name}
                </h4>
                <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${getPriorityBadge(hyp.priority)}`}>
                  Prioridade: {hyp.priority}
                </span>
              </div>

              {/* Achados que Favorecem */}
              <div className="my-2.5">
                <span className="text-[11px] font-semibold text-emerald-400 block mb-1">
                  Achados que Favorecem:
                </span>
                <ul className="space-y-1">
                  {(hyp.supporting_findings || []).map((sup, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{sup}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Achados que Contradizem */}
              {hyp.contradicting_findings?.length > 0 && (
                <div className="my-2.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[11px] font-semibold text-rose-400 block mb-1">
                    Achados que Contradizem:
                  </span>
                  <ul className="space-y-1">
                    {hyp.contradicting_findings.map((cont, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-slate-400">
                        <X className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                        <span>{cont}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Informações Adicionais / Exames Recomendados */}
            {hyp.additional_information?.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-cyan-300/90">
                <span className="flex items-center gap-1 font-semibold text-cyan-400 mb-1">
                  <FilePlus className="w-3 h-3" /> Exames para Diferenciação:
                </span>
                <p className="text-slate-300">
                  {hyp.additional_information.join('; ')}
                </p>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
