import React, { useState } from 'react';
import { FileText, Copy, Printer, Check, Edit3, Save } from 'lucide-react';

export function ClinicalReportView({ report }) {
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    patient_summary: report?.patient_summary || '',
    clinical_history: report?.clinical_history || '',
    clinical_reasoning: report?.clinical_reasoning || '',
    final_notes: report?.final_notes || ''
  });

  if (!report) return null;

  const handleCopy = () => {
    const fullText = `=== RELATÓRIO CLÍNICO ESTRUTURADO (MedIA) ===\n\nSÍNTESE DO PACIENTE:\n${formData.patient_summary}\n\nHISTÓRIA CLÍNICA:\n${formData.clinical_history}\n\nACHADOS PRINCIPAIS:\n${(report.main_findings || []).map(f => `• ${f}`).join('\n')}\n\nHIPÓTESES DIAGNÓSTICAS:\n${(report.differential_diagnosis || []).map(d => `• ${d}`).join('\n')}\n\nRACIOCÍNIO CLÍNICO:\n${formData.clinical_reasoning}\n\nCONDUTA E NOTAS FINAIS:\n${formData.final_notes}\n\nData: ${new Date().toLocaleDateString('pt-BR')} | Sistema Sertão.Unimontes MedIA`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-6">
      
      {/* Barra de Ações do Relatório */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Relatório Clínico Estruturado (Agente de Relatório)
            </h3>
            <span className="text-[11px] text-slate-400">
              Formato oficial para prontuário médico • Editável
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(prev => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition ${
              isEditing
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isEditing ? (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Edição</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Relatório</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar Texto</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition shadow-md shadow-cyan-600/30"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Seção 1: Síntese do Paciente */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-cyan-400 block mb-1">
          1. Síntese do Paciente
        </label>
        {isEditing ? (
          <textarea
            rows={2}
            value={formData.patient_summary}
            onChange={e => setFormData({ ...formData, patient_summary: e.target.value })}
            className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            {formData.patient_summary}
          </div>
        )}
      </div>

      {/* Seção 2: História Clínica Organizada */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-cyan-400 block mb-1">
          2. História Clínica & Antecedentes
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.clinical_history}
            onChange={e => setFormData({ ...formData, clinical_history: e.target.value })}
            className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            {formData.clinical_history}
          </div>
        )}
      </div>

      {/* Grid: Achados Principais & Hipóteses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">
            3. Principais Achados
          </label>
          <ul className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1 text-xs">
            {(report.main_findings || []).map((f, i) => (
              <li key={i} className="text-slate-300">• {f}</li>
            ))}
          </ul>
        </div>

        <div>
          <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">
            4. Hipóteses Diagnósticas
          </label>
          <ul className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 space-y-1 text-xs">
            {(report.differential_diagnosis || []).map((d, i) => (
              <li key={i} className="text-slate-300">• {d}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Seção 5: Raciocínio Clínico Integrado */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-cyan-400 block mb-1">
          5. Raciocínio Clínico Integrado
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.clinical_reasoning}
            onChange={e => setFormData({ ...formData, clinical_reasoning: e.target.value })}
            className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs text-slate-200 leading-relaxed">
            {formData.clinical_reasoning}
          </div>
        )}
      </div>

      {/* Seção 6: Plano & Notas Finais */}
      <div>
        <label className="text-xs uppercase tracking-wider font-bold text-cyan-400 block mb-1">
          6. Conduta, Prescrições & Notas Finais
        </label>
        {isEditing ? (
          <textarea
            rows={3}
            value={formData.final_notes}
            onChange={e => setFormData({ ...formData, final_notes: e.target.value })}
            className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl p-3 text-xs text-white focus:outline-none"
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-100 leading-relaxed font-medium">
            {formData.final_notes}
          </div>
        )}
      </div>

    </div>
  );
}
