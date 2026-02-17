
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Sale } from '../types';

// PDF generation service for creating invoices
export const pdfService = {
  generateInvoice: (sale: Sale) => {
    // Initialize a new jsPDF document
    const doc = new jsPDF();
    
    // Header section
    doc.setFontSize(22);
    doc.setTextColor(40, 44, 52);
    doc.text('NexusERP INVOICE', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Invoice #: ${sale.invoice_number}`, 15, 40);
    doc.text(`Date: ${new Date(sale.created_at).toLocaleDateString()}`, 15, 45);
    
    // Customer Details
    doc.setFontSize(12);
    doc.text('Bill To:', 15, 60);
    doc.setFontSize(10);
    doc.text(sale.customer_name || 'Walking Customer', 15, 65);
    
    // Table - Mapping sale items to rows for the table plugin
    const tableData = sale.items?.map(item => [
      item.product_name,
      item.quantity,
      `$${item.unit_price.toFixed(2)}`,
      `$${item.subtotal.toFixed(2)}`
    ]) || [];

    // Cast doc to any to access the autoTable method injected by the jspdf-autotable plugin
    // This avoids compilation errors when module augmentation is not recognized
    (doc as any).autoTable({
      startY: 75,
      head: [['Product', 'Qty', 'Unit Price', 'Subtotal']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] }
    });

    // Totals section - Using the Y-coordinate calculated by the autoTable plugin
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Subtotal: $${(sale.total_amount + sale.discount_amount - sale.tax_amount).toFixed(2)}`, 140, finalY);
    doc.text(`Tax: $${sale.tax_amount.toFixed(2)}`, 140, finalY + 5);
    doc.text(`Discount: -$${sale.discount_amount.toFixed(2)}`, 140, finalY + 10);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total: $${sale.total_amount.toFixed(2)}`, 140, finalY + 18);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Paid: $${sale.paid_amount.toFixed(2)}`, 140, finalY + 23);
    doc.setTextColor(sale.balance > 0 ? [220, 38, 38] : [0, 0, 0]);
    doc.text(`Balance: $${sale.balance.toFixed(2)}`, 140, finalY + 28);

    // Trigger PDF download
    doc.save(`Invoice_${sale.invoice_number}.pdf`);
  }
};
