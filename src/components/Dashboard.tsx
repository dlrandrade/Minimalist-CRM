
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactList } from './ContactList';
import { useToast } from '@/hooks/use-toast';
import { contactsService } from '@/services/contactsService';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [contactsCount, setContactsCount] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'contacts'>('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const count = await contactsService.getContactsCount();
      setContactsCount(count);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logout realizado com sucesso!",
        description: "Até mais!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao fazer logout",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">CRM Minimalista</h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'dashboard'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveView('contacts')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeView === 'contacts'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Contatos
                </button>
              </nav>
              <span className="text-sm text-gray-600">
                Olá, {user.email}
              </span>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                disabled={loading}
              >
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {activeView === 'dashboard' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total de Contatos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{contactsCount}</div>
                  <p className="text-xs text-muted-foreground">Contatos cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Tarefas em aberto</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">No pipeline</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">Em negociação</p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center py-12">
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Bem-vindo ao seu CRM!
              </h2>
              <p className="text-gray-600 mb-6">
                Seu CRM agora está conectado ao Supabase com autenticação e banco de dados real.
              </p>
              <div className="space-x-4">
                <Button onClick={() => setActiveView('contacts')}>
                  Ver Contatos
                </Button>
                <Button variant="outline">
                  Adicionar Contato
                </Button>
              </div>
            </div>
          </>
        )}

        {activeView === 'contacts' && <ContactList />}
      </main>
    </div>
  );
}
