import React, { useState } from 'react';
import { Stethoscope, Sparkles, Send, RefreshCw, Bookmark } from 'lucide-react';

export function CaseInputForm({ sampleCases, onAnalyze, isLoading }) {
  const [formData, setFormData] = useState({
    idade: 62,
    sexo: 'Masculino',
    sintomas: 'Febre alta iniciada há 3 dias (38.8°C), calafrios, tosse produtiva com secreção amarelada/purulenta e dispneia progressiva aos esforços moderados.',
    sinais: 'FC: 104 bpm, FR: 26 irpm, PA: 125/80 mmHg, SpO2: 91% em ar ambiente, Temp: 38.6°C. Crepitações em base pulmonar direita.',
    historico: 'Hipertensão arterial em tratamento regular com Enalapril. Nega diabetes ou DPOC prévio.',
    medicamentos: 'Enalapril 20mg 1x/dia, Paracetamol 750mg.',
    exames: 'Hemograma: Leucócitos 16.500/mm³ com 10% de bastonetes. PCR: 95 mg/L. Radiografia de tórax: Infiltrado alveolar consolidativo em lobo inferior direito.',
    observacoes_clinicas: 'Evolução rápida em 72h. Mora em Montes Claros (MG).'
  });

  const handleLoadSample = (sample) => {
    setFormData({ ...sample.data });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;
    onAnalyze(formData);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-5">
      
      {/* Header com Casos Clínicos Modelo */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-cyan-400" />
            Entrada de Informações Clínicas
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Insira os dados do paciente ou carregue um caso modelo para orquestração da IA
          </p>
        </div>

        {/* Casos Modelo Rápidos */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" /> Casos Rápidos:
          </span>
          {sampleCases.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleLoadSample(s)}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 text-xs font-medium transition"
            >
              {s.tag}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Linha 1: Idade e Sexo */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Idade (anos)
            </label>
            <input
              type="number"
              value={formData.idade}
              onChange={e => setFormData({ ...formData, idade: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Sexo Biológico
            </label>
            <select
              value={formData.sexo}
              onChange={e => setFormData({ ...formData, sexo: e.target.value })}
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
              <option value="Outro">Outro</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Medicamentos em Uso
            </label>
            <input
              type="text"
              value={formData.medicamentos}
              onChange={e => setFormData({ ...formData, medicamentos: e.target.value })}
              placeholder="Ex: Anti-hipertensivos, insulina..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Linha 2: Sintomas Queixa Principal */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Sintomas e Queixa Principal
          </label>
          <textarea
            rows={2}
            value={formData.sintomas}
            onChange={e => setFormData({ ...formData, sintomas: e.target.value })}
            placeholder="Descreva sintomas, tempo de evolução, febre, tosse, dor..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
            required
          />
        </div>

        {/* Linha 3: Sinais Vitais e Exame Físico */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Sinais Vitais e Exame Físico Objetivo
          </label>
          <textarea
            rows={2}
            value={formData.sinais}
            onChange={e => setFormData({ ...formData, sinais: e.target.value })}
            placeholder="Ex: PA, FC, FR, SpO2, Ausculta cardíaca e pulmonar..."
            className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Linha 4: Histórico & Comorbidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Histórico Clínico e Comorbidades
            </label>
            <textarea
              rows={2}
              value={formData.historico}
              onChange={e => setFormData({ ...formData, historico: e.target.value })}
              placeholder="Histórico patológico pregresso, cirurgias, tabagismo..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Exames Laboratoriais e de Imagem
            </label>
            <textarea
              rows={2}
              value={formData.exames}
              onChange={e => setFormData({ ...formData, exames: e.target.value })}
              placeholder="Hemograma, ECG, Raio-X, Tomografia, Troponina..."
              className="w-full rounded-xl bg-slate-900 border border-slate-700/80 px-3.5 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Botão de Envio / Análise */}
        <div className="pt-3 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide uppercase transition-all shadow-lg shadow-cyan-500/25 active:scale-95 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Orquestrando 8 Agentes...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Analisar Caso com Agentes MedIA</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
