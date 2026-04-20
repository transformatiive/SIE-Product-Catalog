import { eq } from "drizzle-orm";
import { db } from "./storage";
import { pdfTemplates } from "@shared/schema";

const TEMPLATE_NAME = "SIE Padrão (editável)";

const mf = (key: string, label: string) => ({
  type: "mergeField",
  attrs: { key, label },
});

const t = (text: string) => ({ type: "text", text });

const p = (content: any[] = [], align?: "left" | "center" | "right") => ({
  type: "paragraph",
  ...(align ? { attrs: { textAlign: align } } : {}),
  content: content.length ? content : undefined,
});

const h = (
  level: 1 | 2 | 3,
  content: any[],
  align?: "left" | "center" | "right",
) => ({
  type: "heading",
  attrs: { level, ...(align ? { textAlign: align } : {}) },
  content,
});

const cell = (content: any[]) => ({
  type: "tableCell",
  attrs: { colspan: 1, rowspan: 1 },
  content,
});

const row = (cells: any[]) => ({ type: "tableRow", content: cells });

const table = (rows: any[]) => ({ type: "table", content: rows });

const bold = (text: string) => ({
  type: "text",
  marks: [{ type: "bold" }],
  text,
});

const white = (text: string) => ({
  type: "text",
  marks: [
    { type: "bold" },
    { type: "textStyle", attrs: { color: "#ffffff" } },
    { type: "highlight", attrs: { color: "#E31E24" } },
  ],
  text,
});

const img = (src: string, width = 120) => ({
  type: "image",
  attrs: { src, alt: "", title: null, width },
});

const placeholder = (label: string) => ({
  type: "paragraph",
  attrs: { textAlign: "center" },
  content: [
    {
      type: "text",
      marks: [
        { type: "italic" },
        { type: "textStyle", attrs: { color: "#888888" } },
      ],
      text: `[ ${label} ]`,
    },
  ],
});

const specRow = (label: string, key: string, mfLabel: string) =>
  row([
    cell([p([bold(label)])]),
    cell([p([mf(key, mfLabel)])]),
  ]);

const packRow = (label: string, key: string, mfLabel: string) =>
  row([
    cell([p([t(label)])]),
    cell([p([mf(key, mfLabel)])]),
  ]);

function buildDoc() {
  return {
    type: "doc",
    content: [
      // ===== HEADER: SIE LOGO + RED BAR =====
      table([
        row([
          cell([
            p([img("/attached_assets/sie-logo.png", 100)]),
          ]),
          cell([
            p(
              [
                white("  AGROALIMENTAR  "),
                t("  "),
                white("  FARMACÊUTICA  "),
                t("  "),
                white("  QUÍMICA  "),
                t("  "),
                white("  FITOSSANITÁRIOS  "),
              ],
              "right",
            ),
          ]),
        ]),
      ]),

      h(3, [t("REF. "), mf("productCode", "Referência")]),
      h(1, [mf("product", "Produto")]),
      p([bold("Tipo: "), mf("type", "Tipo")]),
      { type: "horizontalRule" },

      // ===== PAGE 1 - Two columns: image | tech characteristics =====
      h(2, [t("Características Técnicas")]),
      table([
        row([
          cell([
            p([bold("Imagem do produto")], "center"),
            placeholder("Imagem do Produto"),
            p([mf("productImage", "Imagem do Produto")], "center"),
          ]),
          cell([
            p([bold("Capacidade Nominal: "), mf("_capacityWithUnit", "Capacidade Nominal + Unidade")]),
            p([bold("Capacidade Total: "), mf("_totalCapacityWithUnit", "Capacidade Total + Unidade")]),
            p([bold("Peso: "), mf("_weightWithUnit", "Peso + Unidade")]),
            p([bold("Peso c/ Acessórios: "), mf("_weightAccWithUnit", "Peso c/ Acessórios + Unidade")]),
            p([bold("Matéria Prima: "), mf("rawMaterial", "Matéria Prima")]),
            p([bold("Cores Disponíveis: "), mf("colors", "Cores")]),
            p([bold("Contacto Alimentar: "), mf("_foodContactDisplay", "Contacto Alimentar (texto)")]),
            p([bold("Forma: "), mf("shape", "Forma")]),
            p([bold("Empilhável: "), mf("_stackingDisplay", "Empilhável (texto)")]),
          ]),
        ]),
      ]),

      // ===== RECYCLING + EU LOGOS BAR =====
      p(
        [
          {
            type: "text",
            marks: [
              { type: "bold" },
              { type: "textStyle", attrs: { color: "#16a34a" } },
            ],
            text: "♻ 100% Reciclável",
          },
          t("    •    "),
          bold("WWW.SIE.PT"),
        ],
        "center",
      ),
      table([
        row([
          cell([p([img("/attached_assets/centro-2020-logo.png", 90)], "center")]),
          cell([p([img("/attached_assets/portugal-2020-logo.png", 90)], "center")]),
          cell([p([img("/attached_assets/uniao-europeia-logo.png", 90)], "center")]),
        ]),
      ]),
      { type: "horizontalRule" },

      // ===== PAGE 2 - Title =====
      h(2, [
        t("FICHA TÉCNICA  |  "),
        mf("product", "Produto"),
        t("  |  "),
        mf("productCode", "Referência"),
      ]),

      // ===== PAGE 2 - Two columns: drawing+packaging | specs+certs =====
      table([
        row([
          // LEFT COLUMN
          cell([
            h(3, [t("Desenho Técnico 2D")]),
            p([t("Medidas apresentadas em milímetros com tolerância de ±3%")]),
            p([mf("technicalDrawing", "Desenho Técnico")], "center"),

            h(3, [t("Esquema de Acondicionamento")]),
            table([
              packRow("Dimensões da palete", "palletDimensions", "Dimensões da Palete"),
              packRow("Dim. mercadoria na palete", "productOnPalletDimensions", "Dim. Mercadoria na Palete"),
              packRow("Esquema de arrumação", "arrangementScheme", "Esquema de Arrumação"),
              packRow("Total de unidades", "_totalUnitsDisplay", "Total Unidades (texto)"),
            ]),
            p([mf("palletizationImage", "Imagem de Paletização")], "center"),
          ]),

          // RIGHT COLUMN
          cell([
            h(3, [t("Características Técnicas")]),
            table([
              specRow("Capacidade nominal", "_capacityWithUnit", "Capacidade Nominal + Unidade"),
              specRow("Capacidade total", "_totalCapacityWithUnit", "Capacidade Total + Unidade"),
              specRow("Peso", "_weightWithUnit", "Peso + Unidade"),
              specRow("Peso c/ acessórios", "_weightAccWithUnit", "Peso c/ Acessórios + Unidade"),
              specRow("Acessórios", "accessories", "Acessórios"),
              specRow("Forma", "shape", "Forma"),
              specRow("Matéria prima", "rawMaterial", "Matéria Prima"),
              specRow("Cores disponíveis", "colors", "Cores"),
              specRow("Contacto alimentar", "_foodContactDisplay", "Contacto Alimentar (texto)"),
              specRow("Designação", "designation", "Designação"),
              specRow("Código de barras", "barcode", "Código de Barras"),
              specRow("Empilhável", "_stackingDisplay", "Empilhável (texto)"),
              specRow("Sistema de fecho", "closingSystem", "Sistema de Fecho"),
              specRow("Tipo de tampa", "capType", "Tipo de Tampa"),
              specRow("Dimensões da tampa", "capDimensions", "Dimensões da Tampa"),
              specRow("Vedante", "_vedanteList", "Lista de Vedantes"),
              specRow("Sistema de manuseamento", "_manuseamentoList", "Lista de Manuseamento"),
              specRow("Gravação Cliente", "gravacaoClienteDetails", "Gravação Cliente (detalhes)"),
              specRow("Autocolante Cliente", "autoculanteCliente", "Autocolante Cliente"),
              specRow("Marcações", "_marcacoesList", "Lista de Marcações"),
              specRow("Outras características", "_outrasList", "Lista de Outras Características"),
              specRow("ADR", "_adrDisplay", "ADR (texto)"),
            ]),

            h(3, [t("Certificações")]),
            p([t("Produto certificado pelos organismos competentes.")]),
          ]),
        ]),
      ]),

      { type: "horizontalRule" },
      p([
        bold("Aprovado por: "),
        mf("approvedBy", "Aprovado por"),
        t("    "),
        bold("Data: "),
        mf("approvalDate", "Data de Aprovação"),
      ]),
      p([t("Versão "), mf("currentVersionNumber", "Versão Actual"), t(" — "), mf("today", "Data de Hoje")]),
    ],
  };
}

async function run() {
  const existing = await db
    .select()
    .from(pdfTemplates)
    .where(eq(pdfTemplates.name, TEMPLATE_NAME))
    .limit(1);

  const content = JSON.stringify(buildDoc());

  if (existing.length > 0) {
    await db
      .update(pdfTemplates)
      .set({ content, updatedAt: new Date() })
      .where(eq(pdfTemplates.id, existing[0].id));
    console.log(`[seed] Updated editable template: ${TEMPLATE_NAME} (${existing[0].id})`);
  } else {
    const [created] = await db
      .insert(pdfTemplates)
      .values({
        name: TEMPLATE_NAME,
        description:
          "Versão editável da ficha técnica SIE. Use como base para criar variações personalizadas — todos os campos são variáveis e podem ser substituídos, removidos ou complementados.",
        content,
        pageSize: "A4",
        orientation: "portrait",
        builtInRenderer: null,
        isGlobalDefault: false,
        isActive: true,
      })
      .returning();
    console.log(`[seed] Created editable template: ${TEMPLATE_NAME} (${created.id})`);
  }

  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
