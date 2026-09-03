import React, { useState, useRef, useEffect } from 'react';
import { VeredasSymbol } from './VeredasSymbol';
import { VeredasMultimodalForm } from './VeredasMultimodalForm';
import { ErosionSegmentationViewer } from './ErosionSegmentationViewer';
import { checkHealth, sendMessage, analyzeDegradation } from '../services/api';
import { 
  ArrowLeft, 
  Mic, 
  MicOff, 
  Paperclip, 
  ArrowUp, 
  RotateCcw, 
  Leaf, 
  TreeDeciduous, 
  Droplets, 
  Sun, 
  Sparkles,
  Layers,
  X,
  Compass,
  Sliders,
  Activity,
  Satellite,
  RefreshCw,
  AlertTriangle,
  Radio,
  Camera
} from 'lucide-react';

export function VeredasImmersiveChat({ onGoHome }) {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [showMultimodalForm, setShowMultimodalForm] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline' | 'checking'
  const [errorMessage, setErrorMessage] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Verificação de conectividade com a API Django
  const verifyBackend = async () => {
    setBackendStatus('checking');
    try {
      const health = await checkHealth();
      if (health && health.status === 'online') {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  useEffect(() => {
    verifyBackend();
  }, []);

  // Rola até o final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Auto-resize do textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [inputText]);

  // Envio de mensagem com suporte a diagnósticos de degradação e segmentação Erosion-SAM
  const handleSendMessage = async (textToSend, extraDegradationData) => {
    const text = (textToSend || inputText).trim();
    if (!text || isThinking) return;

    setErrorMessage(null);

    const userMessage = {
      id: 'user-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      attachments: [...attachedFiles]
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setAttachedFiles([]);
    setIsThinking(true);

    try {
      const lower = text.toLowerCase();
      let degradationResult = extraDegradationData || null;

      // Se for consulta de degradação/erosão e não tiver sido enviada pelo form, consulta a API do Erosion-SAM
      if (!degradationResult && (
        lower.includes('erosão') || lower.includes('erosao') || 
        lower.includes('degradação') || lower.includes('degradacao') || 
        lower.includes('voçoroca') || lower.includes('vocoroca') || 
        lower.includes('solo exposto') || lower.includes('pastagem') || 
        lower.includes('multimodal') || lower.includes('ravina')
      )) {
        try {
          degradationResult = await analyzeDegradation({
            scenario_id: (lower.includes('voçoroca') || lower.includes('vocoroca')) ? 'vocoroca-norte-mg' : 'pastagem-degradada',
            ndvi: 0.28,
            slope_value: 7.5
          });
        } catch (degErr) {
          console.warn('Fallback para segmentação local:', degErr);
        }
      }

      // Consulta a API de chat do Django
      const data = await sendMessage({
        message: text,
        location: { territory: 'Cerrado & Sertão Mineiro', hub: 'Unimontes' },
        sessionId: 'veredas-bio-session'
      });

      if (data && data.message) {
        setBackendStatus('online');
        const assistantMsg = {
          id: data.message.id || 'bio-' + Date.now(),
          role: 'assistant',
          timestamp: data.message.timestamp || new Date().toISOString(),
          ...data.message,
          degradationAnalysis: degradationResult || data.message.degradationAnalysis
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        const fallbackResp = generateTerritorialResponse(text);
        if (degradationResult) {
          fallbackResp.degradationAnalysis = degradationResult;
        }
        setMessages(prev => [...prev, fallbackResp]);
      }
    } catch (err) {
      console.warn('Erro ao conectar ao Django REST, ativando fallback editorial:', err);
      if (err.message && err.message.includes('413')) {
        setErrorMessage('Aviso: O payload enviado excedeu o limite máximo de 8 MB permitido pelo servidor.');
      } else if (err.message && err.message.includes('429')) {
        setErrorMessage('Aviso: Limite de taxa de requisições por minuto excedido (Rate limit). Aguarde um instante.');
      }
      setBackendStatus('offline');
      const fallbackResp = generateTerritorialResponse(text);
      if (extraDegradationData) {
        fallbackResp.degradationAnalysis = extraDegradationData;
      }
      setMessages(prev => [...prev, fallbackResp]);
    } finally {
      setIsThinking(false);
    }
  };

  // Motor de respostas editoriais estruturadas sobre Biodiversidade e Morfologia
  const generateTerritorialResponse = (query) => {
    const lower = query.toLowerCase();

    // 0. DEGRADAÇÃO DA TERRA, EROSÃO, VOÇOROCA E FUSÃO MULTIMODAL (Erosion-SAM)
    if (lower.includes('erosão') || lower.includes('erosao') || lower.includes('degradação') || 
        lower.includes('degradacao') || lower.includes('voçoroca') || lower.includes('vocoroca') || 
        lower.includes('solo exposto') || lower.includes('pastagem') || lower.includes('multimodal') || 
        lower.includes('ravina') || lower.includes('sam')) {
      const isVocoroca = lower.includes('voçoroca') || lower.includes('vocoroca') || lower.includes('ravina') || lower.includes('alta');
      return {
        id: 'degradacao-' + Date.now(),
        role: 'assistant',
        title: isVocoroca 
          ? 'Diagnóstico Espacial: Voçorocamento Ativo e Solo Exposto'
          : 'Diagnóstico Espacial: Degradação de Pastagem e Compactação de Solo',
        scientificName: 'Segmentação Espacial e Análise de Risco de Degradação (Erosion-SAM)',
        family: 'Geomorfologia e Hidrologia Territorial',
        biome: 'Cerrado, Zonas de Recarga e Ecotono Semiárido',
        summary: isVocoroca
          ? 'Identificado processo erosivo hídrico severo com foco de voçoroca em evolução (8.7% de área degradada crítica). A perda de horizonte orgânico superficial foi agravada pelo escoamento superficial desordenado em vertente com declividade superior a 6%.'
          : 'Identificado processo de degradação moderada por perda de cobertura vegetal e compactação por pisoteio extensivo (23% de solo exposto e 18% de pastagem degradada), com risco de surgimento de sulcos lineares.',
        morphology: {
          leaves: 'Índice de Vegetação (NDVI = 0.28): biomassa vegetal severamente suprimida ou senescente.',
          bark: 'Crosta superficial de solo selada e compactada, impedindo a infiltração de água e acelerando o fluxo torrencial de enxurrada.',
          flowers: 'Foco erosivo ativo delimitado com 8.7% de ocupação territorial, gerando desbarrancamento e transporte de sedimentos.',
          habitat: 'Vertente suave-ondulada do Norte de Minas em Latossolo Vermelho-Amarelo com horizonte arenoso suscetível à desagregação.',
          adaptation: 'Prescrição imediata de manejo: contenção física nos vértices com paliçadas de madeira e plantio em curva de nível para retenção hídrica.'
        },
        ecologicalNote: 'A intervenção precoce no foco erosivo protege os cursos d\'água da bacia hidrográfica contra o assoreamento e preserva os aquíferos locais.',
        sources: ['Erosion-SAM (Segment Anything Model adaptado para Solos)', 'Sensoriamento Remoto Sentinel-2', 'Laboratório de Geoprocessamento Unimontes'],
        degradationAnalysis: {
          status: 'success',
          modelo_segmentacao: 'Erosion-SAM v1.2 (ViT-H Backbone + Sentinel-2 Fusion)',
          localizacao: 'Norte de Minas (Região SUDENE-MG)',
          cenario_id: isVocoroca ? 'vocoroca-norte-mg' : 'pastagem-degradada',
          composicao_paisagem_pct: isVocoroca ? {
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
          severidade: isVocoroca ? 'Alta' : 'Moderada',
          confianca_modelo_pct: 88.5,
          tipo_erosao: isVocoroca 
            ? 'Erosão Hídrica Linear (Ravinas e Voçoroca Inicial)' 
            : 'Erosão Laminar e Compactação por Pisoteio',
          indicios_degradacao: [
            'Solo exposto com perda da camada orgânica superficial',
            'Erosão linear ativa em processo de expansão',
            'Formação de canais de drenagem pluvial não controlados',
            'Compactação do horizonte subsuperficial'
          ],
          variaveis_multimodais: {
            ndvi_sentinel2: 0.28,
            declividade_mde: 7.5,
            classificacao_relevo: 'Suave-Ondulado a Ondulado',
            bioma_referencia: 'Cerrado & Semiárido Mineiro'
          },
          mascara_segmentacao: {
            largura_referencia: 100,
            altura_referencia: 100,
            poligonos: isVocoroca ? [
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
              "Construção de paliçadas de madeira e biomassa nos vértices da voçoroca",
              "Bacias de acumulação de enxurrada (barraginhas) no topo da vertente",
              "Curvas de nível em declive zero para infiltração forçada de água pluvial"
            ],
            acoes_biologicas: [
              "Semeadura de leguminosas (Crotalária + Feijão-de-porco) para fixação de nitrogênio",
              "Plantio adensado de mudas do Cerrado com raízes pivotantes (Pequi, Baru, Angico)",
              "Cobertura morta (mulching de palhada seca) para frear a evaporação"
            ],
            cronograma_estimado: "12 a 18 meses para estabilização hidrológica da voçoroca"
          }
        }
      };
    }

    // 1. IPÊ-AMARELO / FLORA DO CERRADO
    if (lower.includes('ipê') || lower.includes('ipe') || lower.includes('amarelo') || lower.includes('árvore')) {
      return {
        id: 'bio-' + Date.now(),
        role: 'assistant',
        title: 'Diagnose Morfológica: Ipê-amarelo do Cerrado',
        scientificName: 'Handroanthus chrysotrichus (Mart. ex DC.) Mattos',
        family: 'Bignoniaceae',
        biome: 'Cerrado sensu stricto & Campos Rupestres',
        summary: 'O ipê-amarelo do Cerrado se distingue de congêneres de mata atlântica pela marcante pilosidade dourada nos cálices e botões, além de um tronco tortuoso com espessa camada de cortiça protetora.',
        morphology: {
          leaves: 'Folhas digitadas com 5 folíolos coriáceos e ásperos, com tricomas estelares na face abaxial que conferem tom ferrugíneo.',
          bark: 'Tronco profundamente sulcado e fendido, com espessa camada suberosa (cortiça) que dissipa o calor de queimadas rápidas.',
          flowers: 'Flores campanuladas em amarelo-ouro intenso, reunidas em corimbos terminais densos, repletas de veludo dourado.',
          habitat: 'Encostas pedregosas, solos arenosos e savanas com insolação direta e boa drenagem.',
          adaptation: 'Desfolhação estival total: perde 100% da copa foliar em julho/agosto para canalizar água residual exclusivamente à floração síncrona.'
        },
        ecologicalNote: 'Sua floração explosiva de curta duração (3 a 7 dias) atua como um farol biológico para abelhas polinizadoras nativas (como Bombus e Xylocopa) no período de maior escassez de recursos do ano.',
        sources: ['Flora e Funga do Brasil (Jardim Botânico do RJ)', 'Herbário Digital Unimontes', 'Tratado de Dendrologia Tropical']
      };
    }

    // 2. LOBO-GUARÁ / FAUNA
    if (lower.includes('lobo') || lower.includes('guará') || lower.includes('guara') || lower.includes('fauna') || lower.includes('animal')) {
      return {
        id: 'bio-' + Date.now(),
        role: 'assistant',
        title: 'Ecologia e Morfologia: Lobo-guará',
        scientificName: 'Chrysocyon brachyurus (Illiger, 1815)',
        family: 'Canidae',
        biome: 'Cerrado, Campos Limpos e Bordas de Veredas',
        summary: 'O lobo-guará é o maior canídeo da América do Sul e o mais eficiente agente de restauração vegetal do Cerrado, graças à sua relação mutualística de dispersão de sementes.',
        morphology: {
          leaves: 'Pelagem avermelhada-fulva com crina dorsal preta erétil utilizada em rituais de comunicação territorial e intimidação.',
          bark: 'Membros esguios e desproporcionalmente longos com extremidades negras (como andas), adaptados para locomoção e visão sobre o dossel do capim alto.',
          flowers: 'Orelhas de grandes dimensões e alta mobilidade angular, capazes de captar ruídos ultrassônicos de roedores e insetos a centenas de metros.',
          habitat: 'Planaltos abertos, chapadas e bordas ecotonais entre savana e matas de galeria.',
          adaptation: 'Onívoro generalista: sua dieta é composta por 50% de frutos nativos, em especial a lobeira (Solanum lycocarpum), cujas sementes sofrem escarificação benéfica em seu estômago.'
        },
        ecologicalNote: 'Sem o lobo-guará, as sementes de lobeira têm taxa de germinação reduzida em mais de 70%. O lobo defeca sementes intactas a quilômetros de distância, regenerando campos degradados.',
        sources: ['Livro Vermelho da Fauna Brasileira Ameaçada de Extinção (ICMBio)', 'Pesquisa Mastozoológica Unimontes']
      };
    }

    // 3. AS VEREDAS & BURITI
    if (lower.includes('vereda') || lower.includes('buriti') || lower.includes('água') || lower.includes('agua') || lower.includes('hidrologia')) {
      return {
        id: 'bio-' + Date.now(),
        role: 'assistant',
        title: 'Ecossistema Hídrico: As Veredas e o Buritizal',
        scientificName: 'Ecótono de Solos Hidromórficos com Mauritia flexuosa L.f.',
        family: 'Arecaceae (Buriti) / Fitofisionomia Savânica Úmida',
        biome: 'Cerrado e Zonas de Transição com o Sertão',
        summary: 'As veredas constituem os berçários hídricos do Brasil Central. São depressões lineares onde o lençol freático aflora sobre camadas de solo orgânico impermeável (turfa), permitindo cursos d\'água perenes no semiárido.',
        morphology: {
          leaves: 'Buriti com folhas em leque (costapalmas) gigantescas de até 3 metros de largura, ricas em fibras de altíssima resistência mecânica.',
          bark: 'Estipe ereto, liso e cilíndrico de até 30 metros de altura, com raízes adventícias e pneumatóforos capazes de respirar em solos inundados.',
          flowers: 'Frutos globosos revestidos por escamas imbricadas castanho-avermelhadas, com polpa alaranjada e oleaginosa densa em carotenoides.',
          habitat: 'Fundos de vale com água subterrânea contínua e solo turfoso encharcado.',
          adaptation: 'As raízes do buriti e das gramíneas hidrófilas atuam como esponjas porosas que retêm a água pluvial, regulando o fluxo dos rios para a bacia do São Francisco.'
        },
        ecologicalNote: 'Para o sertanejo e as comunidades geraizeiras, a vereda é o coração do sustento: fornece água potável o ano todo, frutos para doce e óleo, e palha para cobertura e artesanato ancestral.',
        sources: ['Mapeamento Hidroecológico do Semiárido Mineiro', 'Ecologia de Populações de Mauritia flexuosa (Unimontes)']
      };
    }

    // 4. MANDACARU / CAATINGA / SECA
    if (lower.includes('mandacaru') || lower.includes('caatinga') || lower.includes('seca') || lower.includes('cacto')) {
      return {
        id: 'bio-' + Date.now(),
        role: 'assistant',
        title: 'Anatomia Xeromórfica: Mandacaru',
        scientificName: 'Cereus jamacaru DC.',
        family: 'Cactaceae',
        biome: 'Caatinga, Sertão e Enclaves Semiáridos do Norte de Minas',
        summary: 'O mandacaru é o símbolo máximo da resiliência vegetal do Sertão. Desenvolveu uma síndrome completa de tolerância ao déficit hídrico com fotossíntese CAM e acúmulo de mucilagem aquífera.',
        morphology: {
          leaves: 'Folhas transformadas evolutivamente em espinhos agudos agrupados em aréolas, anulando a perda d\'água por transpiração e repelindo herbívoros.',
          bark: 'Caule colunar carnoso com costelas longitudinais que se expandem como sanfona durante a chuva e se contraem na seca sem romper a epiderme.',
          flowers: 'Grandes flores brancas (até 25cm) que se abrem exclusivamente à noite e duram poucas horas, polinizadas por mariposas esfingídeas.',
          habitat: 'Solos rasos pedregosos, lajedos e encostas secas sob altíssima insolação.',
          adaptation: 'Metabolismo Ácido das Crassuláceas (CAM): abre os estômatos somente durante o frescor da noite para capturar CO₂, mantendo-os selados sob o calor diurno.'
        },
        ecologicalNote: 'Seu fruto vermelho suculento sem espinhos alimenta répteis, aves e primatas no momento mais crítico da estiagem sertaneja, sendo reserva alimentar e hídrica vital para a fauna.',
        sources: ['Botânica de Cactáceas do Brasil', 'Estudos Ecofisiológicos da Caatinga (Unimontes)']
      };
    }

    // RESPOSTA GERAL / INVESTIGAÇÃO DO TERRITÓRIO
    return {
      id: 'bio-' + Date.now(),
      role: 'assistant',
      title: 'Investigação Territorial Veredas AI',
      scientificName: 'Análise de Biodiversidade e Ecologia Regional',
      family: 'Bioma Cerrado & Caatinga',
      biome: 'Planalto Central & Semiárido Mineiro',
      summary: `Sua pergunta "${query}" foi processada sob o prisma da ecologia territorial e botânica do Cerrado e Sertão.`,
      morphology: {
        leaves: 'Morfologia com cutícula cerosa e pelos reflexivos para suportar estresse luminoso.',
        bark: 'Troncos sinuosos com súber espesso resultante da pressão evolutiva de clima e fogo.',
        flowers: 'Padrões de polinização específicos articulados com a fenologia sazonal do território.',
        habitat: 'Diversidade de fitofisionomias: Cerradão, Cerrado sensu stricto, Campo Rupestre e Caatinga.',
        adaptation: 'Estratégias de sobrevivência hídrica com xilopódios subterrâneos e tecidos carnosos.'
      },
      ecologicalNote: 'Você pode aprofundar sua pesquisa perguntando sobre estruturas de casca, raízes profundas, espécies polinizadoras ou anexar imagens para diagnose morfológica.',
      sources: ['Herbário Digital Unimontes', 'Base Biogeográfica do Cerrado']
    };
  };

  // Gravação de Áudio
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = 'pt-BR';
        recognition.continuous = false;
        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => (prev ? prev + ' ' + transcript : transcript));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => {
          setInputText(prev => prev ? prev + ' [Gravação de voz]' : 'Quais as adaptações da casca do pequizeiro contra o fogo?');
          setIsRecording(false);
        }, 2000);
      }
    } else {
      setIsRecording(false);
    }
  };

  // Upload de imagem/arquivo com validação de payload máximo (Lucas: 8 MB)
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

    const oversized = files.filter(f => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      setErrorMessage(`O arquivo "${oversized[0].name}" excede o limite máximo de 8 MB permitido pela segurança do servidor (HTTP 413).`);
      return;
    }

    setErrorMessage(null);
    if (files.length > 0) {
      setAttachedFiles(prev => [...prev, ...files.map(f => f.name)]);
    }
  };

  const removeAttachment = (fileName) => {
    setAttachedFiles(prev => prev.filter(name => name !== fileName));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0a07] text-[#e4ceaa] flex flex-col justify-between selection:bg-[#c4602c]/30 selection:text-[#f7ebd9] relative font-sans">
      
      {/* 1. Header Minimalista com Status da API Django */}
      <header className="sticky top-0 z-40 bg-[#0d0a07]/90 backdrop-blur-md border-b border-[#2d2218] px-6 sm:px-10 py-4">
        <div className="w-full flex items-center justify-between">
          
          <button
            onClick={onGoHome}
            className="flex items-center gap-3 cursor-pointer group focus:outline-none"
            title="Voltar ao início do território"
          >
            <VeredasSymbol size="xs" isPulsing={true} showAura={false} />
            <span className="font-display font-bold text-base tracking-wider text-[#f7ebd9] group-hover:text-[#c4602c] transition-colors">
              VEREDAS AI
            </span>
          </button>

          <div className="flex items-center gap-3">
            {/* Indicador de Status do Backend Django */}
            <div 
              className={`flex items-center gap-2 text-[11px] font-mono px-3 py-1.5 rounded-full border transition-all ${
                backendStatus === 'online'
                  ? 'bg-[#152414] border-[#386b30] text-[#78c26d]'
                  : backendStatus === 'checking'
                  ? 'bg-[#1e1912] border-[#5e4b2d] text-[#d4ad64]'
                  : 'bg-[#241310] border-[#6b2c24] text-[#c96c61]'
              }`}
              title={
                backendStatus === 'online'
                  ? 'Backend Django REST Framework conectado em http://127.0.0.1:8000'
                  : 'Backend Django offline. Respostas operando com base editorial local.'
              }
            >
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === 'online' 
                  ? 'bg-[#4ade80] animate-pulse' 
                  : backendStatus === 'checking'
                  ? 'bg-[#fbbf24] animate-ping'
                  : 'bg-[#ef4444]'
              }`} />
              <span className="hidden sm:inline">
                {backendStatus === 'online' ? 'DJANGO ONLINE' : backendStatus === 'checking' ? 'CONECTANDO...' : 'MODO LOCAL'}
              </span>
              <button 
                onClick={verifyBackend} 
                className="hover:rotate-180 transition-transform duration-500 cursor-pointer ml-0.5 text-inherit"
                title="Checar conexão com a API Django"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => setShowMultimodalForm(prev => !prev)}
              className={`flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                showMultimodalForm 
                  ? 'bg-[#c4602c]/20 border-[#c4602c] text-[#f7ebd9]'
                  : 'bg-[#140f0a] border-[#2d2218] text-[#a89279] hover:text-[#f7ebd9]'
              }`}
              title="Abrir Formulário de Diagnóstico Multimodal e Plano de Manejo"
            >
              <Activity className="w-3.5 h-3.5 text-[#c4602c]" />
              <span className="hidden sm:inline">Diagnóstico Multimodal</span>
            </button>

            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="flex items-center gap-1.5 text-xs font-mono text-[#a89279] hover:text-[#f7ebd9] px-2.5 py-1.5 rounded-lg hover:bg-[#16110c] transition-all cursor-pointer"
                title="Limpar histórico da consulta"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Nova Consulta</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* 2. Canvas Centrado (Estilo Editorial e Cinematográfico, Sem Sidebar) */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-6 sm:px-8 py-8 flex flex-col justify-start">
        
        {/* Banner de Erro / Limite de Segurança */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-[#241310] border border-[#6b2c24] text-[#e4ceaa] text-xs font-mono flex items-center justify-between animate-fade-in shadow-xl">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-[#ef4444] flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button 
              onClick={() => setErrorMessage(null)} 
              className="cursor-pointer text-[#a89279] hover:text-[#f7ebd9] p-1"
              title="Fechar alerta"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Painel do Formulário Multimodal quando ativo */}
        {showMultimodalForm && (
          <VeredasMultimodalForm 
            onSubmitDiagnosis={(query, formData, degradationData) => {
              setShowMultimodalForm(false);
              handleSendMessage(query, degradationData);
            }}
            onClose={() => setShowMultimodalForm(false)}
          />
        )}

        {/* ESTADO DE BOAS-VINDAS */}
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-12 sm:py-16 animate-fade-in max-w-2xl mx-auto">
            
            <div className="mb-6">
              <VeredasSymbol size="2xl" isPulsing={true} showAura={true} />
            </div>

            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-[#f7ebd9] tracking-tight mb-4">
              Veredas AI
            </h1>

            <p className="text-base sm:text-lg text-[#a89279] leading-relaxed max-w-xl font-normal">
              Inteligência territorial para investigar a flora, a fauna e a morfologia adaptativa do Cerrado e do Sertão brasileiro.
            </p>

            {!showMultimodalForm && (
              <button
                onClick={() => setShowMultimodalForm(true)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a140e] border border-[#c4602c]/50 text-xs font-mono text-[#e4ceaa] hover:text-[#f7ebd9] hover:border-[#c4602c] hover:bg-[#241a12] transition-all cursor-pointer shadow-lg"
              >
                <Satellite className="w-4 h-4 text-[#c4602c]" />
                <span>Preencher Diagnóstico Multimodal (Sentinel-2 / Campo)</span>
              </button>
            )}
          </div>
        ) : (
          /* MENSAGENS EM FORMATO DE BLOCOS EDITORIAIS */
          <div className="space-y-12 pb-24">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';

              return (
                <div 
                  key={msg.id || index}
                  className={`animate-fade-in ${
                    isUser ? 'flex justify-end' : 'w-full'
                  }`}
                >
                  {isUser ? (
                    /* Pergunta do Usuário alinhada à direita em mono uppercase */
                    <div className="max-w-xl text-right">
                      <div className="text-[10px] font-mono tracking-widest text-[#a89279] uppercase mb-1 flex items-center justify-end gap-2">
                        <span>INVESTIGAÇÃO DO PESQUISADOR</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#c4602c]" />
                      </div>
                      <div className="p-4 sm:p-5 rounded-2xl bg-[#1a140e] border border-[#2d2218] text-[#f7ebd9] font-mono text-xs sm:text-sm uppercase tracking-wider leading-relaxed shadow-lg">
                        {msg.content}
                      </div>

                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1.5 mt-2">
                          {msg.attachments.map((file, i) => (
                            <span key={i} className="text-[10px] font-mono text-[#a89279] px-2 py-0.5 rounded bg-[#120e0a] border border-[#2d2218]">
                              {file}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Resposta da IA em Bloco Editorial Estruturado */
                    <article className="rounded-2xl p-6 sm:p-8 bg-[#120e0a]/90 border border-[#2d2218] shadow-2xl space-y-6">
                      
                      {/* Topo: Taxonomia & Território */}
                      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#2d2218]">
                        <div className="flex items-center gap-3">
                          <VeredasSymbol size="xs" isPulsing={false} showAura={false} />
                          <div>
                            <h2 className="font-display font-bold text-lg sm:text-xl text-[#f7ebd9]">
                              {msg.title}
                            </h2>
                            {msg.scientificName && (
                              <span className="text-xs font-mono italic text-[#c4602c] block">
                                {msg.scientificName} &bull; {msg.family}
                              </span>
                            )}
                          </div>
                        </div>

                        {msg.biome && (
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#526644]/15 border border-[#526644]/30 text-[#748d61]">
                            {msg.biome}
                          </span>
                        )}
                      </div>

                      {/* Visualizador Espacial Interativo Erosion-SAM (Degradação & Erosão do Solo) */}
                      {msg.degradationAnalysis && (
                        <div className="pt-2">
                          <ErosionSegmentationViewer analysisData={msg.degradationAnalysis} />
                        </div>
                      )}

                      {/* Síntese Geral */}
                      {msg.summary && (
                        <div className="p-4 rounded-xl bg-[#1a130c] border-l-2 border-[#c4602c] text-sm text-[#e4ceaa] leading-relaxed">
                          {msg.summary}
                        </div>
                      )}

                      {/* Grade de Decomposição Morfológica (Folhas, Casca, Flores, Habitat, Adaptação) */}
                      {msg.morphology && (
                        <div className="space-y-3 pt-2">
                          <span className="text-[10px] font-mono uppercase tracking-widest text-[#526644] font-semibold block">
                            // CARACTERÍSTICAS MORFOLÓGICAS & ADAPTATIVAS:
                          </span>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3.5 rounded-xl bg-[#16110c] border border-[#2d2218]">
                              <span className="font-mono font-bold text-[#c4602c] block mb-1">
                                ESTRUTURA FOLIAR
                              </span>
                              <p className="text-[#c2a781] leading-relaxed">
                                {msg.morphology.leaves}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#16110c] border border-[#2d2218]">
                              <span className="font-mono font-bold text-[#c4602c] block mb-1">
                                CASCA & PERIDERME
                              </span>
                              <p className="text-[#c2a781] leading-relaxed">
                                {msg.morphology.bark}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#16110c] border border-[#2d2218]">
                              <span className="font-mono font-bold text-[#c4602c] block mb-1">
                                FLORAÇÃO & REPRODUÇÃO
                              </span>
                              <p className="text-[#c2a781] leading-relaxed">
                                {msg.morphology.flowers}
                              </p>
                            </div>

                            <div className="p-3.5 rounded-xl bg-[#16110c] border border-[#2d2218]">
                              <span className="font-mono font-bold text-[#748d61] block mb-1">
                                ADAPTAÇÃO AO CLIMA & SOLO
                              </span>
                              <p className="text-[#c2a781] leading-relaxed">
                                {msg.morphology.adaptation}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Nota Ecológica e Territorial */}
                      {msg.ecologicalNote && (
                        <div className="pt-2 text-xs text-[#a89279] leading-relaxed border-t border-[#2d2218]">
                          <strong className="text-[#e4ceaa]">Papel Ecológico & Territorial:</strong> {msg.ecologicalNote}
                        </div>
                      )}

                      {/* Fontes Científicas */}
                      {msg.sources && (
                        <div className="pt-3 border-t border-[#2d2218] flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-mono uppercase text-[#6b5847] tracking-wider">
                            FONTES & HERBÁRIOS:
                          </span>
                          {msg.sources.map((src, idx) => (
                            <span 
                              key={idx}
                              className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c150e] border border-[#2d2218] text-[#526644]"
                            >
                              {src}
                            </span>
                          ))}
                        </div>
                      )}

                    </article>
                  )}
                </div>
              );
            })}

            {/* THINKING STATE: Pontos animados sincronizados com o pulso biófilo */}
            {isThinking && (
              <div className="p-6 rounded-2xl bg-[#140f0a] border border-[#c4602c]/30 flex items-center gap-4 animate-fade-in">
                <VeredasSymbol size="sm" isThinking={true} isPulsing={true} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#c4602c] font-semibold">
                      ANALISANDO BASE BOTÂNICA & TERRITORIAL
                    </span>
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c4602c] animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c4602c] animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[#c4602c] animate-bounce" />
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-[#a89279]">
                    Consultando morfologia de espécies, herbários digitais e registros do semiárido...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

      </main>

      {/* 3. Input Minimalista e Elegante (Microfone, Anexo e Envio) */}
      <footer className="sticky bottom-0 z-40 bg-[#0d0a07]/95 backdrop-blur-xl border-t border-[#2d2218] p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Arquivos Anexados */}
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachedFiles.map((name, i) => (
                <div key={i} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1a140e] border border-[#c4602c]/40 text-xs font-mono text-[#e4ceaa]">
                  <span>{name}</span>
                  <button 
                    onClick={() => removeAttachment(name)} 
                    className="hover:text-[#c4602c]"
                    aria-label={`Remover anexo ${name}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Barra de Digitação */}
          <div className="relative rounded-2xl bg-[#140f0a] border border-[#2d2218] focus-within:border-[#c4602c]/80 focus-within:ring-1 focus-within:ring-[#c4602c]/30 shadow-2xl transition-all flex items-end p-2.5 sm:p-3 gap-2">
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              multiple 
              accept="image/*,.pdf"
            />

            {/* Ícone: Diagnóstico Multimodal */}
            <button
              type="button"
              onClick={() => setShowMultimodalForm(prev => !prev)}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                showMultimodalForm 
                  ? 'bg-[#c4602c]/20 text-[#c4602c] border border-[#c4602c]/50'
                  : 'text-[#a89279] hover:text-[#f7ebd9] hover:bg-[#1f1812]'
              }`}
              title="Abrir Formulário de Diagnóstico Multimodal (Sentinel-2 / Campo)"
              aria-label="Abrir Diagnóstico Multimodal"
            >
              <Sliders className="w-5 h-5" />
            </button>

            {/* Ícone: Anexo de imagem ou amostra foliar */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-[#a89279] hover:text-[#f7ebd9] hover:bg-[#1f1812] rounded-xl transition-all cursor-pointer"
              title="Anexar fotografia de folha, casca ou fruto para identificação"
              aria-label="Anexar amostra visual"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Ícone: Microfone com feedback tátil */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-3 rounded-xl transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse' 
                  : 'text-[#a89279] hover:text-[#f7ebd9] hover:bg-[#1f1812]'
              }`}
              title={isRecording ? 'Parar gravação' : 'Perguntar por voz'}
              aria-label={isRecording ? 'Parar gravação de voz' : 'Iniciar entrada por voz'}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>

            {/* Campo Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isRecording ? "Ouvindo sua dúvida sobre biodiversidade..." : "Pergunte sobre espécies, características morfológicas, fauna ou adaptações do Cerrado..."}
              className="flex-1 max-h-36 bg-transparent border-0 resize-none px-2 py-2.5 text-sm sm:text-base text-[#f7ebd9] placeholder-[#6b5847] focus:outline-none font-sans"
              aria-label="Pergunta sobre biodiversidade para a Veredas AI"
            />

            {/* Ícone: Enviar */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={(!inputText.trim() && attachedFiles.length === 0) || isThinking}
              className="p-3 rounded-xl bg-[#c4602c] hover:bg-[#e06e36] disabled:opacity-30 disabled:hover:bg-[#c4602c] disabled:cursor-not-allowed text-[#0d0a07] transition-all cursor-pointer shrink-0 shadow-lg shadow-[#c4602c]/20 active:scale-95 flex items-center justify-center font-bold"
              title="Enviar consulta (Enter)"
              aria-label="Enviar consulta"
            >
              <ArrowUp className="w-5 h-5" />
            </button>

          </div>
        </div>
      </footer>

    </div>
  );
}

export default VeredasImmersiveChat;
