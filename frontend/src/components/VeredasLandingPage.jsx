import React from 'react';

export const VeredasLandingPage = ({ onLaunchApp }) => {
  return (
    <div className="min-h-screen bg-[#1c1712] font-sans text-[#e6d5c3] flex flex-col justify-between">
      {/* Header / Navbar */}
      <header className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-[#3b2d22] z-20 backdrop-blur-md bg-[#1c1712]/80 sticky top-0">
        <div className="flex items-center gap-2 text-[#d17a42] font-semibold tracking-wider text-base sm:text-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-[#d17a42] animate-pulse"></span>
          VEREDAS <span className="text-xs text-[#a69685] font-normal tracking-normal">• Sertão.Unimontes</span>
        </div>
        
        <nav className="hidden md:flex gap-8 text-sm text-[#a69685]">
          <a href="#sobre" className="hover:text-white transition-colors">Sobre</a>
          <a href="#capacidades" className="hover:text-white transition-colors">Capacidades Clínicas</a>
          <a href="#projeto" className="hover:text-white transition-colors">Projeto</a>
        </nav>

        <button 
          onClick={onLaunchApp}
          className="bg-[#c25a30] hover:bg-[#a14823] text-white text-xs sm:text-sm font-medium px-4 sm:px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-[#c25a30]/20 active:scale-95 cursor-pointer flex items-center gap-1.5"
        >
          <span>Experimentar a IA</span>
          <span>↗</span>
        </button>
      </header>

      {/* Hero Section */}
      <main 
        className="relative flex-1 flex flex-col justify-center px-6 sm:px-12 md:px-20 py-24 md:py-36 bg-cover bg-center overflow-hidden" 
        style={{ backgroundImage: "url('/cerrado-veredas.jpg')" }}
      >
        {/* Overlay escuro em degradê para garantir leitura e elegância */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#1c1712] via-[#1c1712]/80 to-[#1c1712]/60"></div>

        <div className="relative z-10 max-w-4xl animate-fade-in">
          <div className="inline-flex items-center border border-[#3b2d22] bg-[#1c1712]/60 backdrop-blur-md text-[#d6c5b3] text-xs uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-8">
            <span className="text-[#c25a30] mr-2 text-base">•</span>
            Inteligência Artificial Brasileira
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold leading-[1.1] text-[#f2e5d0] mb-8 font-serif tracking-tight">
            Inteligência que <br /> nasce do território.
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-[#b3a493] max-w-2xl mb-10 leading-relaxed">
            Uma IA criada no Brasil, conectada ao Cerrado e ao Sertão, desenvolvida para pensar com profundidade, rigor e clareza clínica.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={onLaunchApp}
              className="bg-[#c25a30] hover:bg-[#a14823] text-white px-8 py-4 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#c25a30]/25 active:scale-95 cursor-pointer"
            >
              <span>Experimentar a IA</span>
              <span>→</span>
            </button>
            <a 
              href="#sobre"
              className="border border-[#4a3a2a] bg-[#2a2018]/50 backdrop-blur-sm text-[#d6c5b3] hover:bg-[#2a2018] px-8 py-4 rounded-xl font-medium text-sm transition-colors text-center"
            >
              Conhecer o projeto
            </a>
          </div>
        </div>

        {/* Coordenadas Footer Hero */}
        <div className="relative mt-16 flex flex-wrap justify-between items-center text-[11px] tracking-widest text-[#8c7a6b] uppercase border-t border-[#3b2d22]/80 pt-4 z-10 font-mono">
          <div className="flex flex-wrap gap-4 sm:gap-8">
            <span className="text-[#d17a42]">15°32′S 47°52′O</span>
            <span>PLANALTO CENTRAL</span>
            <span>CERRADO & SERTÃO</span>
            <span>UNIMONTES</span>
          </div>
          <span className="hidden sm:inline text-[#d17a42]">SCROLL ↓</span>
        </div>
      </main>

      {/* Seção Sobre / Capacidades Integradas */}
      <section id="sobre" className="bg-[#18130f] px-6 sm:px-12 md:px-20 py-20 border-t border-[#2e231b]">
        <div className="max-w-6xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-[#d17a42] font-semibold block mb-2 font-mono">
            // ARQUITETURA MULTIAGENTE MedIA
          </span>
          <h2 className="text-2xl sm:text-4xl font-bold text-[#f2e5d0] font-serif mb-6">
            Especialistas clínicos coordenados por raciocínio em rede.
          </h2>
          <p className="text-sm sm:text-base text-[#a69685] max-w-3xl leading-relaxed mb-12">
            O Veredas conecta 8 agentes com skills dedicadas para analisar sintomas, correlacionar exames laboratoriais, calcular probabilidades com fatores de suporte e gerar relatórios médicos estruturados.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-[#231b15] border border-[#3b2d22]">
              <div className="w-8 h-8 rounded-xl bg-[#c25a30]/20 text-[#d17a42] flex items-center justify-center font-bold mb-3">
                01
              </div>
              <h3 className="text-base font-bold text-[#f2e5d0] mb-1">Agente Clínico</h3>
              <p className="text-xs text-[#a69685] leading-relaxed">
                Estrutura sintomas, sinais vitais e histórico sem alucinações.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#231b15] border border-[#3b2d22]">
              <div className="w-8 h-8 rounded-xl bg-[#c25a30]/20 text-[#d17a42] flex items-center justify-center font-bold mb-3">
                02
              </div>
              <h3 className="text-base font-bold text-[#f2e5d0] mb-1">Probabilidade</h3>
              <p className="text-xs text-[#a69685] leading-relaxed">
                Estimativas qualitativas fundamentadas em evidências clínicas.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#231b15] border border-[#3b2d22]">
              <div className="w-8 h-8 rounded-xl bg-[#c25a30]/20 text-[#d17a42] flex items-center justify-center font-bold mb-3">
                03
              </div>
              <h3 className="text-base font-bold text-[#f2e5d0] mb-1">Guardrail de Segurança</h3>
              <p className="text-xs text-[#a69685] leading-relaxed">
                Detecção imediata de sinais de alarme e gravidade de emergência.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#231b15] border border-[#3b2d22]">
              <div className="w-8 h-8 rounded-xl bg-[#c25a30]/20 text-[#d17a42] flex items-center justify-center font-bold mb-3">
                04
              </div>
              <h3 className="text-base font-bold text-[#f2e5d0] mb-1">Relatório Médico</h3>
              <p className="text-xs text-[#a69685] leading-relaxed">
                Documento clínico completo, pronto para prontuário e editável.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onLaunchApp}
              className="bg-[#c25a30] hover:bg-[#a14823] text-white px-8 py-3.5 rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg active:scale-95"
            >
              Acessar Plataforma Completa →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 sm:px-8 py-6 border-t border-[#2e231b] text-center text-xs text-[#6a5a4b] font-mono">
        © 2026 Veredas • Projeto Sertão.Unimontes • Inteligência Artificial Brasileira
      </footer>
    </div>
  );
};

export default VeredasLandingPage;
