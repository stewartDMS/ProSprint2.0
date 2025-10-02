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
    const currentPrompt = prompt;
    setPrompt('');
    setLoading(true);
    setError(null);

    try {
      // Try to trigger automation based on prompt keywords
      const automationTriggered = await tryAutomation(currentPrompt);

      // Call our secure API route which handles OpenAI requests server-side
      const response = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: currentPrompt },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();

      // Check if we're in demo mode
      if ('demoMode' in data && data.demoMode) {
        throw new Error('demo_mode');
      }

      // Check for errors
      if ('error' in data) {
        throw new Error(data.error);
      }

      // Success - display AI response
      let content = data.choices[0].message.content;
      if (automationTriggered) {
        content += `\n\n✅ Automation triggered: ${automationTriggered}`;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content,
        timestamp: new Date(),
      };

      setMessages([...messages, userMessage, assistantMessage]);
      setError(null);
    } catch (err) {
      // Demo fallback response
      let demoContent = `Demo response: I received your message "${currentPrompt}". To use real AI responses, please configure your OpenAI API key in .env.local (OPENAI_API_KEY).`;
      
      // Try automation even in demo mode
      const automationTriggered = await tryAutomation(currentPrompt);
      if (automationTriggered) {
        demoContent += `\n\n✅ Automation triggered: ${automationTriggered}`;
      }

      const demoMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: demoContent,
        timestamp: new Date(),
      };
      setMessages([...messages, userMessage, demoMessage]);
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      if (errorMessage === 'demo_mode') {
        setError('Running in demo mode. Add OPENAI_API_KEY to .env.local for real AI responses.');
      } else {
        setError(`Error: ${errorMessage}. Running in demo mode.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const tryAutomation = async (promptText: string): Promise<string | null> => {
    const lowerPrompt = promptText.toLowerCase();
    
    // Detect task type and integration based on keywords
    let integration = null;
    let action = null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const extractedData: Record<string, any> = {};
    
    // Email detection
    if (lowerPrompt.includes('email') || lowerPrompt.includes('send email')) {
      integration = 'email';
      action = 'send';
      
      // Try to extract recipient, subject from the prompt
      const emailMatch = lowerPrompt.match(/to\s+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
      if (emailMatch) {
        extractedData.recipient = emailMatch[1];
      } else {
        extractedData.recipient = 'team@example.com';
      }
      
      // Extract subject if mentioned
      const subjectMatch = lowerPrompt.match(/about\s+(.+)/);
      if (subjectMatch) {
        extractedData.subject = subjectMatch[1].trim();
      } else {
        extractedData.subject = 'Automated notification';
      }
      
      extractedData.body = promptText;
    } 
    // Slack detection
    else if (lowerPrompt.includes('slack') || lowerPrompt.includes('post to slack') || 
             (lowerPrompt.includes('notify') && lowerPrompt.includes('team'))) {
      integration = 'slack';
      action = 'post_message';
      
      // Extract channel if mentioned
      const channelMatch = lowerPrompt.match(/#([a-z0-9-]+)/);
      if (channelMatch) {
        extractedData.channel = '#' + channelMatch[1];
      } else {
        extractedData.channel = '#general';
      }
      
      // Extract message
      const aboutMatch = lowerPrompt.match(/about\s+(.+)/);
      if (aboutMatch) {
        extractedData.message = aboutMatch[1].trim();
      } else {
        extractedData.message = promptText;
      }
    }
    // CRM detection
    else if (lowerPrompt.includes('crm') || lowerPrompt.includes('contact') || 
             lowerPrompt.includes('customer') || lowerPrompt.includes('update contact')) {
      integration = 'crm';
      action = 'update_contact';
      
      extractedData.entity_type = 'contact';
      
      // Try to extract contact name
      const nameMatch = lowerPrompt.match(/contact\s+(?:for\s+)?([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
      if (nameMatch) {
        extractedData.contact_name = nameMatch[1];
      }
      
      extractedData.data = {
        prompt: promptText,
        timestamp: new Date().toISOString()
      };
    }
    
    if (!integration || !action) {
      return null;
    }
    
    try {
      // Call the integration endpoint directly
      const response = await fetch(`/api/integrations/${integration}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action,
          ...extractedData,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        const mode = data.details?.mode || 'demo';
        return `${integration.toUpperCase()} automation triggered ${mode === 'production' ? '(LIVE)' : '(DEMO)'} - ${data.message}`;
      } else {
        const errorData = await response.json();
        return `${integration.toUpperCase()} automation failed: ${errorData.message}`;
      }
    } catch (error) {
      // Silent fail - automation is optional
      console.error('Automation trigger failed:', error);
      return null;
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
                <li>&quot;Send an email to the sales team&quot;</li>
                <li>&quot;Post a message to Slack about our deployment&quot;</li>
                <li>&quot;Update CRM contact information&quot;</li>
                <li>&quot;How can I automate my email workflows?&quot;</li>
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
