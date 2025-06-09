
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];
type ContactUpdate = Database['public']['Tables']['contacts']['Update'];

export const contactsService = {
  // Buscar todos os contatos do usuário
  async getContacts(): Promise<Contact[]> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar contatos:', error);
      throw error;
    }

    return data || [];
  },

  // Buscar um contato específico
  async getContact(id: string): Promise<Contact | null> {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar contato:', error);
      return null;
    }

    return data;
  },

  // Criar novo contato
  async createContact(contact: Omit<ContactInsert, 'user_id'>): Promise<Contact> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('Usuário não autenticado');
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        ...contact,
        user_id: user.id
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar contato:', error);
      throw error;
    }

    return data;
  },

  // Atualizar contato
  async updateContact(id: string, contact: Omit<ContactUpdate, 'user_id'>): Promise<Contact> {
    const { data, error } = await supabase
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar contato:', error);
      throw error;
    }

    return data;
  },

  // Deletar contato
  async deleteContact(id: string): Promise<void> {
    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar contato:', error);
      throw error;
    }
  },

  // Contar total de contatos
  async getContactsCount(): Promise<number> {
    const { count, error } = await supabase
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Erro ao contar contatos:', error);
      return 0;
    }

    return count || 0;
  }
};
