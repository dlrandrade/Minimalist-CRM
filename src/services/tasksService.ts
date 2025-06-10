
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Task = Database['public']['Tables']['tasks']['Row'];
type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export const tasksService = {
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tarefas:', error);
      throw error;
    }

    return data || [];
  },

  async getTask(id: string): Promise<Task | null> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar tarefa:', error);
      return null;
    }

    return data;
  },

  async createTask(task: Omit<TaskInsert, 'user_id'>): Promise<Task> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        ...task,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar tarefa:', error);
      throw error;
    }

    return data;
  },

  async updateTask(id: string, task: Omit<TaskUpdate, 'user_id'>): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .update({
        ...task,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }

    return data;
  },

  async deleteTask(id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar tarefa:', error);
      throw error;
    }
  },

  async toggleTaskComplete(id: string): Promise<Task> {
    const task = await this.getTask(id);
    if (!task) throw new Error('Tarefa não encontrada');

    return this.updateTask(id, { completed: !task.completed });
  },

  async getTasksForToday(): Promise<Task[]> {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('due_date', today)
      .eq('completed', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tarefas de hoje:', error);
      throw error;
    }

    return data || [];
  },

  async getTasksByContact(contactId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('contact_id', contactId)
      .order('due_date', { ascending: true });

    if (error) {
      console.error('Erro ao buscar tarefas do contato:', error);
      throw error;
    }

    return data || [];
  }
};
