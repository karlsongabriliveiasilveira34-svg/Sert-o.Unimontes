/**
 * Knowledge Tree (Árvore de Conhecimento Hierárquica)
 * Projeto Sertão.Unimontes
 * 
 * Estruturação taxonômica e geográfica do conhecimento ambiental,
 * ecológico, hídrico e territorial nas 25 Regiões da SUDENE (Norte de Minas e Semiárido).
 */

export const SERTAO_KNOWLEDGE_TREE = {
  id: 'sertao-unimontes-root',
  label: 'Sertão.Unimontes - Ecossistema Regional',
  category: 'root',
  description: 'Árvore de conhecimento unificada do bioma, hidrologia, território e acervos no Polígono da SUDENE no Norte de Minas',
  children: [
    {
      id: 'biomas-ecorregioes',
      label: 'Biomas & Ecorregiões',
      category: 'bioma',
      description: 'Zonas biogeográficas e áreas de ecótono no polígono da SUDENE',
      children: [
        {
          id: 'cerrado-stricto-sensu',
          label: 'Cerrado Stricto Sensu',
          category: 'bioma_detalhe',
          tags: ['cerrado', 'savana', 'biodiversidade', 'solos-acidos'],
          description: 'Vegetação savânica sobre latossolos profundos, caracterizada por árvores tortuosas e alta taxa de endemismo.'
        },
        {
          id: 'caatinga-hiperxerofila',
          label: 'Caatinga Hiperxerófila',
          category: 'bioma_detalhe',
          tags: ['caatinga', 'semiarido', 'xerofitas', 'cactaceas', 'sudene'],
          description: 'Vegetação caducifólia adaptada ao estresse hídrico severo com elevada diversidade de cactáceas e leguminosas no Polígono das Secas.'
        },
        {
          id: 'ecotono-cerrado-caatinga',
          label: 'Zona de Transição (Ecótono Cerrado-Caatinga)',
          category: 'bioma_detalhe',
          tags: ['transicao', 'ecotono', 'norte-de-minas', 'mosaic-vegetacional'],
          description: 'Faixa de transição biogeográfica única nas regiões da SUDENE no Norte de Minas, com sobreposição de espécies da fauna e flora de ambos os biomas.'
        }
      ]
    },
    {
      id: 'recursos-hidricos-veredas',
      label: 'Recursos Hídricos & Veredas',
      category: 'hidrologia',
      description: 'Sistemas aquíferos, bacias hidrográficas e subsistemas de veredas recarregadoras nas regiões da SUDENE',
      children: [
        {
          id: 'veredas-buritizais',
          label: 'Veredas & Buritizais (Mauritia flexuosa)',
          category: 'hidro_detalhe',
          tags: ['veredas', 'buriti', 'recarga-hidrica', 'caixas-dagua-sertao'],
          description: 'Ambientes úmidos vegetados por buritis que atuam como caixas d\'água naturais para a manutenção dos rios sertanejos.'
        },
        {
          id: 'bacia-rio-sao-francisco',
          label: 'Bacia do Rio São Francisco (Médio São Francisco)',
          category: 'hidro_detalhe',
          tags: ['sao-francisco', 'velho-chico', 'calha-principal', 'vazante'],
          description: 'Eixo hidrográfico principal de drenagem regional e sustentação das comunidades ribeirinhas do semiárido.'
        },
        {
          id: 'subbacia-verde-grande',
          label: 'Sub-bacia do Rio Verde Grande',
          category: 'hidro_detalhe',
          tags: ['verde-grande', 'irrigacao', 'fruticultura', 'jaiba'],
          description: 'Sub-bacia essencial para o abastecimento e irrigação agrícola no limite entre Minas Gerais e Bahia.'
        },
        {
          id: 'subbacia-gorutuba',
          label: 'Sub-bacia do Rio Gorutuba & Bico da Pedra',
          category: 'hidro_detalhe',
          tags: ['gorutuba', 'janauba', 'bico-da-pedra', 'reservatorio'],
          description: 'Sistema hídrico vital para o perímetro irrigado do Gorutuba na região SUDENE da Serra Geral.'
        }
      ]
    },
    {
      id: 'territorio-25-regioes-sudene',
      label: 'Território (25 Regiões da SUDENE)',
      category: 'geografia_sudene',
      description: 'As 25 Regiões da SUDENE abrangidas pela análise geográfica, hídrica e ecológica do Norte de Minas e Semiárido',
      children: [
        {
          id: 'sudene-regiao-montes-claros',
          label: 'Região SUDENE 01: Polo Central / Montes Claros (Unimontes)',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-01',
          poloCentral: 'Montes Claros',
          lat: -16.7282,
          lng: -43.8578,
          pctTransicao: 45,
          description: 'Polo universitário, tecnológico e administrativo central do Norte de Minas na área de atuação da SUDENE.'
        },
        {
          id: 'sudene-regiao-januaria',
          label: 'Região SUDENE 02: Médio São Francisco Ocidental / Januária',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-02',
          poloCentral: 'Januária',
          lat: -15.4833,
          lng: -44.3667,
          pctTransicao: 70,
          description: 'Região ribeirinha com ecossistemas de veredas, carste calcário e transição Cerrado-Caatinga.'
        },
        {
          id: 'sudene-regiao-janauba',
          label: 'Região SUDENE 03: Serra Geral Central / Janaúba',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-03',
          poloCentral: 'Janaúba',
          lat: -15.8025,
          lng: -43.3089,
          pctTransicao: 60,
          description: 'Polo agrícola irrigado e de fruticultura no semiárido da SUDENE.'
        },
        {
          id: 'sudene-regiao-salinas',
          label: 'Região SUDENE 04: Alto Rio Pardo Ocidental / Salinas',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-04',
          poloCentral: 'Salinas',
          lat: -16.1611,
          lng: -42.2944,
          pctTransicao: 80,
          description: 'Região de forte presença do bioma Caatinga e clima semiárido estrito.'
        },
        {
          id: 'sudene-regiao-porteirinha',
          label: 'Região SUDENE 05: Serra Geral Ocidental / Porteirinha',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-05',
          poloCentral: 'Porteirinha',
          lat: -15.7442,
          lng: -43.0261,
          pctTransicao: 65,
          description: 'Região de serras e veredas de recarga hídrica no limite da Caatinga.'
        },
        {
          id: 'sudene-regiao-francisco-sa',
          label: 'Região SUDENE 06: Platô de Francisco Sá',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-06',
          poloCentral: 'Francisco Sá',
          lat: -16.5447,
          lng: -43.4883,
          pctTransicao: 50,
          description: 'Área de relevo de transição e ecótono marcado entre Caatinga e Cerrado.'
        },
        {
          id: 'sudene-regiao-pirapora',
          label: 'Região SUDENE 07: Baixo-Médio São Francisco / Pirapora',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-07',
          poloCentral: 'Pirapora',
          lat: -17.3450,
          lng: -44.9419,
          pctTransicao: 35,
          description: 'Região do vale navegação e savanas preservadas do Cerrado.'
        },
        {
          id: 'sudene-regiao-sao-francisco',
          label: 'Região SUDENE 08: Calha do São Francisco / São Francisco',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-08',
          poloCentral: 'São Francisco',
          lat: -15.9486,
          lng: -44.8644,
          pctTransicao: 60,
          description: 'Região de lagoas marginal-fluviais e ecossistemas de várzea no semiárido.'
        },
        {
          id: 'sudene-regiao-bocaiuva',
          label: 'Região SUDENE 09: Vertente Sul Sertaneja / Bocaiúva',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-09',
          poloCentral: 'Bocaiúva',
          lat: -17.1078,
          lng: -43.8150,
          pctTransicao: 40,
          description: 'Região de vegetação mista e transição com o planalto central.'
        },
        {
          id: 'sudene-regiao-taiobeiras',
          label: 'Região SUDENE 10: Alto Rio Pardo Oriental / Taiobeiras',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-10',
          poloCentral: 'Taiobeiras',
          lat: -15.8078,
          lng: -41.6958,
          pctTransicao: 85,
          description: 'Região de semiárido cristalino e espécies hiperxerófilas da Caatinga.'
        },
        {
          id: 'sudene-regiao-rio-pardo-minas',
          label: 'Região SUDENE 11: Serra Nova / Rio Pardo de Minas',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-11',
          poloCentral: 'Rio Pardo de Minas',
          lat: -15.6897,
          lng: -42.5394,
          pctTransicao: 75,
          description: 'Região de serras elevadas e parques estaduais de preservação da Caatinga e Cerrado.'
        },
        {
          id: 'sudene-regiao-jaiba',
          label: 'Região SUDENE 12: Vale Irrigado do Verde Grande / Jaíba',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-12',
          poloCentral: 'Jaíba',
          lat: -15.3400,
          lng: -43.6700,
          pctTransicao: 65,
          description: 'Região do Polo de Irrigação Jaíba fomentado por programas da SUDENE.'
        },
        {
          id: 'sudene-regiao-varzelandia',
          label: 'Região SUDENE 13: Karst & Veredas / Varzelândia',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-13',
          poloCentral: 'Varzelândia',
          lat: -15.7014,
          lng: -44.0272,
          pctTransicao: 70,
          description: 'Região calcária karstica com dolinas e lagoas temporárias.'
        },
        {
          id: 'sudene-regiao-manga',
          label: 'Região SUDENE 14: Extremo Norte Mineiro / Manga',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-14',
          poloCentral: 'Manga',
          lat: -14.7561,
          lng: -43.9261,
          pctTransicao: 80,
          description: 'Região de fronteira agrícola e ambiental com o estado da Bahia no Polígono das Secas.'
        },
        {
          id: 'sudene-regiao-monte-azul',
          label: 'Região SUDENE 15: Divisória Serra Geral / Monte Azul',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-15',
          poloCentral: 'Monte Azul',
          lat: -15.1550,
          lng: -42.8744,
          pctTransicao: 75,
          description: 'Região de transição de escarpas montanhosas para o semiárido.'
        },
        {
          id: 'sudene-regiao-mato-verde',
          label: 'Região SUDENE 16: Veredas da Serra Geral / Mato Verde',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-16',
          poloCentral: 'Mato Verde',
          lat: -15.3975,
          lng: -42.8647,
          pctTransicao: 70,
          description: 'Região de nascentes fluviais de cabeceira da Serra Geral.'
        },
        {
          id: 'sudene-regiao-espinosa',
          label: 'Região SUDENE 17: Fronteira Baiana Semiárida / Espinosa',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-17',
          poloCentral: 'Espinosa',
          lat: -14.9244,
          lng: -42.8194,
          pctTransicao: 85,
          description: 'Região no núcleo do semiárido da SUDENE com vegetação típica de Caatinga.'
        },
        {
          id: 'sudene-regiao-mirabela',
          label: 'Região SUDENE 18: Cinturão de Pequizais / Mirabela',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-18',
          poloCentral: 'Mirabela',
          lat: -16.2619,
          lng: -44.1606,
          pctTransicao: 55,
          description: 'Região de extrativismo sustentável do pequi e frutos nativos do Cerrado.'
        },
        {
          id: 'sudene-regiao-coracao-de-jesus',
          label: 'Região SUDENE 19: Bacia do Rio Corrente / Coração de Jesus',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-19',
          poloCentral: 'Coração de Jesus',
          lat: -16.6853,
          lng: -44.3653,
          pctTransicao: 45,
          description: 'Região paleontológica e hidrológica de recarga do Médio São Francisco.'
        },
        {
          id: 'sudene-regiao-brasilandia-minas',
          label: 'Região SUDENE 20: Transição Ocidental Paracatu-Sertão / Brasilândia de Minas',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-20',
          poloCentral: 'Brasilândia de Minas',
          lat: -17.0031,
          lng: -46.0044,
          pctTransicao: 30,
          description: 'Região ocidental de grande extensão do bioma Cerrado dentro da área da SUDENE.'
        },
        {
          id: 'sudene-regiao-pedras-maria-cruz',
          label: 'Região SUDENE 21: Várzeas Marginais / Pedras de Maria da Cruz',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-21',
          poloCentral: 'Pedras de Maria da Cruz',
          lat: -15.6178,
          lng: -44.4000,
          pctTransicao: 65,
          description: 'Região de lagoas sanzonais e várzeas do Rio São Francisco.'
        },
        {
          id: 'sudene-regiao-itacarambi',
          label: 'Região SUDENE 22: Peruaçu & Cavernas / Itacarambi',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-22',
          poloCentral: 'Itacarambi',
          lat: -15.1022,
          lng: -44.0919,
          pctTransicao: 75,
          description: 'Região do Parque Nacional do Peruaçu, cânions, cavernas e arte rupestre.'
        },
        {
          id: 'sudene-regiao-chapada-gaucha',
          label: 'Região SUDENE 23: Grande Sertão Veredas / Chapada Gaúcha',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-23',
          poloCentral: 'Chapada Gaúcha',
          lat: -15.3047,
          lng: -45.6164,
          pctTransicao: 35,
          description: 'Região do Parque Nacional Grande Sertão Veredas, imortalizado por Guimarães Rosa.'
        },
        {
          id: 'sudene-regiao-grao-mogol',
          label: 'Região SUDENE 24: Campos Rupestres da Serra do Espinhaço / Grão Mogol',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-24',
          poloCentral: 'Grão Mogol',
          lat: -16.5731,
          lng: -42.8961,
          pctTransicao: 60,
          description: 'Região de altitude na Serra do Espinhaço com campos rupestres e alta taxa de endemismo.'
        },
        {
          id: 'sudene-regiao-cristalia',
          label: 'Região SUDENE 25: Vale do Jequitinhonha-Sertão / Cristália',
          category: 'regiao_sudene',
          codigoSudene: 'SUDENE-MG-25',
          poloCentral: 'Cristália',
          lat: -16.7186,
          lng: -42.8622,
          pctTransicao: 65,
          description: 'Região de transição entre o vale do Jequitinhonha e a área sertaneja da SUDENE.'
        }
      ]
    },
    {
      id: 'eixos-tematicos',
      label: 'Eixos Temáticos (Fauna & Flora)',
      category: 'biodiversidade',
      description: 'Espécies indicadoras da biologia e morfologia vegetal/animal nas regiões da SUDENE',
      children: [
        {
          id: 'flora-morfologia-vegetal',
          label: 'Flora & Morfologia Vegetal',
          category: 'especies',
          tags: ['flora', 'pequi', 'buriti', 'ipe-amarelo', 'sempre-vivas', 'cactaceas'],
          description: 'Adaptações morfológicas: cutícula espessa, raízes profundas, suculência e caducifolia.'
        },
        {
          id: 'fauna-dispersores',
          label: 'Fauna & Dispersores de Sementes',
          category: 'especies',
          tags: ['fauna', 'lobo-guara', 'ema', 'tatu-bola', 'arara-azul-de-lear', 'tamandua-bandeira'],
          description: 'Espécies-chave que realizam a manutenção da biodiversidade e dispersão de frutos nativos.'
        }
      ]
    }
  ]
};

export class KnowledgeTreeEngine {
  constructor(treeData = SERTAO_KNOWLEDGE_TREE) {
    this.root = treeData;
  }

  getRoot() {
    return this.root;
  }

  findNodeById(nodeId, current = this.root) {
    if (current.id === nodeId) return current;
    if (current.children) {
      for (const child of current.children) {
        const found = this.findNodeById(nodeId, child);
        if (found) return found;
      }
    }
    return null;
  }

  searchNodes(query, current = this.root, results = []) {
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const labelMatch = current.label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
    const descMatch = current.description && current.description.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q);
    const tagMatch = current.tags && current.tags.some(t => t.toLowerCase().includes(q));

    if (labelMatch || descMatch || tagMatch) {
      results.push({
        id: current.id,
        label: current.label,
        category: current.category,
        description: current.description,
        tags: current.tags || [],
        lat: current.lat,
        lng: current.lng
      });
    }

    if (current.children) {
      for (const child of current.children) {
        this.searchNodes(query, child, results);
      }
    }
    return results;
  }

  getSudeneRegions() {
    const territorioNode = this.findNodeById('territorio-25-regioes-sudene');
    return territorioNode ? territorioNode.children : [];
  }

  getNodePath(nodeId, current = this.root, path = []) {
    const newPath = [...path, { id: current.id, label: current.label, category: current.category }];
    if (current.id === nodeId) return newPath;
    if (current.children) {
      for (const child of current.children) {
        const res = this.getNodePath(nodeId, child, newPath);
        if (res) return res;
      }
    }
    return null;
  }

  formatContextPrompt(nodeId) {
    const node = this.findNodeById(nodeId);
    if (!node) return '';
    const path = this.getNodePath(nodeId);
    const breadcrumb = path ? path.map(p => p.label).join(' > ') : node.label;
    
    return `[KNOWLEDGE_TREE_CONTEXT]
Trilha de Conhecimento: ${breadcrumb}
Categoria: ${node.category}
Descrição: ${node.description || 'N/A'}
Tags: ${node.tags ? node.tags.join(', ') : 'N/A'}`;
  }
}

export const knowledgeTreeEngine = new KnowledgeTreeEngine();
