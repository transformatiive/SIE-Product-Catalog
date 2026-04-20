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

const SIE_LOGO_PATH = (() => {
  const p = path.join(process.cwd(), 'attached_assets', 'sie-logo.png');
  return fs.existsSync(p) ? p : null;
})();

const certificationLogoFile = (filename: string) => {
  const p = path.join(process.cwd(), 'attached_assets', filename);
  return fs.existsSync(p) ? p : null;
};
const CENTRO_2020_LOGO_PATH = certificationLogoFile('centro-2020-logo.png');
const PORTUGAL_2020_LOGO_PATH = certificationLogoFile('portugal-2020-logo.png');
const UNIAO_EUROPEIA_LOGO_PATH = certificationLogoFile('uniao-europeia-logo.png');

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
    height: 110,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  sieLogoBox: {
    backgroundColor: '#ffffff',
    width: 110,
    height: 70,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  sieLogoImage: {
    width: 90,
    height: 52,
    objectFit: 'contain',
  },
  sieLogoFallback: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E31E24',
    letterSpacing: 2,
  },
  headerSections: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  },
  headerPill: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 3,
    minWidth: 150,
  },
  headerPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E31E24',
    letterSpacing: 0.6,
    textAlign: 'right',
  },

  // PAGE 1
  page1Content: {
    padding: 30,
    flex: 1,
  },
  productRef: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#999999',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  productTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 24,
  },

  mainContentRow: {
    flexDirection: 'row',
    gap: 30,
    flex: 1,
  },
  productImageSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    minHeight: 280,
    padding: 16,
  },
  productImage: {
    maxWidth: '100%',
    maxHeight: 260,
    objectFit: 'contain',
  },
  productImagePlaceholder: {
    fontSize: 11,
    color: '#999999',
    textAlign: 'center',
  },

  techCharacteristics: {
    flex: 0.85,
    paddingTop: 8,
  },
  techTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  charRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bulletDot: {
    width: 10,
    height: 10,
    backgroundColor: '#E31E24',
    borderRadius: 5,
    marginRight: 10,
  },
  charContent: {
    flex: 1,
  },
  charLabel: {
    fontSize: 7,
    color: '#888888',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  charValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
  },

  bottomSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
  },
  recyclingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recyclingBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recyclingBadgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  recyclingLabel: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#2E7D32',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  websiteUrl: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#E31E24',
    letterSpacing: 1,
  },
  pageNumber: {
    fontSize: 9,
    color: '#666666',
  },

  // PAGE 2
  page2Content: {
    padding: 30,
    flex: 1,
  },
  page2Subtitle: {
    fontSize: 12,
    color: '#333333',
    textAlign: 'center',
    marginBottom: 22,
    fontWeight: 'bold',
    letterSpacing: 0.4,
  },

  twoColumnLayout: {
    flexDirection: 'row',
    gap: 20,
    flex: 1,
  },
  leftColumnPage2: {
    flex: 1,
  },
  rightColumnPage2: {
    flex: 1.05,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E31E24',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: '#888888',
    marginBottom: 8,
    fontStyle: 'italic',
  },

  technicalDrawingContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 14,
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  technicalDrawing: {
    maxWidth: '100%',
    maxHeight: 160,
    objectFit: 'contain',
  },
  drawingPlaceholder: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
  },

  packagingContainer: {
    marginTop: 4,
  },
  packagingGrid: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  packagingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  packagingRowLast: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  packagingLabel: {
    fontSize: 8,
    color: '#666666',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
  },
  packagingValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#E31E24',
    textAlign: 'right',
    flex: 1,
  },
  palletizationImageContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 10,
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  palletizationImage: {
    maxWidth: '100%',
    maxHeight: 110,
    objectFit: 'contain',
  },

  specsTable: {
    marginBottom: 16,
  },
  specRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingVertical: 5,
    alignItems: 'center',
  },
  specBullet: {
    width: 8,
    height: 8,
    backgroundColor: '#E31E24',
    borderRadius: 4,
    marginRight: 8,
  },
  specLabel: {
    fontSize: 8,
    color: '#777777',
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  specValue: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1.4,
    textAlign: 'right',
  },

  certificationSection: {
    marginTop: 16,
  },
  certificationLogos: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  certLogoImage: {
    height: 36,
    objectFit: 'contain',
  },
  certLogo: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dddddd',
  },
  certLogoText: {
    fontSize: 8,
    color: '#444444',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  footer: {
    position: 'absolute',
    bottom: 16,
    left: 30,
    right: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eeeeee',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 8,
    color: '#777777',
  },
});

interface PDFTemplateProps {
  product: Product;
}

const HEADER_PILLS = ['AGROALIMENTAR', 'FARMACÊUTICA', 'QUÍMICA', 'FITOSSANITÁRIOS'];

function renderHeader() {
  return h(View, { style: styles.redHeader },
    h(View, { style: styles.sieLogoBox },
      SIE_LOGO_PATH
        ? h(Image, { style: styles.sieLogoImage, src: SIE_LOGO_PATH })
        : h(Text, { style: styles.sieLogoFallback }, 'SIE')
    ),
    h(View, { style: styles.headerSections },
      ...HEADER_PILLS.map((label, idx) =>
        h(View, { key: idx, style: styles.headerPill },
          h(Text, { style: styles.headerPillText }, label)
        )
      )
    )
  );
}

function renderRecycling() {
  return h(View, { style: styles.recyclingSection },
    h(View, { style: styles.recyclingBadge },
      h(Text, { style: styles.recyclingBadgeText }, '100%')
    ),
    h(Text, { style: styles.recyclingLabel }, 'Reciclável')
  );
}

function specRow(label: string, value: string) {
  return h(View, { style: styles.specRow },
    h(View, { style: styles.specBullet }),
    h(Text, { style: styles.specLabel }, label),
    h(Text, { style: styles.specValue }, value)
  );
}

function packRow(label: string, value: string, last = false) {
  return h(View, { style: last ? styles.packagingRowLast : styles.packagingRow },
    h(Text, { style: styles.packagingLabel }, label),
    h(Text, { style: styles.packagingValue }, value)
  );
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

  const packaging = parseJSON(product.packaging, {});

  const formatDate = (date: any) => {
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

  const productImagePath = resolveImagePath(product.productImage);
  const technicalDrawingPath = resolveImagePath(product.technicalDrawing);
  const palletizationImagePath = resolveImagePath(product.palletizationImage);

  const totalUnitsValue = (product.totalUnitsQuantity && product.totalUnitsType)
    ? `${product.totalUnitsQuantity} / ${product.totalUnitsType}`
    : (product.totalUnits || packaging.unitsPerPallet?.toString() || '-');

  return h(Document, {},
    // ---------- PAGE 1 ----------
    h(Page, { size: 'A4', style: styles.page },
      renderHeader(),

      h(View, { style: styles.page1Content },
        h(Text, { style: styles.productRef }, `REF. ${product.productCode || '-'}`),
        h(Text, { style: styles.productTitle }, (product.product || '').toUpperCase()),
        h(Text, { style: styles.productSubtitle }, (product.type || '').toUpperCase()),

        h(View, { style: styles.mainContentRow },
          h(View, { style: styles.productImageSection },
            productImagePath
              ? h(Image, { style: styles.productImage, src: productImagePath })
              : h(Text, { style: styles.productImagePlaceholder },
                  'Imagem do produto\n(não carregada)')
          ),

          h(View, { style: styles.techCharacteristics },
            h(Text, { style: styles.techTitle }, 'Características Técnicas'),

            h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CAPACIDADE NOMINAL'),
                h(Text, { style: styles.charValue }, `${product.nominalCapacity || '-'} ${product.nominalCapacityUnit || 'L'}`)
              )
            ),

            product.totalCapacity ? h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CAPACIDADE TOTAL'),
                h(Text, { style: styles.charValue }, `${product.totalCapacity} ${product.totalCapacityUnit || 'L'}`)
              )
            ) : null,

            h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, `PESO (±${product.weightTolerance || '5'}%)`),
                h(Text, { style: styles.charValue }, `${product.weight || '-'} ${product.weightUnit || 'g'}`)
              )
            ),

            product.weightWithAccessories ? h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, `PESO C/ ACESSÓRIOS (±${product.weightTolerance || '5'}%)`),
                h(Text, { style: styles.charValue }, `${product.weightWithAccessories} ${product.weightWithAccessoriesUnit || 'g'}`)
              )
            ) : null,

            h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'MATÉRIA PRIMA'),
                h(Text, { style: styles.charValue }, product.rawMaterial || '-')
              )
            ),

            product.colors ? h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CORES DISPONÍVEIS'),
                h(Text, { style: styles.charValue }, product.colors)
              )
            ) : null,

            h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'CONTACTO ALIMENTAR'),
                h(Text, { style: styles.charValue }, product.foodContact ? 'Apto' : 'Não Apto')
              )
            ),

            product.shape ? h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'FORMA'),
                h(Text, { style: styles.charValue }, product.shape)
              )
            ) : null,

            h(View, { style: styles.charRow },
              h(View, { style: styles.bulletDot }),
              h(View, { style: styles.charContent },
                h(Text, { style: styles.charLabel }, 'EMPILHÁVEL'),
                h(Text, { style: styles.charValue }, product.stackable ? (product.stackingCapacity || 'Sim') : 'Não')
              )
            )
          )
        ),

        h(View, { style: styles.bottomSection },
          renderRecycling(),
          h(Text, { style: styles.websiteUrl }, 'WWW.SIE.PT'),
          h(Text, { style: styles.pageNumber }, 'pág. 1/2')
        )
      )
    ),

    // ---------- PAGE 2 ----------
    h(Page, { size: 'A4', style: styles.page },
      renderHeader(),

      h(View, { style: styles.page2Content },
        h(Text, { style: styles.page2Subtitle },
          `FICHA TÉCNICA  |  ${(product.product || '').toUpperCase()}  |  ${product.productCode || '-'}`),

        h(View, { style: styles.twoColumnLayout },
          // LEFT COLUMN
          h(View, { style: styles.leftColumnPage2 },
            h(Text, { style: styles.sectionTitle }, 'Desenho Técnico 2D'),
            h(Text, { style: styles.sectionSubtitle },
              'Medidas apresentadas em milímetros com tolerância de ±3%'),

            h(View, { style: styles.technicalDrawingContainer },
              technicalDrawingPath
                ? h(Image, { style: styles.technicalDrawing, src: technicalDrawingPath })
                : h(Text, { style: styles.drawingPlaceholder },
                    'Desenho técnico 2D\n(não carregado)')
            ),

            h(View, { style: styles.packagingContainer },
              h(Text, { style: styles.sectionTitle }, 'Esquema de Acondicionamento'),

              h(View, { style: styles.packagingGrid },
                packRow('Dimensões da palete',
                  product.palletDimensions || packaging.palletDimensions || '-'),
                packRow('Dim. mercadoria na palete',
                  product.productOnPalletDimensions || packaging.stackHeight?.toString() || '-'),
                packRow('Esquema de arrumação',
                  product.arrangementScheme || '-'),
                packRow('Total de unidades', totalUnitsValue, true)
              ),

              h(View, { style: styles.palletizationImageContainer },
                palletizationImagePath
                  ? h(Image, { style: styles.palletizationImage, src: palletizationImagePath })
                  : h(Text, { style: styles.drawingPlaceholder },
                      'Imagem de paletização\n(não carregada)')
              )
            )
          ),

          // RIGHT COLUMN
          h(View, { style: styles.rightColumnPage2 },
            h(Text, { style: styles.sectionTitle }, 'Características Técnicas'),

            h(View, { style: styles.specsTable },
              specRow('Capacidade nominal', `${product.nominalCapacity || '-'} ${product.nominalCapacityUnit || 'L'}`),
              product.totalCapacity ? specRow('Capacidade total', `${product.totalCapacity} ${product.totalCapacityUnit || 'L'}`) : null,
              specRow(`Peso (±${product.weightTolerance || '5'}%)`, `${product.weight || '-'} ${product.weightUnit || 'g'}`),
              product.weightWithAccessories ? specRow(`Peso c/ acessórios (±${product.weightTolerance || '5'}%)`, `${product.weightWithAccessories} ${product.weightWithAccessoriesUnit || 'g'}`) : null,
              product.accessories ? specRow('Acessórios', product.accessories) : null,
              product.shape ? specRow('Forma', product.shape) : null,
              specRow('Matéria prima', product.rawMaterial || '-'),
              specRow('Cores disponíveis', product.colors || '-'),
              specRow('Contacto alimentar', product.foodContact ? 'Apto' : 'Não Apto'),
              product.designation ? specRow('Designação', product.designation) : null,
              product.barcode ? specRow('Código de barras', product.barcode) : null,
              specRow('Empilhável', product.stackable ? (product.stackingCapacity || 'Sim') : 'Não'),
              product.closingSystem ? specRow('Sistema de fecho', product.closingSystem) : null,
              product.capType ? specRow('Tipo de tampa', product.capType) : null,
              product.capDimensions ? specRow('Dimensões da tampa', product.capDimensions) : null,
              vedanteString ? specRow('Vedante', vedanteString) : (product.sealingType ? specRow('Vedante', product.sealingType) : null),
              manuseamentoString ? specRow('Sistema de manuseamento', manuseamentoString) : (product.handlingSystem ? specRow('Sistema de manuseamento', product.handlingSystem) : null),
              marcacoesString ? specRow('Marcações', marcacoesString) : null,
              outrasCaracteristicasString ? specRow('Outras características', outrasCaracteristicasString) : null,
              product.adrCertified ? specRow('ADR', product.adrCode ? `Certificado - ${product.adrCode}` : 'Certificado') : null
            ),

            h(View, { style: styles.certificationSection },
              h(Text, { style: styles.sectionTitle }, 'Certificações'),
              h(Text, { style: styles.sectionSubtitle }, 'Produto certificado pelos organismos:'),
              h(View, { style: styles.certificationLogos },
                CENTRO_2020_LOGO_PATH
                  ? h(Image, { style: [styles.certLogoImage, { width: 96 }], src: CENTRO_2020_LOGO_PATH })
                  : h(View, { style: styles.certLogo },
                      h(Text, { style: styles.certLogoText }, 'CENTRO\n2020')
                    ),
                PORTUGAL_2020_LOGO_PATH
                  ? h(Image, { style: [styles.certLogoImage, { width: 36 }], src: PORTUGAL_2020_LOGO_PATH })
                  : h(View, { style: styles.certLogo },
                      h(Text, { style: styles.certLogoText }, 'PORTUGAL\n2020')
                    ),
                UNIAO_EUROPEIA_LOGO_PATH
                  ? h(Image, { style: [styles.certLogoImage, { width: 53 }], src: UNIAO_EUROPEIA_LOGO_PATH })
                  : h(View, { style: styles.certLogo },
                      h(Text, { style: styles.certLogoText }, 'UNIÃO\nEUROPEIA')
                    )
              )
            )
          )
        )
      ),

      h(View, { style: styles.footer, fixed: true },
        h(Text, { style: styles.footerText },
          `Aprovado por: ${product.approvedBy || '-'}  |  Data: ${product.approvalDate || formatDate(null)}`),
        h(Text, { style: styles.pageNumber }, 'pág. 2/2')
      )
    )
  );
}
