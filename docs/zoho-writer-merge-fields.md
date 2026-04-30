# Zoho Writer Merge Fields Reference

When you click **Gerar Datasheet (Zoho)** on a product page, the app sends the entire product record (plus its family) to Zoho Writer's mail-merge API as a flat JSON payload. Your Zoho Writer template just needs to include merge field placeholders whose names match the keys below.

## How to use

1. In Zoho Writer, create your datasheet template document.
2. Insert merge fields with the exact names shown in the **Merge field name** column (e.g. `product_code`, `capacity_nominal`).
3. Save the template in Zoho Writer.
4. In this app, go to **Admin → Famílias**, edit the product family, and pick the template from the **Template Zoho Writer** dropdown.
5. Open any product in that family and click **Gerar Datasheet (Zoho)**. The merged DOCX downloads.

## Naming convention

- Every column on the `products` table is exposed under its `snake_case` name (the database column name).
- Family metadata is exposed under `family_id`, `family_code`, `family_description`.
- Booleans become `Sim` / `Não`.
- `null` / undefined values become an empty string (no literal "null" appears in the document).
- Object/JSON columns are sent as serialized JSON strings — for advanced templates only.

## Available fields

### Identification

| Merge field name | Source | Notes |
| --- | --- | --- |
| `product_code` | products.product_code | Unique product code |
| `model` | products.model | |
| `family` | products.family | Free-text family name |
| `type` | products.type | |
| `shape` | products.shape | Forma (redondo, quadrado, etc.) |
| `product` | products.product | |
| `designation` | products.designation | |
| `barcode` | products.barcode | |

### Family metadata

| Merge field name | Source |
| --- | --- |
| `family_id` | families.id |
| `family_code` | families.code |
| `family_description` | families.description |

### Capacity & dimensions

| Merge field name | Source |
| --- | --- |
| `nominal_capacity` | products.nominal_capacity |
| `nominal_capacity_unit` | products.nominal_capacity_unit |
| `total_capacity` | products.total_capacity |
| `total_capacity_unit` | products.total_capacity_unit |
| `raw_material` | products.raw_material |
| `colors` | products.colors |
| `weight` | products.weight |
| `weight_unit` | products.weight_unit |
| `weight_tolerance` | products.weight_tolerance |
| `weight_with_accessories` | products.weight_with_accessories |
| `weight_with_accessories_unit` | products.weight_with_accessories_unit |
| `accessories` | products.accessories |
| `dimensions` | JSON string of dimensions array |

### Closure & sealing

| Merge field name | Source |
| --- | --- |
| `closing_system` | products.closing_system |
| `cap_type` | products.cap_type |
| `cap_dimensions` | products.cap_dimensions |
| `sealing_type` | products.sealing_type |
| `vedante_pead` | "Sim"/"Não" |
| `vedante_epdm` | "Sim"/"Não" |
| `vedante_outros` | products.vedante_outros |

### Handling

| Merge field name | Source |
| --- | --- |
| `handling_system` | products.handling_system |
| `pegas_laterais` | "Sim"/"Não" |
| `pega_superior` | "Sim"/"Não" |
| `cavidades` | "Sim"/"Não" |
| `manuseamento_outros` | products.manuseamento_outros |

### Markings

| Merge field name | Source |
| --- | --- |
| `markings` | JSON string |
| `datador` | "Sim"/"Não" |
| `simbolo_sie` | "Sim"/"Não" |
| `simbolo_mp` | "Sim"/"Não" |
| `gravacao_cliente` | "Sim"/"Não" |
| `gravacao_cliente_details` | products.gravacao_cliente_details |

### Other features

| Merge field name | Source |
| --- | --- |
| `visor` | "Sim"/"Não" |
| `bica` | "Sim"/"Não" |
| `coex_poliamida` | "Sim"/"Não" |
| `adaptacao` | "Sim"/"Não" |
| `autoculante_cliente` | products.autoculante_cliente |
| `especificacoes_emb_flexiveis` | products.especificacoes_emb_flexiveis |

### Stacking & packaging

| Merge field name | Source |
| --- | --- |
| `stackable` | "Sim"/"Não" |
| `stacking_capacity` | products.stacking_capacity |
| `packaging` | JSON string |
| `pallet_dimensions` | products.pallet_dimensions |
| `product_on_pallet_dimensions` | products.product_on_pallet_dimensions |
| `arrangement_scheme` | products.arrangement_scheme |
| `total_units` | products.total_units |
| `total_units_quantity` | products.total_units_quantity |
| `total_units_type` | products.total_units_type |

### Certifications

| Merge field name | Source |
| --- | --- |
| `certifications` | JSON string |
| `food_contact` | "Sim"/"Não" |
| `adr_certified` | "Sim"/"Não" |
| `adr_code` | products.adr_code |
| `special_features` | JSON string |

### Approval & metadata

| Merge field name | Source |
| --- | --- |
| `approved_by` | products.approved_by |
| `approval_date` | products.approval_date |
| `current_version_number` | products.current_version_number |
| `notes` | products.notes |

## Required environment variables

The Zoho integration is enabled by setting these on the deployment environment:

| Variable | Description |
| --- | --- |
| `ZOHO_CLIENT_ID` | Zoho OAuth Client ID |
| `ZOHO_CLIENT_SECRET` | Zoho OAuth Client Secret |
| `ZOHO_REFRESH_TOKEN` | Long-lived refresh token with `ZohoWriter.documentEditor.ALL` scope |
| `ZOHO_DC` | Zoho data centre suffix: `com`, `eu`, `in`, `com.au`, `jp` (default: `com`) |

When any of these are missing the **Template Zoho Writer** dropdown in Admin → Famílias shows a "Credenciais Zoho Writer não configuradas" message and the **Gerar Datasheet (Zoho)** button on product pages returns a 503 error.

## Notes

- The merge runs in `output_format=docx` so the result is an editable Word document. The endpoint can be switched to PDF by changing the third argument to `mergeTemplate()` in `server/routes.ts`.
- The PDF datasheet generator (**Gerar PDF** button) is unaffected by this integration and continues to use the existing built-in renderer.
