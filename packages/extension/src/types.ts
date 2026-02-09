export interface HarEntry {
  url: string;
  method: string;
  status: number;
  requestHeaders: Record<string, string>;
  responseHeaders: Record<string, string>;
  requestBody?: string;
  responseBody?: string;
  mimeType: string;
}

export interface ParsedRequest {
  path: string;
  domain: string;
  method: string;
  status: number;
  verified: boolean;
}

export interface AuthInfo {
  method: 'bearer' | 'session' | 'apikey' | 'none';
  headers: Record<string, string>;
  cookies: Record<string, string>;
  tokens: string[];
  refreshConfig?: {
    endpoint: string;
    method: string;
    body?: Record<string, unknown>;
  };
}

export interface ApiEndpoint {
  method: string;
  path: string;
  originalPath: string;
  fingerprint: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
}

export interface SkillResult {
  skillPath: string;
  service: string;
  endpointsCount: number;
  authMethod: AuthInfo['method'];
  versionHash: string;
}

export interface NormalizedEndpoint {
  method: string;
  path: string;
  originalPath: string;
  fingerprint: string;
  description?: string;
}
