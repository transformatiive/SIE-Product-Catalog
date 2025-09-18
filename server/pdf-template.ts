import { createElement as h } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
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
    border: 1,
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
    border: 1,
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

  return h(Document, {},
    h(Page, { size: "A4", style: styles.page },
      // Header
      h(View, { style: styles.header },
        h(View, { style: styles.headerLeft },
          h(Text, { style: styles.title }, product.product),
          h(Text, { style: styles.subtitle }, product.model),
          h(Text, { style: styles.productCode }, `REF. ${product.productCode}`)
        ),
        h(View, { style: styles.headerRight },
          h(Text, { style: styles.companyInfo }, 'PRODUCT DATABASE'),
          h(Text, { style: styles.companyInfo }, 'Technical Datasheet')
        )
      ),

      h(View, { style: styles.contentContainer },
        // Left Column - Main Specifications
        h(View, { style: styles.leftColumn },
          // Technical Characteristics
          h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'TECHNICAL CHARACTERISTICS'),
            
            // Capacity Highlight
            h(View, { style: styles.capacityHighlight },
              h(Text, {}, `NOMINAL CAPACITY: ${product.nominalCapacity}`)
            ),

            h(View, { style: styles.specGrid },
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Model:'),
                h(Text, { style: styles.specValue }, product.model)
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Type:'),
                h(Text, { style: styles.specValue }, product.type)
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Weight (±5%):'),
                h(Text, { style: styles.specValue }, product.weight)
              ),
              
              product.weightWithAccessories && h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Weight w/ Accessories:'),
                h(Text, { style: styles.specValue }, product.weightWithAccessories)
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Raw Material:'),
                h(Text, { style: styles.specValue }, product.rawMaterial)
              ),
              
              product.totalCapacity && h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Total Capacity:'),
                h(Text, { style: styles.specValue }, product.totalCapacity)
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Closing System:'),
                h(Text, { style: styles.specValue }, product.closingSystem || 'N/A')
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Sealing Type:'),
                h(Text, { style: styles.specValue }, product.sealingType || 'N/A')
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Handling System:'),
                h(Text, { style: styles.specValue }, product.handlingSystem || 'N/A')
              ),
              
              h(View, { style: styles.specRow },
                h(Text, { style: styles.specLabel }, 'Food Contact:'),
                h(Text, { style: styles.specValue }, product.foodContact ? 'YES' : 'NO')
              )
            )
          ),

          // Colors Available
          h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'AVAILABLE COLORS'),
            h(View, { style: styles.featuresContainer },
              ...product.colors.split(',').map((color, index) =>
                h(View, { key: index, style: styles.featureTag },
                  h(Text, {}, color.trim())
                )
              )
            )
          ),

          // Technical Drawing Placeholder
          h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'TECHNICAL DRAWING'),
            h(View, { style: styles.technicalDrawing },
              h(Text, { style: styles.drawingPlaceholder }, 'Technical Drawing'),
              h(Text, { style: styles.drawingPlaceholder }, 'Measurements in millimeters with ±3% tolerance')
            )
          )
        ),

        // Right Column - Dimensions & Additional Info
        h(View, { style: styles.rightColumn },
          // Dimensions
          Object.keys(dimensions).length > 0 && h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'DIMENSIONS'),
            h(View, { style: styles.dimensionsTable },
              h(View, { style: styles.tableHeader },
                h(Text, { style: styles.tableHeaderText }, 'Parameter'),
                h(Text, { style: styles.tableHeaderText }, 'Value')
              ),
              ...Object.entries(dimensions).map(([key, value], index) =>
                h(View, { key: index, style: styles.tableRow },
                  h(Text, { style: styles.tableCellText }, key),
                  h(Text, { style: styles.tableCellText }, String(value))
                )
              )
            )
          ),

          // Certifications
          certifications.length > 0 && h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'CERTIFICATIONS'),
            h(View, {},
              ...certifications.map((cert: string, index: number) =>
                h(View, { key: index, style: styles.certificationBadge },
                  h(Text, {}, cert)
                )
              )
            )
          ),

          // Special Features
          specialFeatures.length > 0 && h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'SPECIAL FEATURES'),
            h(View, { style: styles.featuresContainer },
              ...specialFeatures.map((feature: string, index: number) =>
                h(View, { key: index, style: styles.featureTag },
                  h(Text, {}, feature)
                )
              )
            )
          ),

          // Packaging Information
          Object.keys(packaging).length > 0 && h(View, { style: styles.section },
            h(Text, { style: styles.sectionTitle }, 'PACKAGING'),
            h(View, { style: styles.specGrid },
              ...Object.entries(packaging).map(([key, value], index) =>
                h(View, { key: index, style: styles.specRow },
                  h(Text, { style: styles.specLabel }, `${key}:`),
                  h(Text, { style: styles.specValue }, String(value))
                )
              )
            )
          ),

          // Recyclable Badge
          h(View, { style: styles.section },
            h(View, {
              style: {
                backgroundColor: '#E8F5E8',
                padding: 10,
                borderRadius: 5,
                alignItems: 'center',
                marginTop: 20,
              }
            },
              h(Text, { style: styles.recycleSymbol }, '♻'),
              h(Text, {
                style: {
                  fontSize: 10,
                  fontWeight: 'bold',
                  color: '#2E7D32',
                  textAlign: 'center',
                }
              }, '100% RECYCLABLE'),
              h(Text, {
                style: {
                  fontSize: 8,
                  color: '#666666',
                  textAlign: 'center',
                  marginTop: 3,
                }
              }, 'REUSABLE')
            )
          )
        )
      ),

      // Footer
      h(View, { style: styles.footer },
        h(View, {},
          h(Text, { style: styles.footerText }, `Generated: ${formatDate(null)}`),
          h(Text, { style: styles.footerText }, `Product Family: ${product.family}`)
        ),
        h(View, { style: { alignItems: 'flex-end' } },
          h(Text, { style: styles.footerText }, `Status: ${product.isActive ? 'ACTIVE' : 'INACTIVE'}`),
          h(Text, { style: styles.footerText }, `Page 1/1 | Technical Datasheet | ${product.productCode}`)
        )
      )
    )
  );
}