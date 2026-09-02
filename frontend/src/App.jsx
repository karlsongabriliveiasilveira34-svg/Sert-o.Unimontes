import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { VeredasLandingPage } from './components/VeredasLandingPage';
import { ChatInterface } from './components/ChatInterface';
import { MapSelector } from './components/MapSelector';
import { CaseInputForm } from './components/clinical/CaseInputForm';
import { ProbabilityCard } from './components/clinical/ProbabilityCard';
import { SafetyAlertsBanner } from './components/clinical/SafetyAlertsBanner';
import { DifferentialList } from './components/clinical/DifferentialList';
import { ExamsAnalysisView } from './components/clinical/ExamsAnalysisView';
import { ClinicalReportView } from './components/clinical/ClinicalReportView';
import { ExplanationModal } from './components/clinical/ExplanationModal';
import { useLocationState } from './hooks/useLocationState';
import { useChat } from './hooks/useChat';
import { fetchSampleCases, orchestrateCase } from './services/api';
import { 
  Stethoscope, 
  Activity, 
  GitBranch, 
  FileText, 
  MessageSquareCode, 
  CheckCircle2, 
  Sparkles,
  ArrowLeft
} from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'app'
  const [activeTab, setActiveTab] = useState('clinical'); // 'clinical' | 'probability' | 'differential' | 'report' | 'chat'
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [sampleCases, setSampleCases] = useState([]);
  const [orchestratedResult, setOrchestratedResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Estado do Modal de Explicação (Por que a IA chegou nisso?)
  const [isExplanationOpen, setIsExplanationOpen] = useState(false);
  const [selectedHypothesisForExplanation, setSelectedHypothesisForExplanation] = useState(null);

  // Hooks de Localização e Chat técnico
  const { locations, selectedLocation, setSelectedLocation } = useLocationState();
  const { messages, isLoading: isChatLoading, currentAgent, send, clearChat } = useChat(selectedLocation);

  // Carrega casos modelo e executa análise inicial em background
  useEffect(() => {
    fetchSampleCases()
      .then(cases => {
        if (cases && cases.length > 0) {
          setSampleCases(cases);
          orchestrateCase(cases[0].data)
            .then(res => setOrchestratedResult(res))
            .catch(err => console.error(err));
        }
      })
      .catch(err => console.error('Erro ao carregar casos:', err));
  }, []);

  const handleAnalyzeCase = async (caseData) => {
    setIsAnalyzing(true);
    try {
      const result = await orchestrateCase(caseData);
      setOrchestratedResult(result);
      if (activeTab === 'clinical') {
        setActiveTab('probability');
      }
    } catch (err) {
      console.error('Erro ao orquestrar caso clínico:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleOpenExplanation = (hypothesisName) => {
    setSelectedHypothesisForExplanation(hypothesisName);
    setIsExplanationOpen(true);
  };

  // Se estiver na tela inicial Veredas
  if (currentView === 'landing') {
    return <VeredasLandingPage onLaunchApp={() => setCurrentView('app')} />;
  }

  // Se estiver na Plataforma de IA Clínica / Front-End
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#1c1712] text-[#e6d5c3]">
      
      {/* Header Superior Integrado */}
      <Header
        currentAgent={currentAgent}
        selectedLocation={selectedLocation}
        onToggleMap={() => setIsMapOpen(prev => !prev)}
        isMapOpen={isMapOpen}
        onGoHome={() => setCurrentView('landing')}
      />

      {/* Barra de Navegação das Telas MedIA (Design System Veredas) */}
      <nav className="glass-panel border-b border-[#3b2d22] px-4 py-2.5 z-30 bg-[#1c1712]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto no-scrollbar gap-2">
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'clinical'
                  ? 'bg-[#c25a30]/30 text-[#f2e5d0] border border-[#d17a42] shadow-sm'
                  : 'text-[#a69685] hover:text-[#f2e5d0] hover:bg-[#2a2018]'
              }`}
            >
              <Stethoscope className="w-4 h-4 text-[#d17a42]" />
              <span>Consulta Clínica</span>
            </button>

            <button
              onClick={() => setActiveTab('probability')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all relative ${
                activeTab === 'probability'
                  ? 'bg-[#c25a30]/30 text-[#f2e5d0] border border-[#d17a42] shadow-sm'
                  : 'text-[#a69685] hover:text-[#f2e5d0] hover:bg-[#2a2018]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#d17a42]" />
              <span>Probabilidade & Alertas</span>
              {orchestratedResult?.safety?.severity === 'critical' && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute top-1 right-1" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('differential')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'differential'
                  ? 'bg-[#c25a30]/30 text-[#f2e5d0] border border-[#d17a42] shadow-sm'
                  : 'text-[#a69685] hover:text-[#f2e5d0] hover:bg-[#2a2018]'
              }`}
            >
              <GitBranch className="w-4 h-4 text-[#d17a42]" />
              <span>Diagnóstico Diferencial & Exames</span>
            </button>

            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'report'
                  ? 'bg-[#c25a30]/30 text-[#f2e5d0] border border-[#d17a42] shadow-sm'
                  : 'text-[#a69685] hover:text-[#f2e5d0] hover:bg-[#2a2018]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#d17a42]" />
              <span>Relatório Médico</span>
            </button>
          </div>

          {/* Atalho para o Chat com os Agentes Front-End */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'chat'
                  ? 'bg-[#c25a30] text-white shadow-md'
                  : 'bg-[#2a2018] text-[#d6c5b3] hover:text-white border border-[#3b2d22]'
              }`}
            >
              <MessageSquareCode className="w-3.5 h-3.5 text-[#d17a42]" />
              <span>Chat de Engenharia (IA Front-End)</span>
            </button>
          </div>

        </div>
      </nav>

      {/* Conteúdo Principal Dinâmico */}
      <div className="flex-1 flex overflow-hidden relative">
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          
          {/* TAB 1: CONSULTA CLÍNICA */}
          {activeTab === 'clinical' && (
            <div className="space-y-6 animate-fade-in">
              <CaseInputForm
                sampleCases={sampleCases}
                onAnalyze={handleAnalyzeCase}
                isLoading={isAnalyzing}
              />

              {orchestratedResult && (
                <div className="glass-panel rounded-2xl p-5 border border-[#3b2d22]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs uppercase tracking-wider font-bold text-[#d17a42] flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      Síntese Estruturada do Agente Clínico
                    </h3>
                    <button
                      onClick={() => setActiveTab('probability')}
                      className="text-xs text-[#d17a42] hover:underline font-semibold"
                    >
                      Ver Análise de Probabilidades →
                    </button>
                  </div>
                  <p className="text-xs text-[#e6d5c3] leading-relaxed mb-3">
                    {orchestratedResult.clinical?.summary}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {orchestratedResult.clinical?.clinical_problems?.map((prob, i) => (
                      <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-[#2a2018] border border-[#3b2d22] text-[#d17a42]">
                        {prob}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PROBABILIDADE CLÍNICA & ALERTAS */}
          {activeTab === 'probability' && (
            <div className="space-y-6 animate-fade-in">
              {/* Guardrail de Segurança Clínica */}
              {orchestratedResult?.safety && (
                <SafetyAlertsBanner safety={orchestratedResult.safety} />
              )}

              {/* Seção das Barras de Probabilidade */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-bold text-[#f2e5d0] flex items-center gap-2">
                      <Activity className="w-5 h-5 text-[#d17a42]" />
                      Estimativa de Probabilidade Clínica (Agente de Probabilidade)
                    </h2>
                    <p className="text-xs text-[#a69685]">
                      Compatibilidade qualitativa fundamentada em achados objetivos e correlações clínicas
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('clinical')}
                    className="text-xs text-[#a69685] hover:text-white underline"
                  >
                    Alterar dados do caso
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {orchestratedResult?.probability?.results?.map((item, idx) => (
                    <ProbabilityCard
                      key={idx}
                      item={item}
                      onExplain={handleOpenExplanation}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNÓSTICO DIFERENCIAL & EXAMES */}
          {activeTab === 'differential' && (
            <div className="space-y-6 animate-fade-in">
              {orchestratedResult?.differential && (
                <DifferentialList differential={orchestratedResult.differential} />
              )}

              {orchestratedResult?.exams && (
                <ExamsAnalysisView exams={orchestratedResult.exams} />
              )}
            </div>
          )}

          {/* TAB 4: RELATÓRIO MÉDICO ESTRUTURADO */}
          {activeTab === 'report' && (
            <div className="animate-fade-in">
              {orchestratedResult?.report ? (
                <ClinicalReportView report={orchestratedResult.report} />
              ) : (
                <div className="glass-panel p-8 text-center text-[#a69685] rounded-2xl">
                  Nenhum caso analisado ainda. Volte para a aba "Consulta Clínica" para iniciar.
                </div>
              )}
            </div>
          )}

          {/* TAB 5: CHAT DE ENGENHARIA / FRONTEND */}
          {activeTab === 'chat' && (
            <div className="h-[calc(100vh-140px)] rounded-2xl overflow-hidden glass-panel border border-[#3b2d22] shadow-2xl flex flex-col animate-fade-in">
              <ChatInterface
                messages={messages}
                isLoading={isChatLoading}
                currentAgent={currentAgent}
                selectedLocation={selectedLocation}
                onSendMessage={send}
                onClearChat={clearChat}
              />
            </div>
          )}

        </main>

        {/* Painel Lateral Geográfico com o Mapa (quando aberto) */}
        {isMapOpen && (
          <aside className="w-full sm:w-96 md:w-[420px] lg:w-[460px] h-full shrink-0 z-40 transition-all duration-300 absolute sm:relative right-0 top-0">
            <MapSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={loc => setSelectedLocation(loc)}
              onClose={() => setIsMapOpen(false)}
            />
          </aside>
        )}

      </div>

      {/* Modal de Explicação do Agente de Explicação */}
      <ExplanationModal
        isOpen={isExplanationOpen}
        onClose={() => setIsExplanationOpen(false)}
        explanation={orchestratedResult?.explanation}
        hypothesisTitle={selectedHypothesisForExplanation}
      />

    </div>
  );
}

export default App;
