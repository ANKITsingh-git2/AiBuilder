document.addEventListener('DOMContentLoaded', () => {
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const inputError = document.getElementById('input-error');
    const taskList = document.getElementById('task-list');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');
    const activeTasksCountSpan = document.getElementById('active-tasks-count');
    const noTasksMessage = document.getElementById('no-tasks-message');

    let tasks = [];
    let currentFilter = 'all'; // 'all', 'active', 'completed'

    // --- Utility Functions ---

    // Generate a unique ID for tasks
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2);

    // Save tasks to localStorage
    const saveTasks = () => {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    };

    // Load tasks from localStorage
    const loadTasks = () => {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            tasks = JSON.parse(storedTasks);
        }
    };

    // Update active tasks count
    const updateTaskCount = () => {
        const activeTasks = tasks.filter(task => !task.completed).length;
        activeTasksCountSpan.textContent = activeTasks;
    };

    // Show/hide no tasks message
    const toggleNoTasksMessage = () => {
        const filteredTasks = getFilteredTasks();
        if (filteredTasks.length === 0 && tasks.length === 0) {
            noTasksMessage.classList.remove('hidden');
        } else if (filteredTasks.length === 0 && tasks.length > 0 && currentFilter !== 'all') {
             noTasksMessage.classList.remove('hidden');
             noTasksMessage.querySelector('p').textContent = `No ${currentFilter} tasks.`;
        }
        else {
            noTasksMessage.classList.add('hidden');
        }
    };

    // --- Task Management Functions ---

    // Get tasks based on current filter
    const getFilteredTasks = () => {
        if (currentFilter === 'active') {
            return tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            return tasks.filter(task => task.completed);
        }
        return tasks;
    };

    // Render tasks to the DOM
    const renderTasks = () => {
        taskList.innerHTML = ''; // Clear current tasks

        const filteredTasks = getFilteredTasks();

        if (filteredTasks.length === 0) {
            toggleNoTasksMessage();
            updateTaskCount();
            return;
        }

        noTasksMessage.classList.add('hidden'); // Hide if tasks are present

        filteredTasks.forEach(task => {
            const listItem = document.createElement('li');
            listItem.setAttribute('data-id', task.id);
            listItem.classList.add(
                'flex', 'items-center', 'justify-between', 'bg-slate-700', 'p-4', 'rounded-lg', 'shadow-md',
                'transform', 'transition-all', 'duration-300', 'ease-in-out', 'hover:shadow-lg',
                task.completed ? 'task-completed' : 'task-pending', // Add classes for completed/pending
                'fade-in' // Apply fade-in animation
            );
            listItem.style.animationDelay = `${Math.random() * 0.1}s`; // Stagger animation

            listItem.innerHTML = `
                <div class="flex items-center flex-grow min-w-0">
                    <label class="custom-checkbox flex-shrink-0 mr-4">
                        <input type="checkbox" ${task.completed ? 'checked' : ''} aria-label="Mark task as completed">
                        <svg class="checkbox-icon w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </label>
                    <span class="task-text flex-grow text-lg break-words cursor-pointer ${task.completed ? 'line-through text-textMuted' : 'text-textLight'}" tabindex="0">${task.text}</span>
                </div>
                <div class="flex-shrink-0 flex gap-2 ml-4">
                    <button class="edit-btn text-primary hover:text-accent p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors duration-200" aria-label="Edit task">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </button>
                    <button class="delete-btn text-red-400 hover:text-red-500 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-red-400/50 transition-colors duration-200" aria-label="Delete task">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                </div>
            `;
            taskList.appendChild(listItem);
        });

        updateTaskCount();
    };

    // Add a new task
    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();

        if (text === '') {
            inputError.textContent = 'Task cannot be empty!';
            inputError.classList.add('opacity-100');
            taskInput.classList.add('border-red-400');
            taskInput.focus();
            setTimeout(() => {
                inputError.classList.remove('opacity-100');
                taskInput.classList.remove('border-red-400');
            }, 2000);
            return;
        }

        const newTask = {
            id: generateId(),
            text,
            completed: false
        };
        tasks.unshift(newTask); // Add to the beginning
        saveTasks();
        taskInput.value = ''; // Clear input
        renderTasks();
    };

    // Toggle task completion status
    const toggleComplete = (id) => {
        const taskIndex = tasks.findIndex(task => task.id === id);
        if (taskIndex > -1) {
            tasks[taskIndex].completed = !tasks[taskIndex].completed;
            saveTasks();
            renderTasks(); // Re-render to update classes and count
        }
    };

    // Delete a task
    const deleteTask = (id, listItem) => {
        listItem.classList.add('fade-out'); // Apply fade-out animation
        listItem.addEventListener('animationend', () => {
            tasks = tasks.filter(task => task.id !== id);
            saveTasks();
            renderTasks(); // Re-render after animation finishes
        }, { once: true }); // Ensure listener is removed after first use
    };

    // Edit task text
    const editTask = (id, currentSpan) => {
        const currentText = currentSpan.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.classList.add(
            'flex-grow', 'bg-slate-600', 'text-textLight', 'rounded-md', 'py-2', 'px-3', 'focus:outline-none',
            'focus:ring-2', 'focus:ring-primary', 'focus:border-transparent', 'transition', 'duration-200'
        );
        currentSpan.parentNode.replaceChild(input, currentSpan);
        input.focus();

        const saveEdit = () => {
            const newText = input.value.trim();
            if (newText === '' || newText === currentText) {
                // If empty or no change, revert to original text span
                input.parentNode.replaceChild(currentSpan, input);
                return;
            }

            const taskIndex = tasks.findIndex(task => task.id === id);
            if (taskIndex > -1) {
                tasks[taskIndex].text = newText;
                saveTasks();
                renderTasks(); // Re-render to update the task list
            }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                input.blur(); // Trigger blur to save
            }
        });
    };

    // Clear all completed tasks
    const clearCompletedTasks = () => {
        const completedTasks = tasks.filter(task => task.completed);
        if (completedTasks.length === 0) {
            alert('No completed tasks to clear!');
            return;
        }

        // Apply fade-out to all completed tasks
        completedTasks.forEach(task => {
            const listItem = taskList.querySelector(`[data-id="${task.id}"]`);
            if (listItem) {
                listItem.classList.add('fade-out');
                listItem.addEventListener('animationend', () => {
                    listItem.remove();
                    // After all animations finish, update the state
                    if (!taskList.querySelector('.fade-out')) { // Check if any other fade-out is still running
                        tasks = tasks.filter(task => !task.completed);
                        saveTasks();
                        renderTasks(); // Render remaining tasks
                    }
                }, { once: true });
            }
        });

        // Fallback for cases where animations might not trigger/finish
        if (completedTasks.length === 0) {
            tasks = tasks.filter(task => !task.completed);
            saveTasks();
            renderTasks();
        }
    };


    // --- Event Listeners ---

    // Form submission for adding tasks
    taskForm.addEventListener('submit', addTask);

    // Event delegation for tasks (toggle, edit, delete)
    taskList.addEventListener('click', (e) => {
        const listItem = e.target.closest('li[data-id]');
        if (!listItem) return;

        const id = listItem.dataset.id;

        if (e.target.closest('input[type="checkbox"]')) {
            toggleComplete(id);
        } else if (e.target.closest('.delete-btn')) {
            deleteTask(id, listItem);
        } else if (e.target.closest('.edit-btn')) {
            const taskTextSpan = listItem.querySelector('.task-text');
            if (taskTextSpan) {
                editTask(id, taskTextSpan);
            }
        }
    });

    // Event delegation for inline editing via task text click
    taskList.addEventListener('dblclick', (e) => {
        const taskTextSpan = e.target.closest('.task-text');
        if (taskTextSpan) {
            const listItem = taskTextSpan.closest('li[data-id]');
            if (listItem) {
                const id = listItem.dataset.id;
                editTask(id, taskTextSpan);
            }
        }
    });


    // Filter buttons click
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active', 'bg-primary', 'text-textLight', 'hover:bg-slate-600'));
            button.classList.add('active', 'bg-primary', 'text-textLight');
            button.classList.remove('text-textMuted', 'hover:bg-slate-600'); // Remove inactive styling

            currentFilter = button.dataset.filter;
            renderTasks();
        });
    });

    // Clear completed button
    clearCompletedBtn.addEventListener('click', clearCompletedTasks);

    // --- Initial Load ---
    loadTasks();
    renderTasks(); // Initial render of tasks
    updateTaskCount();
    toggleNoTasksMessage();

    // Set initial filter button active state
    document.querySelector(`[data-filter="${currentFilter}"]`).classList.add('active', 'bg-primary', 'text-textLight');
    document.querySelector(`[data-filter="${currentFilter}"]`).classList.remove('text-textMuted', 'hover:bg-slate-600');
});