import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-rose-950/70 border-rose-500/80 text-rose-200',
    titleColor: 'text-rose-300',
    badge: 'bg-rose-900/90 text-rose-200 border-rose-500',
    icon: ShieldAlert,
    label: 'EMERGÊNCIA CRÍTICA'
  },
  high: {
    bg: 'bg-amber-950/70 border-amber-500/80 text-amber-200',
    titleColor: 'text-amber-300',
    badge: 'bg-amber-900/90 text-amber-200 border-amber-500',
    icon: AlertTriangle,
    label: 'ALTO RISCO CLÍNICO'
  },
  medium: {
    bg: 'bg-yellow-950/60 border-yellow-500/70 text-yellow-200',
    titleColor: 'text-yellow-300',
    badge: 'bg-yellow-900/90 text-yellow-200 border-yellow-500',
    icon: AlertCircle,
    label: 'ATENÇÃO MODERADA'
  },
  low: {
    bg: 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200',
    titleColor: 'text-emerald-300',
    badge: 'bg-emerald-900/90 text-emerald-200 border-emerald-500',
    icon: Info,
    label: 'BAIXO RISCO / ESTÁVEL'
  }
};

export function SafetyAlertsBanner({ safety }) {
  if (!safety) return null;

  const severity = safety.severity || 'medium';
  const config = SEVERITY_CONFIG[severity] || SEVERITY_CONFIG.medium;
  const Icon = config.icon;

  return (
    <div className={`p-4 rounded-2xl border shadow-xl backdrop-blur-md mb-6 transition-all ${config.bg}`}>
      <div className="flex items-start justify-between gap-3">
        
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-black/30 shrink-0 mt-0.5">
            <Icon className="w-6 h-6 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border ${config.badge}`}>
                {config.label}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Guardrail de Segurança Clínica Ativo
              </span>
            </div>

            <h3 className={`text-sm md:text-base font-bold ${config.titleColor}`}>
              {safety.alerts?.[0] || 'Atenção aos achados clínicos do paciente.'}
            </h3>

            {safety.alerts?.length > 1 && (
              <ul className="mt-2 space-y-1 text-xs list-disc list-inside opacity-90">
                {safety.alerts.slice(1).map((alert, i) => (
                  <li key={i}>{alert}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>

      {/* Achados Críticos & Informações Ausentes */}
      <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {safety.critical_findings?.length > 0 && (
          <div>
            <span className="font-semibold block mb-1 opacity-80">Achados Críticos Identificados:</span>
            <div className="flex flex-wrap gap-1.5">
              {safety.critical_findings.map((f, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-mono">
                  • {f}
                </span>
              ))}
            </div>
          </div>
        )}

        {safety.missing_critical_information?.length > 0 && (
          <div>
            <span className="font-semibold block mb-1 opacity-80">Dados Críticos Ausentes / A Obter:</span>
            <div className="flex flex-wrap gap-1.5">
              {safety.missing_critical_information.map((m, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded-md bg-black/40 text-[11px] font-mono text-cyan-200">
                  ? {m}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
