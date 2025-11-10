import html2pdf from "html2pdf.js";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface InvoiceItem {
  bikeTypeName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface InvoiceGeneratorProps {
  invoiceNumber: string;
  orderNumber: string;
  branchName: string;
  items: InvoiceItem[];
  totalAmount: number;
  date: Date;
  mechanicName: string;
  siret: string;
}

export function InvoiceGenerator({
  invoiceNumber,
  orderNumber,
  branchName,
  items,
  totalAmount,
  date,
  mechanicName,
  siret,
}: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    if (!invoiceRef.current) return;

    const element = invoiceRef.current;
    const opt = {
      margin: 10,
      filename: `${invoiceNumber}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };

    (html2pdf() as any).set(opt).from(element).save();
  };

  return (
    <div className="space-y-4">
      <div
        ref={invoiceRef}
        className="bg-white p-8 rounded-lg border border-gray-200"
        style={{ width: "210mm", margin: "0 auto" }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-8 border-b-2 border-cyan-500">
          <div>
            <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-2">
              d
            </div>
            <h1 className="text-2xl font-bold text-gray-900">FACTURE</h1>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">
              <strong>Facture N°:</strong> {invoiceNumber}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Commande N°:</strong> {orderNumber}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Date:</strong> {date.toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Company Info */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Prestataire</h3>
            <p className="text-sm text-gray-600">{mechanicName}</p>
            <p className="text-sm text-gray-600">SIRET: {siret}</p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-2">Client</h3>
            <p className="text-sm text-gray-600">Decathlon - {branchName}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-8 border-collapse">
          <thead>
            <tr className="bg-cyan-50 border-b-2 border-cyan-500">
              <th className="text-left p-3 text-sm font-semibold text-gray-900">
                Description
              </th>
              <th className="text-center p-3 text-sm font-semibold text-gray-900">
                Quantité
              </th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">
                Prix Unitaire
              </th>
              <th className="text-right p-3 text-sm font-semibold text-gray-900">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="p-3 text-sm text-gray-700">{item.bikeTypeName}</td>
                <td className="p-3 text-sm text-gray-700 text-center">
                  {item.quantity}
                </td>
                <td className="p-3 text-sm text-gray-700 text-right">
                  {(item.unitPrice / 100).toFixed(2)}€
                </td>
                <td className="p-3 text-sm text-gray-700 text-right font-semibold">
                  {(item.total / 100).toFixed(2)}€
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-8">
          <div className="w-64">
            <div className="flex justify-between p-3 border-t-2 border-b-2 border-cyan-500 bg-cyan-50">
              <span className="font-bold text-gray-900">TOTAL:</span>
              <span className="font-bold text-lg text-cyan-600">
                {(totalAmount / 100).toFixed(2)}€
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-2 border-gray-200 pt-6 text-center text-xs text-gray-600">
          <p>Merci pour votre confiance!</p>
          <p className="mt-2">
            Cette facture a été générée automatiquement par le système de gestion
            d'assemblage de vélos Decathlon.
          </p>
        </div>
      </div>

      <Button
        onClick={handleDownload}
        className="w-full bg-cyan-500 hover:bg-cyan-600"
      >
        <Download className="w-4 h-4 mr-2" />
        Télécharger la facture PDF
      </Button>
    </div>
  );
}
