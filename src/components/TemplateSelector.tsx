import { ArrowLeft, FileText, Receipt, Sparkles, File, Award } from 'lucide-react';

interface Template {
  id: string;
  name: string;
  description: string;
  icon: typeof FileText;
}

interface TemplateSelectorProps {
  onBack: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export function TemplateSelector({ onBack, onSelectTemplate }: TemplateSelectorProps) {
  const templates: Template[] = [
    {
      id: 'simple',
      name: 'Simple Invoice',
      description: 'Basic invoice with company and client fields',
      icon: FileText
    },
    {
      id: 'tax',
      name: 'Tax & GST Invoice',
      description: 'Detailed invoice with tax breakdown',
      icon: Receipt
    },
    {
      id: 'creative',
      name: 'Creative Invoice',
      description: 'With logo, notes, and additional info',
      icon: Sparkles
    },
    {
      id: 'receipt',
      name: 'Short Receipt',
      description: 'Quick receipt for small expenses',
      icon: File
    },
    {
      id: 'premium',
      name: 'Premium Business',
      description: 'Professional with signature and branding',
      icon: Award
    }
  ];

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Invoice</h1>
          <p className="text-gray-600">Choose a template to get started</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => onSelectTemplate(template.id)}
                className="bg-white rounded-lg border-2 border-gray-200 p-6 text-left hover:border-gray-900 hover:shadow-lg transition-all group"
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-900 transition-colors">
                  <Icon className="w-6 h-6 text-gray-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600">{template.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
