import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Export data to CSV format
 */
export function exportToCSV(
  data: Record<string, any>[],
  filename: string,
  columns?: string[]
) {
  if (data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma or newline
          if (typeof value === "string" && (value.includes(",") || value.includes("\n"))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  downloadFile(blob, `${filename}.csv`);
}

/**
 * Export analytics data to PDF
 */
export function exportAnalyticsToPDF(
  data: {
    title: string;
    dateRange: string;
    metrics: Record<string, any>;
    orders: Record<string, any>[];
    invoices: Record<string, any>[];
  },
  filename: string
) {
  const doc = new jsPDF();
  let yPosition = 20;

  // Add title
  doc.setFontSize(20);
  doc.text(data.title, 20, yPosition);
  yPosition += 15;

  // Add date range
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Période: ${data.dateRange}`, 20, yPosition);
  yPosition += 10;

  // Add metrics section
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text("Métriques Clés", 20, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  Object.entries(data.metrics).forEach(([key, value]) => {
    doc.text(`${key}: ${value}`, 30, yPosition);
    yPosition += 7;
  });

  yPosition += 5;

  // Add orders table
  if (data.orders.length > 0) {
    doc.setFontSize(14);
    doc.text("Commandes", 20, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["ID", "Succursale", "Statut", "Date", "Total"]],
      body: data.orders.map((order) => [
        order.id,
        order.branchName,
        order.status,
        order.createdAt,
        order.total,
      ]),
      margin: { left: 20, right: 20 },
    });

    yPosition = (doc as any).lastAutoTable.finalY + 10;
  }

  // Add invoices table
  if (data.invoices.length > 0) {
    doc.setFontSize(14);
    doc.text("Factures", 20, yPosition);
    yPosition += 8;

    autoTable(doc, {
      startY: yPosition,
      head: [["N° Facture", "Succursale", "Montant", "Date"]],
      body: data.invoices.map((invoice) => [
        invoice.invoiceNumber,
        invoice.branchName,
        invoice.total,
        invoice.date,
      ]),
      margin: { left: 20, right: 20 },
    });
  }

  // Add footer
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    `Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
    20,
    doc.internal.pageSize.getHeight() - 10
  );

  doc.save(`${filename}.pdf`);
}

/**
 * Export invoices to PDF
 */
export function exportInvoicesToPDF(
  invoices: Record<string, any>[],
  filename: string
) {
  const doc = new jsPDF();
  let pageNumber = 1;

  invoices.forEach((invoice, index) => {
    if (index > 0) {
      doc.addPage();
      pageNumber++;
    }

    let yPosition = 20;

    // Header
    doc.setFontSize(16);
    doc.text("FACTURE", 20, yPosition);
    yPosition += 10;

    // Invoice number and date
    doc.setFontSize(11);
    doc.text(`N° Facture: ${invoice.invoiceNumber}`, 20, yPosition);
    yPosition += 7;
    doc.text(`Date: ${invoice.date}`, 20, yPosition);
    yPosition += 10;

    // Company info
    doc.setFontSize(10);
    doc.text("Émetteur:", 20, yPosition);
    yPosition += 6;
    doc.text(String(invoice.mechanicName || "Mécanicien"), 25, yPosition);
    yPosition += 5;
    if (invoice.siret) {
      doc.text(`SIRET: ${String(invoice.siret)}`, 25, yPosition);
      yPosition += 5;
    }
    if (invoice.companyInfo) {
      doc.text(String(invoice.companyInfo), 25, yPosition);
      yPosition += 5;
    }

    yPosition += 5;

    // Client info
    doc.text("Client:", 20, yPosition);
    yPosition += 6;
    doc.text(String(invoice.branchName || "Succursale"), 25, yPosition);
    yPosition += 5;
    if (invoice.managerName) {
      doc.text(`Gestionnaire: ${String(invoice.managerName)}`, 25, yPosition);
      yPosition += 5;
    }

    yPosition += 10;

    // Items table
    if (invoice.items && invoice.items.length > 0) {
      autoTable(doc, {
        startY: yPosition,
        head: [["Description", "Quantité", "Prix Unitaire", "Montant"]],
        body: invoice.items.map((item: any) => [
          item.bikeType,
          item.quantity,
          `${(item.price / 100).toFixed(2)}€`,
          `${((item.price * item.quantity) / 100).toFixed(2)}€`,
        ]),
        margin: { left: 20, right: 20 },
      });

      yPosition = (doc as any).lastAutoTable.finalY + 10;
    }

    // Total
    doc.setFontSize(12);
    (doc as any).setFont(undefined, "bold");
    doc.text(
      `Total: ${((invoice.total || 0) / 100).toFixed(2)}€`,
      20,
      yPosition
    );

    // Payment method
    if (invoice.paymentMethod) {
      yPosition += 10;
      (doc as any).setFont(undefined, "normal");
      doc.setFontSize(10);
      doc.text(`Méthode de paiement: ${String(invoice.paymentMethod)}`, 20, yPosition);
    }

    // Footer
    yPosition = doc.internal.pageSize.getHeight() - 20;
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text(
      `Page ${pageNumber} - Généré le: ${new Date().toLocaleDateString("fr-FR")}`,
      20,
      yPosition
    );
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Export invoices to CSV
 */
export function exportInvoicesToCSV(
  invoices: Record<string, any>[],
  filename: string
) {
  const flattenedData = invoices.map((invoice) => ({
    "N° Facture": invoice.invoiceNumber,
    "Date": invoice.date,
    "Succursale": invoice.branchName,
    "Gestionnaire": invoice.managerName,
    "Mécanicien": invoice.mechanicName,
    "Montant Total": `${((invoice.total || 0) / 100).toFixed(2)}€`,
    "Méthode de Paiement": invoice.paymentMethod || "-",
  }));

  exportToCSV(flattenedData, filename);
}

/**
 * Download file helper
 */
function downloadFile(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Format date for display
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const start = startDate.toLocaleDateString("fr-FR");
  const end = endDate.toLocaleDateString("fr-FR");
  return `${start} au ${end}`;
}
