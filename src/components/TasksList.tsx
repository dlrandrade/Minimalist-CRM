
import { useState, useEffect } from 'react';
import { tasksService } from '@/services/tasksService';
import { contactsService } from '@/services/contactsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { TaskForm } from './TaskForm';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];

export function TasksList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [tasksData, contactsData] = await Promise.all([
        tasksService.getTasks(),
        contactsService.getContacts()
      ]);
      setTasks(tasksData);
      setContacts(contactsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar tarefas",
        description: "Não foi possível carregar a lista de tarefas.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (taskId: string) => {
    try {
      await tasksService.toggleTaskComplete(taskId);
      toast({
        title: "Tarefa atualizada",
        description: "Status da tarefa foi atualizado.",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a tarefa "${title}"?`)) {
      return;
    }

    try {
      await tasksService.deleteTask(id);
      toast({
        title: "Tarefa excluída",
        description: `A tarefa "${title}" foi excluída com sucesso.`,
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return 'Sem contato';
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contato não encontrado';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const isOverdue = (dateString: string, completed: boolean) => {
    if (completed) return false;
    const today = new Date();
    const dueDate = new Date(dateString);
    return dueDate < today;
  };

  const handleEditTask = (id: string) => {
    setEditingTaskId(id);
    setShowForm(true);
  };

  const handleNewTask = () => {
    setEditingTaskId(undefined);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingTaskId(undefined);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingTaskId(undefined);
  };

  if (showForm) {
    return (
      <TaskForm
        taskId={editingTaskId}
        contacts={contacts}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando tarefas...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhuma tarefa encontrada</CardTitle>
          <CardDescription>
            Você ainda não tem tarefas cadastradas. Comece adicionando sua primeira tarefa!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleNewTask}>Adicionar Primeira Tarefa</Button>
        </CardContent>
      </Card>
    );
  }

  const pendingTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tarefas ({tasks.length})</h2>
        <Button onClick={handleNewTask}>Nova Tarefa</Button>
      </div>

      {/* Tarefas Pendentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-700">
          Pendentes ({pendingTasks.length})
        </h3>
        <div className="grid gap-3">
          {pendingTasks.map((task) => (
            <Card key={task.id} className={isOverdue(task.due_date, task.completed) ? 'border-red-300' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={() => handleToggleComplete(task.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <div className="text-sm text-gray-600 space-y-0.5">
                      <div className={`inline-flex items-center ${isOverdue(task.due_date, task.completed) ? 'text-red-600' : ''}`}>
                        📅 Vencimento: {formatDate(task.due_date)}
                        {isOverdue(task.due_date, task.completed) && ' (Vencida)'}
                      </div>
                      <div>👤 {getContactName(task.contact_id)}</div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditTask(task.id)}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteTask(task.id, task.title)}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Tarefas Concluídas */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">
            Concluídas ({completedTasks.length})
          </h3>
          <div className="grid gap-3">
            {completedTasks.map((task) => (
              <Card key={task.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => handleToggleComplete(task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium line-through text-gray-600">{task.title}</h4>
                      <div className="text-sm text-gray-500 space-y-0.5">
                        <div>📅 Vencimento: {formatDate(task.due_date)}</div>
                        <div>👤 {getContactName(task.contact_id)}</div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEditTask(task.id)}
                      >
                        Editar
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteTask(task.id, task.title)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
