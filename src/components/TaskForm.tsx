
import { useState, useEffect } from 'react';
import { tasksService } from '@/services/tasksService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type Contact = Database['public']['Tables']['contacts']['Row'];

interface TaskFormProps {
  taskId?: string;
  contacts: Contact[];
  onSave: () => void;
  onCancel: () => void;
}

export function TaskForm({ taskId, contacts, onSave, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState<Partial<TaskInsert>>({
    title: '',
    due_date: new Date().toISOString().split('T')[0],
    contact_id: null,
    completed: false
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (taskId) {
      loadTask();
    }
  }, [taskId]);

  const loadTask = async () => {
    if (!taskId) return;
    
    try {
      const task = await tasksService.getTask(taskId);
      if (task) {
        setFormData(task);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar tarefa",
        description: "Não foi possível carregar os dados da tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (taskId) {
        await tasksService.updateTask(taskId, formData);
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        });
      } else {
        await tasksService.createTask(formData);
        toast({
          title: "Tarefa criada",
          description: "A tarefa foi criada com sucesso.",
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao salvar tarefa",
        description: "Não foi possível salvar a tarefa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!taskId || !confirm('Tem certeza que deseja excluir esta tarefa?')) {
      return;
    }

    try {
      await tasksService.deleteTask(taskId);
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao excluir tarefa",
        description: "Não foi possível excluir a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof TaskInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{taskId ? 'Editar Tarefa' : 'Nova Tarefa'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título da Tarefa *</Label>
            <Input
              id="title"
              value={formData.title || ''}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date">Data de Vencimento *</Label>
            <Input
              id="due_date"
              type="date"
              value={formData.due_date || ''}
              onChange={(e) => handleInputChange('due_date', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Contato Associado</Label>
            <Select 
              value={formData.contact_id || ''} 
              onValueChange={(value) => handleInputChange('contact_id', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar contato (opcional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Nenhum contato</SelectItem>
                {contacts.map((contact) => (
                  <SelectItem key={contact.id} value={contact.id}>
                    {contact.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : (taskId ? 'Atualizar' : 'Salvar')}
            </Button>
            {taskId && (
              <Button type="button" variant="destructive" onClick={handleDelete}>
                Excluir
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
