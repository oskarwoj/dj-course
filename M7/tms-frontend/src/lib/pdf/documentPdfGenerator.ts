import { Document } from '../../model/documents'
import { DocumentPdfGenerator } from './templates/DocumentPdfGenerator'

export interface PDFOptions {
  includeWatermark?: boolean
  includeFooter?: boolean
}

/**
 * Utility function to generate and download a document PDF
 * Maintains backward compatibility with existing API
 */
export async function generateDocumentPDF(document: Document, options: PDFOptions = {}): Promise<void> {
  const generator = new DocumentPdfGenerator(document, options)
  await generator.generate()
}

/**
 * Utility function to generate PDF blob for preview
 * Maintains backward compatibility with existing API
 */
export async function generateDocumentPDFBlob(document: Document, options: PDFOptions = {}): Promise<Blob> {
  const generator = new DocumentPdfGenerator(document, options)
  return await generator.generateBlob()
}
