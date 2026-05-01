/**
 * Generates a Zoho Writer starter template (.docx) that mirrors the existing
 * built-in PDF datasheet layout, with every merge-field placeholder pre-inserted.
 *
 * Output: templates/zoho-writer-starter.docx
 *
 * The customer uploads this file to their Zoho WorkDrive, opens it in Zoho Writer
 * (which auto-converts .docx and recognises {{...}} as merge fields), and assigns
 * it to a family in Admin → Famílias.
 *
 * Run:  npx tsx scripts/generate-zoho-template.ts
 */

import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeightRule,
  ShadingType,
  PageBreak,
  HeadingLevel,
} from "docx";
import * as fs from "fs";
import * as path from "path";

const SIE_RED = "E31E24";
const TEXT_DARK = "333333";
const MUTED = "888888";
const LIGHT_BG = "F8F8F8";
const RECYCLABLE_GREEN = "2E7D32";

const noBorder = {
  top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

const lightRowBorder = {
  top: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
  left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
  insideHorizontal: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
  insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
};

function shaded(fillHex: string) {
  return { type: ShadingType.SOLID, color: "auto", fill: fillHex };
}

function p(opts: {
  text?: string;
  runs?: TextRun[];
  bold?: boolean;
  color?: string;
  size?: number;
  align?: typeof AlignmentType[keyof typeof AlignmentType];
  spacingBefore?: number;
  spacingAfter?: number;
  caps?: boolean;
}) {
  const runs =
    opts.runs ??
    [
      new TextRun({
        text: opts.text ?? "",
        bold: opts.bold,
        color: opts.color,
        size: opts.size,
        allCaps: opts.caps,
      }),
    ];
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: opts.spacingBefore, after: opts.spacingAfter },
    children: runs,
  });
}

function mergeRun(field: string, opts: { bold?: boolean; color?: string; size?: number } = {}) {
  return new TextRun({
    text: `{{${field}}}`,
    bold: opts.bold,
    color: opts.color,
    size: opts.size,
  });
}

function headerBand() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        height: { value: 1700, rule: HeightRule.EXACT },
        children: [
          new TableCell({
            shading: shaded(SIE_RED),
            width: { size: 30, type: WidthType.PERCENTAGE },
            verticalAlign: "center",
            margins: { top: 200, bottom: 200, left: 400, right: 200 },
            children: [
              p({
                text: "SIE",
                bold: true,
                color: "FFFFFF",
                size: 56,
              }),
            ],
          }),
          new TableCell({
            shading: shaded(SIE_RED),
            width: { size: 70, type: WidthType.PERCENTAGE },
            verticalAlign: "center",
            margins: { top: 100, bottom: 100, left: 200, right: 400 },
            children: [
              p({
                text: "AGROALIMENTAR  •  FARMACÊUTICA  •  QUÍMICA  •  FITOSSANITÁRIOS",
                bold: true,
                color: "FFFFFF",
                size: 18,
                align: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function characteristicRow(label: string, mergeField: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 6, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        margins: { top: 80, bottom: 80, left: 80, right: 0 },
        borders: noBorder,
        children: [
          p({
            runs: [new TextRun({ text: "●", color: SIE_RED, size: 22, bold: true })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 94, type: WidthType.PERCENTAGE },
        verticalAlign: "center",
        margins: { top: 60, bottom: 60, left: 120, right: 80 },
        borders: noBorder,
        children: [
          p({
            text: label,
            color: MUTED,
            size: 14,
            caps: true,
          }),
          p({
            runs: [mergeRun(mergeField, { bold: true, color: TEXT_DARK, size: 20 })],
          }),
        ],
      }),
    ],
  });
}

function specRow(label: string, mergeField: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 8, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 80, right: 0 },
        borders: lightRowBorder,
        children: [p({ runs: [new TextRun({ text: "●", color: SIE_RED, size: 18 })] })],
      }),
      new TableCell({
        width: { size: 47, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        borders: lightRowBorder,
        children: [
          p({
            text: label,
            color: "777777",
            size: 16,
            caps: true,
          }),
        ],
      }),
      new TableCell({
        width: { size: 45, type: WidthType.PERCENTAGE },
        margins: { top: 80, bottom: 80, left: 80, right: 80 },
        borders: lightRowBorder,
        children: [
          p({
            runs: [mergeRun(mergeField, { bold: true, color: TEXT_DARK, size: 18 })],
            align: AlignmentType.RIGHT,
          }),
        ],
      }),
    ],
  });
}

function packagingRow(label: string, mergeField: string) {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 60, type: WidthType.PERCENTAGE },
        shading: shaded(LIGHT_BG),
        margins: { top: 100, bottom: 100, left: 200, right: 100 },
        borders: lightRowBorder,
        children: [
          p({ text: label, color: "666666", size: 16, caps: true }),
        ],
      }),
      new TableCell({
        width: { size: 40, type: WidthType.PERCENTAGE },
        shading: shaded(LIGHT_BG),
        margins: { top: 100, bottom: 100, left: 100, right: 200 },
        borders: lightRowBorder,
        children: [
          p({
            runs: [mergeRun(mergeField, { bold: true, color: SIE_RED, size: 20 })],
            align: AlignmentType.RIGHT,
          }),
        ],
      }),
    ],
  });
}

function placeholderBox(text: string, height = 4000) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 4, color: "DDDDDD" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        height: { value: height, rule: HeightRule.ATLEAST },
        children: [
          new TableCell({
            shading: shaded(LIGHT_BG),
            verticalAlign: "center",
            margins: { top: 400, bottom: 400, left: 200, right: 200 },
            children: [
              p({
                text,
                color: "999999",
                size: 18,
                align: AlignmentType.CENTER,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function sectionTitle(text: string) {
  return p({
    runs: [new TextRun({ text, bold: true, color: SIE_RED, size: 22, allCaps: true })],
    spacingBefore: 200,
    spacingAfter: 80,
  });
}

function sectionSubtitle(text: string) {
  return p({
    runs: [new TextRun({ text, color: MUTED, size: 16, italics: true })],
    spacingAfter: 100,
  });
}

function bottomStrip() {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: { top: 200, bottom: 100, left: 0, right: 0 },
            borders: noBorder,
            children: [
              p({
                runs: [
                  new TextRun({ text: "100%  ", bold: true, color: RECYCLABLE_GREEN, size: 20 }),
                  new TextRun({ text: "RECICLÁVEL", bold: true, color: RECYCLABLE_GREEN, size: 16, allCaps: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 34, type: WidthType.PERCENTAGE },
            margins: { top: 200, bottom: 100, left: 0, right: 0 },
            borders: noBorder,
            children: [
              p({
                runs: [new TextRun({ text: "WWW.SIE.PT", bold: true, color: SIE_RED, size: 24 })],
                align: AlignmentType.CENTER,
              }),
            ],
          }),
          new TableCell({
            width: { size: 33, type: WidthType.PERCENTAGE },
            margins: { top: 200, bottom: 100, left: 0, right: 0 },
            borders: noBorder,
            children: [
              p({
                runs: [new TextRun({ text: "pág. 1/2", color: "666666", size: 16 })],
                align: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function buildPage1(): (Paragraph | Table)[] {
  // 2-column layout: image placeholder | technical characteristics
  const twoColumn = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 0, right: 200 },
            borders: noBorder,
            children: [placeholderBox("Imagem do produto\n(insira a imagem aqui)", 5000)],
          }),
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 200, right: 0 },
            borders: noBorder,
            children: [
              sectionTitle("Características Técnicas"),
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: noBorder,
                rows: [
                  characteristicRow("Capacidade nominal", "nominal_capacity"),
                  characteristicRow("Capacidade total", "total_capacity"),
                  characteristicRow("Peso", "weight"),
                  characteristicRow("Matéria prima", "raw_material"),
                  characteristicRow("Cores disponíveis", "colors"),
                  characteristicRow("Contacto alimentar", "food_contact"),
                  characteristicRow("Forma", "shape"),
                  characteristicRow("Empilhável", "stackable"),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return [
    headerBand(),
    p({ spacingAfter: 120 }),
    p({
      runs: [new TextRun({ text: "REF. ", bold: true, color: "999999", size: 22 }), mergeRun("product_code", { bold: true, color: "999999", size: 22 })],
      spacingAfter: 80,
    }),
    p({
      runs: [mergeRun("product", { bold: true, color: SIE_RED, size: 56 })],
      spacingAfter: 60,
    }),
    p({
      runs: [mergeRun("type", { color: "666666", size: 28 })],
      spacingAfter: 240,
    }),
    twoColumn,
    p({ spacingAfter: 120 }),
    bottomStrip(),
  ];
}

function buildPage2(): (Paragraph | Table)[] {
  const leftColumn = [
    sectionTitle("Desenho Técnico 2D"),
    sectionSubtitle("Medidas apresentadas em milímetros com tolerância de ±3%"),
    placeholderBox("Desenho técnico 2D\n(insira o desenho aqui)", 3500),
    p({ spacingAfter: 80 }),
    sectionTitle("Esquema de Acondicionamento"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows: [
        packagingRow("Dimensões da palete", "pallet_dimensions"),
        packagingRow("Dim. mercadoria na palete", "product_on_pallet_dimensions"),
        packagingRow("Esquema de arrumação", "arrangement_scheme"),
        packagingRow("Total de unidades", "total_units"),
      ],
    }),
    p({ spacingAfter: 100 }),
    placeholderBox("Imagem de paletização\n(opcional)", 2500),
  ];

  const rightColumn = [
    sectionTitle("Características Técnicas"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows: [
        specRow("Capacidade nominal", "nominal_capacity"),
        specRow("Capacidade total", "total_capacity"),
        specRow("Peso", "weight"),
        specRow("Peso c/ acessórios", "weight_with_accessories"),
        specRow("Acessórios", "accessories"),
        specRow("Forma", "shape"),
        specRow("Matéria prima", "raw_material"),
        specRow("Cores disponíveis", "colors"),
        specRow("Contacto alimentar", "food_contact"),
        specRow("Designação", "designation"),
        specRow("Código de barras", "barcode"),
        specRow("Empilhável", "stackable"),
        specRow("Sistema de fecho", "closing_system"),
        specRow("Tipo de tampa", "cap_type"),
        specRow("Dimensões da tampa", "cap_dimensions"),
        specRow("Vedante", "sealing_type"),
        specRow("Sistema de manuseamento", "handling_system"),
        specRow("ADR", "adr_code"),
      ],
    }),
    p({ spacingAfter: 200 }),
    sectionTitle("Certificações"),
    sectionSubtitle("Produto certificado pelos organismos:"),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorder,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              borders: noBorder,
              shading: shaded("F0F0F0"),
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                p({ text: "CENTRO 2020", bold: true, color: "444444", size: 14, align: AlignmentType.CENTER }),
              ],
            }),
            new TableCell({
              borders: noBorder,
              shading: shaded("F0F0F0"),
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                p({ text: "PORTUGAL 2020", bold: true, color: "444444", size: 14, align: AlignmentType.CENTER }),
              ],
            }),
            new TableCell({
              borders: noBorder,
              shading: shaded("F0F0F0"),
              margins: { top: 120, bottom: 120, left: 120, right: 120 },
              children: [
                p({ text: "UNIÃO EUROPEIA", bold: true, color: "444444", size: 14, align: AlignmentType.CENTER }),
              ],
            }),
          ],
        }),
      ],
    }),
  ];

  const twoColumn = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorder,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 0, right: 200 },
            borders: noBorder,
            children: leftColumn,
          }),
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            margins: { top: 0, bottom: 0, left: 200, right: 0 },
            borders: noBorder,
            children: rightColumn,
          }),
        ],
      }),
    ],
  });

  const footer = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: "EEEEEE" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorder,
            margins: { top: 200, bottom: 100, left: 0, right: 0 },
            children: [
              p({
                runs: [
                  new TextRun({ text: "Aprovado por: ", color: "777777", size: 14 }),
                  mergeRun("approved_by", { color: "777777", size: 14, bold: true }),
                  new TextRun({ text: "    Data: ", color: "777777", size: 14 }),
                  mergeRun("approval_date", { color: "777777", size: 14, bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: noBorder,
            margins: { top: 200, bottom: 100, left: 0, right: 0 },
            children: [
              p({
                runs: [new TextRun({ text: "pág. 2/2", color: "666666", size: 14 })],
                align: AlignmentType.RIGHT,
              }),
            ],
          }),
        ],
      }),
    ],
  });

  return [
    new Paragraph({ children: [new PageBreak()] }),
    headerBand(),
    p({ spacingAfter: 200 }),
    p({
      runs: [
        new TextRun({ text: "FICHA TÉCNICA  |  ", bold: true, color: TEXT_DARK, size: 22 }),
        mergeRun("product", { bold: true, color: TEXT_DARK, size: 22 }),
        new TextRun({ text: "  |  ", bold: true, color: TEXT_DARK, size: 22 }),
        mergeRun("product_code", { bold: true, color: TEXT_DARK, size: 22 }),
      ],
      align: AlignmentType.CENTER,
      spacingAfter: 240,
    }),
    twoColumn,
    p({ spacingAfter: 200 }),
    footer,
  ];
}

async function generate() {
  const doc = new Document({
    creator: "SIE Product Catalog",
    title: "Datasheet — Zoho Writer Starter Template",
    description:
      "Starter template mirroring the built-in PDF datasheet, with merge field placeholders for Zoho Writer.",
    styles: {
      default: {
        document: {
          run: { font: "Helvetica", size: 18, color: TEXT_DARK },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, right: 720, bottom: 720, left: 720 },
          },
        },
        children: [...buildPage1(), ...buildPage2()],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outDir = path.join(process.cwd(), "templates");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "zoho-writer-starter.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
