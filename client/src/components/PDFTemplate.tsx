import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

// SIE Logo as base64 data URL
const SIE_LOGO_BASE64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNDYuNjEgMTQxLjczIj48ZGVmcz48c3R5bGU+LmNscy0xe2ZpbGw6I2I0MjAyNTt9LmNscy0ye2ZpbGw6I2ZmZjt9PC9zdHlsZT48L2RlZnM+PHRpdGxlPnNpZV9jb3I8L3RpdGxlPjxnIGlkPSJMYXllcl8yIiBkYXRhLW5hbWU9IkxheWVyIDIiPjxnIGlkPSJMYXllcl8xLTIiIGRhdGEtbmFtZT0iTGF5ZXIgMSI+PHBhdGggY2xhc3M9ImNscy0xIiBkPSJNMjI1LjQ0LDcuMTdIMTQzYTIxLjA3LDIxLjA3LDAsMCwwLTE1LjEzLDYuMzlIMTE3LjUxQTIwLjIyLDIwLjIyLDAsMCwwLDk4LjcxLDBIMjAuMThDOSwwLDAsOS41LDAsMjEuMjJ2ODIuNTdDMCwxMTUuNTEsOSwxMjUsMjAuMTgsMTI1SDQyLjI2YTIxLjMsMjEuMywwLDAsMCwyMC41OCwxNi43Mmg4Mi4zOWEyMSwyMSwwLDAsMCwxNy41My05LjU1aDYyLjY4QTIxLjE5LDIxLjE5LDAsMCwwLDI0Ni42MSwxMTFWMjguMzlBMjEuMTksMjEuMTksMCwwLDAsMjI1LjQ0LDcuMTdaIi8+PHBhdGggY2xhc3M9ImNscy0yIiBkPSJNMTEyLjQ4LDQ3LjMxdi0uNjJjMC01LjA2LTEuMTktOS4xLTMuNTUtMTJhMTkuMTgsMTkuMTgsMCwwLDAtOS4yLTYuMTcsNDguNjYsNDguNjYsMCwwLDAtMTMuMDYtMi4yN2MtNC44Ni0uMjQtMTAuMTItLjM3LTE1LjYyLS4zNy02Ljc0LDAtMTMuMTkuMTYtMTkuMTcuNDlBNDguNzMsNDguNzMsMCwwLDAsMzUuNywyOS43NmEyNC4yNiwyNC4yNiwwLDAsMC0xMS4yMSw5LjMxYy0yLjcsNC4xOC00LjA3LDEwLjE1LTQuMDcsMTcuNzMsMCwxMS4wNyw0LjYyLDE3LjQ4LDEzLjcyLDE5YTE0My4zNiwxNDMuMzYsMCwwLDAsMjcuNjQsMS44LDE0MC40NCwxNDAuNDQsMCwwLDEsMjcsMS43NEM5Ni4zMiw4MC42NiwxMDAsODUuODIsMTAwLDk1LjE2YzAsMy40OS0uNjgsNC44OS0xLjI2LDVsLS4xNCwwYTQyLjczLDQyLjczLDAsMCwxLTEyLjA1LDJjLTQuODEuMi0xMCwuMy0xNS40OC4zYTE0MS42NiwxNDEuNjYsMCwwLDEtMjcuNzQtMi4zNGMtNy0xLjQyLTEwLjQtNi4zOS0xMC40LTE1LjE4VjgxTDIwLjQyLDk0LjU0di42MmMwLDEwLjMyLDQuMzUsMTYuNDUsMTIuOTQsMTguMjRhMTQxLjgsMTQxLjgsMCwwLDAsMjguMzgsMi40N2M1LjUxLDAsMTAuNzctLjEyLDE1LjYyLS4zN2E1Mi4zNiw1Mi4zNiwwLDAsMCwxMy0yLjE1LDM2Ljc0LDM2Ljc0LDAsMCwwLDE2LTkuODJjNC00LjQzLDYuMDgtMTAuNjUsNi4wOC0xOC40OSwwLTExLTQuNjUtMTcuMzYtMTMuODQtMTguOTJBMTQ0LjUzLDE0NC41MywwLDAsMCw3MSw2NC4zNCwxNDAuMzYsMTQwLjM2LDAsMCwxLDQ0LDYyLjZjLTcuNDktMS4yOC0xMS4xMy02LjQ4LTExLjEzLTE1LjkxLDAtMi4yOC43OC01LjQsNy41NC02LjI4YTE3MC4xMiwxNzAuMTIsMCwwLDEsMjEuMjktMS4xNGM1LjUyLDAsMTAuNzMuMSwxNS40OC4zYTQyLjc4LDQyLjc4LDAsMCwxLDEyLjEsMi4wNiwxNi4wNSwxNi4wNSwwLDAsMSw3LjgzLDUuMTRDOTksNDkuMTEsMTAwLDUyLjQ5LDEwMCw1Ni44djQuMDhaIi8+PHBvbHlnb24gY2xhc3M9ImNscy0yIiBwb2ludHM9IjEyNS4zMiAzNy4wMiAxMjUuMzIgMTE3Ljk0IDEzOC42MiAxMDQuOTcgMTM4LjYyIDIzLjczIDEyNS4zMiAzNy4wMiIvPjxwb2x5Z29uIGNsYXNzPSJjbHMtMiIgcG9pbnRzPSIxNjYuNSA3Ny42NSAxOTkuNzkgNzcuOTcgMjEyLjgxIDY0Ljc4IDE2Ni41IDY0LjM2IDE2Ni41IDM5LjI5IDIxNC4zMiAzOS43NyAyMzYuNTEgMjUuODYgMTY0LjI1IDI1Ljg2IDE1My4yMSAzNy4wMyAxNTMuMjEgMTE1Ljg4IDIwNy4xOCAxMTUuODggMjIwLjQ3IDEwMi41OCAxNjYuNSAxMDIuNTggMTY2LjUgNzcuNjUiLz48L2c+PC9nPjwvc3ZnPg==';

// SIE Brand Colors
const COLORS = {
  primary: '#E31E24',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  background: '#FFFFFF',
  backgroundLight: '#F5F5F5',
  border: '#DDDDDD',
  success: '#2E7D32',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    paddingTop: 30,
    paddingBottom: 50,
    paddingHorizontal: 35,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    width: 80,
    alignItems: 'flex-end',
  },
  logo: {
    width: 65,
    height: 38,
  },
  docType: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginTop: 5,
    textTransform: 'uppercase',
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 11,
    color: COLORS.text,
    marginBottom: 3,
  },
  productRef: {
    fontSize: 9,
    color: COLORS.textLight,
    fontFamily: 'Courier',
  },
  capacityBox: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 3,
    padding: 10,
    marginBottom: 20,
    alignItems: 'center',
  },
  capacityLabel: {
    fontSize: 8,
    color: COLORS.textLight,
  },
  capacityValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  twoColumn: {
    flexDirection: 'row',
    gap: 15,
  },
  column: {
    flex: 1,
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  rowAlt: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
    paddingHorizontal: 5,
    backgroundColor: COLORS.backgroundLight,
  },
  label: {
    fontSize: 8,
    color: COLORS.text,
    flex: 1,
  },
  value: {
    fontSize: 8,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'right',
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 7,
    color: COLORS.text,
  },
  certTag: {
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 2,
    fontSize: 7,
    color: COLORS.success,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  imageSection: {
    marginTop: 15,
  },
  imageGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  imageBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 3,
    padding: 8,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    minHeight: 100,
  },
  imageTitle: {
    fontSize: 7,
    color: COLORS.textMuted,
    marginBottom: 5,
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: 90,
    objectFit: 'contain',
  },
  recycleBox: {
    backgroundColor: '#E8F5E8',
    padding: 8,
    borderRadius: 3,
    alignItems: 'center',
    marginTop: 10,
  },
  recycleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.success,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 35,
    right: 35,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textMuted,
  },
  footerBrand: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

interface PDFTemplateProps {
  product: Product;
}

export function TechnicalDatasheetPDF({ product }: PDFTemplateProps) {
  const parseJSON = (jsonString: string | null, fallback: any = []) => {
    if (!jsonString) return fallback;
    try {
      return JSON.parse(jsonString);
    } catch {
      return fallback;
    }
  };

  const dimensions = parseJSON(product.dimensions, {});
  const certifications = parseJSON(product.certifications, []);
  const markings = parseJSON(product.markings, []);
  const packaging = parseJSON(product.packaging, {});

  const hasValue = (val: any) => val !== null && val !== undefined && val !== '' && val !== 'N/A';

  const formatDate = () => new Date().toLocaleDateString('pt-PT');

  // Build specs arrays - only include filled fields
  const mainSpecs: Array<{ label: string; value: string }> = [];
  if (hasValue(product.model)) mainSpecs.push({ label: 'Modelo', value: product.model });
  if (hasValue(product.family)) mainSpecs.push({ label: 'Familia', value: product.family });
  if (hasValue(product.type)) mainSpecs.push({ label: 'Tipo', value: product.type });
  if (hasValue(product.product)) mainSpecs.push({ label: 'Produto', value: product.product });
  if (hasValue(product.rawMaterial)) mainSpecs.push({ label: 'Materia-Prima', value: product.rawMaterial });
  if (hasValue(product.totalCapacity)) mainSpecs.push({ label: 'Capacidade Total', value: product.totalCapacity || '' });

  const physSpecs: Array<{ label: string; value: string }> = [];
  if (hasValue(product.weight)) physSpecs.push({ label: 'Peso (+/-5%)', value: product.weight });
  if (hasValue(product.weightWithAccessories)) physSpecs.push({ label: 'Peso c/ Acessorios', value: product.weightWithAccessories || '' });
  if (hasValue(product.closingSystem)) physSpecs.push({ label: 'Sistema de Fecho', value: product.closingSystem || '' });
  if (hasValue(product.sealingType)) physSpecs.push({ label: 'Tipo de Vedacao', value: product.sealingType || '' });
  if (hasValue(product.capType)) physSpecs.push({ label: 'Tipo de Tampa', value: product.capType || '' });
  if (hasValue(product.capDimensions)) physSpecs.push({ label: 'Medida Tampa', value: product.capDimensions || '' });
  if (hasValue(product.handlingSystem)) physSpecs.push({ label: 'Manuseamento', value: product.handlingSystem || '' });

  const packSpecs: Array<{ label: string; value: string }> = [];
  if (hasValue(product.palletDimensions)) packSpecs.push({ label: 'Dim. Palete', value: product.palletDimensions || '' });
  if (hasValue(product.productOnPalletDimensions)) packSpecs.push({ label: 'Dim. Prod. Palete', value: product.productOnPalletDimensions || '' });
  if (hasValue(product.totalUnits)) packSpecs.push({ label: 'Total Unidades', value: product.totalUnits || '' });
  if (hasValue(product.arrangementScheme)) packSpecs.push({ label: 'Esquema', value: product.arrangementScheme || '' });
  Object.entries(packaging).forEach(([key, value]) => {
    if (hasValue(value)) packSpecs.push({ label: key, value: String(value) });
  });

  const boolSpecs: Array<{ label: string; value: string }> = [];
  if (product.foodContact !== undefined) boolSpecs.push({ label: 'Contacto Alimentar', value: product.foodContact ? 'Sim' : 'Nao' });
  if (product.datador !== undefined) boolSpecs.push({ label: 'Datador', value: product.datador ? 'Sim' : 'Nao' });
  if (product.simboloSie !== undefined) boolSpecs.push({ label: 'Simbolo SIE', value: product.simboloSie ? 'Sim' : 'Nao' });

  const hasImages = product.productImage || product.technicalDrawing || product.palletizationImage;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {hasValue(product.designation) && (
              <Text style={styles.productTitle}>{product.designation}</Text>
            )}
            {!hasValue(product.designation) && hasValue(product.product) && (
              <Text style={styles.productTitle}>{product.product}</Text>
            )}
            {hasValue(product.model) && (
              <Text style={styles.productSubtitle}>{product.model}</Text>
            )}
            {hasValue(product.productCode) && (
              <Text style={styles.productRef}>REF: {product.productCode}</Text>
            )}
            {hasValue(product.barcode) && (
              <Text style={styles.productRef}>EAN: {product.barcode}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <Image src={SIE_LOGO_BASE64} style={styles.logo} />
            <Text style={styles.docType}>Ficha Tecnica</Text>
          </View>
        </View>

        {/* Capacity Highlight */}
        {hasValue(product.nominalCapacity) && (
          <View style={styles.capacityBox}>
            <Text style={styles.capacityLabel}>CAPACIDADE NOMINAL</Text>
            <Text style={styles.capacityValue}>{product.nominalCapacity}</Text>
          </View>
        )}

        {/* Two Column Layout */}
        <View style={styles.twoColumn}>
          {/* Left Column */}
          <View style={styles.column}>
            {mainSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ESPECIFICACOES TECNICAS</Text>
                {mainSpecs.map((spec, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                    <Text style={styles.label}>{spec.label}</Text>
                    <Text style={styles.value}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {physSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PROPRIEDADES FISICAS</Text>
                {physSpecs.map((spec, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                    <Text style={styles.label}>{spec.label}</Text>
                    <Text style={styles.value}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {hasValue(product.colors) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CORES DISPONIVEIS</Text>
                <View style={styles.tagContainer}>
                  {product.colors.split(',').map((color, i) => (
                    <Text key={i} style={styles.tag}>{color.trim()}</Text>
                  ))}
                </View>
              </View>
            )}

            {boolSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CARACTERISTICAS</Text>
                {boolSpecs.map((spec, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                    <Text style={styles.label}>{spec.label}</Text>
                    <Text style={styles.value}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {Object.keys(dimensions).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>DIMENSOES</Text>
                {Object.entries(dimensions).map(([key, value], i) => (
                  <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                    <Text style={styles.label}>{key}</Text>
                    <Text style={styles.value}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}

            {packSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>EMBALAGEM E PALETIZACAO</Text>
                {packSpecs.map((spec, i) => (
                  <View key={i} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                    <Text style={styles.label}>{spec.label}</Text>
                    <Text style={styles.value}>{spec.value}</Text>
                  </View>
                ))}
              </View>
            )}

            {certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CERTIFICACOES</Text>
                {certifications.map((cert: string, i: number) => (
                  <Text key={i} style={styles.certTag}>{cert}</Text>
                ))}
              </View>
            )}

            {markings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>MARCACOES</Text>
                <View style={styles.tagContainer}>
                  {markings.map((mark: string, i: number) => (
                    <Text key={i} style={styles.tag}>{mark}</Text>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.recycleBox}>
              <Text style={styles.recycleText}>100% RECICLAVEL</Text>
              <Text style={{ fontSize: 6, color: COLORS.success }}>REUTILIZAVEL</Text>
            </View>
          </View>
        </View>

        {/* Product Images */}
        {hasImages && (
          <View style={styles.imageSection}>
            <Text style={styles.sectionTitle}>IMAGENS DO PRODUTO</Text>
            <View style={styles.imageGrid}>
              {product.productImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageTitle}>FRENTE</Text>
                  <Image src={product.productImage} style={styles.productImage} />
                </View>
              )}
              {product.technicalDrawing && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageTitle}>DESENHO TECNICO</Text>
                  <Image src={product.technicalDrawing} style={styles.productImage} />
                </View>
              )}
              {product.palletizationImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageTitle}>PALETIZACAO</Text>
                  <Image src={product.palletizationImage} style={styles.productImage} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>Gerado: {formatDate()}</Text>
            {hasValue(product.currentVersionNumber) && (
              <Text style={styles.footerText}>Versao: {product.currentVersionNumber}</Text>
            )}
          </View>
          <Text style={styles.footerBrand}>SIE - Sociedade Internacional de Embalagens</Text>
          <View style={{ alignItems: 'flex-end' }}>
            {hasValue(product.productCode) && (
              <Text style={styles.footerText}>{product.productCode}</Text>
            )}
            <Text style={styles.footerText}>Pag. 1</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
