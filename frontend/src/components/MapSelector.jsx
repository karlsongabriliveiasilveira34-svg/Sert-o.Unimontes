import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Cpu, CheckCircle2, ChevronRight, Compass } from 'lucide-react';

// Ícone customizado de alta precisão para Leaflet
const customMarkerIcon = (isActive) =>
  new L.DivIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="position: relative; display: flex; align-items: center; justify-content: center;">
        <div style="
          width: ${isActive ? '34px' : '26px'};
          height: ${isActive ? '34px' : '26px'};
          border-radius: 50%;
          background: ${isActive ? '#06b6d4' : '#1e293b'};
          border: 2px solid ${isActive ? '#ffffff' : '#06b6d4'};
          box-shadow: 0 0 ${isActive ? '16px #06b6d4' : '6px rgba(0,0,0,0.5)'};
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: ${isActive ? '15px' : '11px'};
          font-weight: bold;
          transition: all 0.3s ease;
        ">
          ⚡
        </div>
        ${isActive ? '<div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(6,182,212,0.4); animation: markerPing 1.8s infinite;"></div>' : ''}
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

function MapRecenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo([center.lat, center.lng], 6, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export function MapSelector({ locations, selectedLocation, onSelectLocation, onClose }) {
  return (
    <div className="flex flex-col h-full glass-panel border-l border-cyan-500/20 bg-slate-950/95 overflow-hidden">
      
      {/* Header do Painel Geográfico */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-white tracking-tight">
              Polos Tecnológicos do Brasil
            </h2>
            <p className="text-[11px] text-slate-400">
              Selecione o polo para conectar o contexto dos agentes
            </p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition text-xs"
          >
            ✕
          </button>
        )}
      </div>

      {/* Mapa Interativo Leaflet */}
      <div className="h-64 sm:h-72 w-full relative">
        <MapContainer
          center={[selectedLocation?.lat || -16.7282, selectedLocation?.lng || -43.8578]}
          zoom={5}
          scrollWheelZoom={false}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapRecenter center={selectedLocation} />

          {locations.map((hub) => {
            const isSelected = selectedLocation?.id === hub.id;
            return (
              <Marker
                key={hub.id}
                position={[hub.lat, hub.lng]}
                icon={customMarkerIcon(isSelected)}
                eventHandlers={{
                  click: () => onSelectLocation(hub)
                }}
              >
                <Popup>
                  <div className="text-xs p-1">
                    <strong className="block text-cyan-400 mb-1">{hub.city}</strong>
                    <p className="text-slate-300 text-[11px] leading-tight mb-2">
                      {hub.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {hub.specialties.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 font-mono text-[9px]"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* Badge Flutuante de Polo Ativo */}
        <div className="absolute top-3 left-3 z-[1000] glass-panel px-3 py-1.5 rounded-xl border-cyan-500/40 text-xs font-semibold text-cyan-300 flex items-center gap-1.5 shadow-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Polo Ativo: {selectedLocation?.city?.split(' ')[0] || 'Unimontes'}</span>
        </div>
      </div>

      {/* Lista de Polos Disponíveis */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
          Regiões de Inovação Mapeadas:
        </span>

        {locations.map((hub) => {
          const isSelected = selectedLocation?.id === hub.id;

          return (
            <div
              key={hub.id}
              onClick={() => onSelectLocation(hub)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-cyan-950/60 border-cyan-500 shadow-md shadow-cyan-950/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                    <h3 className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                      {hub.city}
                    </h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                    {hub.description}
                  </p>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                )}
              </div>

              {/* Tags de Especialidades Regionais */}
              <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800/60">
                {hub.specialties.map((spec, idx) => (
                  <span
                    key={idx}
                    className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300"
                  >
                    #{spec}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
