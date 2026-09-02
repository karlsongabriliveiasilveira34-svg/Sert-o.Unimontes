import { useState, useCallback } from 'react';
import { sendMessage } from '../services/api';

export function useChat(selectedLocation) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'agent',
      agent: 'react-agent',
      content: 'Olá! Sou o **Agente Central de Front-End com IA** do Sertão.Unimontes. Tenho agentes especialistas em **React, CSS, Acessibilidade, Performance, SEO, UI/UX e TypeScript** prontos para te apoiar com código limpo e arquitetura de ponta.\n\nComo posso acelerar o seu desenvolvimento hoje?',
      timestamp: new Date().toISOString(),
      metadata: {
        specialty: 'react',
        title: 'Central de Agentes Front-End',
        avatar: '⚡',
        accentColor: '#06B6D4',
        suggestions: [
          'Como otimizar performance e aplicar lazy loading no React?',
          'Como construir um grid de cards responsivo com glassmorphism?',
          'Quais as regras WCAG para acessibilidade em modais?',
          'Como usar Generics e Discriminated Unions no TypeScript?'
        ]
      }
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [currentAgent, setCurrentAgent] = useState({
    name: 'react-agent',
    title: 'Especialista em React & Next.js',
    avatar: '⚛️',
    specialty: 'react',
    accentColor: '#61DAFB'
  });
  const [sessionId, setSessionId] = useState(() => 'sess-' + Math.random().toString(36).substring(2, 9));

  const send = useCallback(async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const data = await sendMessage({
        message: text,
        location: selectedLocation,
        sessionId
      });

      if (data && data.message) {
        setMessages(prev => [...prev, data.message]);

        // Atualiza agente ativo no header
        if (data.message.metadata) {
          setCurrentAgent({
            name: data.message.agent,
            title: data.message.metadata.title || 'Agente Especialista',
            avatar: data.message.metadata.avatar || '🤖',
            specialty: data.message.metadata.specialty || data.router?.detectedSpecialty,
            accentColor: data.message.metadata.accentColor || '#06B6D4'
          });
        }
      }
    } catch (err) {
      console.error('Erro ao enviar mensagem:', err);
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          role: 'agent',
          agent: 'system-error',
          content: 'Desculpe, ocorreu um erro temporário ao consultar os agentes. Verifique se o servidor backend está online.',
          timestamp: new Date().toISOString(),
          metadata: {
            specialty: 'error',
            title: 'Erro de Conexão',
            avatar: '⚠️',
            accentColor: '#EF4444'
          }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, selectedLocation, sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    currentAgent,
    send,
    clearChat
  };
}
