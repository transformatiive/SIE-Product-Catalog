import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';
import { Product } from '@shared/schema';
import sieLogo from '@assets/sie-logo.png';

const COLORS = {
  primary: '#E31E24',
  text: '#333333',
  textLight: '#666666',
  textMuted: '#888888',
  background: '#FFFFFF',
  backgroundLight: '#F8F8F8',
  border: '#E0E0E0',
  recycle: '#2E7D32',
};

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: COLORS.background,
    padding: 0,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: COLORS.text,
  },

  redHeader: {
    backgroundColor: COLORS.primary,
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
    color: COLORS.primary,
    letterSpacing: 0.6,
    textAlign: 'right',
  },

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
    color: COLORS.primary,
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
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
    backgroundColor: COLORS.backgroundLight,
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
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    borderRadius: 5,
    marginRight: 10,
  },
  charContent: {
    flex: 1,
  },
  charLabel: {
    fontSize: 7,
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 1,
  },
  charValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
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
    backgroundColor: COLORS.recycle,
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
    color: COLORS.recycle,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  websiteUrl: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  pageNumber: {
    fontSize: 9,
    color: COLORS.textLight,
  },

  // Page 2
  page2Content: {
    padding: 30,
    flex: 1,
  },
  page2Subtitle: {
    fontSize: 12,
    color: COLORS.text,
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
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 8,
    color: COLORS.textMuted,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  technicalDrawingContainer: {
    backgroundColor: COLORS.backgroundLight,
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
    backgroundColor: COLORS.backgroundLight,
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
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    flex: 1,
  },
  packagingValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'right',
    flex: 1,
  },
  palletizationImageContainer: {
    backgroundColor: COLORS.backgroundLight,
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
    backgroundColor: COLORS.primary,
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
    color: COLORS.text,
    flex: 1.4,
    textAlign: 'right',
  },

  certificationSection: {
    marginTop: 16,
  },
  certificationLogos: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginTop: 8,
    flexWrap: 'wrap',
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

const HEADER_PILLS = ['AGROALIMENTAR', 'FARMACÊUTICA', 'QUÍMICA', 'FITOSSANITÁRIOS'];

interface PDFTemplateProps {
  product: Product;
}

function Header() {
  return (
    <View style={styles.redHeader}>
      <View style={styles.sieLogoBox}>
        <Image src={sieLogo} style={styles.sieLogoImage} />
      </View>
      <View style={styles.headerSections}>
        {HEADER_PILLS.map((label) => (
          <View key={label} style={styles.headerPill}>
            <Text style={styles.headerPillText}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function Recycling() {
  return (
    <View style={styles.recyclingSection}>
      <View style={styles.recyclingBadge}>
        <Text style={styles.recyclingBadgeText}>100%</Text>
      </View>
      <Text style={styles.recyclingLabel}>Reciclável</Text>
    </View>
  );
}

function CharRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.charRow}>
      <View style={styles.bulletDot} />
      <View style={styles.charContent}>
        <Text style={styles.charLabel}>{label}</Text>
        <Text style={styles.charValue}>{value}</Text>
      </View>
    </View>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.specRow}>
      <View style={styles.specBullet} />
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue}>{value}</Text>
    </View>
  );
}

function PackRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={last ? styles.packagingRowLast : styles.packagingRow}>
      <Text style={styles.packagingLabel}>{label}</Text>
      <Text style={styles.packagingValue}>{value}</Text>
    </View>
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

  const totalUnitsValue = (product.totalUnitsQuantity && product.totalUnitsType)
    ? `${product.totalUnitsQuantity} / ${product.totalUnitsType}`
    : (product.totalUnits || packaging.unitsPerPallet?.toString() || '-');

  return (
    <Document>
      {/* PAGE 1 */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.page1Content}>
          <Text style={styles.productRef}>REF. {product.productCode || '-'}</Text>
          <Text style={styles.productTitle}>{(product.product || '').toUpperCase()}</Text>
          <Text style={styles.productSubtitle}>{(product.type || '').toUpperCase()}</Text>

          <View style={styles.mainContentRow}>
            <View style={styles.productImageSection}>
              {product.productImage ? (
                <Image src={product.productImage} style={styles.productImage} />
              ) : (
                <Text style={styles.productImagePlaceholder}>
                  Imagem do produto{'\n'}(não carregada)
                </Text>
              )}
            </View>

            <View style={styles.techCharacteristics}>
              <Text style={styles.techTitle}>Características Técnicas</Text>

              <CharRow label="CAPACIDADE NOMINAL" value={`${product.nominalCapacity || '-'} ${product.nominalCapacityUnit || 'L'}`} />
              {product.totalCapacity ? (
                <CharRow label="CAPACIDADE TOTAL" value={`${product.totalCapacity} ${product.totalCapacityUnit || 'L'}`} />
              ) : null}
              <CharRow label={`PESO (±${product.weightTolerance || '5'}%)`} value={`${product.weight || '-'} ${product.weightUnit || 'g'}`} />
              {product.weightWithAccessories ? (
                <CharRow label={`PESO C/ ACESSÓRIOS (±${product.weightTolerance || '5'}%)`} value={`${product.weightWithAccessories} ${product.weightWithAccessoriesUnit || 'g'}`} />
              ) : null}
              <CharRow label="MATÉRIA PRIMA" value={product.rawMaterial || '-'} />
              {product.colors ? <CharRow label="CORES DISPONÍVEIS" value={product.colors} /> : null}
              <CharRow label="CONTACTO ALIMENTAR" value={product.foodContact ? 'Apto' : 'Não Apto'} />
              {product.shape ? <CharRow label="FORMA" value={product.shape} /> : null}
              <CharRow label="EMPILHÁVEL" value={product.stackable ? (product.stackingCapacity || 'Sim') : 'Não'} />
            </View>
          </View>

          <View style={styles.bottomSection}>
            <Recycling />
            <Text style={styles.websiteUrl}>WWW.SIE.PT</Text>
            <Text style={styles.pageNumber}>pág. 1/2</Text>
          </View>
        </View>
      </Page>

      {/* PAGE 2 */}
      <Page size="A4" style={styles.page}>
        <Header />
        <View style={styles.page2Content}>
          <Text style={styles.page2Subtitle}>
            FICHA TÉCNICA  |  {(product.product || '').toUpperCase()}  |  {product.productCode || '-'}
          </Text>

          <View style={styles.twoColumnLayout}>
            {/* LEFT COLUMN */}
            <View style={styles.leftColumnPage2}>
              <Text style={styles.sectionTitle}>Desenho Técnico 2D</Text>
              <Text style={styles.sectionSubtitle}>
                Medidas apresentadas em milímetros com tolerância de ±3%
              </Text>

              <View style={styles.technicalDrawingContainer}>
                {product.technicalDrawing ? (
                  <Image src={product.technicalDrawing} style={styles.technicalDrawing} />
                ) : (
                  <Text style={styles.drawingPlaceholder}>
                    Desenho técnico 2D{'\n'}(não carregado)
                  </Text>
                )}
              </View>

              <View style={styles.packagingContainer}>
                <Text style={styles.sectionTitle}>Esquema de Acondicionamento</Text>
                <View style={styles.packagingGrid}>
                  <PackRow label="Dimensões da palete" value={product.palletDimensions || packaging.palletDimensions || '-'} />
                  <PackRow label="Dim. mercadoria na palete" value={product.productOnPalletDimensions || (packaging.stackHeight ? String(packaging.stackHeight) : '-')} />
                  <PackRow label="Esquema de arrumação" value={product.arrangementScheme || '-'} />
                  <PackRow label="Total de unidades" value={totalUnitsValue} last />
                </View>

                <View style={styles.palletizationImageContainer}>
                  {product.palletizationImage ? (
                    <Image src={product.palletizationImage} style={styles.palletizationImage} />
                  ) : (
                    <Text style={styles.drawingPlaceholder}>
                      Imagem de paletização{'\n'}(não carregada)
                    </Text>
                  )}
                </View>
              </View>
            </View>

            {/* RIGHT COLUMN */}
            <View style={styles.rightColumnPage2}>
              <Text style={styles.sectionTitle}>Características Técnicas</Text>
              <View style={styles.specsTable}>
                <SpecRow label="Capacidade nominal" value={`${product.nominalCapacity || '-'} ${product.nominalCapacityUnit || 'L'}`} />
                {product.totalCapacity ? <SpecRow label="Capacidade total" value={`${product.totalCapacity} ${product.totalCapacityUnit || 'L'}`} /> : null}
                <SpecRow label={`Peso (±${product.weightTolerance || '5'}%)`} value={`${product.weight || '-'} ${product.weightUnit || 'g'}`} />
                {product.weightWithAccessories ? <SpecRow label={`Peso c/ acessórios (±${product.weightTolerance || '5'}%)`} value={`${product.weightWithAccessories} ${product.weightWithAccessoriesUnit || 'g'}`} /> : null}
                {product.accessories ? <SpecRow label="Acessórios" value={product.accessories} /> : null}
                {product.shape ? <SpecRow label="Forma" value={product.shape} /> : null}
                <SpecRow label="Matéria prima" value={product.rawMaterial || '-'} />
                <SpecRow label="Cores disponíveis" value={product.colors || '-'} />
                <SpecRow label="Contacto alimentar" value={product.foodContact ? 'Apto' : 'Não Apto'} />
                {product.designation ? <SpecRow label="Designação" value={product.designation} /> : null}
                {product.barcode ? <SpecRow label="Código de barras" value={product.barcode} /> : null}
                <SpecRow label="Empilhável" value={product.stackable ? (product.stackingCapacity || 'Sim') : 'Não'} />
                {product.closingSystem ? <SpecRow label="Sistema de fecho" value={product.closingSystem} /> : null}
                {product.capType ? <SpecRow label="Tipo de tampa" value={product.capType} /> : null}
                {product.capDimensions ? <SpecRow label="Dimensões da tampa" value={product.capDimensions} /> : null}
                {vedanteString
                  ? <SpecRow label="Vedante" value={vedanteString} />
                  : (product.sealingType ? <SpecRow label="Vedante" value={product.sealingType} /> : null)}
                {manuseamentoString
                  ? <SpecRow label="Sistema de manuseamento" value={manuseamentoString} />
                  : (product.handlingSystem ? <SpecRow label="Sistema de manuseamento" value={product.handlingSystem} /> : null)}
                {marcacoesString ? <SpecRow label="Marcações" value={marcacoesString} /> : null}
                {outrasCaracteristicasString ? <SpecRow label="Outras características" value={outrasCaracteristicasString} /> : null}
                {product.adrCertified ? <SpecRow label="ADR" value={product.adrCode ? `Certificado - ${product.adrCode}` : 'Certificado'} /> : null}
              </View>

              <View style={styles.certificationSection}>
                <Text style={styles.sectionTitle}>Certificações</Text>
                <Text style={styles.sectionSubtitle}>Produto certificado pelos organismos:</Text>
                <View style={styles.certificationLogos}>
                  <View style={styles.certLogo}>
                    <Text style={styles.certLogoText}>CENTRO{'\n'}2020</Text>
                  </View>
                  <View style={styles.certLogo}>
                    <Text style={styles.certLogoText}>PORTUGAL{'\n'}2020</Text>
                  </View>
                  <View style={styles.certLogo}>
                    <Text style={styles.certLogoText}>UNIÃO{'\n'}EUROPEIA</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Aprovado por: {product.approvedBy || '-'}  |  Data: {product.approvalDate || formatDate(null)}
          </Text>
          <Text style={styles.pageNumber}>pág. 2/2</Text>
        </View>
      </Page>
    </Document>
  );
}
