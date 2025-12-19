import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { TemplateSelector } from './components/TemplateSelector';
import { InvoiceForm } from './components/InvoiceForm';
import { InvoiceHistory } from './components/InvoiceHistory';
import { CompanyCatalog } from './components/CompanyCatalog';
import { SettingsPage } from './components/SettingsPage';
import { signOut } from './lib/auth';

type Page = 'dashboard' | 'create' | 'history' | 'catalog' | 'settings' | 'template-select' | 'invoice-form';

interface AppProps {
  userCompany?: any;
}

function App({ userCompany }: AppProps) {
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  const handleNavigate = (page: string) => {
    if (page === 'create') {
      setCurrentPage('template-select');
    } else {
      setCurrentPage(page as Page);
    }
  };

  const handleCreateInvoice = () => {
    setCurrentPage('template-select');
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    setCurrentPage('invoice-form');
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const handleBackToTemplates = () => {
    setCurrentPage('template-select');
  };

  const handleInvoiceCreated = () => {
    setCurrentPage('dashboard');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onCreateInvoice={handleCreateInvoice} />;
      case 'template-select':
        return <TemplateSelector onBack={handleBackToDashboard} onSelectTemplate={handleSelectTemplate} />;
      case 'invoice-form':
        return <InvoiceForm onBack={handleBackToTemplates} templateType={selectedTemplate} onInvoiceCreated={handleInvoiceCreated} userCompany={userCompany} />;
      case 'history':
        return <InvoiceHistory />;
      case 'catalog':
        return <CompanyCatalog />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard onCreateInvoice={handleCreateInvoice} />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        currentPage={currentPage === 'template-select' || currentPage === 'invoice-form' ? 'create' : currentPage}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        userCompany={userCompany}
      />
      {renderPage()}
    </div>
  );
}

export default App;
