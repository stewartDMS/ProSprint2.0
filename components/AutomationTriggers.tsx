import { useState } from 'react';

interface Trigger {
  id: string;
  name: string;
  description: string;
  condition: string;
  action: string;
  enabled: boolean;
  createdAt: Date;
}

export default function AutomationTriggers() {
  const [triggers, setTriggers] = useState<Trigger[]>([
    {
      id: '1',
      name: 'High Priority Task Alert',
      description: 'Send notification when high priority task is created',
      condition: 'task.priority === "high"',
      action: 'send_notification',
      enabled: true,
      createdAt: new Date(),
    },
  ]);
  const [isCreating, setIsCreating] = useState(false);
  const [newTrigger, setNewTrigger] = useState({
    name: '',
    description: '',
    condition: '',
    action: '',
  });

  const handleCreateTrigger = () => {
    if (!newTrigger.name.trim() || !newTrigger.condition.trim()) return;

    const trigger: Trigger = {
      id: Date.now().toString(),
      name: newTrigger.name,
      description: newTrigger.description,
      condition: newTrigger.condition,
      action: newTrigger.action,
      enabled: true,
      createdAt: new Date(),
    };

    setTriggers([...triggers, trigger]);
    setNewTrigger({ name: '', description: '', condition: '', action: '' });
    setIsCreating(false);
  };

  const handleToggleTrigger = (triggerId: string) => {
    setTriggers(triggers.map(trigger => 
      trigger.id === triggerId ? { ...trigger, enabled: !trigger.enabled } : trigger
    ));
  };

  const handleDeleteTrigger = (triggerId: string) => {
    setTriggers(triggers.filter(trigger => trigger.id !== triggerId));
  };

  return (
    <section style={styles.container} aria-labelledby="automation-triggers-title">
      <h2 id="automation-triggers-title" style={styles.title}>Automation Triggers</h2>
      
      <div style={styles.actions}>
        <button
          onClick={() => setIsCreating(!isCreating)}
          style={styles.button}
          aria-expanded={isCreating}
          aria-controls="create-trigger-form"
        >
          {isCreating ? 'Cancel' : '+ New Trigger'}
        </button>
      </div>

      {isCreating && (
        <form
          id="create-trigger-form"
          style={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            handleCreateTrigger();
          }}
          aria-label="Create new automation trigger"
        >
          <div style={styles.formGroup}>
            <label htmlFor="trigger-name" style={styles.label}>Name *</label>
            <input
              id="trigger-name"
              type="text"
              value={newTrigger.name}
              onChange={(e) => setNewTrigger({ ...newTrigger, name: e.target.value })}
              style={styles.input}
              placeholder="e.g., Send email on task completion"
              required
              aria-required="true"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="trigger-description" style={styles.label}>Description</label>
            <textarea
              id="trigger-description"
              value={newTrigger.description}
              onChange={(e) => setNewTrigger({ ...newTrigger, description: e.target.value })}
              style={styles.textarea}
              placeholder="Describe what this trigger does"
              rows={2}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="trigger-condition" style={styles.label}>Condition *</label>
            <input
              id="trigger-condition"
              type="text"
              value={newTrigger.condition}
              onChange={(e) => setNewTrigger({ ...newTrigger, condition: e.target.value })}
              style={styles.input}
              placeholder='e.g., status === "completed"'
              required
              aria-required="true"
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="trigger-action" style={styles.label}>Action</label>
            <input
              id="trigger-action"
              type="text"
              value={newTrigger.action}
              onChange={(e) => setNewTrigger({ ...newTrigger, action: e.target.value })}
              style={styles.input}
              placeholder="e.g., send_email, create_notification"
            />
          </div>
          <button type="submit" style={styles.buttonPrimary}>
            Create Trigger
          </button>
        </form>
      )}

      <div style={styles.triggerList} role="list" aria-label="Automation triggers">
        {triggers.length === 0 ? (
          <p style={styles.emptyState}>No automation triggers yet. Create your first one!</p>
        ) : (
          triggers.map((trigger) => (
            <article key={trigger.id} style={styles.triggerCard} role="listitem">
              <div style={styles.triggerHeader}>
                <div style={styles.triggerHeaderLeft}>
                  <h3 style={styles.triggerTitle}>{trigger.name}</h3>
                  <span
                    style={{
                      ...styles.statusBadge,
                      ...(trigger.enabled ? styles.statusEnabled : styles.statusDisabled),
                    }}
                    aria-label={`Status: ${trigger.enabled ? 'Enabled' : 'Disabled'}`}
                  >
                    {trigger.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <label style={styles.switchLabel}>
                  <input
                    type="checkbox"
                    checked={trigger.enabled}
                    onChange={() => handleToggleTrigger(trigger.id)}
                    style={styles.checkbox}
                    aria-label={`Toggle ${trigger.name}`}
                  />
                  <span style={styles.switchText}>Toggle</span>
                </label>
              </div>
              {trigger.description && (
                <p style={styles.triggerDescription}>{trigger.description}</p>
              )}
              <div style={styles.triggerDetails}>
                <div style={styles.detailItem}>
                  <strong style={styles.detailLabel}>Condition:</strong>
                  <code style={styles.code}>{trigger.condition}</code>
                </div>
                {trigger.action && (
                  <div style={styles.detailItem}>
                    <strong style={styles.detailLabel}>Action:</strong>
                    <code style={styles.code}>{trigger.action}</code>
                  </div>
                )}
              </div>
              <div style={styles.triggerFooter}>
                <button
                  onClick={() => handleDeleteTrigger(trigger.id)}
                  style={styles.deleteButton}
                  aria-label={`Delete trigger: ${trigger.name}`}
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
  triggerList: {
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
  triggerCard: {
    background: 'rgba(15, 23, 42, 0.5)',
    padding: '1.5rem',
    borderRadius: '8px',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  triggerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  triggerHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
  },
  triggerTitle: {
    fontSize: '1.1rem',
    color: '#e2e8f0',
    margin: 0,
  },
  statusBadge: {
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statusEnabled: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
  },
  statusDisabled: {
    background: 'rgba(148, 163, 184, 0.2)',
    color: '#94a3b8',
  },
  switchLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  checkbox: {
    cursor: 'pointer',
    width: '1.25rem',
    height: '1.25rem',
  },
  switchText: {
    color: '#cbd5e1',
    fontSize: '0.9rem',
  },
  triggerDescription: {
    color: '#cbd5e1',
    marginBottom: '1rem',
    lineHeight: '1.5',
  },
  triggerDetails: {
    marginBottom: '1rem',
  },
  detailItem: {
    marginBottom: '0.5rem',
  },
  detailLabel: {
    color: '#94a3b8',
    fontSize: '0.9rem',
    marginRight: '0.5rem',
  },
  code: {
    background: 'rgba(15, 23, 42, 0.8)',
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.875rem',
    color: '#a78bfa',
    fontFamily: 'monospace',
  },
  triggerFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
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
