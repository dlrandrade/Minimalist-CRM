
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Interaction = Database['public']['Tables']['interactions']['Row'];
type InteractionInsert = Database['public']['Tables']['interactions']['Insert'];

export const interactionsService = {
  async getInteractions(): Promise<Interaction[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interações:', error);
      throw error;
    }

    return data || [];
  },

  async getInteraction(id: string): Promise<Interaction | null> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar interação:', error);
      return null;
    }

    return data;
  },

  async createInteraction(interaction: Omit<InteractionInsert, 'user_id'>): Promise<Interaction> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('interactions')
      .insert({
        ...interaction,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar interação:', error);
      throw error;
    }

    return data;
  },

  async deleteInteraction(id: string): Promise<void> {
    const { error } = await supabase
      .from('interactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar interação:', error);
      throw error;
    }
  },

  async getInteractionsByContact(contactId: string): Promise<Interaction[]> {
    const { data, error } = await supabase
      .from('interactions')
      .select('*')
      .eq('contact_id', contactId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Erro ao buscar interações do contato:', error);
      throw error;
    }

    return data || [];
  }
};
