import React, { useState, useEffect, useRef } from 'react';
import { 
  Sliders, 
  Satellite, 
  MapPin, 
  AlertCircle, 
  FileText, 
  Send, 
  X, 
  Layers, 
  Activity, 
  Sparkles,
  Camera,
  ShieldAlert,
  Upload,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import { ErosionSegmentationViewer } from './ErosionSegmentationViewer';
import { analyzeDegradation, segmentErosionImage } from '../services/api';

export function VeredasMultimodalForm({ onSubmitDiagnosis, onClose }) {
  const [formData, setFormData] = useState({
    scenario_id: 'vocoroca-norte-mg',
    ndvi: 0.28,
    slope: 'Suave Ondulado (3 a 8%)',
    slopeValue: 7.5,
    seasonality: 'Período Seco / Estiagem (Abril a Setembro)',
    location: 'Gleba Piloto - Vertente Bacia do Verde Grande (Montes Claros - SUDENE)',
    invasiveSpecies: 'Moderada (15 a 45% Braquiária)',
    soilType: 'Latossolo Vermelho-Amarelo com Horizonte Arenoso',
    waterProximity: 'Vereda / Buritizal (< 500m)',
    erosion: 'Voçoroca ativa / Degradação severa',
    landUseHistory: 'Pastagem extensiva com compactação',
    technicalNotes: 'Foco erosivo acelerado por escorrimento de estrada vicinal superior.'
  });

  const [degradationData, setDegradationData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Carrega análise de degradação e segmentação Erosion-SAM
  const loadAnalysis = async (scenarioId, ndviVal, slopeVal) => {
    setIsLoadingAnalysis(true);
    try {
      const data = await analyzeDegradation({
        scenario_id: scenarioId || formData.scenario_id,
        ndvi: ndviVal !== undefined ? ndviVal : formData.ndvi,
        slope_value: slopeVal !== undefined ? slopeVal : formData.slopeValue,
        location: formData.location
      });
      if (data && data.status === 'success') {
        setDegradationData(data);
      }
    } catch (err) {
      console.warn('Erro ao consultar backend Django, usando motor de segmentação local:', err);
      // Fallback local do Erosion-SAM
      setDegradationData({
        status: 'success',
        modelo_segmentacao: 'Erosion-SAM v1.2 (ViT-H Local Mock)',
        localizacao: formData.location,
        cenario_id: scenarioId || formData.scenario_id,
        composicao_paisagem_pct: (scenarioId === 'vocoroca-norte-mg') ? {
          vegetacao_preservada: 44.5,
          solo_exposto: 28.3,
          pastagem_degradada: 18.5,
          erosao_ativa: 8.7
        } : {
          vegetacao_preservada: 54.0,
          solo_exposto: 23.0,
          pastagem_degradada: 18.0,
          erosao_ativa: 5.0
        },
        severidade: (scenarioId === 'vocoroca-norte-mg') ? 'Alta' : 'Moderada',
        confianca_modelo_pct: 88.5,
        tipo_erosao: (scenarioId === 'vocoroca-norte-mg') 
          ? 'Erosão Hídrica Linear (Ravinas e Voçoroca Inicial)' 
          : 'Erosão Laminar e Compactação por Pisoteio',
        indicios_degradacao: [
          'Solo exposto com crosta de selamento e compactação',
          'Erosão linear ativa em processo de avanço na vertente',
          'Baixo vigor vegetal (NDVI = ' + formData.ndvi + ')',
          'Risco de assoreamento para a microbacia hidrográfica'
        ],
        variaveis_multimodais: {
          ndvi_sentinel2: formData.ndvi,
          declividade_mde: formData.slopeValue,
          classificacao_relevo: formData.slope,
          bioma_referencia: 'Cerrado & Semiárido Mineiro'
        },
        mascara_segmentacao: {
          largura_referencia: 100,
          altura_referencia: 100,
          poligonos: (scenarioId === 'vocoroca-norte-mg') ? [
            { id: "mask-erosao-1", classe: "erosao", label: "Voçoroca / Foco Erosivo Ativo", cor: "#ef4444", area_pct: 8.7, pontos: [[35, 45], [42, 42], [58, 65], [62, 85], [50, 92], [41, 78], [33, 58]] },
            { id: "mask-solo-1", classe: "solo_exposto", label: "Solo Exposto e Compactado", cor: "#d97706", area_pct: 28.3, pontos: [[20, 30], [35, 40], [45, 60], [30, 80], [15, 65], [12, 45]] },
            { id: "mask-pasto-1", classe: "pastagem", label: "Pastagem Degradada / Braquiária", cor: "#eab308", area_pct: 18.5, pontos: [[55, 20], [80, 25], [88, 55], [70, 60], [58, 40]] },
            { id: "mask-veg-1", classe: "vegetacao", label: "Cerrado / Vegetação Arbustiva Preservada", cor: "#22c55e", area_pct: 44.5, pontos: [[5, 5], [95, 5], [95, 25], [60, 20], [10, 25]] }
          ] : [
            { id: "mask-erosao-2", classe: "erosao", label: "Erosão Laminar Concentrada", cor: "#ef4444", area_pct: 5.0, pontos: [[45, 50], [55, 48], [60, 68], [48, 72]] },
            { id: "mask-solo-2", classe: "solo_exposto", label: "Solo Exposto / Selado", cor: "#d97706", area_pct: 23.0, pontos: [[25, 35], [45, 45], [40, 75], [20, 65]] },
            { id: "mask-pasto-2", classe: "pastagem", label: "Pastagem Rala / Degradação", cor: "#eab308", area_pct: 18.0, pontos: [[60, 30], [85, 35], [80, 70], [55, 60]] },
            { id: "mask-veg-2", classe: "vegetacao", label: "Vegetação Preservada", cor: "#22c55e", area_pct: 54.0, pontos: [[10, 10], [90, 10], [90, 30], [10, 30]] }
          ]
        },
        plano_manejo: {
          acoes_mecanicas: [
            "Paliçadas de biomassa e madeira nos vértices de escorrimento",
            "Bacias de acumulação de enxurrada (barraginhas) no topo do declive",
            "Curvas de nível em desnível zero"
          ],
          acoes_biologicas: [
            "Hidrossemeadura de leguminosas (Crotalária + Feijão-de-porco)",
            "Plantio de espécies pioneiras nativas (Pequi, Baru, Angico)",
            "Cercamento de veredas para proteção de nascentes"
          ],
          cronograma_estimado: "12 a 18 meses para estabilização"
        }
      });
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  useEffect(() => {
    loadAnalysis('vocoroca-norte-mg', 0.28, 7.5);
  }, []);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'ndvi') {
        loadAnalysis(updated.scenario_id, parseFloat(value) || 0, updated.slopeValue);
      }
      return updated;
    });
  };

  const handleScenarioChange = (scenarioId) => {
    const isVocoroca = scenarioId === 'vocoroca-norte-mg';
    setFormData(prev => ({
      ...prev,
      scenario_id: scenarioId,
      ndvi: isVocoroca ? 0.28 : 0.38,
      slope: isVocoroca ? 'Suave Ondulado (3 a 8%)' : 'Plano (0 a 3%)',
      slopeValue: isVocoroca ? 7.5 : 2.5,
      erosion: isVocoroca ? 'Voçoroca ativa / Degradação severa' : 'Erosão laminar leve',
      location: isVocoroca 
        ? 'Gleba Piloto - Vertente Bacia do Verde Grande (Montes Claros - SUDENE)'
        : 'Fazenda Sertão - Pastagem Antiga (Bocaiúva - SUDENE)'
    }));
    loadAnalysis(scenarioId, isVocoroca ? 0.28 : 0.38, isVocoroca ? 7.5 : 2.5);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setUploadedImageUrl(previewUrl);
    setIsUploading(true);

    try {
      const uploadData = new FormData();
      uploadData.append('image', file);
      uploadData.append('scenario', formData.scenario_id);
      uploadData.append('ndvi', formData.ndvi.toString());
      uploadData.append('slope', formData.slopeValue.toString());

      const res = await segmentErosionImage(uploadData);
      if (res && res.status === 'success') {
        setDegradationData(res);
      }
    } catch (err) {
      console.warn('Erro ao processar imagem no endpoint segment:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Formata o prompt estruturado de diagnóstico multimodal
    const formattedQuery = `[DIAGNÓSTICO MULTIMODAL DE DEGRADAÇÃO & EROSÃO ESPACIAL]
📍 Local / Região SUDENE: ${formData.location}

🛰️ 1. DADOS DE SENSORIAMENTO REMOTO (Sentinel-2 / MDE):
- NDVI Médio da Gleba: ${formData.ndvi}
- Declividade e Relevo: ${formData.slope}
- Sazonalidade: ${formData.seasonality}

📱 2. PARÂMETROS DE CAMPO (Inspeção / App Mobile):
- Infestação de Invasoras: ${formData.invasiveSpecies}
- Pedologia Visual: ${formData.soilType}
- Recursos Hídricos / Proximidade: ${formData.waterProximity}
- Processos Erosivos: ${formData.erosion}
- Histórico de Uso: ${formData.landUseHistory}
${formData.technicalNotes ? `- Anotações Complementares: ${formData.technicalNotes}` : ''}

🔬 3. SEGMENTAÇÃO EROSION-SAM:
- Modelo: ${degradationData?.modelo_segmentacao || 'Erosion-SAM v1.2'}
- Severidade: ${degradationData?.severidade || 'Alta'}
- Cobertura Vegetal: ${degradationData?.composicao_paisagem_pct?.vegetacao_preservada || 44.5}%
- Solo Exposto: ${degradationData?.composicao_paisagem_pct?.solo_exposto || 28.3}%
- Pastagem Degradada: ${degradationData?.composicao_paisagem_pct?.pastagem_degradada || 18.5}%
- Área com Erosão Ativa: ${degradationData?.composicao_paisagem_pct?.erosao_ativa || 8.7}%
${degradationData?.processing_time_ms !== undefined ? `- Tempo de Inferência no Ryzen 7735HS: ${degradationData.processing_time_ms}ms` : ''}

Por favor, elabore o parecer técnico de engenharia ecológica, detalhando o enquadramento na bacia hidrográfica e o Plano de Manejo Restaurador.`;

    onSubmitDiagnosis(formattedQuery, formData, degradationData);
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
          <span>Módulo de Geointeligência e Restauração Territorial</span>
        </div>
        <h2 className="font-display text-xl sm:text-2xl font-bold text-[#f7ebd9]">
          Diagnóstico de Degradação da Terra & Delimitação de Erosão
        </h2>
        <p className="text-xs sm:text-sm text-[#a89279] mt-1">
          Fusão Multimodal: Imagem de Terreno (Erosion-SAM) + Sensoriamento Orbital (Sentinel-2) + Altimetria (MDE) + Parâmetros de Campo.
        </p>
      </div>

      {/* SEÇÃO DE ENTRADA VISUAL: Erosion-SAM Interactive Viewer */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[#f7ebd9] font-mono text-xs uppercase tracking-wider font-bold border-l-2 border-[#ef4444] pl-2">
            <Camera className="w-4 h-4 text-[#ef4444]" />
            <span>Detecção & Delimitação Espacial de Erosão (Erosion-SAM)</span>
          </div>

          <div className="flex items-center gap-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#1e1710] border border-[#c4602c] text-xs font-mono text-[#f7ebd9] hover:bg-[#2d2218] transition-all cursor-pointer shadow-md active:scale-95"
            >
              <Upload className="w-3.5 h-3.5 text-[#c4602c]" />
              <span>{isUploading ? 'Processando no Ryzen...' : uploadedImageUrl ? 'Trocar Foto de Drone / Campo' : 'Upload Foto de Drone / Campo'}</span>
            </button>
          </div>
        </div>

        {degradationData && (
          <ErosionSegmentationViewer 
            analysisData={degradationData} 
            onScenarioChange={handleScenarioChange}
            uploadedImageUrl={uploadedImageUrl}
          />
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 pt-4 border-t border-[#2d2218]">
        
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
                Declividade e Relevo (MDE)
              </label>
              <select
                value={formData.slope}
                onChange={(e) => {
                  const val = e.target.value;
                  const numeric = val.includes('3 a 8') ? 7.5 : val.includes('8 a 20') ? 14 : val.includes('> 20') ? 25 : 2.0;
                  setFormData(prev => ({ ...prev, slope: val, slopeValue: numeric }));
                  loadAnalysis(formData.scenario_id, formData.ndvi, numeric);
                }}
                className="w-full bg-[#18120c] border border-[#2d2218] rounded-xl px-3 py-2 text-sm text-[#f7ebd9] focus:outline-none focus:border-[#c4602c]"
              >
                <option value="Plano (0 a 3%)">Plano (0 a 3%)</option>
                <option value="Suave Ondulado (3 a 8%)">Suave Ondulado (3 a 8%)</option>
                <option value="Ondulado (8 a 20%)">Ondulado (8 a 20%)</option>
                <option value="Forte Ondulado (> 20%)">Forte Ondulado (&gt; 20%)</option>
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
            <span>2. Parâmetros de Campo (Inspeção & Território SUDENE-MG)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Identificação da Propriedade / Município */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="block text-xs font-mono text-[#a89279]">
                Identificação da Propriedade / Município (Amostra 25 Cidades)
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="Ex: Gleba Piloto - Vertente Bacia do Verde Grande (Montes Claros - SUDENE)"
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
                <option value="Moderada (15 a 45% Braquiária)">Moderada (15 a 45% Braquiária)</option>
                <option value="Severa (> 45% Braquiária Senescente)">Severa (&gt; 45% Braquiária Senescente)</option>
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
                <option value="Latossolo Vermelho-Amarelo com Horizonte Arenoso">Latossolo Vermelho-Amarelo com Horizonte Arenoso</option>
                <option value="Neossolo Quartzarênico (Alta Suscetibilidade à Erosão)">Neossolo Quartzarênico (Alta Suscetibilidade à Erosão)</option>
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
            <span>Emitir Diagnóstico & Plano de Manejo com Erosion-SAM</span>
          </button>
        </div>

      </form>

    </div>
  );
}

export default VeredasMultimodalForm;
