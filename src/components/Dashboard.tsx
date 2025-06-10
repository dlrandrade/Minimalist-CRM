
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactList } from './ContactList';
import { Pipeline } from './Pipeline';
import { TasksList } from './TasksList';
import { useToast } from '@/hooks/use-toast';
import { contactsService } from '@/services/contactsService';
import { dealsService } from '@/services/dealsService';
import { tasksService } from '@/services/tasksService';
import { seedDataService } from '@/services/seedDataService';

interface DashboardProps {
  user: User;
}

type ViewType = 'dashboard' | 'contacts' | 'pipeline' | 'tasks';

export function Dashboard({ user }: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [seedingData, setSeedingData] = useState(false);
  const [stats, setStats] = useState({
    contactsCount: 0,
    pendingTasks: 0,
    activeDeals: 0,
    totalValue: 0
  });
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [contactsCount, allDeals, allTasks] = await Promise.all([
        contactsService.getContactsCount(),
        dealsService.getDeals(),
        tasksService.getTasks()
      ]);

      const activeDeals = allDeals.filter(deal => !['Ganho/Cliente', 'Perdido'].includes(deal.stage));
      const pendingTasks = allTasks.filter(task => !task.completed);
      const totalValue = activeDeals.reduce((sum, deal) => sum + Number(deal.value), 0);

      setStats({
        contactsCount,
        pendingTasks: pendingTasks.length,
        activeDeals: activeDeals.length,
        totalValue
      });
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  const handleCreateSampleData = async () => {
    setSeedingData(true);
    try {
      const success = await seedDataService.createSampleData();
      if (success) {
        toast({
          title: "Dados de exemplo criados!",
          description: "Foram criados contatos, oportunidades, tarefas e interações de exemplo.",
        });
        loadDashboardStats();
      } else {
        toast({
          title: "Erro ao criar dados",
          description: "Houve um problema ao criar os dados de exemplo.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao criar dados",
        description: "Houve um problema ao criar os dados de exemplo.",
        variant: "destructive",
      });
    } finally {
      setSeedingData(false);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">CRM Minimalista</h1>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                {[
                  { key: 'dashboard', label: 'Dashboard' },
                  { key: 'contacts', label: 'Contatos' },
                  { key: 'pipeline', label: 'Pipeline' },
                  { key: 'tasks', label: 'Tarefas' }
                ].map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveView(key as ViewType)}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      activeView === key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {label}
                  </button>
                ))}
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
                  <div className="text-2xl font-bold">{stats.contactsCount}</div>
                  <p className="text-xs text-muted-foreground">Contatos cadastrados</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tarefas Pendentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingTasks}</div>
                  <p className="text-xs text-muted-foreground">Tarefas em aberto</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Oportunidades Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeDeals}</div>
                  <p className="text-xs text-muted-foreground">No pipeline</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Valor em Negociação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div>
                  <p className="text-xs text-muted-foreground">Oportunidades ativas</p>
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
              <div className="space-x-4 space-y-2">
                <div className="flex justify-center gap-4 mb-4">
                  <Button onClick={() => setActiveView('contacts')}>
                    Ver Contatos
                  </Button>
                  <Button variant="outline" onClick={() => setActiveView('pipeline')}>
                    Ver Pipeline
                  </Button>
                  <Button variant="outline" onClick={() => setActiveView('tasks')}>
                    Ver Tarefas
                  </Button>
                </div>
                
                {stats.contactsCount === 0 && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-700 mb-3">
                      Quer testar o CRM com dados de exemplo?
                    </p>
                    <Button 
                      onClick={handleCreateSampleData}
                      disabled={seedingData}
                      variant="outline"
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      {seedingData ? 'Criando dados...' : 'Criar Dados de Exemplo'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeView === 'contacts' && <ContactList />}
        {activeView === 'pipeline' && <Pipeline />}
        {activeView === 'tasks' && <TasksList />}
      </main>
    </div>
  );
}
