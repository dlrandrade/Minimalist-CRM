
import { useState, useEffect } from 'react';
import { contactsService } from '@/services/contactsService';
import { dealsService } from '@/services/dealsService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];
type ContactInsert = Database['public']['Tables']['contacts']['Insert'];

interface ContactFormProps {
  contactId?: string;
  onSave: () => void;
  onCancel: () => void;
}

export function ContactForm({ contactId, onSave, onCancel }: ContactFormProps) {
  const [formData, setFormData] = useState<Omit<ContactInsert, 'user_id'>>({
    name: '',
    email: '',
    phone: '',
    city: '',
    company: '',
    position: '',
    plan: '',
    payment_day: null,
    notes: ''
  });
  const [sendToPipeline, setSendToPipeline] = useState(false);
  const [pipelineStage, setPipelineStage] = useState('Lead');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (contactId) {
      loadContact();
    }
  }, [contactId]);

  const loadContact = async () => {
    if (!contactId) return;
    
    try {
      const contact = await contactsService.getContact(contactId);
      if (contact) {
        const { user_id, created_at, updated_at, id, ...contactData } = contact;
        setFormData(contactData);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar contato",
        description: "Não foi possível carregar os dados do contato.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e email são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let savedContact;
      
      if (contactId) {
        savedContact = await contactsService.updateContact(contactId, formData);
        toast({
          title: "Contato atualizado",
          description: "O contato foi atualizado com sucesso.",
        });
      } else {
        savedContact = await contactsService.createContact(formData);
        
        // Se deve enviar para pipeline, criar uma oportunidade
        if (sendToPipeline && savedContact) {
          await dealsService.createDeal({
            name: `Oportunidade - ${savedContact.name}`,
            value: 0,
            contact_id: savedContact.id,
            stage: pipelineStage
          });
          toast({
            title: "Contato criado e enviado para pipeline",
            description: "O contato foi criado e uma oportunidade foi adicionada ao pipeline.",
          });
        } else {
          toast({
            title: "Contato criado",
            description: "O contato foi criado com sucesso.",
          });
        }
      }
      
      onSave();
    } catch (error) {
      toast({
        title: "Erro ao salvar contato",
        description: "Não foi possível salvar o contato.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof Omit<ContactInsert, 'user_id'>, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{contactId ? 'Editar Contato' : 'Novo Contato'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">Cidade</Label>
              <Input
                id="city"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="Cidade"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Empresa</Label>
              <Input
                id="company"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Nome da empresa"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Cargo</Label>
              <Input
                id="position"
                value={formData.position || ''}
                onChange={(e) => handleInputChange('position', e.target.value)}
                placeholder="Cargo/Função"
              />
            </div>

            <div className="space-y-2">
              <Label>Plano</Label>
              <Select value={formData.plan || ''} onValueChange={(value) => handleInputChange('plan', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar plano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cortesia">Cortesia</SelectItem>
                  <SelectItem value="Básico">Básico</SelectItem>
                  <SelectItem value="Plus">Plus</SelectItem>
                  <SelectItem value="Max">Max</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Dia de Pagamento</Label>
              <Select 
                value={formData.payment_day?.toString() || ''} 
                onValueChange={(value) => handleInputChange('payment_day', value ? parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecionar dia" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <SelectItem key={day} value={day.toString()}>Dia {day}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Informações adicionais sobre o contato..."
              rows={3}
            />
          </div>

          {!contactId && (
            <div className="border-2 border-dashed border-blue-200 p-4 rounded-lg bg-blue-50">
              <div className="flex items-center space-x-2 mb-3">
                <Checkbox
                  id="sendToPipeline"
                  checked={sendToPipeline}
                  onCheckedChange={(checked) => setSendToPipeline(checked === true)}
                />
                <Label htmlFor="sendToPipeline" className="font-semibold text-blue-700">
                  Enviar para Pipeline de Vendas
                </Label>
              </div>
              
              {sendToPipeline && (
                <div className="space-y-2">
                  <Label>Estágio Inicial</Label>
                  <Select value={pipelineStage} onValueChange={setPipelineStage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Qualificação">Qualificação</SelectItem>
                      <SelectItem value="Proposta">Proposta</SelectItem>
                      <SelectItem value="Negociação">Negociação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : (contactId ? 'Atualizar' : 'Salvar Contato')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
