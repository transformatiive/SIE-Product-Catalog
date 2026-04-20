// Catalog of merge fields available inside PDF templates.
// Each field has a stable `key` referenced by the editor and a human `label`.
// Server-side extractors live in server/template-renderer.ts.

export interface MergeFieldDef {
  key: string;
  label: string;
  section: string;
  example?: string;
}

export const MERGE_FIELD_SECTIONS = [
  "Identificação",
  "Capacidade",
  "Peso",
  "Material e Cor",
  "Sistema de Fecho",
  "Vedante",
  "Manuseamento",
  "Marcações",
  "Outras Características",
  "Empilhamento",
  "Embalagem",
  "Certificações",
  "Imagens",
  "Aprovação",
  "Datas",
  "Compostos",
] as const;

export const MERGE_FIELDS: MergeFieldDef[] = [
  // Identificação
  { key: "productCode", label: "Referência", section: "Identificação", example: "0541-A127-..." },
  { key: "product", label: "Produto", section: "Identificação", example: "GARRAFÃO 5L" },
  { key: "model", label: "Modelo", section: "Identificação" },
  { key: "family", label: "Família", section: "Identificação" },
  { key: "type", label: "Tipo", section: "Identificação" },
  { key: "shape", label: "Forma", section: "Identificação" },
  { key: "designation", label: "Designação", section: "Identificação" },
  { key: "barcode", label: "Código de Barras", section: "Identificação" },

  // Capacidade
  { key: "nominalCapacity", label: "Capacidade Nominal", section: "Capacidade" },
  { key: "nominalCapacityUnit", label: "Unidade Cap. Nominal", section: "Capacidade" },
  { key: "totalCapacity", label: "Capacidade Total", section: "Capacidade" },
  { key: "totalCapacityUnit", label: "Unidade Cap. Total", section: "Capacidade" },

  // Peso
  { key: "weight", label: "Peso", section: "Peso" },
  { key: "weightUnit", label: "Unidade do Peso", section: "Peso" },
  { key: "weightTolerance", label: "Tolerância de Peso (%)", section: "Peso" },
  { key: "weightWithAccessories", label: "Peso c/ Acessórios", section: "Peso" },
  { key: "weightWithAccessoriesUnit", label: "Unidade Peso c/ Acessórios", section: "Peso" },
  { key: "accessories", label: "Acessórios", section: "Peso" },

  // Material e Cor
  { key: "rawMaterial", label: "Matéria Prima", section: "Material e Cor" },
  { key: "colors", label: "Cores", section: "Material e Cor" },

  // Sistema de Fecho
  { key: "closingSystem", label: "Sistema de Fecho", section: "Sistema de Fecho" },
  { key: "capType", label: "Tipo de Tampa", section: "Sistema de Fecho" },
  { key: "capDimensions", label: "Dimensões da Tampa", section: "Sistema de Fecho" },

  // Vedante
  { key: "sealingType", label: "Tipo de Vedante", section: "Vedante" },
  { key: "vedantePead", label: "Vedante PEAD", section: "Vedante" },
  { key: "vedanteEpdm", label: "Vedante EPDM", section: "Vedante" },
  { key: "vedanteOutros", label: "Outros Vedantes", section: "Vedante" },

  // Manuseamento
  { key: "handlingSystem", label: "Sistema de Manuseamento", section: "Manuseamento" },
  { key: "pegasLaterais", label: "Pegas Laterais", section: "Manuseamento" },
  { key: "pegaSuperior", label: "Pega Superior", section: "Manuseamento" },
  { key: "cavidades", label: "Cavidades", section: "Manuseamento" },
  { key: "manuseamentoOutros", label: "Outros (Manuseamento)", section: "Manuseamento" },

  // Marcações
  { key: "datador", label: "Datador", section: "Marcações" },
  { key: "simboloSie", label: "Símbolo SIE", section: "Marcações" },
  { key: "simboloMp", label: "Símbolo MP", section: "Marcações" },
  { key: "gravacaoCliente", label: "Gravação Cliente", section: "Marcações" },
  { key: "gravacaoClienteDetails", label: "Gravação Cliente (detalhes)", section: "Marcações" },

  // Outras Características
  { key: "visor", label: "Visor", section: "Outras Características" },
  { key: "bica", label: "Bica", section: "Outras Características" },
  { key: "coexPoliamida", label: "COEX Poliamida", section: "Outras Características" },
  { key: "adaptacao", label: "Adaptação", section: "Outras Características" },
  { key: "autoculanteCliente", label: "Autocolante Cliente", section: "Outras Características" },
  { key: "especificacoesEmbFlexiveis", label: "Especif. Emb. Flexíveis", section: "Outras Características" },

  // Empilhamento
  { key: "stackable", label: "Empilhável", section: "Empilhamento" },
  { key: "stackingCapacity", label: "Capacidade de Empilhamento", section: "Empilhamento" },

  // Embalagem
  { key: "palletDimensions", label: "Dimensões da Palete", section: "Embalagem" },
  { key: "productOnPalletDimensions", label: "Dim. Mercadoria na Palete", section: "Embalagem" },
  { key: "arrangementScheme", label: "Esquema de Arrumação", section: "Embalagem" },
  { key: "totalUnits", label: "Total de Unidades (legacy)", section: "Embalagem" },
  { key: "totalUnitsQuantity", label: "Quantidade Total", section: "Embalagem" },
  { key: "totalUnitsType", label: "Tipo (palete/caixa/...)", section: "Embalagem" },

  // Certificações
  { key: "foodContact", label: "Contacto Alimentar", section: "Certificações" },
  { key: "adrCertified", label: "ADR Certificado", section: "Certificações" },
  { key: "adrCode", label: "Código ADR", section: "Certificações" },

  // Imagens
  { key: "productImage", label: "Imagem do Produto", section: "Imagens" },
  { key: "technicalDrawing", label: "Desenho Técnico", section: "Imagens" },
  { key: "palletizationImage", label: "Imagem de Paletização", section: "Imagens" },

  // Aprovação
  { key: "approvedBy", label: "Aprovado por", section: "Aprovação" },
  { key: "approvalDate", label: "Data de Aprovação", section: "Aprovação" },
  { key: "notes", label: "Notas", section: "Aprovação" },

  // Datas
  { key: "createdAt", label: "Data de Criação", section: "Datas" },
  { key: "updatedAt", label: "Data de Actualização", section: "Datas" },
  { key: "currentVersionNumber", label: "Versão Actual", section: "Datas" },
  { key: "today", label: "Data de Hoje", section: "Datas" },

  // Compostos (calculated)
  { key: "_capacityWithUnit", label: "Capacidade Nominal + Unidade", section: "Compostos" },
  { key: "_totalCapacityWithUnit", label: "Capacidade Total + Unidade", section: "Compostos" },
  { key: "_weightWithUnit", label: "Peso + Unidade", section: "Compostos" },
  { key: "_weightAccWithUnit", label: "Peso c/ Acessórios + Unidade", section: "Compostos" },
  { key: "_marcacoesList", label: "Lista de Marcações", section: "Compostos" },
  { key: "_outrasList", label: "Lista de Outras Características", section: "Compostos" },
  { key: "_vedanteList", label: "Lista de Vedantes", section: "Compostos" },
  { key: "_manuseamentoList", label: "Lista de Manuseamento", section: "Compostos" },
  { key: "_stackingDisplay", label: "Empilhável (texto)", section: "Compostos" },
  { key: "_foodContactDisplay", label: "Contacto Alimentar (texto)", section: "Compostos" },
  { key: "_totalUnitsDisplay", label: "Total Unidades (texto)", section: "Compostos" },
  { key: "_adrDisplay", label: "ADR (texto)", section: "Compostos" },
];

export const MERGE_FIELDS_BY_KEY: Record<string, MergeFieldDef> = MERGE_FIELDS.reduce(
  (acc, f) => {
    acc[f.key] = f;
    return acc;
  },
  {} as Record<string, MergeFieldDef>,
);

export function getMergeFieldLabel(key: string): string {
  return MERGE_FIELDS_BY_KEY[key]?.label ?? key;
}
