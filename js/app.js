
// App.js - Lógica principal da aplicação

// Utility functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
    }
}

function showToast(message, type = 'info') {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function confirmDelete(message) {
    return confirm(message || 'Tem certeza que deseja excluir este item?');
}

function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

function navigateToContact(contactId) {
    window.location.href = `contact-detail.html?id=${contactId}`;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            isValid = false;
            field.style.borderColor = '#dc3545';
        } else {
            field.style.borderColor = '#ced4da';
        }
    });
    
    return isValid;
}

// Dashboard functions
function loadDashboardData() {
    const stats = dataService.getDashboardStats();
    
    // Update stats
    document.getElementById('totalContacts').textContent = stats.totalContacts;
    document.getElementById('pendingTasks').textContent = stats.pendingTasks;
    document.getElementById('activeDeals').textContent = stats.activeDeals;
    document.getElementById('totalValue').textContent = stats.totalValue;
    
    // Load today's tasks
    loadTodayTasks();
    
    // Load recent contacts
    loadRecentContacts();
}

function loadTodayTasks() {
    const container = document.getElementById('todayTasks');
    if (!container) return;
    
    const todayTasks = dataService.getTasksForToday();
    
    if (todayTasks.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma tarefa para hoje.</p>';
        return;
    }
    
    container.innerHTML = todayTasks.map(task => {
        const contact = task.contactId ? dataService.getContact(task.contactId) : null;
        return `
            <div class="task-item">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        ${contact ? `Contato: ${contact.name}` : 'Tarefa geral'}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function loadRecentContacts() {
    const container = document.getElementById('recentContacts');
    if (!container) return;
    
    const contacts = dataService.getContacts();
    const recentContacts = contacts
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentContacts.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhum contato encontrado.</p>';
        return;
    }
    
    container.innerHTML = recentContacts.map(contact => `
        <div class="contact-item" style="padding: 0.75rem; border-bottom: 1px solid #e9ecef; cursor: pointer;" onclick="navigateToContact('${contact.id}')">
            <div style="font-weight: 500;">${contact.name}</div>
            <div style="color: #6c757d; font-size: 0.9rem;">${contact.email}</div>
        </div>
    `).join('');
}

// Contact functions
function loadContacts() {
    const container = document.getElementById('contactsTable');
    if (!container) return;
    
    const contacts = dataService.getContacts();
    
    if (contacts.length === 0) {
        container.innerHTML = '<tr><td colspan="5" class="text-center">Nenhum contato encontrado. <a href="contact-form.html">Adicione um novo!</a></td></tr>';
        return;
    }
    
    container.innerHTML = contacts.map(contact => `
        <tr onclick="navigateToContact('${contact.id}')" style="cursor: pointer;">
            <td>${contact.name}</td>
            <td>${contact.email}</td>
            <td>${contact.phone || '-'}</td>
            <td>${contact.company || '-'}</td>
            <td>
                <div class="flex gap-1">
                    <a href="contact-detail.html?id=${contact.id}" class="btn btn-small btn-primary">Ver</a>
                    <a href="contact-form.html?id=${contact.id}" class="btn btn-small btn-secondary">Editar</a>
                    <button onclick="event.stopPropagation(); deleteContact('${contact.id}')" class="btn btn-small btn-danger">Excluir</button>
                </div>
            </td>
        </tr>
    `).join('');
}

function deleteContact(contactId) {
    if (confirmDelete('Tem certeza que deseja excluir este contato? Todas as interações e tarefas relacionadas também serão excluídas.')) {
        dataService.deleteContact(contactId);
        showToast('Contato excluído com sucesso!', 'success');
        loadContacts();
    }
}

// Contact detail functions
function loadContactDetail() {
    const contactId = getUrlParameter('id');
    if (!contactId) {
        window.location.href = 'contacts.html';
        return;
    }
    
    const contact = dataService.getContact(contactId);
    if (!contact) {
        showToast('Contato não encontrado!', 'error');
        window.location.href = 'contacts.html';
        return;
    }
    
    // Update page title
    document.title = `${contact.name} - CRM Minimalista`;
    
    // Update contact info
    document.getElementById('contactName').textContent = contact.name;
    document.getElementById('contactEmail').textContent = contact.email;
    document.getElementById('contactPhone').textContent = contact.phone || '-';
    document.getElementById('contactCompany').textContent = contact.company || '-';
    document.getElementById('contactPosition').textContent = contact.position || '-';
    document.getElementById('contactNotes').textContent = contact.notes || '-';
    
    // Update action buttons
    document.getElementById('editContactBtn').href = `contact-form.html?id=${contactId}`;
    document.getElementById('deleteContactBtn').onclick = () => {
        if (confirmDelete('Tem certeza que deseja excluir este contato?')) {
            dataService.deleteContact(contactId);
            showToast('Contato excluído com sucesso!', 'success');
            window.location.href = 'contacts.html';
        }
    };
    
    // Load interactions and tasks
    loadContactInteractions(contactId);
    loadContactTasks(contactId);
}

function loadContactInteractions(contactId) {
    const container = document.getElementById('interactionsList');
    if (!container) return;
    
    const interactions = dataService.getInteractionsByContact(contactId);
    
    if (interactions.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma interação registrada.</p>';
        return;
    }
    
    container.innerHTML = interactions.map(interaction => `
        <div class="interaction-item">
            <div class="interaction-header">
                <span class="interaction-type">${interaction.type}</span>
                <div>
                    <span class="interaction-date">${dataService.formatDate(interaction.date)}</span>
                    <button onclick="deleteInteraction('${interaction.id}')" class="btn btn-small btn-danger" style="margin-left: 1rem;">Excluir</button>
                </div>
            </div>
            <div class="interaction-notes">${interaction.notes}</div>
        </div>
    `).join('');
}

function loadContactTasks(contactId) {
    const container = document.getElementById('tasksList');
    if (!container) return;
    
    const tasks = dataService.getTasksByContact(contactId);
    
    if (tasks.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma tarefa registrada.</p>';
        return;
    }
    
    container.innerHTML = tasks.map(task => `
        <div class="task-item ${task.completed ? 'task-completed' : ''}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTask('${task.id}')">
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-meta">Vencimento: ${dataService.formatDate(task.dueDate)}</div>
            </div>
            <button onclick="deleteTask('${task.id}')" class="btn btn-small btn-danger">Excluir</button>
        </div>
    `).join('');
}

function addInteraction() {
    const contactId = getUrlParameter('id');
    const form = document.getElementById('interactionForm');
    
    if (!validateForm(form)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const interactionData = {
        contactId: contactId,
        type: formData.get('type'),
        date: formData.get('date'),
        notes: formData.get('notes')
    };
    
    dataService.saveInteraction(interactionData);
    showToast('Interação adicionada com sucesso!', 'success');
    form.reset();
    loadContactInteractions(contactId);
}

function addContactTask() {
    const contactId = getUrlParameter('id');
    const form = document.getElementById('taskForm');
    
    if (!validateForm(form)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const taskData = {
        contactId: contactId,
        title: formData.get('title'),
        dueDate: formData.get('dueDate'),
        completed: false
    };
    
    dataService.saveTask(taskData);
    showToast('Tarefa adicionada com sucesso!', 'success');
    form.reset();
    loadContactTasks(contactId);
}

function deleteInteraction(interactionId) {
    if (confirmDelete('Tem certeza que deseja excluir esta interação?')) {
        dataService.deleteInteraction(interactionId);
        showToast('Interação excluída com sucesso!', 'success');
        const contactId = getUrlParameter('id');
        loadContactInteractions(contactId);
    }
}

function toggleTask(taskId) {
    dataService.toggleTaskComplete(taskId);
    const contactId = getUrlParameter('id');
    loadContactTasks(contactId);
}

function deleteTask(taskId) {
    if (confirmDelete('Tem certeza que deseja excluir esta tarefa?')) {
        dataService.deleteTask(taskId);
        showToast('Tarefa excluída com sucesso!', 'success');
        const contactId = getUrlParameter('id');
        loadContactTasks(contactId);
    }
}

// Contact form functions
function loadContactForm() {
    const contactId = getUrlParameter('id');
    const titleElement = document.getElementById('formTitle');
    const form = document.getElementById('contactForm');
    
    if (contactId) {
        // Edit mode
        titleElement.textContent = 'Editar Contato';
        const contact = dataService.getContact(contactId);
        if (contact) {
            form.elements.name.value = contact.name || '';
            form.elements.email.value = contact.email || '';
            form.elements.phone.value = contact.phone || '';
            form.elements.company.value = contact.company || '';
            form.elements.position.value = contact.position || '';
            form.elements.notes.value = contact.notes || '';
        }
    } else {
        // Create mode
        titleElement.textContent = 'Novo Contato';
    }
}

function saveContact() {
    const form = document.getElementById('contactForm');
    
    if (!validateForm(form)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const email = form.elements.email.value;
    if (!validateEmail(email)) {
        showToast('Por favor, insira um email válido.', 'error');
        return;
    }
    
    const contactId = getUrlParameter('id');
    const formData = new FormData(form);
    
    const contactData = {
        id: contactId || null,
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        position: formData.get('position'),
        notes: formData.get('notes')
    };
    
    dataService.saveContact(contactData);
    showToast(contactId ? 'Contato atualizado com sucesso!' : 'Contato criado com sucesso!', 'success');
    
    if (contactId) {
        window.location.href = `contact-detail.html?id=${contactId}`;
    } else {
        window.location.href = 'contacts.html';
    }
}

// Tasks functions
function loadTasks() {
    const container = document.getElementById('tasksContainer');
    if (!container) return;
    
    const filterStatus = document.getElementById('statusFilter')?.value || 'all';
    let tasks = dataService.getTasks();
    
    // Apply filter
    if (filterStatus === 'pending') {
        tasks = tasks.filter(task => !task.completed);
    } else if (filterStatus === 'completed') {
        tasks = tasks.filter(task => task.completed);
    }
    
    if (tasks.length === 0) {
        container.innerHTML = '<div class="empty-state">Nenhuma tarefa encontrada.</div>';
        return;
    }
    
    container.innerHTML = tasks.map(task => {
        const contact = task.contactId ? dataService.getContact(task.contactId) : null;
        return `
            <div class="task-item ${task.completed ? 'task-completed' : ''}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="toggleTaskFromList('${task.id}')">
                <div class="task-content">
                    <div class="task-title">${task.title}</div>
                    <div class="task-meta">
                        Vencimento: ${dataService.formatDate(task.dueDate)}
                        ${contact ? ` | Contato: ${contact.name}` : ' | Tarefa geral'}
                    </div>
                </div>
                <button onclick="deleteTaskFromList('${task.id}')" class="btn btn-small btn-danger">Excluir</button>
            </div>
        `;
    }).join('');
}

function toggleTaskFromList(taskId) {
    dataService.toggleTaskComplete(taskId);
    loadTasks();
}

function deleteTaskFromList(taskId) {
    if (confirmDelete('Tem certeza que deseja excluir esta tarefa?')) {
        dataService.deleteTask(taskId);
        showToast('Tarefa excluída com sucesso!', 'success');
        loadTasks();
    }
}

function showNewTaskModal() {
    // Load contacts for select
    const contactSelect = document.getElementById('taskContactId');
    if (contactSelect) {
        const contacts = dataService.getContactsSelectOptions();
        contactSelect.innerHTML = '<option value="">Tarefa geral (sem contato)</option>' +
            contacts.map(contact => `<option value="${contact.value}">${contact.text}</option>`).join('');
    }
    
    showModal('newTaskModal');
}

function saveNewTask() {
    const form = document.getElementById('newTaskForm');
    
    if (!validateForm(form)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const taskData = {
        title: formData.get('title'),
        dueDate: formData.get('dueDate'),
        contactId: formData.get('contactId') || null,
        completed: false
    };
    
    dataService.saveTask(taskData);
    showToast('Tarefa criada com sucesso!', 'success');
    hideModal('newTaskModal');
    form.reset();
    loadTasks();
}

// Pipeline functions
function loadPipeline() {
    const stages = ['Lead', 'Qualificação', 'Proposta', 'Negociação', 'Ganho', 'Perdido'];
    
    stages.forEach(stage => {
        const container = document.getElementById(`stage-${stage.toLowerCase().replace('ção', 'cao').replace('ã', 'a')}`);
        if (!container) return;
        
        const deals = dataService.getDealsByStage(stage);
        
        if (deals.length === 0) {
            container.innerHTML = '<div class="empty-state" style="padding: 1rem; font-size: 0.9rem;">Nenhuma oportunidade</div>';
            return;
        }
        
        container.innerHTML = deals.map(deal => {
            const contact = deal.contactId ? dataService.getContact(deal.contactId) : null;
            return `
                <div class="deal-card" onclick="editDeal('${deal.id}')">
                    <div class="deal-title">${deal.name}</div>
                    <div class="deal-value">${dataService.formatCurrency(deal.value)}</div>
                    <div class="deal-contact">${contact ? contact.name : 'Sem contato'}</div>
                </div>
            `;
        }).join('');
    });
}

function showNewDealModal() {
    // Load contacts for select
    const contactSelect = document.getElementById('dealContactId');
    if (contactSelect) {
        const contacts = dataService.getContactsSelectOptions();
        contactSelect.innerHTML = '<option value="">Selecionar contato (opcional)</option>' +
            contacts.map(contact => `<option value="${contact.value}">${contact.text}</option>`).join('');
    }
    
    // Reset form
    document.getElementById('dealForm').reset();
    document.getElementById('dealId').value = '';
    document.getElementById('dealModalTitle').textContent = 'Nova Oportunidade';
    
    showModal('dealModal');
}

function editDeal(dealId) {
    const deal = dataService.getDeal(dealId);
    if (!deal) return;
    
    // Load contacts for select
    const contactSelect = document.getElementById('dealContactId');
    if (contactSelect) {
        const contacts = dataService.getContactsSelectOptions();
        contactSelect.innerHTML = '<option value="">Selecionar contato (opcional)</option>' +
            contacts.map(contact => `<option value="${contact.value}">${contact.text}</option>`).join('');
        contactSelect.value = deal.contactId || '';
    }
    
    // Fill form with deal data
    document.getElementById('dealId').value = deal.id;
    document.getElementById('dealName').value = deal.name;
    document.getElementById('dealValue').value = deal.value;
    document.getElementById('dealStage').value = deal.stage;
    document.getElementById('dealModalTitle').textContent = 'Editar Oportunidade';
    
    showModal('dealModal');
}

function saveDeal() {
    const form = document.getElementById('dealForm');
    
    if (!validateForm(form)) {
        showToast('Por favor, preencha todos os campos obrigatórios.', 'error');
        return;
    }
    
    const formData = new FormData(form);
    const dealData = {
        id: formData.get('id') || null,
        name: formData.get('name'),
        value: parseFloat(formData.get('value')) || 0,
        contactId: formData.get('contactId') || null,
        stage: formData.get('stage')
    };
    
    dataService.saveDeal(dealData);
    showToast(dealData.id ? 'Oportunidade atualizada com sucesso!' : 'Oportunidade criada com sucesso!', 'success');
    hideModal('dealModal');
    loadPipeline();
}

function deleteDealFromModal() {
    const dealId = document.getElementById('dealId').value;
    if (!dealId) return;
    
    if (confirmDelete('Tem certeza que deseja excluir esta oportunidade?')) {
        dataService.deleteDeal(dealId);
        showToast('Oportunidade excluída com sucesso!', 'success');
        hideModal('dealModal');
        loadPipeline();
    }
}

// Global event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Set default date for today
    const todayInputs = document.querySelectorAll('input[type="date"]');
    const today = new Date().toISOString().split('T')[0];
    todayInputs.forEach(input => {
        if (!input.value) {
            input.value = today;
        }
    });
});
