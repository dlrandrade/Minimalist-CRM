
import { useState, useEffect } from 'react';
import { contactsService } from '@/services/contactsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Contact = Database['public']['Tables']['contacts']['Row'];

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await contactsService.getContacts();
      setContacts(data);
    } catch (error) {
      toast({
        title: "Erro ao carregar contatos",
        description: "Não foi possível carregar a lista de contatos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContact = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir o contato "${name}"?`)) {
      return;
    }

    try {
      await contactsService.deleteContact(id);
      toast({
        title: "Contato excluído",
        description: `O contato ${name} foi excluído com sucesso.`,
      });
      loadContacts();
    } catch (error) {
      toast({
        title: "Erro ao excluir contato",
        description: "Não foi possível excluir o contato.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-lg">Carregando contatos...</div>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum contato encontrado</CardTitle>
          <CardDescription>
            Você ainda não tem contatos cadastrados. Comece adicionando seu primeiro contato!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button>Adicionar Primeiro Contato</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Contatos ({contacts.length})</h2>
        <Button>Novo Contato</Button>
      </div>

      <div className="grid gap-4">
        {contacts.map((contact) => (
          <Card key={contact.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">{contact.name}</h3>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>📧 {contact.email}</div>
                    {contact.phone && <div>📱 {contact.phone}</div>}
                    {contact.company && <div>🏢 {contact.company}</div>}
                    {contact.city && <div>📍 {contact.city}</div>}
                    {contact.plan && <div>💼 Plano: {contact.plan}</div>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Editar
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteContact(contact.id, contact.name)}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
