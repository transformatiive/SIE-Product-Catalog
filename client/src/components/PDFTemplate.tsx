import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

const COLORS = {
  primary: '#E31E24',
  text: '#333333',
  textLight: '#666666',
  background: '#FFFFFF',
  backgroundLight: '#F8F8F8',
  border: '#E0E0E0',
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: COLORS.background,
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  logoBox: {
    width: 80,
    height: 45,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerCenter: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: COLORS.textLight,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  docLabel: {
    fontSize: 8,
    color: COLORS.textLight,
    textTransform: 'uppercase',
  },
  refCode: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  mainContent: {
    flexDirection: 'row',
    marginTop: 10,
  },
  leftColumn: {
    width: '48%',
    marginRight: '4%',
  },
  rightColumn: {
    width: '48%',
  },
  section: {
    marginBottom: 15,
  },
  sectionHeader: {
    backgroundColor: COLORS.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dataRowAlt: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.backgroundLight,
  },
  dataLabel: {
    width: '50%',
    fontSize: 8,
    color: COLORS.text,
  },
  dataValue: {
    width: '50%',
    fontSize: 8,
    color: COLORS.textLight,
    textAlign: 'right',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  tag: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
    fontSize: 7,
  },
  certTag: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#4CAF50',
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 4,
    marginBottom: 4,
    fontSize: 7,
    color: '#2E7D32',
  },
  imageSection: {
    marginTop: 15,
  },
  imageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imageBox: {
    width: '30%',
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 8,
    alignItems: 'center',
  },
  imageLabel: {
    fontSize: 7,
    color: COLORS.textLight,
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  productImage: {
    maxWidth: 80,
    maxHeight: 60,
    objectFit: 'contain',
  },
  footer: {
    position: 'absolute',
    bottom: 25,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.textLight,
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
      const parsed = JSON.parse(jsonString);
      return parsed;
    } catch {
      return fallback;
    }
  };

  const dimensions = parseJSON(product.dimensions, {});
  const certifications = parseJSON(product.certifications, []);
  const markings = parseJSON(product.markings, []);
  const packaging = parseJSON(product.packaging, {});

  const hasValue = (val: any) => {
    if (val === null || val === undefined || val === '' || val === 'N/A') return false;
    if (typeof val === 'string' && val.trim() === '') return false;
    return true;
  };

  const cleanValue = (val: string | null | undefined): string => {
    if (!val) return '';
    const cleaned = val.replace(/^[=\-<>]+/, '').trim();
    return cleaned;
  };

  const cleanCertifications = (certs: any[]): string[] => {
    if (!Array.isArray(certs)) return [];
    return certs
      .filter(c => c && typeof c === 'string')
      .map(c => cleanValue(c))
      .filter(c => c.length > 0 && c.length < 50);
  };

  const formatDate = () => new Date().toLocaleDateString('pt-PT');

  const cleanedCerts = cleanCertifications(certifications);
  const cleanedMarkings = cleanCertifications(markings);

  const hasImages = product.productImage || product.technicalDrawing || product.palletizationImage;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>SIE</Text>
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.title}>FICHA TECNICA</Text>
            <Text style={styles.subtitle}>
              {hasValue(product.designation) ? product.designation : product.product || 'Produto'}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.docLabel}>Referencia</Text>
            <Text style={styles.refCode}>{product.productCode || '-'}</Text>
            {hasValue(product.barcode) && (
              <>
                <Text style={[styles.docLabel, { marginTop: 4 }]}>EAN</Text>
                <Text style={styles.refCode}>{product.barcode}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.leftColumn}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Identificacao</Text>
              </View>
              {hasValue(product.model) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Modelo</Text>
                  <Text style={styles.dataValue}>{product.model}</Text>
                </View>
              )}
              {hasValue(product.family) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Familia</Text>
                  <Text style={styles.dataValue}>{product.family}</Text>
                </View>
              )}
              {hasValue(product.type) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Tipo</Text>
                  <Text style={styles.dataValue}>{product.type}</Text>
                </View>
              )}
              {hasValue(product.product) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Produto</Text>
                  <Text style={styles.dataValue}>{product.product}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Especificacoes</Text>
              </View>
              {hasValue(product.nominalCapacity) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Capacidade Nominal</Text>
                  <Text style={styles.dataValue}>{product.nominalCapacity}</Text>
                </View>
              )}
              {hasValue(product.totalCapacity) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Capacidade Total</Text>
                  <Text style={styles.dataValue}>{product.totalCapacity}</Text>
                </View>
              )}
              {hasValue(product.weight) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Peso (+/-5%)</Text>
                  <Text style={styles.dataValue}>{product.weight}</Text>
                </View>
              )}
              {hasValue(product.rawMaterial) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Materia-Prima</Text>
                  <Text style={styles.dataValue}>{product.rawMaterial}</Text>
                </View>
              )}
              {hasValue(product.colors) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Cores</Text>
                  <Text style={styles.dataValue}>{product.colors}</Text>
                </View>
              )}
              {product.foodContact !== undefined && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Contacto Alimentar</Text>
                  <Text style={styles.dataValue}>{product.foodContact ? 'Apto' : 'Nao Apto'}</Text>
                </View>
              )}
            </View>

            {Object.keys(dimensions).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Dimensoes (mm)</Text>
                </View>
                {Object.entries(dimensions).map(([key, value], i) => (
                  <View key={key} style={i % 2 === 0 ? styles.dataRow : styles.dataRowAlt}>
                    <Text style={styles.dataLabel}>{key}</Text>
                    <Text style={styles.dataValue}>{String(value)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.rightColumn}>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Detalhes Tecnicos</Text>
              </View>
              {hasValue(product.closingSystem) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Sistema de Fecho</Text>
                  <Text style={styles.dataValue}>{product.closingSystem}</Text>
                </View>
              )}
              {hasValue(product.sealingType) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Tipo de Vedacao</Text>
                  <Text style={styles.dataValue}>{product.sealingType}</Text>
                </View>
              )}
              {hasValue(product.capType) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Tipo de Tampa</Text>
                  <Text style={styles.dataValue}>{product.capType}</Text>
                </View>
              )}
              {hasValue(product.capDimensions) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Medida Tampa</Text>
                  <Text style={styles.dataValue}>{product.capDimensions}</Text>
                </View>
              )}
              {hasValue(product.handlingSystem) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Manuseamento</Text>
                  <Text style={styles.dataValue}>{product.handlingSystem}</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Embalagem</Text>
              </View>
              {hasValue(product.palletDimensions) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Dim. Palete</Text>
                  <Text style={styles.dataValue}>{product.palletDimensions}</Text>
                </View>
              )}
              {hasValue(product.totalUnits) && (
                <View style={styles.dataRowAlt}>
                  <Text style={styles.dataLabel}>Total Unidades</Text>
                  <Text style={styles.dataValue}>{product.totalUnits}</Text>
                </View>
              )}
              {hasValue(product.arrangementScheme) && (
                <View style={styles.dataRow}>
                  <Text style={styles.dataLabel}>Esquema</Text>
                  <Text style={styles.dataValue}>{product.arrangementScheme}</Text>
                </View>
              )}
              {Object.entries(packaging).slice(0, 4).map(([key, value], i) => (
                hasValue(value) && (
                  <View key={key} style={i % 2 === 0 ? styles.dataRowAlt : styles.dataRow}>
                    <Text style={styles.dataLabel}>{key}</Text>
                    <Text style={styles.dataValue}>{String(value)}</Text>
                  </View>
                )
              ))}
            </View>

            {cleanedCerts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Certificacoes</Text>
                </View>
                <View style={styles.tagRow}>
                  {cleanedCerts.map((cert, i) => (
                    <Text key={i} style={styles.certTag}>{cert}</Text>
                  ))}
                </View>
              </View>
            )}

            {cleanedMarkings.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Marcacoes</Text>
                </View>
                <View style={styles.tagRow}>
                  {cleanedMarkings.map((mark, i) => (
                    <Text key={i} style={styles.tag}>{mark}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>
        </View>

        {hasImages && (
          <View style={styles.imageSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Imagens</Text>
            </View>
            <View style={styles.imageRow}>
              {product.productImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Produto</Text>
                  <Image src={product.productImage} style={styles.productImage} />
                </View>
              )}
              {product.technicalDrawing && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Desenho Tecnico</Text>
                  <Image src={product.technicalDrawing} style={styles.productImage} />
                </View>
              )}
              {product.palletizationImage && (
                <View style={styles.imageBox}>
                  <Text style={styles.imageLabel}>Paletizacao</Text>
                  <Image src={product.palletizationImage} style={styles.productImage} />
                </View>
              )}
            </View>
          </View>
        )}

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Gerado: {formatDate()}</Text>
          <Text style={styles.footerBrand}>SIE - Sociedade Internacional de Embalagens</Text>
          <Text style={styles.footerText}>{product.productCode || ''}</Text>
        </View>
      </Page>
    </Document>
  );
}
