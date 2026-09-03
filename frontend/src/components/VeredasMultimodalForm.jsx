import React, { useState } from 'react';
import { Sliders, Satellite, MapPin, AlertCircle, FileText, Send, X, Layers, Activity } from 'lucide-react';

export function VeredasMultimodalForm({ onSubmitDiagnosis, onClose }) {
  const [formData, setFormData] = useState({
    ndvi: 0.42,
    slope: 'Plano (0 a 3%)',
    seasonality: 'Período Seco / Estiagem (Abril a Setembro)',
    location: 'Talhão Piloto 40ha - Norte de Minas (Região SUDENE)',
    invasiveSpecies: 'Ausente',
    soilType: 'Latossolo Vermelho/Amarelo',
    waterProximity: 'Sem corpo d\'água adjacente',
    erosion: 'Sem erosão evidente',
    landUseHistory: 'Pastagem extensiva com compactação',
    technicalNotes: ''
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formata o prompt estruturado de diagnóstico multimodal
    const formattedQuery = `[DIAGNÓSTICO MULTIMODAL E PLANO DE MANEJO]
📍 Local / Região SUDENE: ${formData.location}

🛰️ 1. DADOS DE SENSORIAMENTO REMOTO (Sentinel-2 / MDE):
- NDVI Médio da Gleba: ${formData.ndvi}
- Declividade e Relevo: ${formData.slope}
- Sazonalidade da Imagem: ${formData.seasonality}

📱 2. PARÂMETROS DE CAMPO (Inspeção / App Mobile):
- Infestação de Invasoras (Braquiária): ${formData.invasiveSpecies}
- Caracterização Pedológica Visual: ${formData.soilType}
- Recursos Hídricos e Proximidade: ${formData.waterProximity}
- Processos Erosivos Ativos: ${formData.erosion}
- Histórico de Uso da Terra: ${formData.landUseHistory}
${formData.technicalNotes ? `- Anotações Complementares: ${formData.technicalNotes}` : ''}

Por favor, elabore um diagnóstico ambiental detalhado, com enquadramento nos acervos da Knowledge Tree e um Plano de Manejo com recomendação ecológica.`;

    onSubmitDiagnosis(formattedQuery, formData);
  };

  return (
    <div className="bg-[#120e0a] border border-[#2d2218] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-[#e4ceaa] font-sans my-4 animate-fade-in relative">
      
      {/* Botão de Fechar */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#a89279] hover:text-[#f7ebd9] hover:bg-[#1a140e] rounded-xl transition-all cursor-pointer"
          title="Fechar formulário"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Cabeçalho do Formulário */}
      <div className="border-b border-[#2d2218] pb-4">
        <div className="flex items-center gap-2 text-[#c4602c] font-mono text-xs uppercase tracking-widest font-semibold mb-1">
          <Activity className="w-4 h-4 animate-pulse" />
          <span>Módulo de Integração de Dados Biófilos</span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f7ebd9]">
          Diagnóstico de Fusão Multimodal e Plano de Manejo
        </h2>
        <p className="text-xs sm:text-sm text-[#a89279] mt-1">
          Integração de sensoriamento remoto orbital (Sentinel-2 / MDE) e levantamento expedito de campo.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* SEÇÃO 1: Dados de Sensoriamento Remoto */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-[#f7ebd9] font-mono text-xs uppercase tracking-wider font-bold border-l-2 border-[#c4602c] pl-2">
            <Satellite className="w-4 h-4 text-[#c4602c]" />
            <span>1. Dados de Sensoriamento Remoto (Sentinel-2 / MDE)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* NDVI */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                NDVI Médio da Gleba (0.00 a 1.00)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={formData.ndvi}
                  onChange={(e) => handleChange('ndvi', parseFloat(e.target.value) || 0)}
                  className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c] font-mono"
                />
              </div>
            </div>

            {/* Declividade e Relevo */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Declividade e Relevo
              </label>
              <select
                value={formData.slope}
                onChange={(e) => handleChange('slope', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Plano (0 a 3%)">Plano (0 a 3%)</option>
                <option value="Suave Ondulado (3 a 8%)">Suave Ondulado (3 a 8%)</option>
                <option value="Ondulado (8 a 20%)">Ondulado (8 a 20%)</option>
                <option value="Forte Ondulado (&gt; 20%)">Forte Ondulado (&gt; 20%)</option>
              </select>
            </div>

            {/* Sazonalidade */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Sazonalidade da Imagem
              </label>
              <select
                value={formData.seasonality}
                onChange={(e) => handleChange('seasonality', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Período Seco / Estiagem (Abril a Setembro)">Período Seco / Estiagem (Abril a Setembro)</option>
                <option value="Período Chuvoso (Outubro a Março)">Período Chuvoso (Outubro a Março)</option>
              </select>
            </div>

          </div>
        </div>

        {/* SEÇÃO 2: Parâmetros de Campo */}
        <div className="space-y-4 pt-2 border-t border-[#2d2218]">
          <div className="flex items-center gap-2 text-[#f7ebd9] font-mono text-xs uppercase tracking-wider font-bold border-l-2 border-[#526644] pl-2">
            <MapPin className="w-4 h-4 text-[#748d61]" />
            <span>2. Parâmetros de Campo (Inspeção / App Mobile)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identificação da Propriedade / Município */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-[#a89279]">
                Identificação da Propriedade / Município / Região SUDENE
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Talhão Piloto 40ha - Região SUDENE Januária"
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              />
            </div>

            {/* Espécies Invasoras */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Infestação de Espécies Invasoras (Braquiária)
              </label>
              <select
                value={formData.invasiveSpecies}
                onChange={(e) => handleChange('invasiveSpecies', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Ausente">Ausente</option>
                <option value="Leve (< 15%)">Leve (&lt; 15%)</option>
                <option value="Moderada (15 a 45%)">Moderada (15 a 45%)</option>
                <option value="Severa (> 45%)">Severa (&gt; 45%)</option>
              </select>
            </div>

            {/* Caracterização Pedológica */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Caracterização Pedológica Visual
              </label>
              <select
                value={formData.soilType}
                onChange={(e) => handleChange('soilType', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Latossolo Vermelho/Amarelo">Latossolo Vermelho/Amarelo</option>
                <option value="Neossolo Quartzarênico">Neossolo Quartzarênico</option>
                <option value="Cambissolo / Carste Calcário">Cambissolo / Carste Calcário</option>
                <option value="Plintossolo / Glei Hidromórfico">Plintossolo / Glei Hidromórfico</option>
                <option value="Solo Turfoso Orgânico (Veredas)">Solo Turfoso Orgânico (Veredas)</option>
              </select>
            </div>

            {/* Recursos Hídricos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Recursos Hídricos e Proximidade
              </label>
              <select
                value={formData.waterProximity}
                onChange={(e) => handleChange('waterProximity', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Sem corpo d'água adjacente">Sem corpo d'água adjacente</option>
                <option value="Vereda / Buritizal (< 500m)">Vereda / Buritizal (&lt; 500m)</option>
                <option value="Calha do Rio São Francisco">Calha do Rio São Francisco</option>
                <option value="Sub-bacia do Rio Verde Grande">Sub-bacia do Rio Verde Grande</option>
                <option value="Sub-bacia do Rio Gorutuba">Sub-bacia do Rio Gorutuba</option>
              </select>
            </div>

            {/* Processos Erosivos */}
            <div className="space-y-1.5">
              <label className="block text-xs font-mono text-[#a89279]">
                Processos Erosivos Ativos
              </label>
              <select
                value={formData.erosion}
                onChange={(e) => handleChange('erosion', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Sem erosão evidente">Sem erosão evidente</option>
                <option value="Erosão laminar leve">Erosão laminar leve</option>
                <option value="Sulcos erosivos moderados">Sulcos erosivos moderados</option>
                <option value="Voçoroca ativa / Degradação severa">Voçoroca ativa / Degradação severa</option>
              </select>
            </div>

            {/* Histórico de Uso da Terra */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-[#a89279]">
                Histórico de Uso da Terra
              </label>
              <select
                value={formData.landUseHistory}
                onChange={(e) => handleChange('landUseHistory', e.target.value)}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Pastagem extensiva com compactação">Pastagem extensiva com compactação</option>
                <option value="Agricultura de sequeiro tradicional">Agricultura de sequeiro tradicional</option>
                <option value="Extrativismo de pequi / buriti / macaúba">Extrativismo de pequi / buriti / macaúba</option>
                <option value="Vegetação nativa preservada sem manejo recente">Vegetação nativa preservada sem manejo recente</option>
              </select>
            </div>

            {/* Anotações Complementares */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-[#a89279]">
                Anotações Complementares do Técnico
              </label>
              <textarea
                rows={3}
                value={formData.technicalNotes}
                onChange={(e) => handleChange('technicalNotes', e.target.value)}
                placeholder="Informe detalhes sobre banco de sementes, queimadas recentes, afloramentos rochosos, etc."
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl p-3 text-sm text-[#f7ebd9] placeholder-[#6b5847] focus:outline-none focus:border-[#c4602c] font-sans"
              />
            </div>

          </div>
        </div>

        {/* Botão de Envio do Diagnóstico Multimodal */}
        <div className="pt-4">
          <button
            type="submit"
            className="w-full py-3.5 px-6 rounded-xl bg-[#e05646] hover:bg-[#ef4444] text-[#ffffff] font-bold text-sm sm:text-base tracking-wide transition-all shadow-lg shadow-[#e05646]/20 cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Send className="w-4 h-4" />
            <span>Processar Diagnóstico Multimodal</span>
          </button>
        </div>

      </form>

    </div>
  );
}

export default VeredasMultimodalForm;
