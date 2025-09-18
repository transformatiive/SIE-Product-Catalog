import { createElement as h } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

// SIE Brand Colors and Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  
  // RED HEADER STYLES
  redHeader: {
    backgroundColor: '#E31E24',
    height: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  sieLogo: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sieLogoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E31E24',
    letterSpacing: 2,
  },
  headerSections: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
  },
  headerSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  headerSectionIcon: {
    fontSize: 10,
    color: '#E31E24',
    marginRight: 6,
  },
  headerSectionText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E31E24',
    letterSpacing: 0.5,
  },

  // PAGE 1 STYLES
  page1Content: {
    padding: 30,
    flex: 1,
  },
  productRef: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666666',
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 30,
  },
  
  // MAIN CONTENT LAYOUT
  mainContentRow: {
    flexDirection: 'row',
    gap: 40,
    flex: 1,
  },
  productImageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    minHeight: 300,
    padding: 20,
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: 280,
    objectFit: 'contain',
  },
  productImagePlaceholder: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  
  techCharacteristics: {
    flex: 0.6,
    paddingTop: 20,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  
  // CHARACTERISTICS WITH ICONS
  charItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingVertical: 8,
  },
  charIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#E31E24',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  charIconText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  charContent: {
    flex: 1,
  },
  charLabel: {
    fontSize: 8,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  charValue: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#333333',
  },
  
  // COLOR CIRCLE
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cccccc',
    marginTop: 4,
  },
  
  // BOTTOM SECTION PAGE 1
  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 40,
  },
  recyclingSection: {
    alignItems: 'center',
  },
  recyclingIcon: {
    fontSize: 24,
    color: '#2E7D32',
    marginBottom: 4,
  },
  recyclingText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  recyclingSubtext: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  websiteUrl: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E31E24',
  },
  pageNumber: {
    fontSize: 10,
    color: '#666666',
  },

  // PAGE 2 STYLES
  page2Content: {
    padding: 30,
    flex: 1,
  },
  page2Subtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 30,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  
  // TWO COLUMN LAYOUT PAGE 2
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 30,
    flex: 1,
  },
  leftColumnPage2: {
    flex: 1,
  },
  rightColumnPage2: {
    flex: 1,
  },
  
  // SECTION TITLES
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 9,
    color: '#666666',
    marginBottom: 15,
  },
  
  // TECHNICAL DRAWING
  technicalDrawingContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 20,
    minHeight: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  technicalDrawing: {
    maxWidth: '100%',
    maxHeight: 180,
    objectFit: 'contain',
  },
  drawingPlaceholder: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
  },
  
  // PACKAGING SECTION
  packagingContainer: {
    marginTop: 20,
  },
  packagingGrid: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  packagingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  packagingLabel: {
    fontSize: 10,
    color: '#333333',
    textTransform: 'uppercase',
  },
  packagingValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E31E24',
  },
  
  // CHARACTERISTICS TABLE
  specsTable: {
    marginBottom: 20,
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 6,
    alignItems: 'center',
  },
  specIcon: {
    width: 16,
    height: 16,
    backgroundColor: '#E31E24',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  specIconSmall: {
    fontSize: 8,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  specLabel: {
    fontSize: 9,
    color: '#666666',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  specValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1.5,
  },
  
  // CERTIFICATIONS
  certificationSection: {
    marginTop: 30,
  },
  certificationLogos: {
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center',
    marginTop: 15,
  },
  certLogo: {
    width: 40,
    height: 30,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  certLogoText: {
    fontSize: 8,
    color: '#666666',
    textAlign: 'center',
  },
  
  // FOOTER
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 15,
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
  const markings = parseJSON(product.markings, []);

  const formatDate = (date: Date | null) => {
    if (!date) return new Date().toLocaleDateString('pt-PT');
    return new Date(date).toLocaleDateString('pt-PT');
  };

  return h(Document, {},
    // PAGE 1
    h(Page, { size: "A4", style: styles.page },
      // RED HEADER
      h(View, { style: styles.redHeader },
        // SIE LOGO
        h(View, { style: styles.sieLogo },
          h(Text, { style: styles.sieLogoText }, 'SIE')
        ),
        
        // HEADER SECTIONS
        h(View, { style: styles.headerSections },
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '📦'),
            h(Text, { style: styles.headerSectionText }, 'PACKAGING')
          ),
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '⚙️'),
            h(Text, { style: styles.headerSectionText }, 'TECHNICAL')
          ),
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '🚛'),
            h(Text, { style: styles.headerSectionText }, 'TRAFFIC')
          )
        )
      ),

      // PAGE 1 CONTENT
      h(View, { style: styles.page1Content },
        // PRODUCT REFERENCE
        h(Text, { style: styles.productRef }, `REF. ${product.productCode}`),
        
        // PRODUCT TITLE
        h(Text, { style: styles.productTitle }, product.product.toUpperCase()),
        h(Text, { style: styles.productSubtitle }, product.type.toUpperCase()),

        // MAIN CONTENT ROW
        h(View, { style: styles.mainContentRow },
          // PRODUCT IMAGE
          h(View, { style: styles.productImageSection },
            product.productImage 
              ? h(Image, { 
                  style: styles.productImage, 
                  src: product.productImage 
                })
              : h(Text, { style: styles.productImagePlaceholder }, 
                  'IMAGEM DO PRODUTO\n(Imagem será exibida aqui)')
          ),

          // TECHNICAL CHARACTERISTICS
          h(View, { style: styles.techCharacteristics },
            h(Text, { style: styles.techTitle }, 'CARACTERÍSTICAS\nTÉCNICAS'),
            
            // CAPACITY
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '⚱')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CAPACIDADE NOMINAL'),
                h(Text, { style: styles.charValue }, product.nominalCapacity)
              )
            ),

            // WEIGHT
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '⚖')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'PESO (±5%)'),
                h(Text, { style: styles.charValue }, product.weight)
              )
            ),

            // MATERIAL
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '🔬')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'MATERIAL PRIMA'),
                h(Text, { style: styles.charValue }, product.rawMaterial)
              )
            ),

            // COLORS
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '🎨')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CORES PRINCIPAIS'),
                h(Text, { style: styles.charValue }, product.colors.split(',')[0]?.trim() || 'Branco'),
                h(Text, { style: styles.charLabel }, 'Outras opções de cor sob consulta'),
                h(View, { style: styles.colorCircle })
              )
            ),

            // STACKABLE
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '📚')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'EMPILHÁVEL'),
                h(Text, { style: styles.charValue }, '✓')
              )
            )
          )
        ),

        // BOTTOM SECTION
        h(View, { style: styles.bottomSection },
          // RECYCLING
          h(View, { style: styles.recyclingSection },
            h(Text, { style: styles.recyclingIcon }, '♻'),
            h(Text, { style: styles.recyclingText }, '100%'),
            h(Text, { style: styles.recyclingSubtext }, 'RECICLÁVEL')
          ),

          // WEBSITE
          h(Text, { style: styles.websiteUrl }, 'WWW.SIE.PT'),

          // PAGE NUMBER
          h(Text, { style: styles.pageNumber }, 'pág. 1/2')
        )
      )
    ),

    // PAGE 2
    h(Page, { size: "A4", style: styles.page },
      // RED HEADER (SAME AS PAGE 1)
      h(View, { style: styles.redHeader },
        // SIE LOGO
        h(View, { style: styles.sieLogo },
          h(Text, { style: styles.sieLogoText }, 'SIE')
        ),
        
        // HEADER SECTIONS WITH CERTIFICATION ICONS
        h(View, { style: styles.headerSections },
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '🏭'),
            h(Text, { style: styles.headerSectionText }, 'AGROALIMENTAR')
          ),
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '💊'),
            h(Text, { style: styles.headerSectionText }, 'FARMACÊUTICA')
          ),
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '⚗️'),
            h(Text, { style: styles.headerSectionText }, 'QUÍMICA')
          ),
          h(View, { style: styles.headerSection },
            h(Text, { style: styles.headerSectionIcon }, '🧴'),
            h(Text, { style: styles.headerSectionText }, 'FITOSSANITÁRIOS')
          )
        )
      ),

      // PAGE 2 CONTENT
      h(View, { style: styles.page2Content },
        // SUBTITLE
        h(Text, { style: styles.page2Subtitle }, 
          `FICHA TÉCNICA | ${product.product.toUpperCase()} | ${product.productCode}`),

        // TWO COLUMN LAYOUT
        h(View, { style: styles.twoColumnLayout },
          // LEFT COLUMN
          h(View, { style: styles.leftColumnPage2 },
            // TECHNICAL DRAWING 2D
            h(Text, { style: styles.sectionTitle }, 'DESENHO TÉCNICO 2D'),
            h(Text, { style: styles.sectionSubtitle }, 
              'Medidas apresentadas em milímetros com tolerância de ±3%'),
            
            h(View, { style: styles.technicalDrawingContainer },
              product.technicalDrawing
                ? h(Image, { 
                    style: styles.technicalDrawing, 
                    src: product.technicalDrawing 
                  })
                : h(Text, { style: styles.drawingPlaceholder }, 
                    'DESENHO TÉCNICO 2D\n(Blueprint será exibido aqui)')
            ),

            // PACKAGING SCHEME
            h(View, { style: styles.packagingContainer },
              h(Text, { style: styles.sectionTitle }, 'ESQUEMA DE\nACONDICIONAMENTO'),
              
              h(View, { style: styles.packagingGrid },
                h(Text, { style: styles.packagingLabel }, 'UNIDADES POR PALETE'),
                h(Text, { style: styles.packagingValue }, 
                  packaging.unitsPerPallet?.toString() || '105'),
                
                h(Text, { style: styles.packagingLabel }, 'UNIDADES POR CAMIÃO'),
                h(Text, { style: styles.packagingValue }, 
                  packaging.unitsPerTruck?.toString() || '3360'),

                h(Text, { style: styles.packagingLabel }, 'DIMENSÕES DA PALETE'),
                h(Text, { style: styles.packagingValue }, 
                  packaging.palletDimensions || '1200x800mm'),

                h(Text, { style: styles.packagingLabel }, 'ALTURA DE EMPILHAMENTO'),
                h(Text, { style: styles.packagingValue }, 
                  packaging.stackHeight?.toString() || '1200x810x2470mm')
              ),

              // 3D PRODUCT IMAGE
              h(View, { style: styles.productImageSection },
                product.productImage 
                  ? h(Image, { 
                      style: styles.productImage, 
                      src: product.productImage 
                    })
                  : h(Text, { style: styles.productImagePlaceholder }, 
                      'Imagem 3D do Produto')
              )
            )
          ),

          // RIGHT COLUMN
          h(View, { style: styles.rightColumnPage2 },
            // TECHNICAL CHARACTERISTICS
            h(Text, { style: styles.sectionTitle }, 'CARACTERÍSTICAS TÉCNICAS'),
            
            h(View, { style: styles.specsTable },
              // CAPACITY
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚱')
                ),
                h(Text, { style: styles.specLabel }, 'CAPACIDADE NOMINAL'),
                h(Text, { style: styles.specValue }, product.nominalCapacity)
              ),

              // TOTAL CAPACITY
              product.totalCapacity && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚱')
                ),
                h(Text, { style: styles.specLabel }, 'CAPACIDADE TOTAL'),
                h(Text, { style: styles.specValue }, product.totalCapacity)
              ),

              // WEIGHT
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚖')
                ),
                h(Text, { style: styles.specLabel }, 'PESO (±5%)'),
                h(Text, { style: styles.specValue }, product.weight)
              ),

              // WEIGHT WITH ACCESSORIES
              product.weightWithAccessories && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚖')
                ),
                h(Text, { style: styles.specLabel }, 'PESO C/ ACESSÓRIOS (±5%)'),
                h(Text, { style: styles.specValue }, product.weightWithAccessories)
              ),

              // MATERIAL
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔬')
                ),
                h(Text, { style: styles.specLabel }, 'MATERIAL PRIMA'),
                h(Text, { style: styles.specValue }, product.rawMaterial)
              ),

              // COLORS
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🎨')
                ),
                h(Text, { style: styles.specLabel }, 'CORES DISPONÍVEIS'),
                h(Text, { style: styles.specValue }, product.colors)
              ),

              // CLOSING SYSTEM
              product.closingSystem && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔒')
                ),
                h(Text, { style: styles.specLabel }, 'SISTEMA DE FECHO'),
                h(Text, { style: styles.specValue }, product.closingSystem)
              ),

              // SEALING
              product.sealingType && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔗')
                ),
                h(Text, { style: styles.specLabel }, 'VEDANTE'),
                h(Text, { style: styles.specValue }, product.sealingType)
              ),

              // HANDLING SYSTEM
              product.handlingSystem && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🤲')
                ),
                h(Text, { style: styles.specLabel }, 'SISTEMA DE MANUSEAMENTO'),
                h(Text, { style: styles.specValue }, product.handlingSystem)
              ),

              // FOOD CONTACT
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🍽')
                ),
                h(Text, { style: styles.specLabel }, 'CONTACTO ALIMENTAR'),
                h(Text, { style: styles.specValue }, product.foodContact ? 'Apto' : 'Não Apto')
              )
            ),

            // CERTIFICATIONS SECTION
            h(View, { style: styles.certificationSection },
              h(Text, { style: styles.sectionTitle }, 'CERTIFICAÇÕES'),
              h(Text, { style: styles.specLabel }, 'Produto certificado pelos organismos:'),
              
              h(View, { style: styles.certificationLogos },
                h(View, { style: styles.certLogo },
                  h(Text, { style: styles.certLogoText }, 'CENTRO\n2020')
                ),
                h(View, { style: styles.certLogo },
                  h(Text, { style: styles.certLogoText }, 'PT\n2020')
                ),
                h(View, { style: styles.certLogo },
                  h(Text, { style: styles.certLogoText }, 'EU\nCOMM')
                )
              )
            )
          )
        )
      ),

      // FOOTER PAGE 2
      h(View, { style: styles.footer },
        h(Text, { style: styles.footerText }, `Aprovado: ${formatDate(null)} | Revisão: 03 | Data: 29/08/2023`),
        h(Text, { style: styles.pageNumber }, 'pág. 2/2')
      )
    )
  );
}