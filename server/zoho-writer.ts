/**
 * Zoho Writer API client.
 *
 * Implements the OAuth refresh-token flow and the two endpoints we need:
 *   1. listTemplates() — populates the family admin dropdown
 *   2. mergeTemplate(templateId, mergeData) — renders a template with merge data and returns the resulting DOCX
 *
 * Configured via four env vars: ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_DC (default "com").
 */

export class ZohoConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ZohoConfigError";
  }
}

export class ZohoApiError extends Error {
  status: number;
  details?: unknown;
  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ZohoApiError";
    this.status = status;
    this.details = details;
  }
}

interface ZohoConfig {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
  dc: string;
}

function loadConfig(): ZohoConfig {
  const clientId = process.env.ZOHO_CLIENT_ID;
  const clientSecret = process.env.ZOHO_CLIENT_SECRET;
  const refreshToken = process.env.ZOHO_REFRESH_TOKEN;
  const dc = process.env.ZOHO_DC || "com";

  const missing: string[] = [];
  if (!clientId) missing.push("ZOHO_CLIENT_ID");
  if (!clientSecret) missing.push("ZOHO_CLIENT_SECRET");
  if (!refreshToken) missing.push("ZOHO_REFRESH_TOKEN");

  if (missing.length > 0) {
    throw new ZohoConfigError(
      `Zoho Writer não configurado. Variáveis em falta: ${missing.join(", ")}`
    );
  }

  return { clientId: clientId!, clientSecret: clientSecret!, refreshToken: refreshToken!, dc };
}

export function isZohoConfigured(): boolean {
  try {
    loadConfig();
    return true;
  } catch {
    return false;
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) {
    return cachedToken.value;
  }

  const cfg = loadConfig();
  const url = `https://accounts.zoho.${cfg.dc}/oauth/v2/token`;
  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: cfg.refreshToken,
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ZohoApiError(`Falha ao obter access token Zoho (${res.status})`, res.status, text);
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number; error?: string };
  if (!data.access_token) {
    throw new ZohoApiError("Resposta de token Zoho sem access_token", 500, data);
  }

  const expiresInMs = (data.expires_in ?? 3600) * 1000;
  cachedToken = { value: data.access_token, expiresAt: Date.now() + expiresInMs };
  return cachedToken.value;
}

export interface ZohoTemplate {
  id: string;
  name: string;
}

export async function listTemplates(): Promise<ZohoTemplate[]> {
  const cfg = loadConfig();
  const token = await getAccessToken();
  const url = `https://writer.zoho.${cfg.dc}/api/v1/documents`;

  const res = await fetch(url, {
    headers: { Authorization: `Zoho-oauthtoken ${token}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ZohoApiError(`Falha ao listar documentos Zoho (${res.status})`, res.status, text);
  }

  const data = (await res.json()) as { data?: Array<{ document_id?: string; id?: string; document_name?: string; name?: string }> };
  const items = data.data ?? [];
  return items
    .map((d) => ({ id: d.document_id ?? d.id ?? "", name: d.document_name ?? d.name ?? "(sem nome)" }))
    .filter((t) => t.id);
}

/**
 * Run a Zoho Writer mail merge and return the rendered document as a Buffer.
 * Default output format is DOCX (editable Word document).
 */
export async function mergeTemplate(
  templateId: string,
  mergeData: Record<string, unknown>,
  outputFormat: "docx" | "pdf" = "docx"
): Promise<Buffer> {
  if (!templateId) {
    throw new ZohoApiError("templateId em falta", 400);
  }

  const cfg = loadConfig();
  const token = await getAccessToken();
  const url = `https://writer.zoho.${cfg.dc}/api/v1/documents/${encodeURIComponent(templateId)}/mailmerge`;

  const body = new URLSearchParams({
    merge_data: JSON.stringify({ data: [mergeData] }),
    output_format: outputFormat,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new ZohoApiError(`Falha ao executar mail merge Zoho (${res.status})`, res.status, text);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
