import { useEffect, useState } from 'react';
import { FileText, DollarSign, CheckCircle, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCurrentUser } from '../lib/auth';

interface DashboardProps {
  onCreateInvoice: () => void;
}

interface Invoice {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
}

export function Dashboard({ onCreateInvoice }: DashboardProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

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
      const user = await getCurrentUser();
      if (!user) {
        setInvoices([]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('id, total_amount, status, created_at')
        .eq('user_id', user.id);

      if (error) throw error;
      setInvoices(data || []);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalInvoices = invoices.length;
    const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending').length;

    return [
      { label: 'Total Invoices', value: totalInvoices.toString(), icon: FileText, color: 'bg-blue-50 text-blue-600' },
      { label: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'bg-green-50 text-green-600' },
      { label: 'Paid Invoices', value: paidInvoices.toString(), icon: CheckCircle, color: 'bg-green-50 text-green-600' },
      { label: 'Pending', value: pendingInvoices.toString(), icon: Clock, color: 'bg-blue-50 text-blue-600' }
    ];
  };

  const stats = calculateStats();

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your invoice overview.</p>
          </div>
          <button
            onClick={onCreateInvoice}
            className="px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
          >
            + Create Invoice
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Recent Invoices</h2>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading...</div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium mb-1">No invoices yet</p>
                <p className="text-sm mb-4">Create your first invoice to get started</p>
                <button
                  onClick={onCreateInvoice}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Create Invoice
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.slice(0, 5).map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Invoice #{invoice.id.slice(0, 8)}</p>
                      <p className="text-xs text-gray-500">{new Date(invoice.created_at).toLocaleDateString()}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">${invoice.total_amount?.toFixed(2) || '0.00'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
