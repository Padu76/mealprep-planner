import { generateEnhancedPDF } from './enhancedPdfGenerator';

export function generateCompleteDocument(parsedPlan: any, formData: any): string {
  return generateEnhancedPDF(parsedPlan, formData);
}