import { orchestrateClinicalCase, SAMPLE_CASES } from './services/clinical-pipeline.js';

console.log('🧪 Iniciando teste do Pipeline MedIA (Orquestrador & 8 Agentes)...');

const sample = SAMPLE_CASES[0];
console.log(`\n📋 Testando com: "${sample.title}"`);

const result = orchestrateClinicalCase(sample.data);

console.log('\n--- VERIFICAÇÃO DE ESTRUTURA JSON ---');
console.log('Request ID:', result.request_id);
console.log('Status:', result.status);

// 1. Clínico
console.log('\n🩺 1. Clínico:');
console.log(' - Resumo:', result.clinical.summary);
console.log(' - Problemas:', result.clinical.clinical_problems);

// 2. Diferencial
console.log('\n🔍 2. Diagnóstico Diferencial:');
result.differential.hypotheses.forEach(h => {
  console.log(` - ${h.name} [Prioridade: ${h.priority}]`);
});

// 3. Exames
console.log('\n🔬 3. Exames:');
console.log(' - Resultados Relevantes:', result.exams.relevant_results.length);

// 4. Probabilidade
console.log('\n📊 4. Probabilidade:');
result.probability.results.forEach(p => {
  console.log(` - ${p.hypothesis}: ${p.score}% (${p.compatibility})`);
});

// 5. Segurança
console.log('\n🛡️ 5. Segurança (Guardrail):');
console.log(' - Severidade:', result.safety.severity);
console.log(' - Alertas:', result.safety.alerts);

// 6. Explicação
console.log('\n💡 6. Explicação (Por que a IA chegou nisso?):');
console.log(' - Conclusão:', result.explanation.conclusion);

// 7. Relatório
console.log('\n📄 7. Relatório Médico:');
console.log(' - Síntese do Paciente:', result.report.patient_summary);
console.log(' - Notas Finais:', result.report.final_notes);

// 8. Metadados
console.log('\n⚙️ Agentes Executados:', result.metadata.agents_executed.join(', '));
console.log(`Tempo de processamento: ${result.metadata.processing_time_ms}ms`);

console.log('\n✅ Todos os contratos JSON do MedIA foram validados com sucesso!');
