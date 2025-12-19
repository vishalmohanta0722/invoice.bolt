import { useRef } from 'react';
import { Download, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface Invoice {
  id: string;
  invoice_number: string;
  company_name: string;
  company_address: string;
  company_email: string;
  company_phone: string;
  company_tax_id: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  client_address: string;
  invoice_date: string;
  due_date: string | null;
  template_type: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  status: string;
}

interface InvoicePreviewProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export function InvoicePreview({ invoice, isOpen, onClose }: InvoicePreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !invoice) return null;

  const handleDownloadPDF = () => {
    if (!printRef.current) return;

    const element = printRef.current;
    const opt = {
      margin: 10,
      filename: `${invoice.invoice_number}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Invoice {invoice.invoice_number}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <div ref={printRef} className="p-8 bg-white">
            <div className="max-w-4xl mx-auto">
              <div className="mb-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">{invoice.company_name}</h1>
                    <p className="text-gray-600 mt-1">INVOICE</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Invoice Number</p>
                    <p className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">FROM</p>
                    <p className="font-semibold text-gray-900">{invoice.company_name}</p>
                    <p className="text-sm text-gray-600">{invoice.company_address}</p>
                    <p className="text-sm text-gray-600">{invoice.company_email}</p>
                    <p className="text-sm text-gray-600">{invoice.company_phone}</p>
                    {invoice.company_tax_id && (
                      <p className="text-sm text-gray-600">Tax ID: {invoice.company_tax_id}</p>
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2">TO</p>
                    <p className="font-semibold text-gray-900">{invoice.client_name}</p>
                    <p className="text-sm text-gray-600">{invoice.client_address}</p>
                    <p className="text-sm text-gray-600">{invoice.client_email}</p>
                    <p className="text-sm text-gray-600">{invoice.client_phone}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-8 mb-8">
                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-1">Invoice Date</p>
                    <p className="text-gray-900">{formatDate(invoice.invoice_date)}</p>
                  </div>
                  {invoice.due_date && (
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Due Date</p>
                      <p className="text-gray-900">{formatDate(invoice.due_date)}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <table className="w-full">
                  <thead className="bg-gray-100 border-t border-b border-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Description</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Quantity</th>
                      <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Rate</th>
                      <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-center text-gray-900">${item.rate.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-right text-gray-900">${item.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mb-8">
                <div className="w-80">
                  <div className="flex justify-between py-2 border-t-2 border-gray-300">
                    <span className="font-semibold">Subtotal:</span>
                    <span>${invoice.subtotal.toFixed(2)}</span>
                  </div>
                  {invoice.tax_amount > 0 && (
                    <div className="flex justify-between py-2">
                      <span className="font-semibold">Tax:</span>
                      <span>${invoice.tax_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-300">
                    <span>Total:</span>
                    <span>${invoice.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {invoice.notes && (
                <div className="mt-8 pt-8 border-t border-gray-300">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
