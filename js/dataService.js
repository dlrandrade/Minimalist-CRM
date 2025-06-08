// Data Service - Gerencia todas as operações de localStorage
class DataService {
    constructor() {
        this.initializeData();
    }

    // Inicializa dados padrão se não existirem
    initializeData() {
        if (!localStorage.getItem('contacts')) {
            localStorage.setItem('contacts', JSON.stringify([]));
        }
        if (!localStorage.getItem('interactions')) {
            localStorage.setItem('interactions', JSON.stringify([]));
        }
        if (!localStorage.getItem('tasks')) {
            localStorage.setItem('tasks', JSON.stringify([]));
        }
        if (!localStorage.getItem('deals')) {
            localStorage.setItem('deals', JSON.stringify([]));
        }
    }

    // Gera ID único
    generateId() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 9);
    }

    // CONTACTS CRUD
    getContacts() {
        return JSON.parse(localStorage.getItem('contacts') || '[]');
    }

    getContact(id) {
        const contacts = this.getContacts();
        return contacts.find(contact => contact.id === id);
    }

    saveContact(contactData) {
        const contacts = this.getContacts();
        
        if (contactData.id) {
            // Update existing contact
            const index = contacts.findIndex(c => c.id === contactData.id);
            if (index !== -1) {
                contacts[index] = { ...contactData, updatedAt: new Date().toISOString() };
            }
        } else {
            // Create new contact
            const newContact = {
                ...contactData,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            contacts.push(newContact);
            
            // Se o campo sendToPipeline estiver marcado, criar uma oportunidade
            if (contactData.sendToPipeline && contactData.pipelineStage) {
                const dealData = {
                    name: `Oportunidade - ${contactData.name}`,
                    value: 0,
                    contactId: newContact.id,
                    stage: contactData.pipelineStage
                };
                this.saveDeal(dealData);
            }
        }
        
        localStorage.setItem('contacts', JSON.stringify(contacts));
        return contactData.id || contacts[contacts.length - 1].id;
    }

    deleteContact(id) {
        const contacts = this.getContacts();
        const filteredContacts = contacts.filter(contact => contact.id !== id);
        localStorage.setItem('contacts', JSON.stringify(filteredContacts));
        
        // Also delete related interactions and tasks
        this.deleteInteractionsByContact(id);
        this.deleteTasksByContact(id);
    }

    // INTERACTIONS CRUD
    getInteractions() {
        return JSON.parse(localStorage.getItem('interactions') || '[]');
    }

    getInteractionsByContact(contactId) {
        const interactions = this.getInteractions();
        return interactions.filter(interaction => interaction.contactId === contactId)
                          .sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    saveInteraction(interactionData) {
        const interactions = this.getInteractions();
        
        const newInteraction = {
            ...interactionData,
            id: this.generateId(),
            createdAt: new Date().toISOString()
        };
        
        interactions.push(newInteraction);
        localStorage.setItem('interactions', JSON.stringify(interactions));
        return newInteraction.id;
    }

    deleteInteraction(id) {
        const interactions = this.getInteractions();
        const filteredInteractions = interactions.filter(interaction => interaction.id !== id);
        localStorage.setItem('interactions', JSON.stringify(filteredInteractions));
    }

    deleteInteractionsByContact(contactId) {
        const interactions = this.getInteractions();
        const filteredInteractions = interactions.filter(interaction => interaction.contactId !== contactId);
        localStorage.setItem('interactions', JSON.stringify(filteredInteractions));
    }

    // TASKS CRUD
    getTasks() {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
    }

    getTasksByContact(contactId) {
        const tasks = this.getTasks();
        return tasks.filter(task => task.contactId === contactId);
    }

    getTasksForToday() {
        const tasks = this.getTasks();
        const today = new Date().toISOString().split('T')[0];
        return tasks.filter(task => task.dueDate === today && !task.completed);
    }

    saveTask(taskData) {
        const tasks = this.getTasks();
        
        if (taskData.id) {
            // Update existing task
            const index = tasks.findIndex(t => t.id === taskData.id);
            if (index !== -1) {
                tasks[index] = { ...taskData, updatedAt: new Date().toISOString() };
            }
        } else {
            // Create new task
            const newTask = {
                ...taskData,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            tasks.push(newTask);
        }
        
        localStorage.setItem('tasks', JSON.stringify(tasks));
        return taskData.id || tasks[tasks.length - 1].id;
    }

    deleteTask(id) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.id !== id);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }

    deleteTasksByContact(contactId) {
        const tasks = this.getTasks();
        const filteredTasks = tasks.filter(task => task.contactId !== contactId);
        localStorage.setItem('tasks', JSON.stringify(filteredTasks));
    }

    toggleTaskComplete(id) {
        const tasks = this.getTasks();
        const task = tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.updatedAt = new Date().toISOString();
            localStorage.setItem('tasks', JSON.stringify(tasks));
        }
    }

    // DEALS CRUD
    getDeals() {
        return JSON.parse(localStorage.getItem('deals') || '[]');
    }

    getDeal(id) {
        const deals = this.getDeals();
        return deals.find(deal => deal.id === id);
    }

    saveDeal(dealData) {
        const deals = this.getDeals();
        
        if (dealData.id) {
            // Update existing deal
            const index = deals.findIndex(d => d.id === dealData.id);
            if (index !== -1) {
                deals[index] = { ...dealData, updatedAt: new Date().toISOString() };
            }
        } else {
            // Create new deal
            const newDeal = {
                ...dealData,
                id: this.generateId(),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            deals.push(newDeal);
        }
        
        localStorage.setItem('deals', JSON.stringify(deals));
        return dealData.id || deals[deals.length - 1].id;
    }

    deleteDeal(id) {
        const deals = this.getDeals();
        const filteredDeals = deals.filter(deal => deal.id !== id);
        localStorage.setItem('deals', JSON.stringify(filteredDeals));
    }

    getDealsByStage(stage) {
        const deals = this.getDeals();
        return deals.filter(deal => deal.stage === stage);
    }

    // UTILITY METHODS
    getContactsSelectOptions() {
        const contacts = this.getContacts();
        return contacts.map(contact => ({
            value: contact.id,
            text: contact.name
        }));
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(value || 0);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    // Dashboard stats - atualizado
    getDashboardStats() {
        const contacts = this.getContacts();
        const tasks = this.getTasks();
        const deals = this.getDeals();
        
        const pendingTasks = tasks.filter(task => !task.completed);
        const activeDeals = deals.filter(deal => !['Ganho/Cliente', 'Perdido'].includes(deal.stage));
        const wonDeals = deals.filter(deal => deal.stage === 'Ganho/Cliente');
        
        const totalValueInNegotiation = activeDeals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0);
        const monthlyValue = wonDeals.reduce((sum, deal) => sum + (parseFloat(deal.value) || 0), 0);
        
        return {
            totalContacts: contacts.length,
            pendingTasks: pendingTasks.length,
            activeDeals: activeDeals.length,
            totalValueInNegotiation: this.formatCurrency(totalValueInNegotiation),
            monthlyValue: this.formatCurrency(monthlyValue)
        };
    }

    // Função para confirmação de exclusão
    confirmDelete(itemName, callback) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="delete-confirmation">
                    <h3>⚠️ Confirmar Exclusão</h3>
                    <p>Tem certeza que deseja excluir "${itemName}"?</p>
                    <p>Para confirmar, digite <strong>EXCLUIR</strong> abaixo:</p>
                    <input type="text" class="delete-input" id="deleteConfirmInput" placeholder="Digite EXCLUIR">
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button class="btn btn-danger" id="confirmDeleteBtn" disabled>Excluir</button>
                        <button class="btn btn-secondary" id="cancelDeleteBtn">Cancelar</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        const input = modal.querySelector('#deleteConfirmInput');
        const confirmBtn = modal.querySelector('#confirmDeleteBtn');
        const cancelBtn = modal.querySelector('#cancelDeleteBtn');
        
        input.addEventListener('input', function() {
            confirmBtn.disabled = this.value !== 'EXCLUIR';
        });
        
        confirmBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
            callback(true);
        });
        
        cancelBtn.addEventListener('click', function() {
            document.body.removeChild(modal);
            callback(false);
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                document.body.removeChild(modal);
                callback(false);
            }
        });
        
        input.focus();
    }
}

// Instância global do DataService
window.dataService = new DataService();
