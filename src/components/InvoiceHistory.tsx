import { useEffect, useState } from 'react';
import { FileText, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { InvoicePreview } from './InvoicePreview';

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
  items: Array<any>;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string;
  status: string;
  created_at: string;
}

export function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    fetchInvoices();

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        fetchInvoices();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string }> = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700' },
      sent: { bg: 'bg-blue-100', text: 'text-blue-700' },
      paid: { bg: 'bg-green-100', text: 'text-green-700' },
      overdue: { bg: 'bg-red-100', text: 'text-red-700' }
    };
    const badge = badges[status] || badges.draft;
    return badge;
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice History</h1>
          <p className="text-gray-600">View and manage all your invoices</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading invoices...</div>
          ) : invoices.length === 0 ? (
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">No invoices yet</p>
                <p className="text-sm">Your invoice history will appear here</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Invoice #</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Client</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Date</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-900">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {invoices.map((invoice) => {
                    const statusBadge = getStatusBadge(invoice.status);
                    return (
                      <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.invoice_number}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{invoice.client_name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{formatDate(invoice.invoice_date)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${invoice.total_amount.toFixed(2)}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleViewInvoice(invoice)}
                            className="inline-flex items-center gap-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <InvoicePreview
        invoice={selectedInvoice}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
      />
    </div>
  );
}
