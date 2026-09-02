import React, { useState } from 'react';
import { Header } from './components/Header';
import { ChatInterface } from './components/ChatInterface';
import { MapSelector } from './components/MapSelector';
import { useLocationState } from './hooks/useLocationState';
import { useChat } from './hooks/useChat';

export function App() {
  const [isMapOpen, setIsMapOpen] = useState(true);
  const { locations, selectedLocation, setSelectedLocation } = useLocationState();
  const { messages, isLoading, currentAgent, send, clearChat } = useChat(selectedLocation);

  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Header Superior */}
      <Header
        currentAgent={currentAgent}
        selectedLocation={selectedLocation}
        onToggleMap={() => setIsMapOpen(prev => !prev)}
        isMapOpen={isMapOpen}
      />

      {/* Corpo Principal (Chat + Mapa) */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Painel do Chat (Principal) */}
        <main className="flex-1 flex flex-col min-w-0 h-full">
          <ChatInterface
            messages={messages}
            isLoading={isLoading}
            currentAgent={currentAgent}
            selectedLocation={selectedLocation}
            onSendMessage={send}
            onClearChat={clearChat}
          />
        </main>

        {/* Painel Lateral Geográfico com o Mapa */}
        {isMapOpen && (
          <aside className="w-full sm:w-96 md:w-[420px] lg:w-[460px] h-full shrink-0 z-30 transition-all duration-300 absolute sm:relative right-0 top-0">
            <MapSelector
              locations={locations}
              selectedLocation={selectedLocation}
              onSelectLocation={handleSelectLocation}
              onClose={() => setIsMapOpen(false)}
            />
          </aside>
        )}

      </div>

    </div>
  );
}

export default App;
