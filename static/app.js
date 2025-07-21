document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskList = document.getElementById('task-list');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // Inicializa o modo escuro
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    darkModeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    // Alternador de modo escuro/claro
    darkModeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        darkModeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    });

    // Carrega tarefas quando a página é carregada
    loadTasks();

    // Manipulador de envio do formulário (criação/edição)
    taskForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const status = document.getElementById('status').value;

        try {
            if (this.dataset.editing) {
                // Atualiza uma tarefa existente
                const taskId = this.dataset.editing;
                const response = await fetch(`/tasks/${taskId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        status
                    })
                });

                if (!response.ok) throw new Error('Failed to update task');
                
                // Reset form
                this.reset();
                delete this.dataset.editing;
                this.querySelector('button').textContent = 'Add Task';
            } else {
                // Cria uma nova tarefa
                const response = await fetch('/tasks', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        status
                    })
                });

                if (!response.ok) throw new Error('Failed to create task');
                this.reset();
            }
            
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert(`Error ${this.dataset.editing ? 'updating' : 'creating'} task`);
        }
    });

    // Carrega todas as tarefas do backend
    async function loadTasks() {
        try {
            const response = await fetch('/tasks');
            if (!response.ok) throw new Error('Failed to load tasks');
            
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error('Error:', error);
            alert('Error loading tasks');
        }
    }

    // Renderiza as tarefas no DOM
    function renderTasks(tasks) {
        taskList.innerHTML = '';

        // Filtra tarefas por status
        const pendingTasks = tasks.filter(task => task.status === 'pendente');
        const completedTasks = tasks.filter(task => task.status === 'concluida');

        // Formata datas para exibição (DD/MM)
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        };

        // Renderiza seção de tarefas pendentes
        if (pendingTasks.length > 0) {
            const pendingHeader = document.createElement('h2');
            pendingHeader.className = 'section-header';
            pendingHeader.textContent = 'Pending Tasks';
            taskList.appendChild(pendingHeader);
        }

        pendingTasks.forEach(task => {
            const taskElement = createTaskElement(task, formatDate);
            taskList.appendChild(taskElement);
        });

        // Renderiza seção de tarefas concluídas
        if (completedTasks.length > 0) {
            const completedHeader = document.createElement('h2');
            completedHeader.className = 'section-header';
            completedHeader.textContent = 'Completed Tasks';
            taskList.appendChild(completedHeader);
        }

        completedTasks.forEach(task => {
            const taskElement = createTaskElement(task, formatDate);
            taskList.appendChild(taskElement);
        });

        // Renderiza estatísticas
        renderStatistics(tasks);
    }

    function createTaskElement(task, formatDate) {
        const taskElement = document.createElement('div');
        taskElement.className = `task ${task.status === 'concluida' ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
            <button class="status-toggle"></button>
            <div class="task-content">
                <input type="text" class="task-title-edit" value="${task.title}" style="display:none">
                <h3 class="task-title">${task.title}</h3>
                <span class="task-date">${formatDate(task.created_at)}</span>
                ${task.status === 'concluida' ? `<span class="task-date">${formatDate(task.completed_at)}</span>` : ''}
            </div>
            <div class="task-actions">
                <button class="edit-btn" data-id="${task.id}">✎</button>
                <button class="save-btn" data-id="${task.id}" style="display:none">✓</button>
                <button class="delete-btn" data-id="${task.id}">✕</button>
            </div>
        `;

        // Add event listeners
        taskElement.querySelector('.status-toggle').addEventListener('click', () => toggleTaskStatus(task.id));
        taskElement.querySelector('.delete-btn').addEventListener('click', handleDelete);
        taskElement.querySelector('.edit-btn').addEventListener('click', () => enableTaskEdit(task.id));
        taskElement.querySelector('.save-btn').addEventListener('click', () => saveTaskEdit(task.id));

        return taskElement;
    }

    function renderStatistics(tasks) {
        const today = new Date().toISOString().split('T')[0];
        const stats = {
            totalCompleted: tasks.filter(t => t.status === 'concluida').length,
            createdToday: tasks.filter(t => t.created_at && t.created_at.startsWith(today)).length,
            completedToday: tasks.filter(t => t.status === 'concluida' && t.completed_at && t.completed_at.startsWith(today)).length
        };

        const statsHTML = `
            <div class="stats-container">
                <h3>Task Statistics</h3>
                <div>Total Completed: ${stats.totalCompleted}</div>
                <div>Created Today: ${stats.createdToday}</div>
                <div>Completed Today: ${stats.completedToday}</div>
            </div>
        `;

        taskList.insertAdjacentHTML('beforeend', statsHTML);
    }

    function enableTaskEdit(taskId) {
        const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
        taskElement.querySelector('.task-title').style.display = 'none';
        taskElement.querySelector('.task-title-edit').style.display = 'block';
        taskElement.querySelector('.edit-btn').style.display = 'none';
        taskElement.querySelector('.save-btn').style.display = 'block';
    }

    async function saveTaskEdit(taskId) {
        const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
        const newTitle = taskElement.querySelector('.task-title-edit').value;

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title: newTitle
                })
            });

            if (!response.ok) throw new Error('Failed to update task');
            
            taskElement.querySelector('.task-title').textContent = newTitle;
            taskElement.querySelector('.task-title').style.display = 'block';
            taskElement.querySelector('.task-title-edit').style.display = 'none';
            taskElement.querySelector('.edit-btn').style.display = 'block';
            taskElement.querySelector('.save-btn').style.display = 'none';
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating task');
        }
    }

    // Alterna status da tarefa entre pendente/concluída
    async function toggleTaskStatus(taskId) {
        const taskElement = document.querySelector(`.task[data-id="${taskId}"]`);
        const isCompleted = taskElement.classList.contains('completed');
        const newStatus = isCompleted ? 'pendente' : 'concluida';

        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    status: newStatus
                })
            });

            if (!response.ok) throw new Error('Failed to update task status');
            
            // Recarrega todas as tarefas para atualizar categorização e estatísticas
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating task status');
        }
    }

    // Handle task edit (now inline)
    taskForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        if (!title) return;

        try {
            const response = await fetch('/tasks', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    title,
                    status: 'pendente'
                })
            });

            if (!response.ok) throw new Error('Failed to create task');
            
            this.reset();
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Error creating task');
        }
    });

    // Manipula exclusão de tarefas
    async function handleDelete(e) {
        if (!confirm('Are you sure you want to delete this task?')) return;
        
        const taskId = e.target.dataset.id;
        
        try {
            const response = await fetch(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete task');
            
            loadTasks();
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting task');
        }
    }
});
