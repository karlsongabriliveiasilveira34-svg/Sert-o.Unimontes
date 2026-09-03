import React, { useState } from 'react';
import { VeredasLandingPage } from './components/VeredasLandingPage';
import { VeredasImmersiveChat } from './components/VeredasImmersiveChat';
import { VeredasSymbol } from './components/VeredasSymbol';

export function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'chat'
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Transição cinematográfica animada para entrar na aba da IA
  const handleLaunchChat = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('chat');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }, 350);
  };

  // Transição cinematográfica para retornar ao território
  const handleGoHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('landing');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 350);
    }, 350);
  };

  return (
    <div className="relative min-h-screen bg-[#0d0a07] text-[#e4ceaa] overflow-hidden">
      
      {/* VÉU CINEMATOGRÁFICO DE TRANSIÇÃO COM SÍMBOLO BIÓFILO */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 bg-[#0d0a07]/95 backdrop-blur-xl flex flex-col items-center justify-center animate-cinematic-veil pointer-events-none">
          <div className="scale-125 transform transition-transform">
            <VeredasSymbol size="lg" isPulsing={true} showAura={true} />
          </div>
          <span className="mt-4 text-xs font-mono tracking-widest text-[#c4602c] uppercase font-semibold animate-pulse">
            {currentView === 'landing' ? 'CONECTANDO À BASE TERRITORIAL...' : 'RETORNANDO AO TERRITÓRIO...'}
          </span>
        </div>
      )}

      {currentView === 'chat' ? (
        <div className="animate-portal-enter">
          <VeredasImmersiveChat onGoHome={handleGoHome} />
        </div>
      ) : (
        <div className="animate-fade-in">
          <VeredasLandingPage onLaunchChat={handleLaunchChat} />
        </div>
      )}

    </div>
  );
}

export default App;
