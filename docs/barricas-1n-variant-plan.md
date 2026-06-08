# Plan — Model groups & 1:N variants (Barricas)

Implementation plan to unblock the open decision in **TRNSF-901**
("Decidir esquema final — manter flat ou refactor para 1:N parent/variant").
No code is shipped by this document; it is the design to review/approve.

## Problem

The SIE quality team reported (TRNSF-901, screenshots from Sónia Alexandre):

> "Iniciei pela ref. 1350, no entanto cada vez que introduzo diferentes
> barricas da mesma família do 1350, ele sobrepõe sempre a anterior. Não
> consigo inserir várias referências dentro do mesmo grupo de origem."

Root cause (verified in code):

1. **Flat model, one row per `productCode`.** There is no notion of a model
   "group of origin" holding several variant references.
2. **Edit-in-place overwrites.** `Dashboard.handleSaveProduct` chooses the
   verb purely from `selectedProduct`: an open product → `PUT` (overwrite).
   Entering the next variant while the first is open updates the first.
3. **Reference collisions.** The auto-reference
   (`ProductForm.tsx` ≈ `model.material.color.cert+pack.spec`) omits the
   variant-distinguishing dimension (capacity / Ø), so different-sized
   barricas of model 1350 generate the *same* `productCode`.

A short-term guardrail ("Guardar como nova referência" — save-as-new) ships
separately. This plan covers the structural fix.

## Goals

- A model/group can own **many** variant references (1:N).
- Creating a variant never overwrites a sibling.
- Variants are listed/managed grouped under their model.
- Auto reference/barcode encode the size dimension → no accidental collisions.
- Keep versioning, share links and PDF/template generation working per variant.

## Current model (recap)

- `products` — flat; `productCode` is `unique notNull`. JSON fields for
  dimensions/packaging/markings/certifications.
- `product_versions` — immutable snapshot per product (`productId` FK).
- `share_links` — per `productId` (+ optional `versionId`).
- `models` support table (`3_Modelo`) already exists (code/displayCode/description).

## Recommended approach — phased

### Phase 1 — Self-referential grouping (low risk, no new core tables)

Add to `products`:

| column            | type            | notes                                        |
|-------------------|-----------------|----------------------------------------------|
| `groupId`         | varchar (uuid)  | shared by all variants of one model group; defaults to own id for standalone products |
| `isGroupParent`   | boolean         | the representative variant of the group      |
| `variantLabel`    | text (nullable) | e.g. "230L Ø370" — human label for the variant |

- `groupId` is set on create: a brand-new product gets `groupId = id`
  (its own); "add variant" copies the source's `groupId`.
- No change to `productCode` uniqueness — each variant keeps a unique code.
- Versioning / share links / PDF stay **per variant** (unchanged).

Rationale: each variant remains a complete `Product`, so all existing
per-product machinery keeps working. Grouping is an overlay, not a rewrite.

### Phase 2 — Optional explicit `product_groups` table (only if Phase 1 proves insufficient)

`product_groups { id, modelId, family, description, createdAt }` with
`products.groupId` FK. Adds group-level metadata/shared fields. Defer until
there is a concrete need (shared attributes edited once for the whole group).

## Changes by layer (Phase 1)

### Schema (`shared/schema.ts`)
- Add the three columns above + Zod updates. `drizzle-kit push` migration.
- Backfill: `UPDATE products SET group_id = id WHERE group_id IS NULL`.

### Reference/barcode (`ProductForm.tsx`)
- Include capacity (and Ø/size where present) in the generated **Referência**
  and **Designação** so variants are distinct, e.g. append capacity code.
- Keep server de-dup as a safety net.

### API (`server/routes.ts`, `server/storage.ts`)
- `POST /api/products`: accept optional `groupId`; default to the new row's id.
- `GET /api/products`: support `?groupId=` and return `groupId/isGroupParent/variantLabel`.
- New: `POST /api/products/:id/variants` — create a sibling (copies `groupId`,
  blanks unique fields) — the server-side equivalent of "save as new".
- `getProductsGroupedByModel()` for the grouped list.

### UI
- **Dashboard list:** group rows by `groupId` (model header → variant rows),
  with an "Adicionar variante" action per group (→ create with that `groupId`).
- **ProductForm:** show the group/model the variant belongs to; the
  "Guardar como nova referência" (Phase-0 guardrail) becomes "Adicionar
  variante a este grupo" and passes `groupId`.
- Clear visual separation of *Actualizar* (this variant) vs *Adicionar variante*.

### Import (per TRNSF-901 importer)
- Map each parent Model → one `groupId`; its rows → variants sharing it.
- Set `isGroupParent` on the representative row; `variantLabel` from capacity/Ø.

## Migration & rollout
1. Add columns (nullable) + backfill `groupId = id`. Safe, no data loss.
2. Ship API + grouped read (backward compatible — ungrouped clients ignore new fields).
3. Ship grouped UI + "Adicionar variante".
4. Run the Barricas importer producing groups.
5. UAT with SIE quality team on multi-variant entry.

## Risks
- **Versioning/share links** are per variant — confirm SIE wants variant-level
  (recommended) vs group-level fichas. Likely variant-level (each barrica has
  its own FT/PDF).
- **`drizzle-kit push`** runs against the live Neon DB — take a snapshot first.
- Reference-formula change affects *new* codes only; existing codes untouched.

## Effort (rough)
- Phase 1: schema+backfill (S), API (S/M), grouped UI (M), import mapping (M),
  reference formula (S). ~3–5 dev-days incl. UAT.
- Phase 2: only if shared group-level editing is required later.

## Open questions for SIE (carry into 901)
- Are fichas/PDFs per variant or one per model group?
- Which attributes are shared at model level vs per variant?
- Confirm the variant key (capacity + Ø? other?) for the reference formula.
