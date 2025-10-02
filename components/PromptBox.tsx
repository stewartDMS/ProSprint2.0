import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function PromptBox() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      // Sample implementation - In production, you'd use actual OpenAI API
      // This demonstrates the structure for calling the API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'YOUR_API_KEY'}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        // For demo purposes, fall back to mock response
        throw new Error('API key not configured - using demo mode');
      }

      const data = await response.json();
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.choices[0].message.content,
        timestamp: new Date(),
      };

      setMessages([...messages, userMessage, assistantMessage]);
    } catch {
      // Demo fallback response
      const demoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Demo response: I received your message "${prompt}". To use real AI responses, please configure your OpenAI API key in the environment variables (NEXT_PUBLIC_OPENAI_API_KEY).`,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage, demoMessage]);
      setError('Running in demo mode. Configure NEXT_PUBLIC_OPENAI_API_KEY for real AI responses.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
  };

  return (
    <section style={styles.container} aria-labelledby="prompt-box-title">
      <h2 id="prompt-box-title" style={styles.title}>AI Assistant</h2>
      <p style={styles.subtitle}>
        Ask questions or get help with your business automation
      </p>

      {error && (
        <div style={styles.infoBox} role="status" aria-live="polite">
          <strong>Note:</strong> {error}
        </div>
      )}

      <div style={styles.chatContainer} role="log" aria-label="Chat messages" aria-live="polite">
        {messages.length === 0 ? (
          <div style={styles.emptyState}>
            <p>Start a conversation! Ask me anything about business automation.</p>
            <div style={styles.examplePrompts}>
              <p style={styles.exampleLabel}>Try asking:</p>
              <ul style={styles.exampleList}>
                <li>&quot;How can I automate my email workflows?&quot;</li>
                <li>&quot;What are best practices for task management?&quot;</li>
                <li>&quot;Help me set up automation triggers&quot;</li>
              </ul>
            </div>
          </div>
        ) : (
          <div style={styles.messageList}>
            {messages.map((message) => (
              <article
                key={message.id}
                style={{
                  ...styles.message,
                  ...(message.role === 'user' ? styles.messageUser : styles.messageAssistant),
                }}
                aria-label={`${message.role} message`}
              >
                <div style={styles.messageHeader}>
                  <strong style={styles.messageRole}>
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </strong>
                  <span style={styles.messageTime}>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <p style={styles.messageContent}>{message.content}</p>
              </article>
            ))}
            {loading && (
              <div style={styles.loadingMessage} aria-label="Loading response">
                <span style={styles.loadingDot}>●</span>
                <span style={styles.loadingDot}>●</span>
                <span style={styles.loadingDot}>●</span>
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form} aria-label="Send message">
        <div style={styles.inputGroup}>
          <label htmlFor="prompt-input" style={styles.visuallyHidden}>
            Enter your message
          </label>
          <textarea
            id="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your message here..."
            style={styles.textarea}
            rows={3}
            disabled={loading}
            aria-label="Message input"
          />
        </div>
        <div style={styles.buttonGroup}>
          <button
            type="button"
            onClick={handleClear}
            style={styles.button}
            disabled={loading || messages.length === 0}
            aria-label="Clear conversation"
          >
            Clear
          </button>
          <button
            type="submit"
            style={styles.buttonPrimary}
            disabled={loading || !prompt.trim()}
            aria-label="Send message"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
      </form>
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
    marginBottom: '0.5rem',
    color: '#e2e8f0',
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  infoBox: {
    background: 'rgba(96, 165, 250, 0.1)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    borderRadius: '8px',
    padding: '1rem',
    marginBottom: '1rem',
    color: '#93c5fd',
    fontSize: '0.9rem',
  },
  chatContainer: {
    minHeight: '400px',
    maxHeight: '500px',
    overflowY: 'auto',
    background: 'rgba(15, 23, 42, 0.5)',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    border: '1px solid rgba(148, 163, 184, 0.1)',
  },
  emptyState: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: '2rem',
  },
  examplePrompts: {
    marginTop: '2rem',
    textAlign: 'left',
    maxWidth: '500px',
    margin: '2rem auto 0',
  },
  exampleLabel: {
    color: '#cbd5e1',
    fontWeight: '600',
    marginBottom: '0.5rem',
  },
  exampleList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  messageList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    maxWidth: '85%',
  },
  messageUser: {
    background: 'rgba(96, 165, 250, 0.15)',
    border: '1px solid rgba(96, 165, 250, 0.3)',
    alignSelf: 'flex-end',
    marginLeft: 'auto',
  },
  messageAssistant: {
    background: 'rgba(167, 139, 250, 0.15)',
    border: '1px solid rgba(167, 139, 250, 0.3)',
    alignSelf: 'flex-start',
  },
  messageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
    gap: '1rem',
  },
  messageRole: {
    color: '#e2e8f0',
    fontSize: '0.9rem',
  },
  messageTime: {
    color: '#94a3b8',
    fontSize: '0.75rem',
  },
  messageContent: {
    color: '#cbd5e1',
    lineHeight: '1.6',
    margin: 0,
    whiteSpace: 'pre-wrap',
  },
  loadingMessage: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1rem',
    justifyContent: 'center',
  },
  loadingDot: {
    color: '#a78bfa',
    animation: 'pulse 1.5s ease-in-out infinite',
    fontSize: '1.5rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputGroup: {
    width: '100%',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0, 0, 0, 0)',
    whiteSpace: 'nowrap',
    border: 0,
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
  buttonGroup: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'flex-end',
  },
  button: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
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
};
