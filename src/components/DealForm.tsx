
import { useState, useEffect } from 'react';
import { dealsService } from '@/services/dealsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Deal = Database['public']['Tables']['deals']['Row'];
type DealInsert = Database['public']['Tables']['deals']['Insert'];
type Contact = Database['public']['Tables']['contacts']['Row'];

interface DealFormProps {
  dealId?: string;
  contacts: Contact[];
  onSave: () => void;
  onCancel: () => void;
}

const STAGES = ['Lead', 'Qualificação', 'Proposta', 'Negociação', 'Ganho/Cliente', 'Perdido'];

export function DealForm({ dealId, contacts, onSave, onCancel }: DealFormProps) {
  const [formData, setFormData] = useState<Partial<DealInsert>>({
    name: '',
    value: 0,
    contact_id: null,
    stage: 'Lead'
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (dealId) {
      loadDeal();
    }
  }, [dealId]);

  const loadDeal = async () => {
    if (!dealId) return;
    
    try {
      const deal = await dealsService.getDeal(dealId);
      if (deal) {
        setFormData(deal);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar oportunidade",
        description: "Não foi possível carregar os dados da oportunidade.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (dealId) {
        await dealsService.updateDeal(dealId, formData);
        toast({
          title: "Oportunidade atualizada",
          description: "A oportunidade foi atualizada com sucesso.",
        });
      } else {
        await dealsService.createDeal(formData);
        toast({
          title: "Oportunidade criada",
          description: "A oportunidade foi criada com sucesso.",
        });
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao salvar oportunidade",
        description: "Não foi possível salvar a oportunidade.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!dealId || !confirm('Tem certeza que deseja excluir esta oportunidade?')) {
      return;
    }

    try {
      await dealsService.deleteDeal(dealId);
      toast({
        title: "Oportunidade excluída",
        description: "A oportunidade foi excluída com sucesso.",
      });
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao excluir oportunidade",
        description: "Não foi possível excluir a oportunidade.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: keyof DealInsert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>{dealId ? 'Editar Oportunidade' : 'Nova Oportunidade'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Oportunidade *</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Venda de Software CRM"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="value">Valor *</Label>
            <Input
              id="value"
              type="number"
              step="0.01"
              min="0"
              value={formData.value || 0}
              onChange={(e) => handleInputChange('value', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
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

          <div className="space-y-2">
            <Label>Estágio *</Label>
            <Select 
              value={formData.stage || 'Lead'} 
              onValueChange={(value) => handleInputChange('stage', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STAGES.map((stage) => (
                  <SelectItem key={stage} value={stage}>
                    {stage}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : (dealId ? 'Atualizar' : 'Salvar')}
            </Button>
            {dealId && (
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
