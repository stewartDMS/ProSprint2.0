import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  createdAt: Date;
}

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Setup automation workflow',
      description: 'Configure initial automation rules',
      priority: 'high',
      status: 'in-progress',
      createdAt: new Date(),
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      createdAt: new Date(),
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsCreating(false);
  };

  const handleUpdateStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  return (
    <section style={styles.container} aria-labelledby="task-manager-title">
      <h2 id="task-manager-title" style={styles.title}>Task Manager</h2>
      
      <div style={styles.actions}>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={styles.button}
          aria-expanded={isCreating}
          aria-controls="create-task-form"
        >
          {isCreating ? 'Cancel' : '+ New Task'}
        </button>
      </div>

      {isCreating && (
        <form
          id="create-task-form"
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTask();
          }}
          aria-label="Create new task"
        >
          <div style={styles.formGroup}>
            <label htmlFor="task-title" style={styles.label}>Title *</label>
            <input
              id="task-title"
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              style={styles.input}
              placeholder="Enter task title"
              required
              aria-required="true"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="task-description" style={styles.label}>Description</label>
            <textarea
              id="task-description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              style={styles.textarea}
              placeholder="Enter task description"
              rows={3}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="task-priority" style={styles.label}>Priority</label>
            <select
              id="task-priority"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Task['priority'] })}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <button type="submit" style={styles.buttonPrimary}>
            Create Task
          </button>
        </form>
      )}

      <div style={styles.taskList} role="list" aria-label="Tasks">
        {tasks.length === 0 ? (
          <p style={styles.emptyState}>No tasks yet. Create your first task!</p>
        ) : (
          tasks.map((task) => (
            <article key={task.id} style={styles.taskCard} role="listitem">
              <div style={styles.taskHeader}>
                <h3 style={styles.taskTitle}>{task.title}</h3>
                <span
                  style={{
                    ...styles.priorityBadge,
                    ...(task.priority === 'high' ? styles.priorityHigh : {}),
                    ...(task.priority === 'medium' ? styles.priorityMedium : {}),
                    ...(task.priority === 'low' ? styles.priorityLow : {}),
                  }}
                  aria-label={`Priority: ${task.priority}`}
                >
                  {task.priority}
                </span>
              </div>
              {task.description && (
                <p style={styles.taskDescription}>{task.description}</p>
              )}
              <div style={styles.taskFooter}>
                <div style={styles.statusGroup}>
                  <label htmlFor={`status-${task.id}`} style={styles.statusLabel}>Status:</label>
                  <select
                    id={`status-${task.id}`}
                    value={task.status}
                    onChange={(e) => handleUpdateStatus(task.id, e.target.value as Task['status'])}
                    style={styles.statusSelect}
                    aria-label={`Update status for ${task.title}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  style={styles.deleteButton}
                  aria-label={`Delete task: ${task.title}`}
                >
                  Delete
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
  },
  actions: {
    marginBottom: '1.5rem',
  },
  button: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    fontSize: '0.95rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  buttonPrimary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: 'none',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  form: {
    background: 'rgba(15, 23, 42, 0.5)',
    padding: '1.5rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    color: '#cbd5e1',
    fontSize: '0.9rem',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  taskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '2rem',
    fontStyle: 'italic',
  },
  taskCard: {
    background: 'rgba(15, 23, 42, 0.5)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  taskTitle: {
    fontSize: '1.1rem',
    color: '#e2e8f0',
    margin: 0,
  },
  priorityBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  priorityHigh: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
  },
  priorityMedium: {
    background: 'rgba(251, 191, 36, 0.2)',
    color: '#fcd34d',
  },
  priorityLow: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
  },
  taskDescription: {
    color: '#cbd5e1',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  taskFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  statusGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  statusLabel: {
    color: '#94a3b8',
    fontSize: '0.9rem',
  },
  statusSelect: {
    padding: '0.5rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.8)',
    color: '#e2e8f0',
    fontSize: '0.9rem',
    cursor: 'pointer',
  },
  deleteButton: {
    padding: '0.5rem 1rem',
    borderRadius: '6px',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    background: 'rgba(239, 68, 68, 0.1)',
    color: '#fca5a5',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
};
