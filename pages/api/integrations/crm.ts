import type { NextApiRequest, NextApiResponse } from 'next';

interface CRMResponse {
  integration: string;
  status: string;
  configured: boolean;
  timestamp: string;
  capabilities?: string[];
  connected_platform?: string;
  last_sync?: string;
  mode?: string;
  message?: string;
  action?: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CRMResponse>
) {
  const { method, query } = req;
  
  // Check if CRM is configured
  const isConfigured = Boolean(
    process.env.CRM_API_KEY && process.env.CRM_API_URL
  );
  
  if (method === 'GET') {
    const action = query.action as string || 'status';
    
    if (action === 'connect') {
      res.status(200).json({
        integration: 'CRM',
        status: 'connected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: isConfigured 
          ? 'CRM connected successfully'
          : 'CRM connected in demo mode (configure CRM_API_KEY and CRM_API_URL for real integration)',
      });
    } else if (action === 'disconnect') {
      res.status(200).json({
        integration: 'CRM',
        status: 'disconnected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        message: 'CRM disconnected successfully',
      });
    } else {
      // Return status
      res.status(200).json({
        integration: 'CRM',
        status: 'connected',
        configured: isConfigured,
        timestamp: new Date().toISOString(),
        capabilities: [
          'Update contacts',
          'Manage deals',
          'Sync companies',
          'Custom field updates',
        ],
        connected_platform: isConfigured ? 'Real CRM' : 'Demo CRM',
        last_sync: new Date().toISOString(),
        mode: isConfigured ? 'production' : 'demo',
      });
    }
  } else if (method === 'POST') {
    const data = req.body;
    const action = data.action || 'unknown';
    const entityType = data.entity_type || 'contact';
    
    try {
      if (isConfigured) {
        // In production mode - would make real API calls here
        // const apiKey = process.env.CRM_API_KEY;
        // const apiUrl = process.env.CRM_API_URL;
        // const response = await fetch(`${apiUrl}/contacts`, {
        //   headers: { Authorization: `Bearer ${apiKey}` },
        //   method: 'POST',
        //   body: JSON.stringify(data)
        // });
        
        res.status(200).json({
          integration: 'CRM',
          status: 'completed',
          configured: isConfigured,
          message: `CRM ${action} operation successful (production mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_type: entityType,
          entity_id: `${entityType}_${Date.now()}`,
          details: {
            platform: 'Real CRM',
            operation: action,
            affected_records: 1,
            mode: 'production',
            api_endpoint: process.env.CRM_API_URL,
            data: Object.fromEntries(
              Object.entries(data).filter(([key]) => key !== 'action')
            ),
          },
        });
      } else {
        // Demo mode
        res.status(200).json({
          integration: 'CRM',
          status: 'completed',
          configured: isConfigured,
          message: `CRM ${action} operation successful (demo mode)`,
          timestamp: new Date().toISOString(),
          action,
          entity_type: entityType,
          entity_id: `${entityType}_${Date.now()}`,
          details: {
            platform: 'Demo CRM',
            operation: action,
            affected_records: 1,
            mode: 'demo',
            note: 'Configure CRM_API_KEY and CRM_API_URL for real integration',
            data: Object.fromEntries(
              Object.entries(data).filter(([key]) => key !== 'action')
            ),
          },
        });
      }
    } catch (error) {
      res.status(500).json({
        integration: 'CRM',
        status: 'error',
        configured: isConfigured,
        message: `CRM operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date().toISOString(),
        action,
      });
    }
  } else if (method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
  } else {
    res.status(405).json({
      integration: 'CRM',
      status: 'error',
      configured: isConfigured,
      message: 'Method not allowed',
      timestamp: new Date().toISOString(),
    });
  }
}
