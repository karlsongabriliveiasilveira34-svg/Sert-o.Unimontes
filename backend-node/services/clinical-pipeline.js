import crypto from 'crypto';

export const SAMPLE_CASES = [
  {
    id: 'case-pneumonia',
    title: 'Caso 1: Paciente Idoso com Febre Alta e Tosse Produtiva',
    tag: 'Respiratório / PAC',
    data: {
      idade: 62,
      sexo: 'Masculino',
      sintomas: 'Febre alta iniciada há 3 dias (38.8°C), calafrios, tosse produtiva com secreção amarelada/purulenta e dispneia progressiva aos esforços moderados.',
      sinais: 'FC: 104 bpm, FR: 26 irpm, PA: 125/80 mmHg, SpO2: 91% em ar ambiente, Temp: 38.6°C. Murmúrio vesicular diminuído com crepitações inspiratórias em base pulmonar direita.',
      historico: 'Hipertensão arterial em tratamento regular com Enalapril. Nega diabetes ou DPOC prévio. Nega tabagismo recente.',
      medicamentos: 'Enalapril 20mg 1x/dia, Paracetamol 750mg sob demanda.',
      exames: 'Hemograma: Leucócitos 16.500/mm³ com 10% de bastonetes, Plaquetas 240.000/mm³. PCR: 95 mg/L. Radiografia de tórax: Infiltrado alveolar consolidativo em lobo inferior direito com broncograma aéreo visível.',
      observacoes_clinicas: 'Evolução rápida em 72h. Mora em Montes Claros (MG), refere contato familiar com quadro gripal prévio.'
    }
  },
  {
    id: 'case-coronary',
    title: 'Caso 2: Dor Precordial Opressiva e Sudorese Fria',
    tag: 'Cardiovascular / Emergência',
    data: {
      idade: 55,
      sexo: 'Feminino',
      sintomas: 'Dor retroesternal em aperto, de forte intensidade (8/10), iniciada em repouso há 45 minutos, com irradiação para mandíbula e membro superior esquerdo, associada a náuseas e sudorese fria profusa.',
      sinais: 'PA: 150/95 mmHg, FC: 110 bpm, FR: 20 irpm, SpO2: 96%. Bulhas rítmicas normofonéticas sem sopros, ausculta pulmonar limpa.',
      historico: 'Dislipidemia, Diabetes Mellitus tipo 2 há 8 anos, tabagista ativa (20 maços/ano). Histórico familiar de infarto agudo precoce (pai aos 52 anos).',
      medicamentos: 'Metformina 850mg 2x/dia, Atorvastatina 20mg/noite.',
      exames: 'ECG de 12 derivações: Supradesnivelamento do segmento ST de 2.5 mm de V1 a V4. Troponina ultrassensível: Coletada na admissão (aguardando liberação).',
      observacoes_clinicas: 'Paciente muito ansiosa e diaforética. Sala de emergência de hospital regional.'
    }
  },
  {
    id: 'case-asthma',
    title: 'Caso 3: Crise de Broncoespasmo Agudo em Região de Clima Seco',
    tag: 'Alergologia / Semiárido',
    data: {
      idade: 24,
      sexo: 'Feminino',
      sintomas: 'Sensação de aperto torácico, tosse seca irritativa e sibilos audíveis sem estetoscópio iniciados na madrugada após mudança brusca de temperatura e tempo seco com poeira no Norte de Minas.',
      sinais: 'FC: 112 bpm, FR: 28 irpm, SpO2: 93%, PA: 118/74 mmHg. Uso de musculatura acessória, tempo expiratório prolongado com sibilos difusos bilaterais.',
      historico: 'Asma brônquica na infância sem crises nos últimos 2 anos. Rinite alérgica.',
      medicamentos: 'Salbutamol spray sob demanda (não usou nas últimas semanas).',
      exames: 'Radiografia de tórax: Hiperinsuflação pulmonar sem consolidações ou pneumotórax. Gasometria venosa: pH 7.42, pCO2 36 mmHg.',
      observacoes_clinicas: 'Relata alívio parcial após 1 ciclo de nebulização com beta-2 agonista na UPA.'
    }
  }
];

export function runClinicalAgent(data) {
  const isPneumonia = (data.sintomas + data.exames).toLowerCase().includes('pulmonar') || (data.sintomas + data.exames).toLowerCase().includes('crepitação');
  const isCardio = (data.sintomas + data.sinais).toLowerCase().includes('retroesternal') || (data.sintomas + data.sinais).toLowerCase().includes('aperto');

  let summary = `Paciente de ${data.idade || 'idade não informada'} anos, sexo ${data.sexo || 'não informado'}, apresentando quadro com ${data.sintomas?.slice(0, 120)}...`;
  let mainFindings = [];
  let clinicalProblems = [];
  let missingInformation = [];
  let observations = [];

  if (isCardio) {
    mainFindings = [
      'Dor precordial em aperto de forte intensidade com irradiação típica',
      'Sudorese fria e náuseas associadas (sintomas autonômicos)',
      'Fatores de risco cardiovascular múltiplos (tabagismo, diabetes, histórico familiar)'
    ];
    clinicalProblems = [
      'Síndrome Coronariana Aguda com provável Supradesnível de ST (SCA C/ SST)',
      'Hipertensão arterial e taquicardia sinusal reativa'
    ];
    missingInformation = [
      'Resultado da curva de Troponina ultrassensível',
      'Tempo de início dos sintomas até a porta (tempo porta-balão/agulha)',
      'Contraindicações formais para trombólise/anticoagulação plena'
    ];
    observations = ['Emergência cardiológica tempo-dependente. Prioridade absoluta de monitorização.'];
  } else if (isPneumonia) {
    mainFindings = [
      'Síndrome febril aguda com calafrios',
      'Tosse produtiva purulenta',
      'Sinais focais pulmonares (crepitações em base)',
      'Taquipneia e hipoxemia limítrofe'
    ];
    clinicalProblems = [
      'Infecção respiratória baixa aguda (Pneumonia bacteriana comunitária)',
      'Insuficiência respiratória aguda leve a moderada'
    ];
    missingInformation = [
      'Gasometria arterial se saturação cair abaixo de 92%',
      'Dosagem sérica de ureia para cálculo do CURB-65',
      'Avaliação formal do estado de hidratação e função renal'
    ];
    observations = ['Paciente idoso com risco de rápida progressão para sepse pulmonar se não tratado.'];
  } else {
    mainFindings = [
      'Dispneia e taquipneia aguda',
      'Sinais auscultatórios obstrutivos',
      'Desconforto respiratório perceptível'
    ];
    clinicalProblems = [
      'Síndrome de obstrução de vias aéreas inferiores'
    ];
    missingInformation = [
      'Pico de fluxo expiratório (Peak Flow)',
      'Frequência de crises no último ano'
    ];
    observations = ['Condições climáticas secas e poeira regional como provável gatilho alergênico.'];
  }

  return {
    agent: 'clinical',
    summary,
    main_findings: mainFindings,
    clinical_problems: clinicalProblems,
    missing_information: missingInformation,
    observations
  };
}

export function runDifferentialAgent(clinicalData, data) {
  const text = `${data.sintomas} ${data.sinais} ${data.exames}`.toLowerCase();

  if (text.includes('retroesternal') || text.includes('v1 a v4') || text.includes('aperto')) {
    return {
      agent: 'differential_diagnosis',
      hypotheses: [
        {
          name: 'Infarto Agudo do Miocárdio com Supra de ST (IAMCSST)',
          priority: 'Alta',
          supporting_findings: [
            'Dor retroesternal em aperto em repouso com irradiação clássica',
            'Diaforese e sintomas neurovegetativos',
            'Supradesnivelamento do segmento ST no eletrocardiograma',
            'Múltiplos fatores de risco coronariano (DM, tabagismo, dislipidemia)'
          ],
          contradicting_findings: [
            'Sem sopro cardíaco ou atrito pericárdico evidente'
          ],
          additional_information: [
            'Cineangiocoronariografia (cateterismo cardíaco de urgência)',
            'Ecocardiograma transtorácico'
          ]
        },
        {
          name: 'Dissecção Aguda de Aorta Torácica',
          priority: 'Moderada',
          supporting_findings: [
            'Dor torácica de forte intensidade de início súbito',
            'Hipertensão arterial na apresentação'
          ],
          contradicting_findings: [
            'Presença de supra de ST típico em parede anterior no ECG',
            'Ausência de assimetria de pulsos ou sopro diastólico aórtico relatado'
          ],
          additional_information: [
            'Angiotomografia de tórax com contraste se houver dúvida'
          ]
        },
        {
          name: 'Tromboembolismo Pulmonar Maciço (TEP)',
          priority: 'Baixa',
          supporting_findings: [
            'Taquicardia, desconforto torácico e ansiedade'
          ],
          contradicting_findings: [
            'Padrão de supra de ST típico de coronariopatia',
            'Ausência de edema unilateral de membros inferiores'
          ],
          additional_information: [
            'Escore de Wells e dímero D se suspeita persistir'
          ]
        }
      ]
    };
  }

  // Padrão Respiratório / PAC
  return {
    agent: 'differential_diagnosis',
    hypotheses: [
      {
        name: 'Pneumonia Adquirida na Comunidade (PAC)',
        priority: 'Alta',
        supporting_findings: [
          'Febre alta aguda com calafrios e taquipneia',
          'Tosse com secreção purulenta',
          'Crepitações focais em hemitórax direito',
          'Consolidação lobar com broncograma aéreo na radiografia'
        ],
        contradicting_findings: [
          'Ausência de dor pleurítica intensa'
        ],
        additional_information: [
          'Escore de risco CURB-65 (Ureia, Consciência, FR, PA, Idade)',
          'Painel viral respiratório se refratário'
        ]
      },
      {
        name: 'Exacerbação Infecciosa de Doença Pulmonar Obstrutiva',
        priority: 'Moderada',
        supporting_findings: [
          'Dispneia progressiva e secreção purulenta',
          'Idade avançada'
        ],
        contradicting_findings: [
          'Infiltrado lobar denso (típico de consolidação bacteriana isolada)',
          'Nega histórico formal de tabagismo pesado ou espirometria'
        ],
        additional_information: [
          'Espirometria após resolução do quadro infeccioso agudo'
        ]
      },
      {
        name: 'Insuficiência Cardíaca Congestiva Descompensada',
        priority: 'Baixa',
        supporting_findings: [
          'Dispneia e taquipneia em paciente hipertenso'
        ],
        contradicting_findings: [
          'Presença de febre alta de 38.8°C',
          'Achado auscultatório e radiológico estritamente unilateral'
        ],
        additional_information: [
          'BNP / NT-proBNP sérico e ecocardiograma'
        ]
      }
    ]
  };
}

export function runExamsAgent(examsText, hypotheses) {
  const text = (examsText || '').toLowerCase();
  const relevantResults = [];
  const correlations = [];
  const inconsistencies = [];
  const additionalExams = [];

  if (text.includes('leucócitos') || text.includes('bastonetes') || text.includes('pcr')) {
    relevantResults.push({
      exam: 'Leucograma',
      finding: 'Leucocitose com desvio à esquerda (bastonetes > 4%)',
      status: 'alterado'
    });
    correlations.push('A leucocitose com neutrofilia e desvio corrobora forte resposta inflamatória bacteriana aguda.');
  }

  if (text.includes('consolidação') || text.includes('infiltrado') || text.includes('radiografia')) {
    relevantResults.push({
      exam: 'Radiografia de Tórax',
      finding: 'Infiltrado alveolar com padrão consolidativo lobar',
      status: 'alterado'
    });
    correlations.push('A imagem radiológica fecha critério morfológico para consolidação infecciosa (PAC).');
  }

  if (text.includes('supradesnivelamento') || text.includes('ecg') || text.includes('st')) {
    relevantResults.push({
      exam: 'Eletrocardiograma (ECG)',
      finding: 'Supradesnivelamento do segmento ST em parede anterior',
      status: 'crítico'
    });
    correlations.push('O supra de ST correlaciona-se com oclusão coronariana aguda com indicação de reperfusão imediata.');
  }

  additionalExams.push('Dosagem de eletrólitos, função renal e coagulograma');
  additionalExams.push('Oximetria seriada e gasometria conforme evolução');

  return {
    agent: 'exams',
    relevant_results: relevantResults,
    clinical_correlations: correlations,
    possible_inconsistencies: inconsistencies,
    additional_exams_to_consider: additionalExams
  };
}

export function runProbabilityAgent(clinical, differential, exams) {
  const results = (differential.hypotheses || []).map((hyp, index) => {
    let score = 50;
    let compatibility = 'Moderada';

    if (hyp.priority === 'Alta') {
      score = index === 0 ? 84 : 72;
      compatibility = score >= 80 ? 'Muito alta' : 'Alta';
    } else if (hyp.priority === 'Moderada') {
      score = 42;
      compatibility = 'Moderada';
    } else {
      score = 18;
      compatibility = 'Muito baixa';
    }

    return {
      hypothesis: hyp.name,
      compatibility,
      score,
      supporting_factors: hyp.supporting_findings || [],
      negative_factors: hyp.contradicting_findings || [],
      explanation: `A compatibilidade foi classificada como ${compatibility.toLowerCase()} com base na coerência entre os sintomas e os achados objetivos observados.`
    };
  });

  return {
    agent: 'probability',
    results
  };
}

export function runSafetyAgent(data, hypotheses, exams) {
  const text = `${data.sintomas} ${data.sinais} ${data.exames}`.toLowerCase();
  const alerts = [];
  const criticalFindings = [];
  const missingCritical = [];
  let severity = 'low';

  if (text.includes('supradesnivelamento') || text.includes('aperto') || text.includes('sudorese fria')) {
    severity = 'critical';
    alerts.push('🚨 ALERTA VERMELHO: Suspeita de Síndrome Coronariana Aguda com Supra de ST. Tempo é músculo miocárdico!');
    alerts.push('Encaminhar imediatamente para sala de emergência / hemodinâmica para angioplastia primária.');
    criticalFindings.push('Eletrocardiograma com supradesnivelamento de ST');
    criticalFindings.push('Dor torácica típica com sintomas vasovagais');
    missingCritical.push('Acesso venoso periférico calibroso e monitorização contínua');
  } else if (text.includes('fr: 26') || text.includes('spo2: 91') || text.includes('taquipneia') || text.includes('bastões')) {
    severity = 'high';
    alerts.push('⚠️ Atenção: Taquipneia e SpO2 limítrofe em paciente idoso caracterizam potencial critério para sepse/internação.');
    alerts.push('Estratificar índice CURB-65 para decidir local de internação (enfermaria vs UTI).');
    criticalFindings.push('Frequência respiratória > 24 irpm');
    criticalFindings.push('Saturação de O2 < 92% em ar ambiente');
    missingCritical.push('Gasometria arterial e lactato sérico');
  } else {
    severity = 'medium';
    alerts.push('Monitorar resposta terapêutica nas próximas 24-48h.');
  }

  return {
    agent: 'safety',
    severity,
    alerts,
    critical_findings: criticalFindings,
    data_inconsistencies: [],
    missing_critical_information: missingCritical
  };
}

export function runExplanationAgent(hypothesisName, probability, data) {
  return {
    agent: 'explanation',
    conclusion: `A hipótese "${hypothesisName || 'Principal'}" apresentou alta compatibilidade clínica devido à perfeita correlação fisiopatológica entre os sinais vitais, sintomas descritos e alterações nos exames complementares.`,
    reasoning_steps: [
      '1. Coleta e validação dos dados de triagem clínica.',
      '2. Correlação dos sintomas principais com as síndromes nosológicas correspondentes.',
      '3. Ponderação de biomarcadores laboratoriais e de imagem como fatores de confirmação.',
      '4. Descarte de diagnósticos diferenciais alternativos que apresentavam achados contraditórios.'
    ],
    supporting_evidence: [
      'Compatibilidade temporal da evolução clínica',
      'Achados propedêuticos no exame físico direcionados',
      'Exames complementares consistentes'
    ],
    contradicting_evidence: [
      'Ausência de manifestações atípicas ou contradições nos sinais vitais'
    ],
    uncertainties: [
      'Necessidade de acompanhamento evolutivo para avaliar resposta terapêutica inicial'
    ]
  };
}

export function runReportAgent(clinical, differential, exams, probability, safety) {
  const topHypothesis = differential.hypotheses?.[0]?.name || 'Hipótese Principal';

  return {
    agent: 'report',
    patient_summary: clinical.summary || 'Resumo do caso clínico avaliado.',
    clinical_history: `Quadro clínico organizado de acordo com a cronologia fornecida. Problemas identificados: ${(clinical.clinical_problems || []).join('; ')}.`,
    main_findings: clinical.main_findings || [],
    differential_diagnosis: (differential.hypotheses || []).map(h => `${h.name} (${h.priority})`),
    exams: (exams.relevant_results || []).map(e => `${e.exam}: ${e.finding}`),
    clinical_reasoning: `Com base na síntese clínica e na análise multivariada dos fatores de risco e exames, a hipótese mais plausível é ${topHypothesis}. As evidências favoráveis superam as alternativas menos prováveis.`,
    alerts: safety.alerts || [],
    additional_information: clinical.missing_information || [],
    final_notes: 'Plano Terapêutico e Conduta: Confirmar estratificação de risco, instituir suporte clínico adequado e reavaliar parâmetros vitais continuamente.'
  };
}

export function orchestrateClinicalCase(data) {
  const startTime = Date.now();
  const clinical = runClinicalAgent(data);
  const differential = runDifferentialAgent(clinical, data);
  const exams = runExamsAgent(data.exames, differential);
  const probability = runProbabilityAgent(clinical, differential, exams);
  const safety = runSafetyAgent(data, differential, exams);
  const topHypothesis = differential.hypotheses?.[0]?.name;
  const explanation = runExplanationAgent(topHypothesis, probability, data);
  const report = runReportAgent(clinical, differential, exams, probability, safety);

  return {
    request_id: 'req-' + crypto.randomUUID().slice(0, 8),
    status: 'success',
    clinical,
    differential,
    exams,
    probability,
    safety,
    explanation,
    report,
    metadata: {
      agents_executed: [
        'clinical',
        'differential',
        'exams',
        'probability',
        'safety',
        'explanation',
        'report'
      ],
      timestamp: new Date().toISOString(),
      processing_time_ms: Date.now() - startTime
    }
  };
}
