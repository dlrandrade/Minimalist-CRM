
# CRM Minimalista

Um sistema de CRM (Customer Relationship Management) simples e funcional, construído com HTML, CSS e JavaScript vanilla.

## Funcionalidades

### 📋 Dashboard
- Visão geral com estatísticas principais
- Tarefas para hoje
- Contatos recentes
- Ações rápidas

### 👥 Gestão de Contatos
- Listar todos os contatos
- Adicionar novos contatos
- Editar informações existentes
- Ver detalhes completos
- Excluir contatos

### 📞 Interações
- Registrar interações com contatos (Email, Ligação, Reunião, Nota)
- Histórico completo de interações
- Datas e observações detalhadas

### ✅ Tarefas
- Criar tarefas gerais ou associadas a contatos
- Marcar como concluída/pendente
- Filtrar por status
- Datas de vencimento

### 🔄 Pipeline de Vendas
- Visualização Kanban com 6 estágios
- Arrastar e soltar oportunidades entre estágios
- Valores em moeda brasileira
- Associação com contatos

## Como usar

1. **Instalação**: Simplesmente baixe todos os arquivos e mantenha a estrutura de pastas
2. **Execução**: Abra o arquivo `index.html` em qualquer navegador moderno
3. **Dados**: Todos os dados são salvos localmente no navegador (localStorage)

## Estrutura de Arquivos

```
├── index.html              # Dashboard principal
├── contacts.html           # Lista de contatos
├── contact-detail.html     # Detalhes do contato
├── contact-form.html       # Formulário de contato
├── tasks.html             # Lista de tarefas
├── pipeline.html          # Pipeline de vendas
├── css/
│   └── style.css          # Estilos principais
└── js/
    ├── app.js             # Lógica da aplicação
    └── dataService.js     # Gerenciamento de dados
```

## Navegação

- **Dashboard**: Visão geral e acesso rápido
- **Contatos**: Gerenciamento completo de contatos
- **Tarefas**: Controle de atividades
- **Pipeline**: Acompanhamento de vendas

## Recursos Técnicos

- **Responsivo**: Funciona em desktop e mobile
- **Persistência**: Dados salvos no localStorage
- **Drag & Drop**: Arrastar oportunidades no pipeline
- **Validação**: Formulários com validação básica
- **Notificações**: Toast messages para feedback

## Requisitos

- Navegador moderno com suporte a ES6+
- JavaScript habilitado
- Não requer servidor ou instalação

## Backup de Dados

Os dados ficam salvos no localStorage do navegador. Para backup:
1. Abra as Ferramentas do Desenvolvedor (F12)
2. Vá na aba Application/Storage
3. Encontre localStorage para o seu domínio
4. Copie os dados das chaves: contacts, interactions, tasks, deals

## Limitações

- Dados locais apenas (não compartilhados entre dispositivos)
- Sem autenticação ou múltiplos usuários
- Backup manual necessário
- Funciona apenas no navegador onde foi usado

## Personalização

O CSS está organizado para fácil customização. Modifique as variáveis de cor no início do arquivo `style.css` para alterar o tema.
