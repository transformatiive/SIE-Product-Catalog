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
        h(Text, { style: styles.sectionTitle }, 'PRODUCT INFORMATION'),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Product Code:'),
          h(Text, { style: styles.value }, product.productCode)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Model:'),
          h(Text, { style: styles.value }, product.model)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Family:'),
          h(Text, { style: styles.value }, product.family)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Type:'),
          h(Text, { style: styles.value }, product.type)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Nominal Capacity:'),
          h(Text, { style: styles.value }, product.nominalCapacity)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Raw Material:'),
          h(Text, { style: styles.value }, product.rawMaterial)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Weight:'),
          h(Text, { style: styles.value }, product.weight)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Colors:'),
          h(Text, { style: styles.value }, product.colors)
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Food Contact:'),
          h(Text, { style: styles.value }, product.foodContact ? 'YES' : 'NO')
        ),
        
        h(View, { style: styles.row },
          h(Text, { style: styles.label }, 'Status:'),
          h(Text, { style: styles.value }, product.isActive ? 'ACTIVE' : 'INACTIVE')
        )
      ),

      // Footer
      h(View, { style: styles.footer },
        h(Text, { style: styles.footerText }, `Generated: ${formatDate(null)} | Technical Datasheet | ${product.productCode}`)
      )
    )
  );
}