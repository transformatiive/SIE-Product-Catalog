/**
 * Barricas import — DRY-RUN parser / mapper / report (TRNSF-901, Phase 3).
 *
 * Reads the SIE "Barricas" workbook (two-tier header, 45 columns, one row per
 * variant) described in
 *   attached_assets/Pasted--Barricas-Product-Datasheet-Import-Spec-...txt
 * groups rows by Modelo, separates the parent/template row from its variants,
 * maps each variant onto the app's `products` shape, applies the documented
 * data-quality rules, and prints an import report.
 *
 * It is intentionally **dry-run only**: it never touches the database and makes
 * no schema changes. Run a real import only after:
 *   - the actual source file is available,
 *   - SIE confirms Q1 (matéria-prima drift) and Q13 (adaptation meanings),
 *   - the reference/unique-key strategy is decided (the source has no
 *     reference column — references are generated, or typed from PHC).
 *
 * Usage:
 *   tsx scripts/import-barricas.ts --self-test
 *   tsx scripts/import-barricas.ts <file.xlsx> [--json out.json]
 */

import * as XLSX from "xlsx";

// ---------------------------------------------------------------------------
// Column indices (0-based) per the import spec. The source has duplicate
// header names, so columns MUST be resolved by index, not by name.
// ---------------------------------------------------------------------------
const COL = {
  modelo: 0,
  familia: 1,
  tipo: 2,
  produto: 3,
  capacidadeNominal: 4,
  materiaPrima: 5,
  cores: 6,
  peso: 7,
  capacidadeTotal: 8,
  diametro: 9, // c / Ø (mm)
  largura: 10, // l (mm)
  altura: 11, // h (mm)
  tipoTampa: 12,
  dimensoesTampa: 13,
  certificacao: 14, // Tipo.1
  adr: 15,
  aptoContatoAlimentar: 16,
  pead: 17,
  epdm: 18,
  vedanteOutros: 19,
  pegasLaterais: 20,
  pegaSuperior: 21,
  cavidades: 22,
  manuseamentoOutros: 23, // Outros.1 ("Frisos para Empilhador")
  datador: 24,
  simboloSie: 25,
  simboloMp: 26,
  capacidadeMarcacao: 27, // Capacidade Nominal.1 (engraved flag)
  gravacaoCliente: 28,
  visor: 29,
  bica: 30,
  coex: 31,
  adaptacao: 32, // CAV / ASA / P/T CAV / P/T ASA
  autocolanteCliente: 33,
  especificacoesEmbFlexiveis: 34,
  caracteristicasEspeciais: 35,
  observacoes: 36,
  empilhavel: 37,
  capacidadeEmpilhamento: 38,
  tipoEmbalamento: 39, // Tipo.2 (PALETE / SACO / #N/A)
  dimensoesPalete: 40,
  dimensoesMercadoria: 41,
  esquemaArrumacao: 42,
  totalUnidades: 43,
  notas: 44,
} as const;

// ---------------------------------------------------------------------------
// Cell sanitizers
// ---------------------------------------------------------------------------
const str = (v: unknown): string => (v === null || v === undefined ? "" : String(v).trim());

const ERROR_STRINGS = ["#N/A", "#n/a", "Erro:509", "erro:509", "N/A", "n/a"];
function clean(v: unknown): string {
  const s = str(v);
  return ERROR_STRINGS.includes(s) ? "" : s;
}

/** Boolean columns use 1 / 0 / blank — all of 0/blank/false mean false. */
function bool(v: unknown): boolean {
  const s = str(v).toLowerCase();
  return s === "1" || s === "true" || s === "sim" || s === "x";
}

/** "30L" -> { value:"30", unit:"L" };  "5,3Kg" -> { value:"5.3", unit:"kg" } */
function splitValueUnit(v: unknown): { value: string; unit: string } {
  const s = clean(v).replace(",", ".");
  const m = s.match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (!m) return { value: s, unit: "" };
  return { value: m[1], unit: (m[2] || "").toLowerCase() };
}

/** Title-case a single colour token (variants are UPPERCASE, parents Title). */
function normalizeColor(v: unknown): string {
  const s = clean(v);
  if (!s || s.includes(",")) return s; // comma list = parent, leave as-is
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function normalizeCapType(v: unknown): string {
  const s = clean(v);
  return s.replace(/tampa\s+de\s+rosca/i, "Tampa Rosca");
}

/** Matéria-prima is polluted with colour codes (~30% of rows). */
function isMateriaPrimaPolluted(v: unknown): boolean {
  const s = clean(v).toLowerCase();
  return s.includes("cor /") || /^\d+\.\s*cor/.test(s);
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------
export type Row = unknown[];

export function readWorkbookRows(filePath: string): Row[] {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  return rowsFromSheet(sheet);
}

export function rowsFromSheet(sheet: XLSX.WorkSheet): Row[] {
  const aoa = XLSX.utils.sheet_to_json<Row>(sheet, { header: 1, defval: "" });
  // Row 0 = category band, row 1 = field names, rows 2+ = data.
  return aoa.slice(2).filter((r) => str(r[COL.modelo]) !== "");
}

export interface ModelGroup {
  modelo: string;
  parent: Row;
  variants: Row[]; // excludes the parent unless it is the only row
}

export function groupByModelo(rows: Row[]): ModelGroup[] {
  const map = new Map<string, Row[]>();
  for (const r of rows) {
    const key = str(r[COL.modelo]);
    (map.get(key) ?? map.set(key, []).get(key)!).push(r);
  }
  return Array.from(map, ([modelo, items]) => {
    const parentIdx = items.findIndex(isParentRow);
    const parent = parentIdx >= 0 ? items[parentIdx] : items[0];
    const variants = items.length === 1 ? items : items.filter((r) => r !== parent);
    return { modelo, parent, variants };
  });
}

/** Parent/template row: comma-separated Cores OR empty certification. */
export function isParentRow(r: Row): boolean {
  const cores = str(r[COL.cores]);
  const cert = str(r[COL.certificacao]);
  return cores.includes(",") || cert === "";
}

// ---------------------------------------------------------------------------
// Mapping a variant row -> products-shaped object (+ per-row flags)
// ---------------------------------------------------------------------------
export interface MappedProduct {
  model: string;
  family: string;
  type: string;
  product: string;
  nominalCapacity: string;
  nominalCapacityUnit: string;
  totalCapacity: string;
  totalCapacityUnit: string;
  rawMaterial: string;
  colors: string;
  weight: string;
  weightUnit: string;
  dimensions: string; // JSON
  capType: string;
  capDimensions: string;
  adrCertified: boolean;
  adrCode: string;
  foodContact: boolean;
  vedantePead: boolean;
  vedanteEpdm: boolean;
  pegasLaterais: boolean;
  pegaSuperior: boolean;
  cavidades: boolean;
  manuseamentoOutros: string;
  datador: boolean;
  simboloSie: boolean;
  simboloMp: boolean;
  gravacaoCliente: boolean;
  gravacaoClienteDetails: string;
  visor: boolean;
  bica: boolean;
  adaptacao: boolean;
  specialFeatures: string; // JSON
  stackable: boolean;
  stackingCapacity: string;
  totalUnitsType: string;
  totalUnitsQuantity: string;
  palletDimensions: string;
  productOnPalletDimensions: string;
  arrangementScheme: string;
  notes: string;
  // import-only metadata (not a product column)
  _flags: string[];
  _adaptacaoType: string; // CAV/ASA/... — no column yet; surfaced for review
  _foodContactCondition: string; // "", "conditional", "warning"
}

export function mapVariant(variant: Row, parent: Row, modelo: string): MappedProduct {
  const flags: string[] = [];

  const cap = splitValueUnit(variant[COL.capacidadeNominal] || parent[COL.capacidadeNominal]);
  const total = splitValueUnit(variant[COL.capacidadeTotal]);
  const weight = splitValueUnit(variant[COL.peso] || parent[COL.peso]);

  // Dimensions: take Ø/altura from the PARENT (authoritative — autofill drift),
  // width from the variant when present (rectangular products).
  const diametro = clean(parent[COL.diametro]).replace(/^Ø/i, "");
  const altura = clean(parent[COL.altura]);
  const largura = clean(variant[COL.largura]);
  const dims: Record<string, string> = {};
  if (diametro) dims["Ø"] = diametro;
  if (altura) dims["h"] = altura;
  if (largura) dims["l"] = largura;

  // Matéria-prima: default polluted cells to PEAD and flag.
  let rawMaterial = clean(variant[COL.materiaPrima] || parent[COL.materiaPrima]);
  if (isMateriaPrimaPolluted(rawMaterial)) {
    flags.push(`matéria-prima poluída ("${rawMaterial}") → PEAD`);
    rawMaterial = "PEAD";
  }

  // Food contact: 🍴 / 🍴* = yes;  ▲ = warning (meaning pending Q8).
  const apto = clean(variant[COL.aptoContatoAlimentar]);
  let foodContact = false;
  let foodCondition = "";
  if (apto.includes("🍴")) {
    foodContact = true;
    if (apto.includes("*")) foodCondition = "conditional";
  } else if (apto.includes("▲")) {
    foodCondition = "warning";
    flags.push('"▲" em Apto Contacto Alimentar (significado por confirmar)');
  }

  const cert = clean(variant[COL.certificacao]);
  const adr = clean(variant[COL.adr]);
  const adrCertified = cert.toUpperCase() === "CERTIFICADO" || !!adr;

  // Client engraving: strip the "G." prefix and stray whitespace.
  const grav = clean(variant[COL.gravacaoCliente]);
  const gravDetails = grav.replace(/^g\.\s*/i, "").trim();

  const adaptacaoType = clean(variant[COL.adaptacao]);

  const special = [clean(variant[COL.caracteristicasEspeciais])].filter(Boolean);
  const notesParts = [clean(variant[COL.observacoes]), clean(variant[COL.notas])].filter(Boolean);

  // Total units may be pipe-separated alternatives ("15 | 18") — keep the first.
  const totalUnits = clean(variant[COL.totalUnidades] || parent[COL.totalUnidades]).split("|")[0].trim();

  const family = clean(variant[COL.familia] || parent[COL.familia]);
  const type = clean(variant[COL.tipo] || parent[COL.tipo]);
  const product = clean(variant[COL.produto] || parent[COL.produto]) || "BARRICA";

  if (!family || !type || !cap.value) {
    flags.push("registo incompleto (sem família/tipo/capacidade) — importar como rascunho");
  }
  if (bool(variant[COL.capacidadeMarcacao])) flags.push("capacidade gravada no produto (sem campo dedicado)");
  if (adaptacaoType) flags.push(`adaptação "${adaptacaoType}" (sem campo dedicado — guardado nas notas)`);

  return {
    model: modelo,
    family,
    type,
    product,
    nominalCapacity: cap.value,
    nominalCapacityUnit: cap.unit || "L",
    totalCapacity: total.value,
    totalCapacityUnit: total.unit || "L",
    rawMaterial,
    colors: normalizeColor(variant[COL.cores]),
    weight: weight.value,
    weightUnit: weight.unit || "g",
    dimensions: JSON.stringify(dims),
    capType: normalizeCapType(parent[COL.tipoTampa] || variant[COL.tipoTampa]),
    capDimensions: clean(parent[COL.dimensoesTampa] || variant[COL.dimensoesTampa]),
    adrCertified,
    adrCode: adr,
    foodContact,
    vedantePead: bool(variant[COL.pead]),
    vedanteEpdm: bool(variant[COL.epdm]),
    pegasLaterais: bool(variant[COL.pegasLaterais]),
    pegaSuperior: bool(variant[COL.pegaSuperior]),
    cavidades: bool(variant[COL.cavidades]),
    manuseamentoOutros: clean(variant[COL.manuseamentoOutros]),
    datador: bool(variant[COL.datador]),
    simboloSie: bool(variant[COL.simboloSie]),
    simboloMp: bool(variant[COL.simboloMp]),
    gravacaoCliente: !!gravDetails,
    gravacaoClienteDetails: gravDetails,
    visor: bool(variant[COL.visor]),
    bica: bool(variant[COL.bica]),
    adaptacao: !!adaptacaoType,
    specialFeatures: JSON.stringify(special),
    stackable: bool(variant[COL.empilhavel] || parent[COL.empilhavel]),
    stackingCapacity: clean(variant[COL.capacidadeEmpilhamento] || parent[COL.capacidadeEmpilhamento]),
    totalUnitsType: clean(variant[COL.tipoEmbalamento] || parent[COL.tipoEmbalamento]),
    totalUnitsQuantity: totalUnits,
    palletDimensions: clean(parent[COL.dimensoesPalete] || variant[COL.dimensoesPalete]),
    productOnPalletDimensions: clean(parent[COL.dimensoesMercadoria] || variant[COL.dimensoesMercadoria]),
    arrangementScheme: clean(parent[COL.esquemaArrumacao] || variant[COL.esquemaArrumacao]),
    notes: [...notesParts, adaptacaoType ? `Adaptação: ${adaptacaoType}` : ""].filter(Boolean).join(" | "),
    _flags: flags,
    _adaptacaoType: adaptacaoType,
    _foodContactCondition: foodCondition,
  };
}

export interface ImportResult {
  groups: number;
  variants: number;
  mapped: MappedProduct[];
  flagged: { model: string; colors: string; flags: string[] }[];
}

export function runImport(rows: Row[]): ImportResult {
  const groups = groupByModelo(rows);
  const mapped: MappedProduct[] = [];
  for (const g of groups) {
    for (const v of g.variants) mapped.push(mapVariant(v, g.parent, g.modelo));
  }
  const flagged = mapped
    .filter((m) => m._flags.length > 0)
    .map((m) => ({ model: m.model, colors: m.colors, flags: m._flags }));
  return { groups: groups.length, variants: mapped.length, mapped, flagged };
}

function printReport(res: ImportResult): void {
  console.log("=== Barricas import — DRY RUN ===");
  console.log(`Modelos (grupos): ${res.groups}`);
  console.log(`Variantes mapeadas: ${res.variants}`);
  console.log(`Linhas com avisos: ${res.flagged.length}`);
  for (const f of res.flagged) {
    console.log(`  • Modelo ${f.model} (${f.colors || "—"}): ${f.flags.join("; ")}`);
  }
  console.log("\nNOTA: dry-run — nada foi escrito na base de dados.");
  console.log("Um import real precisa de: ficheiro de origem, decisão da referência/chave única,");
  console.log("e confirmação da SIE para Q1 (matéria-prima) e Q13 (adaptação).");
}

// ---------------------------------------------------------------------------
// Self-test with a synthetic sheet (verifies the logic without the real file).
// ---------------------------------------------------------------------------
function selfTest(): void {
  const header = (label: string) => label; // readability only
  const blank = Array(45).fill("");
  const make = (overrides: Record<number, unknown>): Row => {
    const r = [...blank];
    for (const k of Object.keys(overrides)) r[Number(k)] = overrides[Number(k)];
    return r;
  };

  const band = blank;
  const fieldNames = blank.map((_, i) => header(`c${i}`));
  // Model 1250: parent + 2 variants (one with Ø drift, one polluted matéria-prima).
  const parent = make({
    [COL.modelo]: "1250", [COL.familia]: "Embalagem", [COL.tipo]: "Tampa Calha",
    [COL.produto]: "BARRICA", [COL.capacidadeNominal]: "30L", [COL.materiaPrima]: "PEAD",
    [COL.cores]: "Incolor, Azul, Preto", [COL.peso]: "1300G", [COL.diametro]: "Ø320",
    [COL.altura]: "495", [COL.tipoTampa]: "Tampa de Rosca", [COL.empilhavel]: "1",
    [COL.tipoEmbalamento]: "PALETE", [COL.totalUnidades]: "72 | 120",
  });
  const v1 = make({
    [COL.modelo]: "1250", [COL.familia]: "Embalagem", [COL.tipo]: "Tampa Calha",
    [COL.produto]: "BARRICA", [COL.capacidadeNominal]: "30L", [COL.materiaPrima]: "PEAD",
    [COL.cores]: "AZUL", [COL.certificacao]: "CERTIFICADO", [COL.adr]: "1H1/Y1,6",
    [COL.diametro]: "Ø324", [COL.altura]: "499", [COL.aptoContatoAlimentar]: "🍴",
    [COL.gravacaoCliente]: "G. SERENDIPITY", [COL.adaptacao]: "CAV", [COL.pead]: "1",
  });
  const v2 = make({
    [COL.modelo]: "1250", [COL.tipo]: "Tampa Calha", [COL.produto]: "BARRICA",
    [COL.capacidadeNominal]: "30L", [COL.materiaPrima]: "32. Cor / Preto / Inc",
    [COL.cores]: "PRETO", [COL.certificacao]: "NORMAL", [COL.aptoContatoAlimentar]: "▲",
    [COL.familia]: "Embalagem", [COL.notas]: "Erro:509",
  });
  const sheet = XLSX.utils.aoa_to_sheet([band, fieldNames, parent, v1, v2]);

  const rows = rowsFromSheet(sheet);
  const res = runImport(rows);

  const assert = (cond: boolean, msg: string) => {
    if (!cond) throw new Error("SELF-TEST FAILED: " + msg);
  };
  assert(res.groups === 1, `expected 1 group, got ${res.groups}`);
  assert(res.variants === 2, `expected 2 variants, got ${res.variants}`);
  const azul = res.mapped.find((m) => m.colors === "Azul")!;
  assert(!!azul, "variant AZUL should normalize to 'Azul'");
  assert(JSON.parse(azul.dimensions)["Ø"] === "320", "Ø should come from parent (320), not 324");
  assert(azul.adrCertified && azul.adrCode === "1H1/Y1,6", "ADR should be mapped");
  assert(azul.foodContact === true, "🍴 should map to foodContact=true");
  assert(azul.gravacaoCliente && azul.gravacaoClienteDetails === "SERENDIPITY", "G. prefix should be stripped");
  assert(azul.capType === "Tampa Rosca", "cap type should be normalized");
  assert(azul._adaptacaoType === "CAV", "adaptation type should be captured");
  const preto = res.mapped.find((m) => m.colors === "Preto")!;
  assert(preto.rawMaterial === "PEAD", "polluted matéria-prima should default to PEAD");
  assert(preto._foodContactCondition === "warning", "▲ should be flagged as warning");
  assert(preto._flags.some((f) => f.includes("matéria-prima")), "pollution should be flagged");

  console.log("Barricas importer self-test: ALL ASSERTIONS PASSED");
  printReport(res);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function main() {
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    selfTest();
    return;
  }
  const file = args.find((a) => !a.startsWith("--"));
  if (!file) {
    console.error("Uso: tsx scripts/import-barricas.ts <ficheiro.xlsx> [--json out.json]\n     tsx scripts/import-barricas.ts --self-test");
    process.exit(1);
  }
  const res = runImport(readWorkbookRows(file));
  printReport(res);
  const jsonFlag = args.indexOf("--json");
  if (jsonFlag >= 0 && args[jsonFlag + 1]) {
    const fs = require("fs");
    fs.writeFileSync(args[jsonFlag + 1], JSON.stringify(res.mapped, null, 2));
    console.log(`\nMapeamento escrito em ${args[jsonFlag + 1]} (${res.mapped.length} registos).`);
  }
}

// Only run as a CLI, not when imported.
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
