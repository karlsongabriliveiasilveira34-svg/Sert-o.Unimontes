import React from 'react';
import { Check, X, HelpCircle, Activity } from 'lucide-react';

export function ProbabilityCard({ item, onExplain }) {
  const score = item.score || 0;
  
  // Cores dinâmicas para a barra de progresso
  const getProgressColor = (val) => {
    if (val >= 75) return 'from-emerald-500 to-cyan-400';
    if (val >= 45) return 'from-amber-500 to-yellow-400';
    return 'from-slate-600 to-slate-400';
  };

  const getCompatibilityBadge = (comp) => {
    switch (comp?.toLowerCase()) {
      case 'muito alta':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
      case 'alta':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
      case 'moderada':
        return 'bg-amber-950/80 text-amber-300 border-amber-500/50';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="glass-panel-glow rounded-2xl p-5 border border-slate-700/80 flex flex-col justify-between hover:border-cyan-500/50 transition-all duration-300 shadow-xl group">
      
      <div>
        {/* Cabeçalho do Card */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            Probabilidade Clínica
          </span>
          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${getCompatibilityBadge(item.compatibility)}`}>
            {item.compatibility}
          </span>
        </div>

        {/* Nome da Hipótese e Porcentagem */}
        <div className="flex items-baseline justify-between gap-2 my-2">
          <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
            {item.hypothesis}
          </h3>
          <span className="text-xl sm:text-2xl font-black font-mono text-cyan-400 shrink-0">
            {score}%
          </span>
        </div>

        {/* Barra de Progresso Visual */}
        <div className="w-full bg-slate-900 rounded-full h-3 p-0.5 overflow-hidden border border-slate-800 my-3">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${getProgressColor(score)} transition-all duration-1000 ease-out`}
            style={{ width: `${score}%` }}
          />
        </div>

        {/* Seção "Por que?" */}
        <div className="mt-4 pt-3 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-slate-300 mb-2.5 flex items-center gap-1">
            Por que?
          </h4>

          {/* Fatores de Suporte */}
          <ul className="space-y-1.5 mb-3">
            {(item.supporting_factors || []).slice(0, 4).map((factor, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{factor}</span>
              </li>
            ))}
          </ul>

          {/* Fatores Contrários (se houver) */}
          {item.negative_factors && item.negative_factors.length > 0 && (
            <ul className="space-y-1 text-xs text-slate-400 border-t border-slate-800/40 pt-2 mb-2">
              {item.negative_factors.slice(0, 2).map((neg, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-400 text-[11px]">
                  <X className="w-3 h-3 text-rose-400 shrink-0 mt-0.5" />
                  <span>{neg}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Botão de Ver Explicação Detalhada */}
      <button
        onClick={() => onExplain && onExplain(item.hypothesis, item)}
        className="mt-3 w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-cyan-950 border border-slate-700/80 hover:border-cyan-500/50 text-cyan-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm"
      >
        <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
        <span>Ver explicação detalhada</span>
      </button>

    </div>
  );
}
