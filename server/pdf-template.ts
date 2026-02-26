import { createElement as h } from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';
import path from 'path';
import fs from 'fs';

function resolveImagePath(webPath: string | null): string | null {
  if (!webPath || webPath.trim() === '') {
    return null;
  }

  try {
    const cleanPath = webPath.startsWith('/') ? webPath.slice(1) : webPath;
    
    if (!cleanPath.startsWith('uploads/')) {
      console.warn(`Invalid image path: ${webPath}. Path must start with uploads/`);
      return null;
    }

    const fullPath = path.join(process.cwd(), 'public', cleanPath);
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fullPath.startsWith(uploadsDir)) {
      console.warn(`Path traversal attempt detected: ${webPath}`);
      return null;
    }

    if (fs.existsSync(fullPath)) {
      return fullPath;
    } else {
      console.warn(`Image file not found: ${fullPath}`);
      return null;
    }
  } catch (error) {
    console.error(`Error resolving image path ${webPath}:`, error);
    return null;
  }
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#333333',
  },
  
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
  
  colorCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#cccccc',
    marginTop: 4,
  },
  
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
  footerText: {
    fontSize: 9,
    color: '#666666',
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

  const buildVedanteString = () => {
    const parts: string[] = [];
    if (product.vedantePead) parts.push('PEAD');
    if (product.vedanteEpdm) parts.push('EPDM');
    if (product.vedanteOutros) parts.push(product.vedanteOutros);
    return parts.join(', ');
  };

  const buildManuseamentoString = () => {
    const parts: string[] = [];
    if (product.pegasLaterais) parts.push('Pegas Laterais');
    if (product.pegaSuperior) parts.push('Pega Superior');
    if (product.cavidades) parts.push('Cavidades');
    if (product.manuseamentoOutros) parts.push(product.manuseamentoOutros);
    return parts.join(', ');
  };

  const buildMarcacoesString = () => {
    const parts: string[] = [];
    if (product.datador) parts.push('Datador');
    if (product.simboloSie) parts.push('Símbolo SIE');
    if (product.simboloMp) parts.push('Símbolo MP');
    if (product.gravacaoCliente) {
      let label = 'Gravação Cliente';
      if (product.gravacaoClienteDetails) label += ` (${product.gravacaoClienteDetails})`;
      parts.push(label);
    }
    return parts.join(', ');
  };

  const buildOutrasCaracteristicasString = () => {
    const parts: string[] = [];
    if (product.visor) parts.push('Visor');
    if (product.bica) parts.push('Bica');
    if (product.coexPoliamida) parts.push('COEX - Poliamida');
    if (product.adaptacao) parts.push('Adaptação');
    if (product.autoculanteCliente) parts.push(`Autocolante: ${product.autoculanteCliente}`);
    if (product.especificacoesEmbFlexiveis) parts.push(`Emb. Flexíveis: ${product.especificacoesEmbFlexiveis}`);
    return parts.join(', ');
  };

  const vedanteString = buildVedanteString();
  const manuseamentoString = buildManuseamentoString();
  const marcacoesString = buildMarcacoesString();
  const outrasCaracteristicasString = buildOutrasCaracteristicasString();

  return h(Document, {},
    h(Page, { size: "A4", style: styles.page },
      h(View, { style: styles.redHeader },
        h(View, { style: styles.sieLogo },
          h(Text, { style: styles.sieLogoText }, 'SIE')
        ),
        
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

      h(View, { style: styles.page1Content },
        h(Text, { style: styles.productRef }, `REF. ${product.productCode}`),
        
        h(Text, { style: styles.productTitle }, product.product.toUpperCase()),
        h(Text, { style: styles.productSubtitle }, product.type.toUpperCase()),

        h(View, { style: styles.mainContentRow },
          h(View, { style: styles.productImageSection },
            resolveImagePath(product.productImage)
              ? h(Image, { 
                  style: styles.productImage, 
                  src: resolveImagePath(product.productImage)! 
                })
              : h(Text, { style: styles.productImagePlaceholder }, 
                  'IMAGEM DO PRODUTO\n(Imagem será exibida aqui)')
          ),

          h(View, { style: styles.techCharacteristics },
            h(Text, { style: styles.techTitle }, 'CARACTERÍSTICAS\nTÉCNICAS'),
            
            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '⚱')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CAPACIDADE NOMINAL'),
                h(Text, { style: styles.charValue }, `${product.nominalCapacity} ${product.nominalCapacityUnit || 'L'}`)
              )
            ),

            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '⚖')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, `PESO (±${product.weightTolerance || '5'}%)`),
                h(Text, { style: styles.charValue }, `${product.weight} ${product.weightUnit || 'g'}`)
              )
            ),

            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '🔬')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'MATERIAL PRIMA'),
                h(Text, { style: styles.charValue }, product.rawMaterial)
              )
            ),

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

            product.shape && h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '◇')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'FORMA'),
                h(Text, { style: styles.charValue }, product.shape)
              )
            ),

            h(View, { style: styles.charItem },
              h(View, { style: styles.charIcon },
                h(Text, { style: styles.charIconText }, '📚')
              ),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'EMPILHÁVEL'),
                h(Text, { style: styles.charValue }, product.stackable ? (product.stackingCapacity || '✓') : '✗')
              )
            )
          )
        ),

        h(View, { style: styles.bottomSection },
          h(View, { style: styles.recyclingSection },
            h(Text, { style: styles.recyclingIcon }, '♻'),
            h(Text, { style: styles.recyclingText }, '100%'),
            h(Text, { style: styles.recyclingSubtext }, 'RECICLÁVEL')
          ),

          h(Text, { style: styles.websiteUrl }, 'WWW.SIE.PT'),

          h(Text, { style: styles.pageNumber }, 'pág. 1/2')
        )
      )
    ),

    h(Page, { size: "A4", style: styles.page },
      h(View, { style: styles.redHeader },
        h(View, { style: styles.sieLogo },
          h(Text, { style: styles.sieLogoText }, 'SIE')
        ),
        
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

      h(View, { style: styles.page2Content },
        h(Text, { style: styles.page2Subtitle }, 
          `FICHA TÉCNICA | ${product.product.toUpperCase()} | ${product.productCode}`),

        h(View, { style: styles.twoColumnLayout },
          h(View, { style: styles.leftColumnPage2 },
            h(Text, { style: styles.sectionTitle }, 'DESENHO TÉCNICO 2D'),
            h(Text, { style: styles.sectionSubtitle }, 
              'Medidas apresentadas em milímetros com tolerância de ±3%'),
            
            h(View, { style: styles.technicalDrawingContainer },
              resolveImagePath(product.technicalDrawing)
                ? h(Image, { 
                    style: styles.technicalDrawing, 
                    src: resolveImagePath(product.technicalDrawing)! 
                  })
                : h(Text, { style: styles.drawingPlaceholder }, 
                    'DESENHO TÉCNICO 2D\n(Blueprint será exibido aqui)')
            ),

            h(View, { style: styles.packagingContainer },
              h(Text, { style: styles.sectionTitle }, 'ESQUEMA DE\nACONDICIONAMENTO'),
              
              h(View, { style: styles.packagingGrid },
                h(Text, { style: styles.packagingLabel }, 'DIMENSÕES DA PALETE'),
                h(Text, { style: styles.packagingValue }, 
                  product.palletDimensions || packaging.palletDimensions || '-'),
                
                h(Text, { style: styles.packagingLabel }, 'DIM. MERCADORIA NA PALETE'),
                h(Text, { style: styles.packagingValue }, 
                  product.productOnPalletDimensions || packaging.stackHeight?.toString() || '-'),

                h(Text, { style: styles.packagingLabel }, 'ESQUEMA DE ARRUMAÇÃO'),
                h(Text, { style: styles.packagingValue }, 
                  product.arrangementScheme || '-'),

                h(Text, { style: styles.packagingLabel }, 'TOTAL DE UNIDADES'),
                h(Text, { style: styles.packagingValue }, 
                  (product.totalUnitsQuantity && product.totalUnitsType)
                    ? `${product.totalUnitsQuantity} / ${product.totalUnitsType}`
                    : product.totalUnits || packaging.unitsPerPallet?.toString() || '-')
              ),

              h(View, { style: styles.productImageSection },
                resolveImagePath(product.productImage)
                  ? h(Image, { 
                      style: styles.productImage, 
                      src: resolveImagePath(product.productImage)! 
                    })
                  : h(Text, { style: styles.productImagePlaceholder }, 
                      'Imagem 3D do Produto')
              )
            )
          ),

          h(View, { style: styles.rightColumnPage2 },
            h(Text, { style: styles.sectionTitle }, 'CARACTERÍSTICAS TÉCNICAS'),
            
            h(View, { style: styles.specsTable },
              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚱')
                ),
                h(Text, { style: styles.specLabel }, 'CAPACIDADE NOMINAL'),
                h(Text, { style: styles.specValue }, `${product.nominalCapacity} ${product.nominalCapacityUnit || 'L'}`)
              ),

              product.totalCapacity && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚱')
                ),
                h(Text, { style: styles.specLabel }, 'CAPACIDADE TOTAL'),
                h(Text, { style: styles.specValue }, `${product.totalCapacity} ${product.totalCapacityUnit || 'L'}`)
              ),

              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚖')
                ),
                h(Text, { style: styles.specLabel }, `PESO (±${product.weightTolerance || '5'}%)`),
                h(Text, { style: styles.specValue }, `${product.weight} ${product.weightUnit || 'g'}`)
              ),

              product.weightWithAccessories && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚖')
                ),
                h(Text, { style: styles.specLabel }, `PESO C/ ACESSÓRIOS (±${product.weightTolerance || '5'}%)`),
                h(Text, { style: styles.specValue }, `${product.weightWithAccessories} ${product.weightWithAccessoriesUnit || 'g'}`)
              ),

              product.accessories && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔧')
                ),
                h(Text, { style: styles.specLabel }, 'ACESSÓRIOS'),
                h(Text, { style: styles.specValue }, product.accessories)
              ),

              product.shape && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '◇')
                ),
                h(Text, { style: styles.specLabel }, 'FORMA'),
                h(Text, { style: styles.specValue }, product.shape)
              ),

              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔬')
                ),
                h(Text, { style: styles.specLabel }, 'MATERIAL PRIMA'),
                h(Text, { style: styles.specValue }, product.rawMaterial)
              ),

              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🎨')
                ),
                h(Text, { style: styles.specLabel }, 'CORES DISPONÍVEIS'),
                h(Text, { style: styles.specValue }, product.colors)
              ),

              product.closingSystem && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔒')
                ),
                h(Text, { style: styles.specLabel }, 'SISTEMA DE FECHO'),
                h(Text, { style: styles.specValue }, product.closingSystem)
              ),

              product.sealingType && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔗')
                ),
                h(Text, { style: styles.specLabel }, 'VEDANTE'),
                h(Text, { style: styles.specValue }, product.sealingType)
              ),

              product.handlingSystem && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🤲')
                ),
                h(Text, { style: styles.specLabel }, 'SISTEMA DE MANUSEAMENTO'),
                h(Text, { style: styles.specValue }, product.handlingSystem)
              ),

              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🍽')
                ),
                h(Text, { style: styles.specLabel }, 'CONTACTO ALIMENTAR'),
                h(Text, { style: styles.specValue }, product.foodContact ? 'Apto' : 'Não Apto')
              ),

              product.adrCertified && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '⚠')
                ),
                h(Text, { style: styles.specLabel }, 'ADR'),
                h(Text, { style: styles.specValue }, product.adrCode ? `Certificado - ${product.adrCode}` : 'Certificado')
              ),

              product.designation && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '📋')
                ),
                h(Text, { style: styles.specLabel }, 'DESIGNAÇÃO'),
                h(Text, { style: styles.specValue }, product.designation)
              ),

              product.barcode && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '📊')
                ),
                h(Text, { style: styles.specLabel }, 'CÓDIGO DE BARRAS'),
                h(Text, { style: styles.specValue }, product.barcode)
              ),

              product.capType && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔓')
                ),
                h(Text, { style: styles.specLabel }, 'TIPO DE TAMPA'),
                h(Text, { style: styles.specValue }, product.capType)
              ),

              product.capDimensions && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '📐')
                ),
                h(Text, { style: styles.specLabel }, 'DIMENSÕES DA TAMPA'),
                h(Text, { style: styles.specValue }, product.capDimensions)
              ),

              h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '📚')
                ),
                h(Text, { style: styles.specLabel }, 'EMPILHÁVEL'),
                h(Text, { style: styles.specValue }, product.stackable ? (product.stackingCapacity || '✓') : '✗')
              ),

              vedanteString && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🔗')
                ),
                h(Text, { style: styles.specLabel }, 'VEDANTE'),
                h(Text, { style: styles.specValue }, vedanteString)
              ),

              manuseamentoString && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🤲')
                ),
                h(Text, { style: styles.specLabel }, 'SISTEMA DE MANUSEAMENTO'),
                h(Text, { style: styles.specValue }, manuseamentoString)
              ),

              marcacoesString && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '🏷')
                ),
                h(Text, { style: styles.specLabel }, 'MARCAÇÕES'),
                h(Text, { style: styles.specValue }, marcacoesString)
              ),

              outrasCaracteristicasString && h(View, { style: styles.specRow },
                h(View, { style: styles.specIcon },
                  h(Text, { style: styles.specIconSmall }, '✨')
                ),
                h(Text, { style: styles.specLabel }, 'OUTRAS CARACTERÍSTICAS'),
                h(Text, { style: styles.specValue }, outrasCaracteristicasString)
              )
            ),

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

      h(View, { style: styles.footer },
        h(Text, { style: styles.footerText }, 
          `Aprovado por: ${product.approvedBy || '-'} | Data de Aprovação: ${product.approvalDate || formatDate(null)} | Revisão: ${String(product.currentVersionNumber).padStart(2, '0')}`),
        h(Text, { style: styles.pageNumber }, 'pág. 2/2')
      )
    )
  );
}
