import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Layers, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Compass, 
  TreePine, 
  Maximize2, 
  Download,
  Info,
  Satellite,
  Mountain
} from 'lucide-react';

export function ErosionSegmentationViewer({ analysisData, onScenarioChange, uploadedImageUrl }) {
  const [activeLayers, setActiveLayers] = useState({
    vegetacao: true,
    solo_exposto: true,
    pastagem: true,
    erosao: true
  });
  const [maskOpacity, setMaskOpacity] = useState(0.55);
  const [showOriginalOnly, setShowOriginalOnly] = useState(false);

  if (!analysisData) return null;

  const {
    modelo_segmentacao,
    localizacao,
    cenario_id,
    composicao_paisagem_pct = {},
    severidade = 'Moderada',
    confianca_modelo_pct = 85.0,
    processing_time_ms,
    tipo_erosao = 'Erosão Hídrica Linear',
    indicios_degradacao = [],
    variaveis_multimodais = {},
    mascara_segmentacao = { poligonos: [] },
    plano_manejo = {}
  } = analysisData;

  const toggleLayer = (key) => {
    setActiveLayers(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Cores temáticas por classe de uso/degradação da terra
  const layerColors = {
    vegetacao: { bg: '#22c55e', border: '#16a34a', label: 'Vegetação Preservada', icon: '🌱' },
    solo_exposto: { bg: '#d97706', border: '#b45309', label: 'Solo Exposto / Compactado', icon: '🟤' },
    pastagem: { bg: '#eab308', border: '#ca8a04', label: 'Pastagem Degradada', icon: '🌾' },
    erosao: { bg: '#ef4444', border: '#dc2626', label: 'Erosão / Voçoroca Ativa', icon: '🕳️' }
  };

  // Converte pontos normalizados (0 a 100) em string para o SVG polygon
  const renderPolygonPoints = (pontos) => {
    return pontos.map(([x, y]) => `${x},${y}`).join(' ');
  };

  return (
    <div className="bg-[#120e0a] border border-[#2d2218] rounded-2xl p-5 sm:p-7 shadow-2xl space-y-6 text-[#e4ceaa] font-sans">
      
      {/* 1. Header do Diagnóstico com Badges do Erosion-SAM */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2d2218]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#c4602c] uppercase font-bold">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>SEGMENTAÇÃO ESPACIAL DE DEGRADAÇÃO & EROSÃO</span>
          </div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-[#f7ebd9] mt-1">
            {tipo_erosao}
          </h3>
          <span className="text-xs font-mono text-[#a89279]">
            {localizacao} &bull; Motor: <span className="text-[#c4602c] font-semibold">{modelo_segmentacao}</span>
          </span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Latência de CPU */}
          {processing_time_ms !== undefined && (
            <div className="px-3 py-1.5 rounded-xl bg-[#161f28] border border-[#254b62] text-xs font-mono text-[#7dd3fc]">
              <span>⚡ <strong className="text-[#38bdf8]">{processing_time_ms}ms</strong> (Ryzen 7735HS)</span>
            </div>
          )}

          {/* Severidade */}
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 ${
            severidade === 'Alta' || severidade === 'Crítica'
              ? 'bg-[#ef4444]/15 border-[#ef4444]/40 text-[#ef4444]'
              : 'bg-[#eab308]/15 border-[#eab308]/40 text-[#eab308]'
          }`}>
            <ShieldAlert className="w-4 h-4" />
            <span>SEVERIDADE {severidade.toUpperCase()}</span>
          </div>

          {/* Confiança */}
          <div className="px-3 py-1.5 rounded-xl bg-[#1a140e] border border-[#2d2218] text-xs font-mono text-[#f7ebd9]">
            <span>Confiança: <strong className="text-[#4ade80]">{confianca_modelo_pct}%</strong></span>
          </div>
        </div>
      </div>

      {/* 2. Seletor de Cenários Rápidos (Montes Claros, Bocaiúva, Januária) */}
      {onScenarioChange && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-mono text-[#a89279]">Cenários de Campo:</span>
          <button
            onClick={() => onScenarioChange('vocoroca-norte-mg')}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              cenario_id === 'vocoroca-norte-mg'
                ? 'bg-[#c4602c]/20 border-[#c4602c] text-[#f7ebd9] font-bold'
                : 'bg-[#18120c] border-[#2d2218] text-[#a89279] hover:text-[#f7ebd9]'
            }`}
          >
            ⛰️ Voçoroca / Vertente (Montes Claros)
          </button>
          <button
            onClick={() => onScenarioChange('pastagem-degradada')}
            className={`px-3 py-1 rounded-lg text-xs font-mono border transition-all cursor-pointer ${
              cenario_id === 'pastagem-degradada'
                ? 'bg-[#c4602c]/20 border-[#c4602c] text-[#f7ebd9] font-bold'
                : 'bg-[#18120c] border-[#2d2218] text-[#a89279] hover:text-[#f7ebd9]'
            }`}
          >
            🐄 Pastagem Degradada / Solo Exposto
          </button>
        </div>
      )}

      {/* 3. Visualizador do Terreno com Máscara Poligonal Interativa (Erosion-SAM) */}
      <div className="relative rounded-2xl overflow-hidden border border-[#2d2218] bg-[#0d0a07] shadow-inner group">
        
        {/* Controles Flutuantes da Imagem (Opacidade e Toggle da Máscara) */}
        <div className="absolute top-3 left-3 right-3 z-30 flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0d0a07]/80 backdrop-blur-md border border-[#2d2218]/80 text-xs font-mono">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowOriginalOnly(prev => !prev)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#18120c] border border-[#2d2218] text-[#e4ceaa] hover:text-[#f7ebd9] transition-all cursor-pointer"
            >
              {showOriginalOnly ? <EyeOff className="w-3.5 h-3.5 text-[#ef4444]" /> : <Eye className="w-3.5 h-3.5 text-[#4ade80]" />}
              <span>{showOriginalOnly ? 'Máscara Desativada' : 'Máscara Erosion-SAM Ativa'}</span>
            </button>

            {!showOriginalOnly && (
              <div className="flex items-center gap-2">
                <span className="text-[#a89279] hidden sm:inline">Opacidade:</span>
                <input
                  type="range"
                  min="0.1"
                  max="0.95"
                  step="0.05"
                  value={maskOpacity}
                  onChange={(e) => setMaskOpacity(parseFloat(e.target.value))}
                  className="w-20 sm:w-28 accent-[#c4602c] cursor-pointer"
                />
                <span className="text-[#f7ebd9]">{Math.round(maskOpacity * 100)}%</span>
              </div>
            )}
          </div>

          <span className="text-[10px] tracking-wider text-[#a89279] uppercase hidden md:inline">
            Delimitação Vetorial em Nível de Pixel
          </span>
        </div>

        {/* Fundo da Paisagem Simulada (Gradientes e Texturas Topográficas do Cerrado) */}
        <div className="w-full h-80 sm:h-96 relative flex items-center justify-center overflow-hidden">
          
          {/* Base da imagem do terreno */}
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center transition-all duration-300"
            style={{
              backgroundImage: uploadedImageUrl
                ? `url(${uploadedImageUrl})`
                : cenario_id === 'vocoroca-norte-mg'
                  ? 'radial-gradient(ellipse at 40% 60%, #54371f 0%, #302014 45%, #181c12 90%)'
                  : 'radial-gradient(ellipse at 50% 50%, #42301c 0%, #291e13 50%, #1a2414 95%)',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {/* Linhas topográficas e feições de terreno */}
            <svg className="w-full h-full opacity-35" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M0,20 Q30,10 60,25 T100,20" fill="none" stroke="#22c55e" strokeWidth="0.5" strokeDasharray="1,1" />
              <path d="M0,45 Q40,35 70,55 T100,50" fill="none" stroke="#d97706" strokeWidth="0.5" />
              <path d="M35,45 L42,42 L58,65 L62,85 L50,92 L41,78 Z" fill="#2d170f" opacity="0.6" />
              <path d="M40,50 Q48,70 55,90" fill="none" stroke="#1f0e08" strokeWidth="1.5" />
              <path d="M42,55 Q50,75 52,90" fill="none" stroke="#1f0e08" strokeWidth="1" />
            </svg>
          </div>

          {/* Sobreposição de Máscaras Poligonais Interativas (Erosion-SAM) */}
          {!showOriginalOnly && (
            <svg 
              className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-200" 
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
              style={{ opacity: maskOpacity }}
            >
              {mascara_segmentacao.poligonos.map((poly) => {
                if (!activeLayers[poly.classe]) return null;
                const isErosion = poly.classe === 'erosao';

                return (
                  <g key={poly.id} className="cursor-pointer pointer-events-auto">
                    <polygon
                      points={renderPolygonPoints(poly.pontos)}
                      fill={poly.cor}
                      stroke={poly.cor}
                      strokeWidth={isErosion ? "1.2" : "0.5"}
                      strokeDasharray={isErosion ? "1.5,1.5" : "none"}
                      fillOpacity={isErosion ? "0.65" : "0.45"}
                      className={isErosion ? "animate-pulse transition-all hover:fill-opacity-80" : "transition-all hover:fill-opacity-65"}
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Marcador e Rótulo Flutuante no Centro da Voçoroca / Foco Erosivo */}
          {!showOriginalOnly && activeLayers.erosao && (
            <div className="absolute top-[65%] left-[50%] -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center animate-bounce">
              <div className="px-3 py-1 rounded-full bg-[#ef4444] text-[#fff] text-[10px] font-mono font-bold tracking-wider shadow-lg flex items-center gap-1.5 border border-white/20">
                <ShieldAlert className="w-3 h-3" />
                <span>FOCO EROSIVO DELIMITADO ({composicao_paisagem_pct.erosao_ativa || 8.7}%)</span>
              </div>
              <div className="w-1.5 h-3 bg-[#ef4444]" />
            </div>
          )}

        </div>

        {/* Barra Inferior com Toggles das Camadas de Cobertura da Terra */}
        <div className="p-3 sm:p-4 bg-[#140f0a] border-t border-[#2d2218] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="text-[#a89279]">Camadas de Detecção:</span>
          
          <div className="flex flex-wrap items-center gap-2">
            {Object.entries(layerColors).map(([key, config]) => {
              const isActive = activeLayers[key];
              const pct = composicao_paisagem_pct[key === 'vegetacao' ? 'vegetacao_preservada' : key === 'solo_exposto' ? 'solo_exposto' : key === 'pastagem' ? 'pastagem_degradada' : 'erosao_ativa'] || 0;

              return (
                <button
                  key={key}
                  onClick={() => toggleLayer(key)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#1e1710] text-[#f7ebd9] border-[#c4602c]'
                      : 'bg-[#120e0a] text-[#a89279] border-[#2d2218] opacity-50 hover:opacity-80'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: config.bg }} />
                  <span>{config.icon} {config.label}</span>
                  <strong className="text-[#f7ebd9] font-mono">({pct}%)</strong>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Quadro de Composição da Paisagem e Breakdown Percentual */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-mono text-[#a89279]">
          <span>COMPOSIÇÃO E PROPORÇÃO ESPACIAL DA PAISAGEM</span>
          <span className="text-[#f7ebd9]">100% Gleba Analisada</span>
        </div>

        {/* Barra de Progresso Dividida */}
        <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#1a140e] border border-[#2d2218]">
          <div 
            style={{ width: `${composicao_paisagem_pct.vegetacao_preservada || 44.5}%` }} 
            className="bg-[#22c55e] h-full transition-all duration-500" 
            title={`Vegetação Preservada: ${composicao_paisagem_pct.vegetacao_preservada || 44.5}%`} 
          />
          <div 
            style={{ width: `${composicao_paisagem_pct.solo_exposto || 28.3}%` }} 
            className="bg-[#d97706] h-full transition-all duration-500" 
            title={`Solo Exposto: ${composicao_paisagem_pct.solo_exposto || 28.3}%`} 
          />
          <div 
            style={{ width: `${composicao_paisagem_pct.pastagem_degradada || 18.5}%` }} 
            className="bg-[#eab308] h-full transition-all duration-500" 
            title={`Pastagem Degradada: ${composicao_paisagem_pct.pastagem_degradada || 18.5}%`} 
          />
          <div 
            style={{ width: `${composicao_paisagem_pct.erosao_ativa || 8.7}%` }} 
            className="bg-[#ef4444] h-full transition-all duration-500 animate-pulse" 
            title={`Erosão / Voçoroca Ativa: ${composicao_paisagem_pct.erosao_ativa || 8.7}%`} 
          />
        </div>

        {/* Badges de Indícios de Degradação */}
        <div className="pt-2">
          <span className="text-xs font-mono text-[#a89279] block mb-2">Indícios Identificados na Imagem:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {indicios_degradacao.map((indicio, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#18120c] border border-[#2d2218] text-xs font-mono text-[#f7ebd9]">
                <CheckCircle2 className="w-4 h-4 text-[#c4602c] flex-shrink-0" />
                <span>{indicio}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Matriz de Fusão Multimodal (Visão do Solo + Satélite + Relevo) */}
      <div className="border-t border-[#2d2218] pt-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono text-[#c4602c] uppercase tracking-wider font-bold">
          <Satellite className="w-4 h-4" />
          <span>FUSÃO MULTIMODAL: IMAGEM + SENTINEL-2 + MDE</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Card NDVI */}
          <div className="p-3.5 rounded-xl bg-[#18120c] border border-[#2d2218]">
            <span className="text-[10px] font-mono text-[#a89279] uppercase block">NDVI Médio (Sentinel-2)</span>
            <div className="text-xl font-bold font-mono text-[#f7ebd9] mt-1 flex items-baseline gap-2">
              <span>{variaveis_multimodais.ndvi_sentinel2 || 0.28}</span>
              <span className="text-xs font-normal text-[#ef4444]">Vigor Baixo</span>
            </div>
            <span className="text-[11px] text-[#a89279] mt-1 block">Estresse hídrico e desfolha sazonal</span>
          </div>

          {/* Card Declividade MDE */}
          <div className="p-3.5 rounded-xl bg-[#18120c] border border-[#2d2218]">
            <span className="text-[10px] font-mono text-[#a89279] uppercase block">Declividade do MDE</span>
            <div className="text-xl font-bold font-mono text-[#f7ebd9] mt-1 flex items-baseline gap-2">
              <span>{variaveis_multimodais.declividade_mde || 7.5}%</span>
              <span className="text-xs font-normal text-[#eab308]">Suave-Ondulado</span>
            </div>
            <span className="text-[11px] text-[#a89279] mt-1 block">Propício a escorrimento superficial</span>
          </div>

          {/* Card Bioma */}
          <div className="p-3.5 rounded-xl bg-[#18120c] border border-[#2d2218]">
            <span className="text-[10px] font-mono text-[#a89279] uppercase block">Domínio Bioclimático</span>
            <div className="text-sm font-bold font-mono text-[#f7ebd9] mt-1">
              Cerrado & Semiárido
            </div>
            <span className="text-[11px] text-[#a89279] mt-1 block">SUDENE-MG (Solos com fragilidade erodível)</span>
          </div>
        </div>
      </div>

      {/* 6. Plano de Manejo e Prescrição Ecológica da Unimontes */}
      {plano_manejo && (
        <div className="border-t border-[#2d2218] pt-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono text-[#22c55e] uppercase tracking-wider font-bold">
            <TreePine className="w-4 h-4" />
            <span>PLANO DE MANEJO & RESTAURAÇÃO ECOLÓGICA (UNIMONTES)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Ações Mecânicas */}
            <div className="p-4 rounded-xl bg-[#16120e] border border-[#3b2b1e] space-y-2">
              <span className="text-xs font-mono font-bold text-[#c4602c] uppercase flex items-center gap-1.5">
                <span>⚙️ Intervenção Mecânica / Hidrotécnica:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-[#e4ceaa] font-sans leading-relaxed">
                {(plano_manejo.acoes_mecanicas || []).map((acao, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#c4602c] font-bold">&bull;</span>
                    <span>{acao}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ações Biológicas */}
            <div className="p-4 rounded-xl bg-[#131b11] border border-[#294224] space-y-2">
              <span className="text-xs font-mono font-bold text-[#22c55e] uppercase flex items-center gap-1.5">
                <span>🌱 Intervenção Biológica & Regeneração:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-[#e4ceaa] font-sans leading-relaxed">
                {(plano_manejo.acoes_biologicas || []).map((acao, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-[#22c55e] font-bold">&bull;</span>
                    <span>{acao}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {plano_manejo.cronograma_estimado && (
            <div className="text-xs font-mono text-[#a89279] flex items-center justify-between p-3 rounded-xl bg-[#18120c] border border-[#2d2218]">
              <span>Tempo Estimado de Estabilização Hidrológica:</span>
              <strong className="text-[#f7ebd9]">{plano_manejo.cronograma_estimado}</strong>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
