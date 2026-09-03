import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { VeredasSymbol } from './VeredasSymbol';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function VeredasLandingPage({ onLaunchChat }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const particleCanvasRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Configuração do ScrollTrigger Pinned Master Timeline
  useEffect(() => {
    const container = containerRef.current;
    const stage = stageRef.current;
    if (!container || !stage) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: 'bottom bottom',
        pin: stage,
        scrub: 1,
        onUpdate: (self) => {
          setScrollProgress(self.progress);
        }
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Sistema de Partículas Vivas em Canvas (Sementes e esporos flutuando ao vento)
  useEffect(() => {
    const canvas = particleCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.8,
      speedX: Math.random() * 0.5 + 0.2,
      speedY: Math.random() * 0.4 - 0.2,
      opacity: Math.random() * 0.4 + 0.2,
      pulse: Math.random() * Math.PI
    }));

    let animId;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        if (p.x > width) p.x = 0;
        if (p.y > height) p.y = 0;
        if (p.y < 0) p.y = height;

        const currentOpacity = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(228, 206, 170, ${currentOpacity})`;
        ctx.shadowBlur = 4;
        ctx.shadowColor = 'rgba(196, 96, 44, 0.4)';
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Cálculo de opacidade e escala para cross-dissolve cinematográfico entre cenas do filme
  const getLayerStyle = (start, peak, end, maxScale = 1.18) => {
    let opacity = 0;
    let scale = 1.0;
    if (scrollProgress >= start && scrollProgress <= end) {
      if (scrollProgress <= peak) {
        const t = (scrollProgress - start) / (peak - start || 0.01);
        opacity = t;
        scale = 1.0 + t * (maxScale - 1.0) * 0.5;
      } else {
        const t = (scrollProgress - peak) / (end - peak || 0.01);
        opacity = 1 - t;
        scale = 1.0 + 0.5 * (maxScale - 1.0) + t * (maxScale - 1.0) * 0.5;
      }
    }
    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      transform: `scale(${scale})`,
      pointerEvents: opacity > 0.4 ? 'auto' : 'none',
      visibility: opacity > 0.01 ? 'visible' : 'hidden',
    };
  };

  return (
    <div 
      ref={containerRef} 
      className="relative bg-[#0d0a07] text-[#e4ceaa] select-none"
      style={{ height: '550vh' }}
    >
      {/* ========================================================================= */}
      {/* PALCO FIXO EM TELA CHEIA (PINNED STAGE GERENCIADO POR GSAP)               */}
      {/* ========================================================================= */}
      <div 
        ref={stageRef}
        className="fixed top-0 left-0 w-screen h-screen overflow-hidden bg-[#0d0a07]"
      >
        
        {/* ===================================================================== */}
        {/* CAMADAS VISUAIS DO DOCUMENTÁRIO (6 CENAS EM CROSS-DISSOLVE SUAVE)     */}
        {/* ===================================================================== */}

        {/* CENA 1: O TERRITÓRIO (Planalto do Cerrado ao Entardecer) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/cerrado-veredas.jpg')",
            ...getLayerStyle(0.00, 0.08, 0.22, 1.25)
          }}
        />

        {/* CENA 2: AS VEREDAS & OÁSIS HÍDRICO (Curso d'água cristalino e buritis) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/vereda-stream.jpg')",
            ...getLayerStyle(0.18, 0.27, 0.40, 1.22)
          }}
        />

        {/* CENA 3: A FLORA (Ipê-amarelo e texturas do cerrado) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/flora-ipe-cerrado.jpg')",
            ...getLayerStyle(0.36, 0.45, 0.58, 1.20)
          }}
        />

        {/* CENA 4: A FAUNA (Lobo-guará em campo aberto) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/fauna-lobo-guara.jpg')",
            ...getLayerStyle(0.54, 0.63, 0.76, 1.18)
          }}
        />

        {/* CENA 5: LABORATÓRIO DE MORFOLOGIA (Blueprint Anatômico) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/vereda-stream.jpg')",
            filter: 'brightness(0.35) saturate(0.6) hue-rotate(15deg)',
            ...getLayerStyle(0.72, 0.80, 0.90, 1.15)
          }}
        />

        {/* CENA 6: A INTELIGÊNCIA TERRITORIAL (Silhueta ao entardecer e mente digital) */}
        <div 
          className="absolute inset-0 bg-cover bg-center will-change-transform transition-all duration-300"
          style={{ 
            backgroundImage: "url('/cta-sunset-cerrado.jpg')",
            ...getLayerStyle(0.86, 0.95, 1.00, 1.12)
          }}
        />

        {/* CANVAS DE PARTÍCULAS EM MOVIMENTO CONTÍNUO */}
        <canvas 
          ref={particleCanvasRef}
          className="absolute inset-0 pointer-events-none z-20"
        />

        {/* OVERLAYS CINEMATOGRÁFICOS DE GRADIENTE & ILUMINAÇÃO */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0a07] via-transparent to-[#0d0a07]/80 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0d0a07]/85 via-transparent to-[#0d0a07]/70 pointer-events-none" />

        {/* ===================================================================== */}
        {/* HEADER NO CANTO SUPERIOR ESQUERDO                                     */}
        {/* ===================================================================== */}
        <header className="absolute top-6 sm:top-8 left-6 sm:left-10 z-40 flex items-center gap-3">
          <VeredasSymbol size="sm" isPulsing={true} showAura={false} />
          <span className="font-display font-bold text-base sm:text-lg tracking-wider text-[#f7ebd9]">
            VEREDAS AI
          </span>
        </header>

        {/* ===================================================================== */}
        {/* CONTEÚDO NARRATIVO EDITORIAL INTEGRADO À ROLAGEM                      */}
        {/* ===================================================================== */}

        <div className="relative z-30 w-full h-full max-w-6xl mx-auto px-6 sm:px-12 flex items-center">
          
          {/* CENA 01: O TERRITÓRIO (0% a 18%) */}
          <div 
            className="absolute max-w-3xl transition-all duration-500"
            style={{ 
              opacity: scrollProgress < 0.18 ? 1 - (scrollProgress / 0.18) * 0.9 : 0,
              transform: `translateY(${scrollProgress * -80}px)`,
              pointerEvents: scrollProgress < 0.16 ? 'auto' : 'none'
            }}
          >
            <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-[#f7ebd9] leading-[1.05] tracking-tight mb-6">
              O Sertão em <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f7ebd9] via-[#e4ceaa] to-[#c4602c]">
                movimento constante.
              </span>
            </h1>

            <p className="text-sm sm:text-xl text-[#c2a781] leading-relaxed max-w-xl font-normal">
              Acompanhe a transição através do planalto, das veredas hídricas e da morfologia adaptativa do Cerrado e do Sertão.
            </p>
          </div>

          {/* CENA 02: AS VEREDAS & AS ÁGUAS (18% a 36%) */}
          <div 
            className="absolute max-w-3xl transition-all duration-500"
            style={{ 
              opacity: scrollProgress >= 0.18 && scrollProgress < 0.36 ? 1 : 0,
              transform: `translateY(${Math.max(-40, Math.min(40, (0.27 - scrollProgress) * 300))}px)`,
              pointerEvents: scrollProgress >= 0.18 && scrollProgress < 0.36 ? 'auto' : 'none'
            }}
          >
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-[#f7ebd9] leading-[1.1] tracking-tight mb-6">
              Onde a vida brota <br />
              do silêncio das veredas.
            </h2>

            <p className="text-sm sm:text-lg text-[#c2a781] leading-relaxed mb-8 max-w-xl font-normal">
              Em pleno solo árido, o lençol freático aflora em depressões de turfa. 
              As colunas de buritis (Mauritia flexuosa) filtram a água pluvial e alimentam as bacias do São Francisco e Tocantins.
            </p>

            <div className="flex flex-wrap items-baseline gap-8 sm:gap-12 pt-2">
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#f7ebd9] block mb-1">
                  3 Aquíferos
                </span>
                <span className="text-xs text-[#a89279]">
                  Guarani, Bambuí e Urucuia
                </span>
              </div>
              <div className="w-[1px] h-8 bg-[#3d2e20] hidden sm:block" />
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#748d61] block mb-1">
                  Solo Turfoso
                </span>
                <span className="text-xs text-[#a89279]">
                  Esponja hídrica natural
                </span>
              </div>
              <div className="w-[1px] h-8 bg-[#3d2e20] hidden sm:block" />
              <div>
                <span className="font-display text-2xl sm:text-3xl font-bold text-[#e4ceaa] block mb-1">
                  Ano Inteiro
                </span>
                <span className="text-xs text-[#a89279]">
                  Vazão perene contínua
                </span>
              </div>
            </div>
          </div>

          {/* CENA 03: A FLORA (36% a 54%) */}
          <div 
            className="absolute max-w-3xl transition-all duration-500"
            style={{ 
              opacity: scrollProgress >= 0.36 && scrollProgress < 0.54 ? 1 : 0,
              transform: `translateY(${Math.max(-40, Math.min(40, (0.45 - scrollProgress) * 300))}px)`,
              pointerEvents: scrollProgress >= 0.36 && scrollProgress < 0.54 ? 'auto' : 'none'
            }}
          >
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-[#f7ebd9] leading-[1.1] tracking-tight mb-6">
              O esplendor que desafia <br />
              o sol escaldante.
            </h2>

            <p className="text-sm sm:text-lg text-[#c2a781] leading-relaxed mb-6 max-w-xl font-normal">
              O Ipê-amarelo do Cerrado (Handroanthus chrysotrichus) perde todas as suas folhas durante a estiagem para concentrar energia biológica em uma floração dourada, polinizada por abelhas nativas.
            </p>

            <p className="text-sm text-[#e4ceaa] font-medium tracking-wide flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Desfolhação estival total</span>
              <span className="text-[#c4602c]">&bull;</span>
              <span>Cortiça espessa anti-chamas</span>
              <span className="text-[#c4602c]">&bull;</span>
              <span>Néctar denso em açúcares</span>
            </p>
          </div>

          {/* CENA 04: A FAUNA (54% a 72%) */}
          <div 
            className="absolute max-w-3xl transition-all duration-500"
            style={{ 
              opacity: scrollProgress >= 0.54 && scrollProgress < 0.72 ? 1 : 0,
              transform: `translateY(${Math.max(-40, Math.min(40, (0.63 - scrollProgress) * 300))}px)`,
              pointerEvents: scrollProgress >= 0.54 && scrollProgress < 0.72 ? 'auto' : 'none'
            }}
          >
            <h2 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold text-[#f7ebd9] leading-[1.1] tracking-tight mb-6">
              Lobo-guará: o semeador <br />
              das campinas abertas.
            </h2>

            <p className="text-sm sm:text-lg text-[#c2a781] leading-relaxed mb-4 max-w-xl font-normal">
              Suas pernas compridas são adaptadas para enxergar presas e frutos sobre o capim alto. 
              Alimenta-se do fruto da lobeira (Solanum lycocarpum), quebrando a dormência de suas sementes e restaurando a vegetação por onde passa.
            </p>

            <p className="text-sm text-[#a89279] pt-2">
              <span className="text-[#f7ebd9] italic font-normal">Chrysocyon brachyurus</span> — Dispersor de sementes nativas do Cerrado, savanas e veredas.
            </p>
          </div>

          {/* CENA 05: LABORATÓRIO DE MORFOLOGIA BOTÂNICA (72% a 88%) */}
          <div 
            className="absolute max-w-4xl transition-all duration-500"
            style={{ 
              opacity: scrollProgress >= 0.72 && scrollProgress < 0.88 ? 1 : 0,
              transform: `translateY(${Math.max(-40, Math.min(40, (0.80 - scrollProgress) * 300))}px)`,
              pointerEvents: scrollProgress >= 0.72 && scrollProgress < 0.88 ? 'auto' : 'none'
            }}
          >
            <h2 className="font-display text-3xl sm:text-5xl font-bold text-[#f7ebd9] leading-[1.1] tracking-tight mb-4">
              Como a IA decifra a engenharia vegetal.
            </h2>

            <p className="text-sm sm:text-base text-[#a89279] mb-8 max-w-2xl font-normal">
              A VEREDAS AI decompõe amostras botânicas identificando as camadas celulares que garantem sobrevivência sob condições climáticas extremas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
              <div className="border-t border-[#3d2e20] pt-4">
                <span className="text-xs font-mono text-[#c4602c] block mb-1">01 / CASCA SUBEROSA</span>
                <h3 className="font-display font-bold text-lg text-[#f7ebd9] mb-2">Cortiça Espessa</h3>
                <p className="text-xs text-[#a89279] leading-relaxed">
                  Isolamento térmico de 20mm a 40mm de súber. O fogo consome o estrato herbáceo sem atingir o tecido vascular da árvore.
                </p>
              </div>

              <div className="border-t border-[#3d2e20] pt-4">
                <span className="text-xs font-mono text-[#748d61] block mb-1">02 / FOLHA ESCLERÓFILA</span>
                <h3 className="font-display font-bold text-lg text-[#f7ebd9] mb-2">Cutícula Cerosa</h3>
                <p className="text-xs text-[#a89279] leading-relaxed">
                  Lâmina foliar rígida revestida de cera natural reflexiva e criptas estomáticas com tricomas que retêm a umidade.
                </p>
              </div>

              <div className="border-t border-[#3d2e20] pt-4">
                <span className="text-xs font-mono text-[#e4ceaa] block mb-1">03 / XILOPÓDIOS</span>
                <h3 className="font-display font-bold text-lg text-[#f7ebd9] mb-2">A Floresta Invertida</h3>
                <p className="text-xs text-[#a89279] leading-relaxed">
                  Até 70% da biomassa vegetal reside sob o solo. Raízes pivotantes que perfuram 12 a 15 metros até atingir o lençol freático.
                </p>
              </div>
            </div>
          </div>

          {/* CENA 06: A INTELIGÊNCIA TERRITORIAL (88% a 100%) */}
          <div 
            className="absolute max-w-3xl text-center mx-auto left-0 right-0 transition-all duration-500 flex flex-col items-center"
            style={{ 
              opacity: scrollProgress >= 0.88 ? Math.min(1, (scrollProgress - 0.88) / 0.08) : 0,
              transform: `translateY(${Math.max(0, (1.0 - scrollProgress) * 200)}px)`,
              pointerEvents: scrollProgress >= 0.88 ? 'auto' : 'none'
            }}
          >
            <div className="mb-6">
              <VeredasSymbol size="xl" isPulsing={true} showAura={true} />
            </div>

            <h2 className="font-display text-4xl sm:text-6xl md:text-7xl font-bold text-[#f7ebd9] tracking-tight mb-4">
              Você pergunta. <br />
              A Veredas investiga. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e4ceaa] to-[#c4602c]">
                O território responde.
              </span>
            </h2>

            <p className="text-sm sm:text-lg text-[#e4ceaa] max-w-xl mx-auto leading-relaxed mb-8 font-normal">
              Entre no chat imersivo da VEREDAS AI. Um laboratório digital para explorar espécies nativas, morfologia adaptativa e ecologia do Sertão.
            </p>

            <button
              onClick={onLaunchChat}
              className="bg-[#c4602c] hover:bg-[#e06e36] text-[#0d0a07] font-bold text-base px-9 py-4 rounded-2xl transition-all shadow-2xl shadow-[#c4602c]/40 hover:shadow-[#c4602c]/60 active:scale-95 flex items-center justify-center gap-3 cursor-pointer group"
            >
              <span>Entrar no Chat Imersivo</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>

            <div className="mt-8 text-xs font-mono text-[#a89279]">
              &copy; 2026 VEREDAS AI &bull; Universidade Estadual de Montes Claros (Unimontes)
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

export default VeredasLandingPage;
