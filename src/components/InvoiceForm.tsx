import { useState } from 'react';
import { ArrowLeft, Building2, Users, AlertCircle } from 'lucide-react';
import { Client, supabase } from '../lib/supabase';
import { ClientSelectionModal } from './ClientSelectionModal';


interface InvoiceFormProps {
  onBack: () => void;
  templateType: string;
  onInvoiceCreated?: () => void;
  userCompany?: any;
}

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export function InvoiceForm({ onBack, templateType, onInvoiceCreated, userCompany }: InvoiceFormProps) {
  const [showClientModal, setShowClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const companyInfo = userCompany ? {
    name: userCompany.name || '',
    address: userCompany.address || '',
    email: userCompany.email || '',
    phone: userCompany.phone || '',
    taxId: userCompany.tax_id || ''
  } : {
    name: 'Your Company',
    address: '',
    email: '',
    phone: '',
    taxId: ''
  };

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
  };

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      rate: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'rate') {
          updated.amount = updated.quantity * updated.rate;
        }
        return updated;
      }
      return item;
    }));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${random}${timestamp}`;
  };

  const validateForm = (): boolean => {
    if (!selectedClient?.name) {
      setError('Please select a client');
      return false;
    }
    if (!invoiceDate) {
      setError('Invoice date is required');
      return false;
    }
    if (items.every(item => !item.description)) {
      setError('Please add at least one item with description');
      return false;
    }
    return true;
  };

  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const tax = subtotal * 0.01;
  const total = subtotal + tax;

 const saveInvoice = async (status: 'draft' | 'sent') => {
  if (!validateForm()) return;

  setLoading(true);
  setError(null);
  setSuccess(null);

  try {
    // ✅ Get logged-in user (CORRECT WAY)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setError('You must be logged in to create an invoice');
      setLoading(false);
      return;
    }

    const invoiceNumber = generateInvoiceNumber();

    const { data, error: insertError } = await supabase
      .from('invoices')
      .insert([
        {
          user_id: user.id, // ✅ FIXED
          invoice_number: invoiceNumber,

          company_name: companyInfo.name,
          company_address: companyInfo.address,
          company_email: companyInfo.email,
          company_phone: companyInfo.phone,
          company_tax_id: companyInfo.taxId,

          client_id: selectedClient!.id,
          client_name: selectedClient!.name,
          client_email: selectedClient!.email,
          client_phone: selectedClient!.phone,
          client_address: selectedClient!.address,

          invoice_date: invoiceDate,
          due_date: dueDate || null,
          template_type: templateType,

          items: items.filter(item => item.description),
          subtotal: subtotal,
          tax_amount: tax,
          total_amount: total,

          notes: notes,
          status: status,
        },
      ])
      .select()
      .single();

    if (insertError) throw insertError;

    setSuccess(
      status === 'draft'
        ? 'Invoice saved as draft successfully!'
        : 'Invoice created successfully!'
    );

    setTimeout(() => {
      onInvoiceCreated?.();
      onBack();
    }, 1200);
  } catch (err) {
    console.error('Error saving invoice:', err);
    setError(err instanceof Error ? err.message : 'Failed to save invoice');
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Templates
        </button>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {templateType === 'simple' && 'Simple Invoice'}
              {templateType === 'tax' && 'Tax & GST Invoice'}
              {templateType === 'creative' && 'Creative Invoice'}
              {templateType === 'receipt' && 'Short Receipt'}
              {templateType === 'premium' && 'Premium Business Invoice'}
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => saveInvoice('draft')}
                disabled={loading}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save as Draft'}
              </button>
              <button
                onClick={() => saveInvoice('sent')}
                disabled={loading}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              </div>
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyInfo.name}
                    readOnly
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input
                    type="text"
                    value={companyInfo.address}
                    readOnly
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={companyInfo.email}
                      readOnly
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={companyInfo.phone}
                      readOnly
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                </div>
                {(templateType === 'tax' || templateType === 'premium') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tax ID / GST</label>
                    <input
                      type="text"
                      value={companyInfo.taxId}
                      readOnly
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Client Information</h2>
                </div>
                <button
                  onClick={() => setShowClientModal(true)}
                  className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Select Client
                </button>
              </div>
              <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={selectedClient?.name || ''}
                    readOnly={!!selectedClient}
                    placeholder="Click 'Select Client' to choose"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
                  <input
                    type="text"
                    value={selectedClient?.address || ''}
                    readOnly={!!selectedClient}
                    placeholder="Select a client"
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={selectedClient?.email || ''}
                      readOnly={!!selectedClient}
                      placeholder="Select a client"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={selectedClient?.phone || ''}
                      readOnly={!!selectedClient}
                      placeholder="Select a client"
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <button
                onClick={addItem}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                + Add Item
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-semibold text-gray-900">Description</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Quantity</th>
                    <th className="text-center px-4 py-3 text-sm font-semibold text-gray-900">Rate</th>
                    <th className="text-right px-4 py-3 text-sm font-semibold text-gray-900">Amount</th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Item description"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                          className="w-32 px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900">
                        ${item.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        {items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>
              {(templateType === 'tax' || templateType === 'premium') && (
                <div className="flex justify-between text-gray-700">
                  <span>Tax (1%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-3 border-t border-gray-300">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {(templateType === 'creative' || templateType === 'premium') && (
            <div className="mt-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes / Additional Information</label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or terms..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
            </div>
          )}
        </div>
      </div>

      <ClientSelectionModal
        isOpen={showClientModal}
        onClose={() => setShowClientModal(false)}
        onSelectClient={handleClientSelect}
      />
    </div>
  );
}
