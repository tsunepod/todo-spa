const { createApp } = Vue;

createApp({
    data() {
        return {
            todos: [],
            newTodo: '',
            newPriority: 'medium',
            newDueDate: '',
            sortBy: 'priority'
        };
    },
    
    computed: {
        sortedTodos() {
            const priorityOrder = { high: 1, medium: 2, low: 3 };
            return [...this.todos].sort((a, b) => {
                if (this.sortBy === 'priority') {
                    return priorityOrder[a.priority || 'medium'] - priorityOrder[b.priority || 'medium'];
                } else {
                    const dateA = a.due_date || '99/99';
                    const dateB = b.due_date || '99/99';
                    const [monthA, dayA] = dateA.split('/').map(Number);
                    const [monthB, dayB] = dateB.split('/').map(Number);
                    
                    if (monthA !== monthB) return monthA - monthB;
                    return dayA - dayB;
                }
            });
        }
    },
    
    async mounted() {
        await this.fetchTodos();
    },
    
    methods: {
        async fetchTodos() {
            try {
                const response = await axios.get('api.php');
                const data = Array.isArray(response.data) ? response.data : [];
                this.todos = data.map(todo => ({ ...todo, editing: false }));
            } catch (error) {
                console.error('TODOの取得に失敗:', error);
                this.todos = [];
            }
        },
        
        formatDate(date) {
            return date || '';
        },
        
        formatDueDate(e) {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 3) {
                val = val.slice(0, 2) + '/' + val.slice(2, 4);
            }
            this.newDueDate = val;
        },
        
        async addTodo() {
            if (!this.newTodo.trim()) return;
            
            try {
                const response = await axios.post('api.php', {
                    title: this.newTodo,
                    priority: this.newPriority,
                    due_date: this.newDueDate || null
                });
                this.todos.unshift({ ...response.data, editing: false });
                this.newTodo = '';
                this.newPriority = 'medium';
                this.newDueDate = '';
            } catch (error) {
                console.error('TODOの追加に失敗:', error);
            }
        },
        
        async updateTodo(todo) {
            try {
                await axios.put(`api.php?id=${todo.id}`, {
                    title: todo.title,
                    completed: todo.completed,
                    priority: todo.priority,
                    due_date: todo.due_date
                });
                
                // 完了したタスクを画面から削除
                if (todo.completed) {
                    this.todos = this.todos.filter(t => t.id !== todo.id);
                }
            } catch (error) {
                console.error('TODOの更新に失敗:', error);
                await this.fetchTodos();
            }
        },
        

        
        startEdit(todo) {
            todo.editing = true;
            this.$nextTick(() => {
                const input = this.$refs.editInput?.[0];
                if (input) input.focus();
            });
        },
        
        async finishEdit(todo) {
            todo.editing = false;
            await this.updateTodo(todo);
        }
    }
}).mount('#app');