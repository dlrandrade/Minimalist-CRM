
import { useState, useEffect } from 'react';
import { dealsService } from '@/services/dealsService';
import { contactsService } from '@/services/contactsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { DealForm } from './DealForm';
import type { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'];
type Contact = Database['public']['Tables']['contacts']['Row'];

const STAGES = ['Lead', 'Qualificação', 'Proposta', 'Negociação', 'Ganho/Cliente', 'Perdido'];

export function Pipeline() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDealId, setEditingDealId] = useState<string | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dealsData, contactsData] = await Promise.all([
        dealsService.getDeals(),
        contactsService.getContacts()
      ]);
      setDeals(dealsData);
      setContacts(contactsData);
    } catch (error) {
      toast({
        title: "Erro ao carregar pipeline",
        description: "Não foi possível carregar os dados do pipeline.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('text/plain', dealId);
  };

  const handleDrop = async (e: React.DragEvent, newStage: string) => {
    e.preventDefault();
    const dealId = e.dataTransfer.getData('text/plain');
    const deal = deals.find(d => d.id === dealId);
    
    if (deal && deal.stage !== newStage) {
      try {
        await dealsService.updateDeal(dealId, { stage: newStage });
        toast({
          title: "Oportunidade movida",
          description: `Oportunidade movida para ${newStage}`,
        });
        loadData();
      } catch (error) {
        toast({
          title: "Erro ao mover oportunidade",
          description: "Não foi possível mover a oportunidade.",
          variant: "destructive",
        });
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getContactName = (contactId: string | null) => {
    if (!contactId) return 'Sem contato';
    const contact = contacts.find(c => c.id === contactId);
    return contact?.name || 'Contato não encontrado';
  };

  const getDealsByStage = (stage: string) => {
    return deals.filter(deal => deal.stage === stage);
  };

  const handleEditDeal = (id: string) => {
    setEditingDealId(id);
    setShowForm(true);
  };

  const handleNewDeal = () => {
    setEditingDealId(undefined);
    setShowForm(true);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setEditingDealId(undefined);
    loadData();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingDealId(undefined);
  };

  if (showForm) {
    return (
      <DealForm
        dealId={editingDealId}
        contacts={contacts}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando pipeline...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pipeline de Vendas</h2>
        <Button onClick={handleNewDeal}>Nova Oportunidade</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {STAGES.map((stage) => (
          <div
            key={stage}
            className="bg-gray-50 rounded-lg p-4 min-h-[400px]"
            onDrop={(e) => handleDrop(e, stage)}
            onDragOver={handleDragOver}
          >
            <h3 className="font-semibold text-sm text-gray-700 mb-3">{stage}</h3>
            <div className="space-y-2">
              {getDealsByStage(stage).map((deal) => (
                <Card
                  key={deal.id}
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable
                  onDragStart={(e) => handleDragStart(e, deal.id)}
                  onClick={() => handleEditDeal(deal.id)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-1">
                      <div className="font-medium text-sm">{deal.name}</div>
                      <div className="text-xs text-green-600 font-semibold">
                        {dealsService.formatCurrency(Number(deal.value))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {getContactName(deal.contact_id)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
