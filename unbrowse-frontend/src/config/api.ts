const API_BASE = window.location.origin;

export interface Skill {
  domain: string;
  name: string;
  description: string;
  endpoints: number;
  authMethod: string;
  tags?: string[];
  abilities?: Ability[];
}

export interface Ability {
  id: string;
  name: string;
  method: string;
  path: string;
  description?: string;
}

export interface Stats {
  totalSkills: number;
  totalAbilities: number;
  totalExecutions: number;
  avgResponseTime: number;
}

export interface ExecutionResult {
  success: boolean;
  data: any;
  timing: number;
  statusCode?: number;
  error?: string;
}

export const api = {
  async searchSkills(query: string = ''): Promise<Skill[]> {
    try {
      const url = query 
        ? `${API_BASE}/api/marketplace/search?q=${encodeURIComponent(query)}`
        : `${API_BASE}/api/marketplace/search`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch skills');
      return await response.json();
    } catch (error) {
      console.error('Search skills error:', error);
      return [];
    }
  },

  async getStats(): Promise<Stats> {
    try {
      const response = await fetch(`${API_BASE}/api/stats`);
      if (!response.ok) throw new Error('Failed to fetch stats');
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      return {
        totalSkills: 0,
        totalAbilities: 0,
        totalExecutions: 0,
        avgResponseTime: 0,
      };
    }
  },

  async executeAbility(
    domain: string,
    abilityId: string,
    params?: Record<string, any>
  ): Promise<ExecutionResult> {
    try {
      const startTime = performance.now();
      const response = await fetch(`${API_BASE}/api/execution/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain,
          abilityId,
          params: params || {},
        }),
      });
      
      const timing = Math.round(performance.now() - startTime);
      const data = await response.json();
      
      return {
        success: response.ok,
        data,
        timing,
        statusCode: response.status,
        error: response.ok ? undefined : data.error || 'Execution failed',
      };
    } catch (error) {
      console.error('Execute ability error:', error);
      return {
        success: false,
        data: null,
        timing: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async ingestSkill(domain: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE}/api/marketplace/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain }),
      });
      
      const data = await response.json();
      return {
        success: response.ok,
        message: data.message || (response.ok ? 'Skill ingested successfully' : 'Failed to ingest skill'),
      };
    } catch (error) {
      console.error('Ingest skill error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },
};
