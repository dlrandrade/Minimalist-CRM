
import { contactsService } from './contactsService';
import { dealsService } from './dealsService';
import { tasksService } from './tasksService';
import { interactionsService } from './interactionsService';

export const seedDataService = {
  async createSampleData() {
    try {
      console.log('Criando dados de exemplo...');

      // Criar contatos de exemplo
      const sampleContacts = [
        {
          name: 'João Silva',
          email: 'joao.silva@empresa.com',
          phone: '(11) 99999-1234',
          city: 'São Paulo',
          company: 'TechCorp',
          position: 'Diretor de TI',
          plan: 'Plus',
          payment_day: 15,
          notes: 'Cliente interessado em expansão do sistema'
        },
        {
          name: 'Maria Santos',
          email: 'maria.santos@startup.com',
          phone: '(21) 98888-5678',
          city: 'Rio de Janeiro',
          company: 'InovaTech',
          position: 'CEO',
          plan: 'Max',
          payment_day: 5,
          notes: 'Startup em crescimento, precisa de solução escalável'
        },
        {
          name: 'Pedro Oliveira',
          email: 'pedro@consultoria.com',
          phone: '(31) 97777-9012',
          city: 'Belo Horizonte',
          company: 'Consultoria BH',
          position: 'Sócio',
          plan: 'Básico',
          payment_day: 10,
          notes: 'Cliente fiel há 2 anos'
        },
        {
          name: 'Ana Costa',
          email: 'ana.costa@digital.com',
          phone: '(41) 96666-3456',
          city: 'Curitiba',
          company: 'Digital Solutions',
          position: 'CTO',
          plan: null,
          payment_day: null,
          notes: 'Lead qualificado, demonstrou interesse no produto'
        },
        {
          name: 'Carlos Ferreira',
          email: 'carlos.ferreira@industria.com',
          phone: '(51) 95555-7890',
          city: 'Porto Alegre',
          company: 'Indústria Sul',
          position: 'Gerente de Projetos',
          plan: 'Plus',
          payment_day: 20,
          notes: 'Precisa integração com sistema legado'
        }
      ];

      const createdContacts = [];
      for (const contactData of sampleContacts) {
        try {
          const contact = await contactsService.createContact(contactData);
          createdContacts.push(contact);
          console.log(`Contato criado: ${contact.name}`);
        } catch (error) {
          console.error(`Erro ao criar contato ${contactData.name}:`, error);
        }
      }

      // Criar oportunidades de exemplo
      const sampleDeals = [
        {
          name: 'Implementação CRM - TechCorp',
          value: 50000,
          contact_id: createdContacts[0]?.id,
          stage: 'Proposta'
        },
        {
          name: 'Sistema Completo - InovaTech',
          value: 75000,
          contact_id: createdContacts[1]?.id,
          stage: 'Negociação'
        },
        {
          name: 'Renovação Anual - Consultoria BH',
          value: 25000,
          contact_id: createdContacts[2]?.id,
          stage: 'Ganho/Cliente'
        },
        {
          name: 'Projeto Piloto - Digital Solutions',
          value: 15000,
          contact_id: createdContacts[3]?.id,
          stage: 'Qualificação'
        },
        {
          name: 'Integração Personalizada',
          value: 30000,
          contact_id: createdContacts[4]?.id,
          stage: 'Lead'
        }
      ];

      const createdDeals = [];
      for (const dealData of sampleDeals) {
        if (dealData.contact_id) {
          try {
            const deal = await dealsService.createDeal(dealData);
            createdDeals.push(deal);
            console.log(`Oportunidade criada: ${deal.name}`);
          } catch (error) {
            console.error(`Erro ao criar oportunidade ${dealData.name}:`, error);
          }
        }
      }

      // Criar tarefas de exemplo
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      const sampleTasks = [
        {
          title: 'Ligar para João Silva - Follow up proposta',
          due_date: tomorrow.toISOString().split('T')[0],
          contact_id: createdContacts[0]?.id,
          completed: false
        },
        {
          title: 'Preparar demonstração para InovaTech',
          due_date: today.toISOString().split('T')[0],
          contact_id: createdContacts[1]?.id,
          completed: false
        },
        {
          title: 'Enviar contrato renovação - Consultoria BH',
          due_date: nextWeek.toISOString().split('T')[0],
          contact_id: createdContacts[2]?.id,
          completed: true
        },
        {
          title: 'Agendar reunião técnica com Ana',
          due_date: tomorrow.toISOString().split('T')[0],
          contact_id: createdContacts[3]?.id,
          completed: false
        },
        {
          title: 'Análise de requisitos - Indústria Sul',
          due_date: nextWeek.toISOString().split('T')[0],
          contact_id: createdContacts[4]?.id,
          completed: false
        }
      ];

      for (const taskData of sampleTasks) {
        if (taskData.contact_id) {
          try {
            const task = await tasksService.createTask(taskData);
            console.log(`Tarefa criada: ${task.title}`);
          } catch (error) {
            console.error(`Erro ao criar tarefa ${taskData.title}:`, error);
          }
        }
      }

      // Criar interações de exemplo
      const sampleInteractions = [
        {
          type: 'Ligação',
          date: today.toISOString().split('T')[0],
          notes: 'Cliente demonstrou interesse na proposta. Solicitou ajustes no escopo.',
          contact_id: createdContacts[0]?.id
        },
        {
          type: 'Email',
          date: today.toISOString().split('T')[0],
          notes: 'Enviado material adicional sobre funcionalidades avançadas.',
          contact_id: createdContacts[1]?.id
        },
        {
          type: 'Reunião',
          date: yesterday(today).toISOString().split('T')[0],
          notes: 'Reunião de alinhamento. Cliente aprovou renovação do contrato.',
          contact_id: createdContacts[2]?.id
        },
        {
          type: 'WhatsApp',
          date: today.toISOString().split('T')[0],
          notes: 'Confirmação de interesse. Aguardando aprovação interna.',
          contact_id: createdContacts[3]?.id
        }
      ];

      for (const interactionData of sampleInteractions) {
        if (interactionData.contact_id) {
          try {
            const interaction = await interactionsService.createInteraction(interactionData);
            console.log(`Interação criada: ${interaction.type} - ${interaction.notes.substring(0, 30)}...`);
          } catch (error) {
            console.error(`Erro ao criar interação:`, error);
          }
        }
      }

      console.log('Dados de exemplo criados com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao criar dados de exemplo:', error);
      return false;
    }
  }
};

function yesterday(date: Date): Date {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
}
