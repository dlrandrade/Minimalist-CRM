
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'];
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type DealUpdate = Database['public']['Tables']['deals']['Update'];

export const dealsService = {
  async getDeals(): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar oportunidades:', error);
      throw error;
    }

    return data || [];
  },

  async getDeal(id: string): Promise<Deal | null> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar oportunidade:', error);
      return null;
    }

    return data;
  },

  async createDeal(deal: Omit<DealInsert, 'user_id'>): Promise<Deal> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('deals')
      .insert({
        ...deal,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar oportunidade:', error);
      throw error;
    }

    return data;
  },

  async updateDeal(id: string, deal: Omit<DealUpdate, 'user_id'>): Promise<Deal> {
    const { data, error } = await supabase
      .from('deals')
      .update({
        ...deal,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar oportunidade:', error);
      throw error;
    }

    return data;
  },

  async deleteDeal(id: string): Promise<void> {
    const { error } = await supabase
      .from('deals')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar oportunidade:', error);
      throw error;
    }
  },

  async getDealsByStage(stage: string): Promise<Deal[]> {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('stage', stage)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar oportunidades por estágio:', error);
      throw error;
    }

    return data || [];
  },

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  }
};
