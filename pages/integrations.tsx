import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navigation from '../components/Navigation';

interface Integration {
  id: string;
  name: string;
  description: string;
  status: 'connected' | 'disconnected' | 'error';
  icon: string;
  capabilities?: string[];
}

interface AutomationAction {
  integration: string;
  action: string;
  description: string;
  inputs: {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
  }[];
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'hubspot',
      name: 'HubSpot',
      description: 'CRM, marketing automation, and sales',
      status: 'disconnected',
      icon: '🧲',
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      description: 'Cloud-based CRM platform',
      status: 'disconnected',
      icon: '☁️',
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Cloud storage and document management',
      status: 'disconnected',
      icon: '📁',
    },
    {
      id: 'xero',
      name: 'Xero',
      description: 'Accounting and invoicing software',
      status: 'disconnected',
      icon: '💰',
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Workspace for notes, docs, and projects',
      status: 'disconnected',
      icon: '📝',
    },
    {
      id: 'asana',
      name: 'Asana',
      description: 'Project and task management',
      status: 'disconnected',
      icon: '✅',
    },
    {
      id: 'jira',
      name: 'Jira',
      description: 'Issue tracking and agile project management',
      status: 'disconnected',
      icon: '🎯',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send and manage emails with Google',
      status: 'disconnected',
      icon: '✉️',
    },
    {
      id: 'outlook',
      name: 'Outlook',
      description: 'Microsoft email and calendar service',
      status: 'disconnected',
      icon: '📬',
    },
    {
      id: 'crm',
      name: 'CRM (Legacy)',
      description: 'Manage contacts, deals, and companies',
      status: 'disconnected',
      icon: '👥',
    },
    {
      id: 'email',
      name: 'Email (Legacy)',
      description: 'Send emails and manage campaigns',

      name: 'Email (SMTP)',
      description: 'Send emails via SMTP server',

      status: 'disconnected',
      icon: '📧',
    },
    {
      id: 'gmail',
      name: 'Gmail',
      description: 'Send emails via Gmail API with OAuth2',
      status: 'disconnected',
      icon: '✉️',
    },
    {
      id: 'microsoft',
      name: 'Microsoft Outlook',
      description: 'Send emails via Microsoft Graph API with OAuth2',
      status: 'disconnected',
      icon: '📨',
    },
    {
      id: 'slack',
      name: 'Slack',
      description: 'Post messages and notifications',
      status: 'disconnected',
      icon: '💬',
    },
  ]);

  const [loading, setLoading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [automationInputs, setAutomationInputs] = useState<Record<string, string>>({});

  const automationActions: AutomationAction[] = [
    {
      integration: 'hubspot',
      action: 'create_contact',
      description: 'Create or update a contact in HubSpot',
      inputs: [
        { name: 'email', label: 'Email', type: 'email', placeholder: 'contact@example.com' },
        { name: 'firstname', label: 'First Name', type: 'text', placeholder: 'John' },
        { name: 'lastname', label: 'Last Name', type: 'text', placeholder: 'Doe' },
      ],
    },
    {
      integration: 'salesforce',
      action: 'create_lead',
      description: 'Create a lead in Salesforce',
      inputs: [
        { name: 'email', label: 'Email', type: 'email', placeholder: 'lead@example.com' },
        { name: 'firstname', label: 'First Name', type: 'text', placeholder: 'Jane' },
        { name: 'lastname', label: 'Last Name', type: 'text', placeholder: 'Smith' },
        { name: 'company', label: 'Company', type: 'text', placeholder: 'Acme Corp' },
      ],
    },
    {
      integration: 'google-drive',
      action: 'create_document',
      description: 'Create a new document in Google Drive',
      inputs: [
        { name: 'title', label: 'Document Title', type: 'text', placeholder: 'My Document' },
        { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Document content...' },
      ],
    },
    {
      integration: 'xero',
      action: 'create_invoice',
      description: 'Create an invoice in Xero',
      inputs: [
        { name: 'contact', label: 'Customer', type: 'text', placeholder: 'Customer Name' },
        { name: 'amount', label: 'Amount', type: 'text', placeholder: '100.00' },
        { name: 'description', label: 'Description', type: 'text', placeholder: 'Invoice description' },
      ],
    },
    {
      integration: 'notion',
      action: 'create_page',
      description: 'Create a new page in Notion',
      inputs: [
        { name: 'title', label: 'Page Title', type: 'text', placeholder: 'My Page' },
        { name: 'content', label: 'Content', type: 'textarea', placeholder: 'Page content...' },
      ],
    },
    {
      integration: 'asana',
      action: 'create_task',
      description: 'Create a task in Asana',
      inputs: [
        { name: 'name', label: 'Task Name', type: 'text', placeholder: 'Complete project' },
        { name: 'notes', label: 'Description', type: 'textarea', placeholder: 'Task details...' },
        { name: 'due_on', label: 'Due Date', type: 'text', placeholder: '2024-12-31' },
      ],
    },
    {
      integration: 'jira',
      action: 'create_issue',
      description: 'Create an issue in Jira',
      inputs: [
        { name: 'summary', label: 'Summary', type: 'text', placeholder: 'Bug in login' },
        { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Issue details...' },
        { name: 'type', label: 'Type', type: 'text', placeholder: 'Bug' },
      ],
    },
    {
      integration: 'gmail',
      action: 'send',
      description: 'Send an email via Gmail',
      inputs: [
        { name: 'recipient', label: 'To', type: 'email', placeholder: 'recipient@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body...' },
      ],
    },
    {
      integration: 'outlook',
      action: 'send',
      description: 'Send an email via Outlook',
      inputs: [
        { name: 'recipient', label: 'To', type: 'email', placeholder: 'recipient@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body...' },
      ],
    },
    {
      integration: 'crm',
      action: 'update_contact',
      description: 'Update a contact record (Legacy)',
      inputs: [
        { name: 'entity_type', label: 'Entity Type', type: 'select', placeholder: 'contact' },
        { name: 'contact_name', label: 'Contact Name', type: 'text', placeholder: 'John Doe' },
        { name: 'email', label: 'Email', type: 'email', placeholder: 'john@example.com' },
      ],
    },
    {
      integration: 'email',
      action: 'send',

      description: 'Send an email (Legacy)',

      description: 'Send an email via SMTP',
      inputs: [
        { name: 'recipient', label: 'Recipient', type: 'email', placeholder: 'recipient@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body' },
      ],
    },
    {
      integration: 'gmail',
      action: 'send',
      description: 'Send an email via Gmail API',
      inputs: [
        { name: 'recipient', label: 'Recipient', type: 'email', placeholder: 'recipient@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body' },
      ],
    },
    {
      integration: 'microsoft',
      action: 'send',
      description: 'Send an email via Microsoft Graph API',

      inputs: [
        { name: 'recipient', label: 'Recipient', type: 'email', placeholder: 'recipient@example.com' },
        { name: 'subject', label: 'Subject', type: 'text', placeholder: 'Email subject' },
        { name: 'body', label: 'Body', type: 'textarea', placeholder: 'Email body' },
      ],
    },
    {
      integration: 'slack',
      action: 'post_message',
      description: 'Post a message to Slack',
      inputs: [
        { name: 'channel', label: 'Channel', type: 'text', placeholder: '#general' },
        { name: 'message', label: 'Message', type: 'textarea', placeholder: 'Your message here' },
      ],
    },
  ];

  useEffect(() => {
    // Check for OAuth callback messages in URL
    const params = new URLSearchParams(window.location.search);
    const connected = params.get('connected');
    const error = params.get('error');
    
    if (connected) {
      setMessage({
        type: 'success',
        text: `${connected.toUpperCase()} connected successfully!`,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/integrations');
    } else if (error) {
      setMessage({
        type: 'error',
        text: `Failed to connect ${error.toUpperCase()}. Please try again.`,
      });
      // Clean up URL
      window.history.replaceState({}, '', '/integrations');
    }
    
    // Fetch integration statuses on mount
    const fetchStatuses = async () => {
      const updatedIntegrations: Integration[] = await Promise.all(
        integrations.map(async (integration) => {
          try {
            // Gmail and Microsoft use the email endpoint
            const endpoint = (integration.id === 'gmail' || integration.id === 'microsoft') 
              ? '/api/integrations/email' 
              : `/api/integrations/${integration.id}`;
            
            const response = await fetch(endpoint);
            if (response.ok) {
              const data = await response.json();
              
              // Handle OAuth2 status for Gmail
              if (integration.id === 'gmail') {
                const isConnected = data.oauth2?.gmail_connected || false;
                return {
                  ...integration,
                  status: (isConnected ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
                  capabilities: isConnected ? ['Send emails via Gmail API', 'OAuth2 authenticated'] : undefined,
                };
              }
              
              // Handle OAuth2 status for Microsoft
              if (integration.id === 'microsoft') {
                const isConnected = data.oauth2?.microsoft_connected || false;
                return {
                  ...integration,
                  status: (isConnected ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
                  capabilities: isConnected ? ['Send emails via Microsoft Graph API', 'OAuth2 authenticated'] : undefined,
                };
              }
              
              // Default handling for other integrations
              return {
                ...integration,
                status: data.status as 'connected' | 'disconnected',
                capabilities: data.capabilities,
              };
            }
            return integration;
          } catch {
            return { ...integration, status: 'error' as const };
          }
        })
      );
      setIntegrations(updatedIntegrations);
    };
    
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleConnect = async (integrationId: string) => {
    setLoading(integrationId);
    setMessage(null);

    try {

      const response = await fetch(`/api/integrations/${integrationId}?action=connect`);
      if (response.ok) {
        const data = await response.json();
        
        // Check if OAuth redirect is required
        if (data.status === 'redirect' && data.auth_url) {
          // Redirect to OAuth authorization page
          window.location.href = data.auth_url;
          return;
        }
        
        setIntegrations(
          integrations.map((integration) =>
            integration.id === integrationId
              ? { ...integration, status: 'connected', capabilities: data.capabilities }
              : integration
          )
        );
        
        const mode = data.configured ? 'PRODUCTION' : 'DEMO';
        const modeMessage = data.configured 
          ? 'with real credentials' 
          : 'in demo mode (configure API keys in .env.local for real integration)';
        
        setMessage({
          type: 'success',
          text: `${integrationId.toUpperCase()} connected successfully ${modeMessage} [${mode}]`,
        });

      // Handle OAuth2 flows for Gmail and Microsoft
      if (integrationId === 'gmail') {
        const response = await fetch(`/api/integrations/email?action=oauth_gmail`);
        if (response.ok) {
          const data = await response.json();
          if (data.auth_url) {
            // Open OAuth2 authorization URL in a popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            const popup = window.open(
              data.auth_url,
              'Gmail Authorization',
              `width=${width},height=${height},left=${left},top=${top}`
            );
            
            // Poll for popup closure or listen for callback
            const checkPopup = setInterval(() => {
              if (popup && popup.closed) {
                clearInterval(checkPopup);
                // Refresh integration status
                fetchIntegrationStatus('gmail');
                setMessage({
                  type: 'success',
                  text: 'Gmail authorization window closed. Check connection status.',
                });
              }
            }, 500);
          } else {
            // Demo mode
            setIntegrations(
              integrations.map((integration) =>
                integration.id === 'gmail'
                  ? { ...integration, status: 'connected', capabilities: ['Send emails via Gmail API', 'OAuth2 authenticated'] }
                  : integration
              )
            );
            setMessage({
              type: 'success',
              text: 'Gmail connected in DEMO mode. Configure GMAIL_CLIENT_ID and GMAIL_CLIENT_SECRET for real integration.',
            });
          }
        }
      } else if (integrationId === 'microsoft') {
        const response = await fetch(`/api/integrations/email?action=oauth_microsoft`);
        if (response.ok) {
          const data = await response.json();
          if (data.auth_url) {
            // Open OAuth2 authorization URL in a popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            const popup = window.open(
              data.auth_url,
              'Microsoft Authorization',
              `width=${width},height=${height},left=${left},top=${top}`
            );
            
            // Poll for popup closure or listen for callback
            const checkPopup = setInterval(() => {
              if (popup && popup.closed) {
                clearInterval(checkPopup);
                // Refresh integration status
                fetchIntegrationStatus('microsoft');
                setMessage({
                  type: 'success',
                  text: 'Microsoft authorization window closed. Check connection status.',
                });
              }
            }, 500);
          } else {
            // Demo mode
            setIntegrations(
              integrations.map((integration) =>
                integration.id === 'microsoft'
                  ? { ...integration, status: 'connected', capabilities: ['Send emails via Microsoft Graph API', 'OAuth2 authenticated'] }
                  : integration
              )
            );
            setMessage({
              type: 'success',
              text: 'Microsoft connected in DEMO mode. Configure MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET for real integration.',
            });
          }
        }

      } else {
        // Standard connection flow for other integrations
        const response = await fetch(`/api/integrations/${integrationId}?action=connect`);
        if (response.ok) {
          const data = await response.json();
          setIntegrations(
            integrations.map((integration) =>
              integration.id === integrationId
                ? { ...integration, status: 'connected', capabilities: data.capabilities }
                : integration
            )
          );
          
          const mode = data.configured ? 'PRODUCTION' : 'DEMO';
          const modeMessage = data.configured 
            ? 'with real credentials' 
            : 'in demo mode (configure API keys in .env.local for real integration)';
          
          setMessage({
            type: 'success',
            text: `${integrationId.toUpperCase()} connected successfully ${modeMessage} [${mode}]`,
          });
        } else {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to connect');
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to connect ${integrationId.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const fetchIntegrationStatus = async (integrationId: string) => {
    try {
      const endpoint = integrationId === 'gmail' || integrationId === 'microsoft' 
        ? '/api/integrations/email' 
        : `/api/integrations/${integrationId}`;
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        // For Gmail and Microsoft, check OAuth2 status
        if (integrationId === 'gmail' && data.oauth2?.gmail_connected) {
          setIntegrations(prev =>
            prev.map(int =>
              int.id === 'gmail'
                ? { ...int, status: 'connected', capabilities: ['Send emails via Gmail API', 'OAuth2 authenticated'] }
                : int
            )
          );
        } else if (integrationId === 'microsoft' && data.oauth2?.microsoft_connected) {
          setIntegrations(prev =>
            prev.map(int =>
              int.id === 'microsoft'
                ? { ...int, status: 'connected', capabilities: ['Send emails via Microsoft Graph API', 'OAuth2 authenticated'] }
                : int
            )
          );
        }
      }
    } catch (error) {
      console.error('Failed to fetch integration status:', error);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    setLoading(integrationId);
    setMessage(null);

    try {
      // Handle disconnect for Gmail and Microsoft OAuth2
      let endpoint = `/api/integrations/${integrationId}?action=disconnect`;
      if (integrationId === 'gmail') {
        endpoint = '/api/integrations/email?action=disconnect_gmail';
      } else if (integrationId === 'microsoft') {
        endpoint = '/api/integrations/email?action=disconnect_microsoft';
      }
      
      const response = await fetch(endpoint);
      if (response.ok) {
        setIntegrations(
          integrations.map((integration) =>
            integration.id === integrationId ? { ...integration, status: 'disconnected' } : integration
          )
        );
        setMessage({
          type: 'success',
          text: `${integrationId.toUpperCase()} disconnected successfully!`,
        });
      } else {
        throw new Error('Failed to disconnect');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to disconnect ${integrationId.toUpperCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleRunAutomation = async () => {
    if (!selectedIntegration) return;

    setLoading('automation');
    setMessage(null);

    const action = automationActions.find((a) => a.integration === selectedIntegration);
    if (!action) return;

    try {
      // Determine the API endpoint and provider
      let endpoint = `/api/integrations/${selectedIntegration}`;
      let provider = selectedIntegration;
      
      if (selectedIntegration === 'gmail' || selectedIntegration === 'microsoft') {
        endpoint = '/api/integrations/email';
        provider = selectedIntegration;
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.action,
          provider: provider,
          ...automationInputs,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const mode = data.details?.mode || 'unknown';
        const modeLabel = mode === 'production' ? '[LIVE]' : '[DEMO]';
        
        setMessage({
          type: 'success',
          text: `${modeLabel} Automation executed successfully! ${data.message}`,
        });
        setAutomationInputs({});
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to execute automation');
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: `Failed to execute automation: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    } finally {
      setLoading(null);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setAutomationInputs({ ...automationInputs, [name]: value });
  };

  const currentAction = automationActions.find((a) => a.integration === selectedIntegration);

  return (
    <>
      <Head>
        <title>Integrations - ProSprint 2.0</title>
        <meta name="description" content="Connect external apps and run automations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div style={styles.page}>
        <Navigation />
        <main style={styles.main}>
          <div style={styles.container}>
            <header style={styles.header}>
              <h1 style={styles.title}>Integrations</h1>
              <p style={styles.subtitle}>
                Connect external apps and run automations to streamline your workflow
              </p>
            </header>

            {message && (
              <div
                style={{
                  ...styles.message,
                  ...(message.type === 'error' ? styles.messageError : styles.messageSuccess),
                }}
                role="alert"
                aria-live="polite"
              >
                {message.text}
              </div>
            )}

            <section style={styles.section} aria-labelledby="available-integrations">
              <h2 id="available-integrations" style={styles.sectionTitle}>
                Available Integrations
              </h2>
              <div style={styles.integrationGrid}>
                {integrations.map((integration) => (
                  <article key={integration.id} style={styles.integrationCard}>
                    <div style={styles.integrationHeader}>
                      <div style={styles.integrationIcon} aria-hidden="true">
                        {integration.icon}
                      </div>
                      <div style={styles.integrationInfo}>
                        <h3 style={styles.integrationName}>{integration.name}</h3>
                        <p style={styles.integrationDescription}>{integration.description}</p>
                      </div>
                    </div>
                    <div
                      style={{
                        ...styles.statusBadge,
                        ...(integration.status === 'connected'
                          ? styles.statusConnected
                          : integration.status === 'error'
                          ? styles.statusError
                          : styles.statusDisconnected),
                      }}
                      role="status"
                    >
                      {integration.status}
                    </div>
                    {integration.capabilities && integration.status === 'connected' && (
                      <div style={styles.capabilities}>
                        <p style={styles.capabilitiesLabel}>Capabilities:</p>
                        <ul style={styles.capabilitiesList}>
                          {integration.capabilities.map((capability, index) => (
                            <li key={index}>{capability}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div style={styles.integrationActions}>
                      {integration.status === 'connected' ? (
                        <button
                          onClick={() => handleDisconnect(integration.id)}
                          disabled={loading === integration.id}
                          style={styles.buttonSecondary}
                          aria-label={`Disconnect ${integration.name}`}
                        >
                          {loading === integration.id ? 'Disconnecting...' : 'Disconnect'}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConnect(integration.id)}
                          disabled={loading === integration.id}
                          style={styles.buttonPrimary}
                          aria-label={`Connect ${integration.name}`}
                        >
                          {loading === integration.id ? 'Connecting...' : 'Connect'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section style={styles.section} aria-labelledby="automation-triggers">
              <h2 id="automation-triggers" style={styles.sectionTitle}>
                Run Automations
              </h2>
              <div style={styles.automationCard}>
                <div style={styles.formGroup}>
                  <label htmlFor="integration-select" style={styles.label}>
                    Select Integration
                  </label>
                  <select
                    id="integration-select"
                    value={selectedIntegration || ''}
                    onChange={(e) => {
                      setSelectedIntegration(e.target.value);
                      setAutomationInputs({});
                    }}
                    style={styles.select}
                    aria-label="Select integration for automation"
                  >
                    <option value="">-- Choose an integration --</option>
                    {integrations
                      .filter((i) => i.status === 'connected')
                      .map((integration) => (
                        <option key={integration.id} value={integration.id}>
                          {integration.name}
                        </option>
                      ))}
                  </select>
                </div>

                {currentAction && (
                  <>
                    <div style={styles.actionInfo}>
                      <h3 style={styles.actionTitle}>{currentAction.description}</h3>
                    </div>
                    <div style={styles.formFields}>
                      {currentAction.inputs.map((input) => (
                        <div key={input.name} style={styles.formGroup}>
                          <label htmlFor={input.name} style={styles.label}>
                            {input.label}
                          </label>
                          {input.type === 'textarea' ? (
                            <textarea
                              id={input.name}
                              value={automationInputs[input.name] || ''}
                              onChange={(e) => handleInputChange(input.name, e.target.value)}
                              placeholder={input.placeholder}
                              style={styles.textarea}
                              rows={4}
                              aria-label={input.label}
                            />
                          ) : input.type === 'select' ? (
                            <select
                              id={input.name}
                              value={automationInputs[input.name] || 'contact'}
                              onChange={(e) => handleInputChange(input.name, e.target.value)}
                              style={styles.select}
                              aria-label={input.label}
                            >
                              <option value="contact">Contact</option>
                              <option value="deal">Deal</option>
                              <option value="company">Company</option>
                            </select>
                          ) : (
                            <input
                              id={input.name}
                              type={input.type}
                              value={automationInputs[input.name] || ''}
                              onChange={(e) => handleInputChange(input.name, e.target.value)}
                              placeholder={input.placeholder}
                              style={styles.input}
                              aria-label={input.label}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleRunAutomation}
                      disabled={loading === 'automation'}
                      style={styles.buttonPrimary}
                      aria-label="Execute automation"
                    >
                      {loading === 'automation' ? 'Running...' : 'Run Automation'}
                    </button>
                  </>
                )}

                {!currentAction && selectedIntegration && (
                  <p style={styles.infoText}>No automation actions available for this integration.</p>
                )}

                {!selectedIntegration && (
                  <p style={styles.infoText}>
                    Select a connected integration to run automations.
                  </p>
                )}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(to bottom, #0f172a, #1e293b)',
    color: '#f1f5f9',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  main: {
    padding: '2rem',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '2rem',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '0.5rem',
    background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  subtitle: {
    fontSize: '1.1rem',
    color: '#94a3b8',
  },
  message: {
    padding: '1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontSize: '0.95rem',
  },
  messageSuccess: {
    background: 'rgba(34, 197, 94, 0.15)',
    border: '1px solid rgba(34, 197, 94, 0.3)',
    color: '#86efac',
  },
  messageError: {
    background: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    color: '#fca5a5',
  },
  section: {
    marginBottom: '3rem',
  },
  sectionTitle: {
    fontSize: '1.75rem',
    marginBottom: '1.5rem',
    color: '#e2e8f0',
  },
  integrationGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  integrationCard: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '1.5rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  integrationHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  integrationIcon: {
    fontSize: '2.5rem',
    flexShrink: 0,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationName: {
    fontSize: '1.25rem',
    fontWeight: 'bold',
    marginBottom: '0.25rem',
    color: '#e2e8f0',
  },
  integrationDescription: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    margin: 0,
  },
  statusBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
  },
  statusConnected: {
    background: 'rgba(34, 197, 94, 0.2)',
    color: '#86efac',
  },
  statusDisconnected: {
    background: 'rgba(148, 163, 184, 0.2)',
    color: '#cbd5e1',
  },
  statusError: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
  },
  capabilities: {
    marginTop: '0.5rem',
  },
  capabilitiesLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: '#cbd5e1',
    marginBottom: '0.5rem',
  },
  capabilitiesList: {
    margin: 0,
    paddingLeft: '1.5rem',
    fontSize: '0.85rem',
    color: '#94a3b8',
  },
  integrationActions: {
    marginTop: 'auto',
  },
  automationCard: {
    background: 'rgba(30, 41, 59, 0.8)',
    borderRadius: '12px',
    padding: '2rem',
    border: '1px solid rgba(148, 163, 184, 0.2)',
  },
  formGroup: {
    marginBottom: '1.5rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#cbd5e1',
  },
  select: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#e2e8f0',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#e2e8f0',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(30, 41, 59, 0.9)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  actionInfo: {
    marginBottom: '1.5rem',
  },
  actionTitle: {
    fontSize: '1.1rem',
    color: '#e2e8f0',
    marginBottom: '0.5rem',
  },
  formFields: {
    marginBottom: '1.5rem',
  },
  infoText: {
    color: '#94a3b8',
    textAlign: 'center',
    padding: '2rem',
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
    width: '100%',
  },
  buttonSecondary: {
    padding: '0.75rem 1.5rem',
    borderRadius: '6px',
    border: '1px solid #475569',
    background: 'rgba(51, 65, 85, 0.8)',
    color: '#e2e8f0',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '100%',
  },
};
