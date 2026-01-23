import { Document, Page, Text, View, StyleSheet, Image, Svg, Path, G } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

// SIE Brand Colors
const COLORS = {
  primary: '#E31E24',      // SIE Red
  primaryDark: '#B42025',  // SIE Dark Red
  text: '#333333',
  textLight: '#666666',
  textMuted: '#999999',
  background: '#FFFFFF',
  backgroundLight: '#F8F9FA',
  backgroundAccent: '#FEF2F2', // Light red tint
  border: '#E5E5E5',
  borderLight: '#EEEEEE',
  success: '#2E7D32',
  successLight: '#E8F5E8',
};

// Create styles with SIE branding
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.background,
    paddingTop: 25,
    paddingBottom: 60,
    paddingHorizontal: 30,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 3,
    borderBottomColor: COLORS.primary,
  },
  headerLeft: {
    flexDirection: 'column',
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
    width: 100,
  },
  logo: {
    width: 70,
    height: 40,
  },
  documentTitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginTop: 5,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  productName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 4,
  },
  productDesignation: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 3,
  },
  productCode: {
    fontSize: 10,
    color: COLORS.textLight,
    fontFamily: 'Courier',
  },
  productBarcode: {
    fontSize: 9,
    color: COLORS.textMuted,
    fontFamily: 'Courier',
    marginTop: 2,
  },
  // Content layout
  contentContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  // Sections
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  // Specification grid
  specGrid: {
    flexDirection: 'column',
    gap: 4,
  },
  specRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 2,
  },
  specRowAlt: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: COLORS.background,
    borderRadius: 2,
  },
  specLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  specValue: {
    fontSize: 8,
    color: COLORS.textLight,
    flex: 1,
    textAlign: 'right',
  },
  // Highlight box
  highlightBox: {
    backgroundColor: COLORS.backgroundAccent,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 4,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  highlightLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textTransform: 'uppercase',
    marginBottom: 3,
  },
  highlightValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  // Tags and badges
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    color: COLORS.text,
  },
  certBadge: {
    backgroundColor: COLORS.successLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 3,
  },
  // Images section
  imagesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  imageBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 8,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 7,
    fontWeight: 'bold',
    color: COLORS.textMuted,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: 120,
    objectFit: 'contain',
  },
  // Tables
  table: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.background,
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.backgroundLight,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tableCellText: {
    fontSize: 8,
    color: COLORS.text,
    flex: 1,
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
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
  // Recyclable badge
  recycleBadge: {
    backgroundColor: COLORS.successLight,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
  },
  recycleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: COLORS.success,
    textAlign: 'center',
  },
  // Boolean indicators
  booleanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  booleanItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
  },
  booleanCheck: {
    fontSize: 8,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  booleanX: {
    fontSize: 8,
    color: COLORS.textMuted,
  },
  booleanLabel: {
    fontSize: 7,
    color: COLORS.text,
  },
});

// SIE Logo Component (inline SVG)
function SIELogo() {
  return (
    <Svg viewBox="0 0 246.61 141.73" style={styles.logo}>
      <G>
        <Path fill="#B42025" d="M225.44,7.17H143a21.07,21.07,0,0,0-15.13,6.39H117.51A20.22,20.22,0,0,0,98.71,0H20.18C9,0,0,9.5,0,21.22v82.57C0,115.51,9,125,20.18,125H42.26a21.3,21.3,0,0,0,20.58,16.72h82.39a21,21,0,0,0,17.53-9.55h62.68A21.19,21.19,0,0,0,246.61,111V28.39A21.19,21.19,0,0,0,225.44,7.17Z" />
        <Path fill="#FFF" d="M112.48,47.31v-.62c0-5.06-1.19-9.1-3.55-12a19.18,19.18,0,0,0-9.2-6.17,48.66,48.66,0,0,0-13.06-2.27c-4.86-.24-10.12-.37-15.62-.37-6.74,0-13.19.16-19.17.49A48.73,48.73,0,0,0,35.7,29.76a24.26,24.26,0,0,0-11.21,9.31c-2.7,4.18-4.07,10.15-4.07,17.73,0,11.07,4.62,17.48,13.72,19a143.36,143.36,0,0,0,27.64,1.8,140.44,140.44,0,0,1,27,1.74C96.32,80.66,100,85.82,100,95.16c0,3.49-.68,4.89-1.26,5l-.14,0a42.73,42.73,0,0,1-12.05,2c-4.81.2-10,.3-15.48.3a141.66,141.66,0,0,1-27.74-2.34c-7-1.42-10.4-6.39-10.4-15.18V81L20.42,94.54v.62c0,10.32,4.35,16.45,12.94,18.24a141.8,141.8,0,0,0,28.38,2.47c5.51,0,10.77-.12,15.62-.37a52.36,52.36,0,0,0,13-2.15,36.74,36.74,0,0,0,16-9.82c4-4.43,6.08-10.65,6.08-18.49,0-11-4.65-17.36-13.84-18.92A144.53,144.53,0,0,0,71,64.34,140.36,140.36,0,0,1,44,62.6c-7.49-1.28-11.13-6.48-11.13-15.91,0-2.28.78-5.4,7.54-6.28a170.12,170.12,0,0,1,21.29-1.14c5.52,0,10.73.1,15.48.3a42.78,42.78,0,0,1,12.1,2.06,16.05,16.05,0,0,1,7.83,5.14C99,49.11,100,52.49,100,56.8v4.08Z" />
        <Path fill="#FFF" d="M125.32,37.02V117.94l13.3-12.97V23.73Z" />
        <Path fill="#FFF" d="M166.5,77.65l33.29.32,13.02-13.19-46.31-.42V39.29l47.82.48,22.19-13.91H164.25l-11.04,11.17v78.85h53.97l13.29-13.3H166.5Z" />
      </G>
    </Svg>
  );
}

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
  const specialFeatures = parseJSON(product.specialFeatures, []);
  const packaging = parseJSON(product.packaging, {});

  const formatDate = (date: Date | null) => {
    if (!date) return new Date().toLocaleDateString('pt-PT');
    return new Date(date).toLocaleDateString('pt-PT');
  };

  // Helper to check if value exists and is not empty
  const hasValue = (val: any) => val !== null && val !== undefined && val !== '' && val !== 'N/A';

  // Build specification rows - only include fields with values
  const technicalSpecs: { label: string; value: string }[] = [];
  
  if (hasValue(product.model)) technicalSpecs.push({ label: 'Modelo', value: product.model });
  if (hasValue(product.family)) technicalSpecs.push({ label: 'Família', value: product.family });
  if (hasValue(product.type)) technicalSpecs.push({ label: 'Tipo', value: product.type });
  if (hasValue(product.product)) technicalSpecs.push({ label: 'Produto', value: product.product });
  if (hasValue(product.rawMaterial)) technicalSpecs.push({ label: 'Matéria-Prima', value: product.rawMaterial });
  if (hasValue(product.totalCapacity)) technicalSpecs.push({ label: 'Capacidade Total', value: product.totalCapacity });

  const physicalSpecs: { label: string; value: string }[] = [];
  if (hasValue(product.weight)) physicalSpecs.push({ label: 'Peso (±5%)', value: product.weight });
  if (hasValue(product.weightWithAccessories)) physicalSpecs.push({ label: 'Peso c/ Acessórios', value: product.weightWithAccessories });
  if (hasValue(product.closingSystem)) physicalSpecs.push({ label: 'Sistema de Fecho', value: product.closingSystem });
  if (hasValue(product.sealingType)) physicalSpecs.push({ label: 'Tipo de Vedação', value: product.sealingType || '' });
  if (hasValue(product.capType)) physicalSpecs.push({ label: 'Tipo de Tampa', value: product.capType || '' });
  if (hasValue(product.capDimensions)) physicalSpecs.push({ label: 'Medida Tampa', value: product.capDimensions || '' });
  if (hasValue(product.handlingSystem)) physicalSpecs.push({ label: 'Manuseamento', value: product.handlingSystem || '' });

  // Packaging specs
  const packagingSpecs: { label: string; value: string }[] = [];
  if (hasValue(product.unitsPerBox)) packagingSpecs.push({ label: 'Unidades/Caixa', value: product.unitsPerBox || '' });
  if (hasValue(product.unitsPerPallet)) packagingSpecs.push({ label: 'Unidades/Palete', value: product.unitsPerPallet || '' });
  if (hasValue(product.palletType)) packagingSpecs.push({ label: 'Tipo Palete', value: product.palletType || '' });
  if (hasValue(product.palletDimensions)) packagingSpecs.push({ label: 'Dimensões Palete', value: product.palletDimensions || '' });
  if (hasValue(product.productOnPalletDimensions)) packagingSpecs.push({ label: 'Dim. Prod. em Palete', value: product.productOnPalletDimensions || '' });
  if (hasValue(product.arrangementScheme)) packagingSpecs.push({ label: 'Esquema', value: product.arrangementScheme || '' });
  if (hasValue(product.totalUnits)) packagingSpecs.push({ label: 'Total Unidades', value: product.totalUnits || '' });
  
  // Add parsed packaging data
  Object.entries(packaging).forEach(([key, value]) => {
    if (hasValue(value)) {
      packagingSpecs.push({ label: key, value: String(value) });
    }
  });

  // Boolean features
  const booleanFeatures: { label: string; value: boolean }[] = [];
  if (product.foodContact !== undefined) booleanFeatures.push({ label: 'Contacto Alimentar', value: product.foodContact });
  if (product.datador !== undefined) booleanFeatures.push({ label: 'Datador', value: product.datador });
  if (product.simboloSie !== undefined) booleanFeatures.push({ label: 'Símbolo SIE', value: product.simboloSie });
  if (product.vedantePead !== undefined && product.vedantePead) booleanFeatures.push({ label: 'Vedante PEAD', value: true });
  if (product.vedanteEpdm !== undefined && product.vedanteEpdm) booleanFeatures.push({ label: 'Vedante EPDM', value: true });
  if (product.pegasLaterais !== undefined && product.pegasLaterais) booleanFeatures.push({ label: 'Pegas Laterais', value: true });
  if (product.pegaSuperior !== undefined && product.pegaSuperior) booleanFeatures.push({ label: 'Pega Superior', value: true });
  if (product.cavidades !== undefined && product.cavidades) booleanFeatures.push({ label: 'Cavidades', value: true });

  // Check if we have images
  const hasImages = product.productImage || product.technicalDrawing || product.palletizationImage;
  const imageCount = [product.productImage, product.technicalDrawing, product.palletizationImage].filter(Boolean).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.productName}>{product.designation || product.product || 'Produto'}</Text>
            {hasValue(product.model) && (
              <Text style={styles.productDesignation}>{product.model}</Text>
            )}
            <Text style={styles.productCode}>REF: {product.productCode}</Text>
            {hasValue(product.barcode) && (
              <Text style={styles.productBarcode}>EAN: {product.barcode}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <SIELogo />
            <Text style={styles.documentTitle}>Ficha Técnica</Text>
          </View>
        </View>

        {/* Capacity Highlight */}
        {hasValue(product.nominalCapacity) && (
          <View style={styles.highlightBox}>
            <Text style={styles.highlightLabel}>Capacidade Nominal</Text>
            <Text style={styles.highlightValue}>{product.nominalCapacity}</Text>
          </View>
        )}

        {/* Two Column Content */}
        <View style={styles.contentContainer}>
          {/* Left Column */}
          <View style={styles.leftColumn}>
            {/* Technical Specifications */}
            {technicalSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Especificações Técnicas</Text>
                <View style={styles.specGrid}>
                  {technicalSpecs.map((spec, index) => (
                    <View key={index} style={index % 2 === 0 ? styles.specRow : styles.specRowAlt}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Physical Properties */}
            {physicalSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Propriedades Físicas</Text>
                <View style={styles.specGrid}>
                  {physicalSpecs.map((spec, index) => (
                    <View key={index} style={index % 2 === 0 ? styles.specRow : styles.specRowAlt}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Colors */}
            {hasValue(product.colors) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Cores Disponíveis</Text>
                <View style={styles.tagsContainer}>
                  {product.colors.split(',').map((color, index) => (
                    <Text key={index} style={styles.tag}>{color.trim()}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Boolean Features */}
            {booleanFeatures.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Características</Text>
                <View style={styles.booleanGrid}>
                  {booleanFeatures.map((feat, index) => (
                    <View key={index} style={styles.booleanItem}>
                      <Text style={feat.value ? styles.booleanCheck : styles.booleanX}>
                        {feat.value ? '✓' : '✗'}
                      </Text>
                      <Text style={styles.booleanLabel}>{feat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Right Column */}
          <View style={styles.rightColumn}>
            {/* Dimensions */}
            {Object.keys(dimensions).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Dimensões</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Parâmetro</Text>
                    <Text style={styles.tableHeaderText}>Valor</Text>
                  </View>
                  {Object.entries(dimensions).map(([key, value], index) => (
                    <View key={index} style={index % 2 === 0 ? styles.tableRow : styles.tableRowAlt}>
                      <Text style={styles.tableCellText}>{key}</Text>
                      <Text style={styles.tableCellText}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Packaging */}
            {packagingSpecs.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Embalagem e Paletização</Text>
                <View style={styles.specGrid}>
                  {packagingSpecs.map((spec, index) => (
                    <View key={index} style={index % 2 === 0 ? styles.specRow : styles.specRowAlt}>
                      <Text style={styles.specLabel}>{spec.label}</Text>
                      <Text style={styles.specValue}>{spec.value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Certificações</Text>
                <View>
                  {certifications.map((cert: string, index: number) => (
                    <Text key={index} style={styles.certBadge}>{cert}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Markings */}
            {markings.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Marcações</Text>
                <View style={styles.tagsContainer}>
                  {markings.map((mark: string, index: number) => (
                    <Text key={index} style={styles.tag}>{mark}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Special Features */}
            {specialFeatures.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Características Especiais</Text>
                <View style={styles.tagsContainer}>
                  {specialFeatures.map((feature: string, index: number) => (
                    <Text key={index} style={styles.tag}>{feature}</Text>
                  ))}
                </View>
              </View>
            )}

            {/* Recyclable Badge */}
            <View style={styles.recycleBadge}>
              <Text style={styles.recycleText}>♻ 100% RECICLÁVEL</Text>
              <Text style={{ fontSize: 7, color: COLORS.success, marginTop: 2 }}>REUTILIZÁVEL</Text>
            </View>
          </View>
        </View>

        {/* Product Images - Full Width Below */}
        {hasImages && (
          <View style={[styles.section, { marginTop: 15 }]}>
            <Text style={styles.sectionTitle}>Imagens do Produto</Text>
            <View style={styles.imagesContainer}>
              {product.productImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Frente</Text>
                  <Image src={product.productImage} style={styles.productImage} />
                </View>
              )}
              {product.technicalDrawing && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Desenho Técnico</Text>
                  <Image src={product.technicalDrawing} style={styles.productImage} />
                </View>
              )}
              {product.palletizationImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Paletização</Text>
                  <Image src={product.palletizationImage} style={styles.productImage} />
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <View>
            <Text style={styles.footerText}>Gerado em: {formatDate(null)}</Text>
            <Text style={styles.footerText}>Versão: {product.currentVersionNumber || 1}</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.footerBrand}>SIE - Sociedade Internacional de Embalagens</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerText}>{product.productCode}</Text>
            <Text style={styles.footerText}>Pág. 1</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
