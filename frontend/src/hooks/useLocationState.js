import { useState, useEffect } from 'react';
import { fetchLocations } from '../services/api';

const DEFAULT_HUB = {
  id: 'unimontes-mg',
  state: 'MG',
  city: 'Montes Claros (Polo Sertão / Unimontes)',
  lat: -16.7282,
  lng: -43.8578,
  specialties: ['react', 'performance', 'a11y'],
  description: 'Polo de Inovação e Tecnologia do Norte de Minas - Unimontes.'
};

export function useLocationState() {
  const [locations, setLocations] = useState([DEFAULT_HUB]);
  const [selectedLocation, setSelectedLocation] = useState(DEFAULT_HUB);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations()
      .then(data => {
        if (data && data.length > 0) {
          setLocations(data);
          setSelectedLocation(data[0]); // Padrão: Unimontes
        }
      })
      .catch(err => console.error('Erro ao buscar polos:', err))
      .finally(() => setLoading(false));
  }, []);

  return {
    locations,
    selectedLocation,
    setSelectedLocation,
    loading
  };
}
