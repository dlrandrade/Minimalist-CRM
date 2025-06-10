
import { supabase } from '@/integrations/supabase/client';
import { contactsService } from './contactsService';
import { dealsService } from './dealsService';
import { tasksService } from './tasksService';
import { interactionsService } from './interactionsService';

export const seedDataService = {
  async createSampleData(): Promise<boolean> {
    try {
      console.log('Iniciando criação de dados de exemplo...');

      // Criar contatos de exemplo
      const contacts = [
        {
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 99999-1234',
          city: 'São Paulo',
          company: 'Tech Solutions LTDA',
          position: 'Diretor de TI',
          plan: 'Plus',
          payment_day: 15,
          notes: 'Cliente interessado em soluções de automação'
        },
        {
          name: 'Maria Santos',
          email: 'maria.santos@empresa.com',
          phone: '(21) 88888-5678',
          city: 'Rio de Janeiro',
          company: 'Inovação & Co',
          position: 'Gerente de Projetos',
          plan: 'Max',
          payment_day: 5,
          notes: 'Precisa de integração com sistema ERP'
        },
        {
          name: 'Pedro Oliveira',
          email: 'pedro@startup.com',
          phone: '(31) 77777-9012',
          city: 'Belo Horizonte',
          company: 'StartupBH',
          position: 'CEO',
          plan: 'Básico',
          payment_day: 10,
          notes: 'Startup em crescimento, orçamento limitado'
        }
      ];

      const createdContacts = [];
      for (const contactData of contacts) {
        const contact = await contactsService.createContact(contactData);
        createdContacts.push(contact);
        console.log('Contato criado:', contact.name);
      }

      // Criar oportunidades de exemplo
      const deals = [
        {
          name: 'Implementação CRM - Tech Solutions',
          value: 25000,
          contact_id: createdContacts[0].id,
          stage: 'Proposta'
        },
        {
          name: 'Consultoria ERP - Inovação & Co',
          value: 45000,
          contact_id: createdContacts[1].id,
          stage: 'Negociação'
        },
        {
          name: 'Plano Básico - StartupBH',
          value: 5000,
          contact_id: createdContacts[2].id,
          stage: 'Lead'
        }
      ];

      const createdDeals = [];
      for (const dealData of deals) {
        const deal = await dealsService.createDeal(dealData);
        createdDeals.push(deal);
        console.log('Oportunidade criada:', deal.name);
      }

      // Criar tarefas de exemplo
      const tasks = [
        {
          title: 'Ligar para João Silva - Follow up proposta',
          due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contact_id: createdContacts[0].id,
          completed: false
        },
        {
          title: 'Preparar apresentação para Maria Santos',
          due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          contact_id: createdContacts[1].id,
          completed: false
        },
        {
          title: 'Enviar material sobre planos para Pedro',
          due_date: new Date().toISOString().split('T')[0],
          contact_id: createdContacts[2].id,
          completed: false
        }
      ];

      for (const taskData of tasks) {
        const task = await tasksService.createTask(taskData);
        console.log('Tarefa criada:', task.title);
      }

      // Criar interações de exemplo
      const interactions = [
        {
          contact_id: createdContacts[0].id,
          type: 'Chamada',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'Primeira conversa sobre necessidades de CRM. Cliente demonstrou interesse.'
        },
        {
          contact_id: createdContacts[1].id,
          type: 'Email',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          notes: 'Enviado proposta de consultoria ERP. Aguardando retorno.'
        },
        {
          contact_id: createdContacts[2].id,
          type: 'Reunião',
          date: new Date().toISOString().split('T')[0],
          notes: 'Reunião para apresentação dos planos. Cliente interessado no plano básico.'
        }
      ];

      for (const interactionData of interactions) {
        const interaction = await interactionsService.createInteraction(interactionData);
        console.log('Interação criada para contato:', interaction.contact_id);
      }

      console.log('Dados de exemplo criados com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
};
