import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#0066CC',
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 3,
  },
  productCode: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'Courier',
  },
  companyLogo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  companyInfo: {
    fontSize: 10,
    color: '#0066CC',
    fontWeight: 'bold',
  },
  contentContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  leftColumn: {
    flex: 2,
  },
  rightColumn: {
    flex: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  specGrid: {
    flexDirection: 'column',
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 3,
  },
  specLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  specValue: {
    fontSize: 10,
    color: '#666666',
    flex: 1,
    textAlign: 'right',
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  featureTag: {
    backgroundColor: '#E3F2FD',
    color: '#0066CC',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 9,
    fontWeight: 'bold',
  },
  certificationBadge: {
    backgroundColor: '#E8F5E8',
    color: '#2E7D32',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 9,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dimensionsTable: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f3f4',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#CCCCCC',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tableHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  tableCellText: {
    fontSize: 10,
    color: '#666666',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#CCCCCC',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  },
  recycleSymbol: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  technicalDrawing: {
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    minHeight: 150,
    justifyContent: 'center',
  },
  drawingPlaceholder: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  capacityHighlight: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    backgroundColor: '#E3F2FD',
    padding: 8,
    borderRadius: 5,
    textAlign: 'center',
    marginBottom: 10,
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
  const specialFeatures = parseJSON(product.specialFeatures, []);
  const packaging = parseJSON(product.packaging, {});

  const formatDate = (date: Date | null) => {
    if (!date) return new Date().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{product.product}</Text>
            <Text style={styles.subtitle}>{product.model}</Text>
            <Text style={styles.productCode}>REF. {product.productCode}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.companyInfo}>PRODUCT DATABASE</Text>
            <Text style={styles.companyInfo}>Technical Datasheet</Text>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* Left Column - Main Specifications */}
          <View style={styles.leftColumn}>
            {/* Technical Characteristics */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TECHNICAL CHARACTERISTICS</Text>
              
              {/* Capacity Highlight */}
              <View style={styles.capacityHighlight}>
                <Text>NOMINAL CAPACITY: {product.nominalCapacity}</Text>
              </View>

              <View style={styles.specGrid}>
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Model:</Text>
                  <Text style={styles.specValue}>{product.model}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Type:</Text>
                  <Text style={styles.specValue}>{product.type}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Weight (±5%):</Text>
                  <Text style={styles.specValue}>{product.weight}</Text>
                </View>
                
                {product.weightWithAccessories && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Weight w/ Accessories:</Text>
                    <Text style={styles.specValue}>{product.weightWithAccessories}</Text>
                  </View>
                )}
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Raw Material:</Text>
                  <Text style={styles.specValue}>{product.rawMaterial}</Text>
                </View>
                
                {product.totalCapacity && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Total Capacity:</Text>
                    <Text style={styles.specValue}>{product.totalCapacity}</Text>
                  </View>
                )}
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Closing System:</Text>
                  <Text style={styles.specValue}>{product.closingSystem || 'N/A'}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Sealing Type:</Text>
                  <Text style={styles.specValue}>{product.sealingType || 'N/A'}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Handling System:</Text>
                  <Text style={styles.specValue}>{product.handlingSystem || 'N/A'}</Text>
                </View>
                
                <View style={styles.specRow}>
                  <Text style={styles.specLabel}>Food Contact:</Text>
                  <Text style={styles.specValue}>{product.foodContact ? 'YES' : 'NO'}</Text>
                </View>
              </View>
            </View>

            {/* Colors Available */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>AVAILABLE COLORS</Text>
              <View style={styles.featuresContainer}>
                {product.colors.split(',').map((color, index) => (
                  <View key={index} style={styles.featureTag}>
                    <Text>{color.trim()}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Technical Drawing Placeholder */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TECHNICAL DRAWING</Text>
              <View style={styles.technicalDrawing}>
                <Text style={styles.drawingPlaceholder}>
                  Technical Drawing
                </Text>
                <Text style={styles.drawingPlaceholder}>
                  Measurements in millimeters with ±3% tolerance
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column - Dimensions & Additional Info */}
          <View style={styles.rightColumn}>
            {/* Dimensions */}
            {Object.keys(dimensions).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>DIMENSIONS</Text>
                <View style={styles.dimensionsTable}>
                  <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Parameter</Text>
                    <Text style={styles.tableHeaderText}>Value</Text>
                  </View>
                  {Object.entries(dimensions).map(([key, value], index) => (
                    <View key={index} style={styles.tableRow}>
                      <Text style={styles.tableCellText}>{key}</Text>
                      <Text style={styles.tableCellText}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CERTIFICATIONS</Text>
                <View>
                  {certifications.map((cert: string, index: number) => (
                    <View key={index} style={styles.certificationBadge}>
                      <Text>{cert}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Special Features */}
            {specialFeatures.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SPECIAL FEATURES</Text>
                <View style={styles.featuresContainer}>
                  {specialFeatures.map((feature: string, index: number) => (
                    <View key={index} style={styles.featureTag}>
                      <Text>{feature}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Packaging Information */}
            {Object.keys(packaging).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>PACKAGING</Text>
                <View style={styles.specGrid}>
                  {Object.entries(packaging).map(([key, value], index) => (
                    <View key={index} style={styles.specRow}>
                      <Text style={styles.specLabel}>{key}:</Text>
                      <Text style={styles.specValue}>{String(value)}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Recyclable Badge */}
            <View style={styles.section}>
              <View style={{
                backgroundColor: '#E8F5E8',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: 20,
              }}>
                <Text style={styles.recycleSymbol}>♻</Text>
                <Text style={{
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#2E7D32',
                  textAlign: 'center',
                }}>
                  100% RECYCLABLE
                </Text>
                <Text style={{
                  fontSize: 8,
                  color: '#666666',
                  textAlign: 'center',
                  marginTop: 3,
                }}>
                  REUSABLE
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.footerText}>
              Generated: {formatDate(null)}
            </Text>
            <Text style={styles.footerText}>
              Product Family: {product.family}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerText}>
              Status: {product.isActive ? 'ACTIVE' : 'INACTIVE'}
            </Text>
            <Text style={styles.footerText}>
              Page 1/1 | Technical Datasheet | {product.productCode}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}