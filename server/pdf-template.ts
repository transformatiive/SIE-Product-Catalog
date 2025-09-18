import { createElement as h } from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Product } from '@shared/schema';

// Create simplified styles without any border issues
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0066CC',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
  },
  value: {
    fontSize: 10,
    color: '#666666',
    flex: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#666666',
  },
});

interface PDFTemplateProps {
  product: Product;
}

export function TechnicalDatasheetPDF({ product }: PDFTemplateProps) {
  const formatDate = (date: Date | null) => {
    if (!date) return new Date().toLocaleDateString();
    return new Date(date).toLocaleDateString();
  };

  return h(Document, {},
    h(Page, { size: "A4", style: styles.page },
      // Simple header
      h(Text, { style: styles.title }, product.product),
      
      // Basic product information
      h(View, { style: styles.section },
        h(Text, { style: styles.sectionTitle }, 'INFORMAÇÃO DO PRODUTO'),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Código do Produto:'),
          h(Text, { style: styles.value }, product.productCode)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Modelo:'),
          h(Text, { style: styles.value }, product.model)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Família:'),
          h(Text, { style: styles.value }, product.family)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Tipo:'),
          h(Text, { style: styles.value }, product.type)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Capacidade Nominal:'),
          h(Text, { style: styles.value }, product.nominalCapacity)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Material de Base:'),
          h(Text, { style: styles.value }, product.rawMaterial)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Peso:'),
          h(Text, { style: styles.value }, product.weight)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Cores:'),
          h(Text, { style: styles.value }, product.colors)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Contacto Alimentar:'),
          h(Text, { style: styles.value }, product.foodContact ? 'SIM' : 'NÃO')
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Estado:'),
          h(Text, { style: styles.value }, product.isActive ? 'ATIVO' : 'INATIVO')
        )
      ),

      // Footer
      h(View, { style: styles.footer },
        h(Text, { style: styles.footerText }, `Gerado: ${formatDate(null)} | Ficha Técnica | ${product.productCode}`)
      )
    )
  );
}