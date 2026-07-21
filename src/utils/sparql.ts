const READ_ONLY_QUERY_PATTERN =
  /^\s*(?:PREFIX\s+\w+:\s*<[^>]+>\s*)*(SELECT|ASK|CONSTRUCT|DESCRIBE)\b/i;
const UPDATE_KEYWORDS = [
  'INSERT',
  'DELETE',
  'LOAD',
  'CLEAR',
  'CREATE',
  'DROP',
  'MOVE',
  'COPY',
  'ADD',
];

export function isReadOnlySparql(sparql: string): boolean {
  if (!READ_ONLY_QUERY_PATTERN.test(sparql || '')) return false;
  const upper = sparql.toUpperCase();
  return !UPDATE_KEYWORDS.some((keyword) => new RegExp(`\\b${keyword}\\b`).test(upper));
}

export async function executeSparql(
  sparql: string
): Promise<{ bindings: Record<string, unknown>[]; error?: string }> {
  if (!sparql?.trim()) {
    return { bindings: [], error: 'No SPARQL query provided.' };
  }
  if (!isReadOnlySparql(sparql)) {
    return {
      bindings: [],
      error: 'Only read-only SELECT, ASK, CONSTRUCT, or DESCRIBE SPARQL queries are allowed.',
    };
  }
  try {
    const url = new URL('https://query.wikidata.org/sparql');
    url.searchParams.set('query', sparql);
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'User-Agent':
          'opencode-wikidata-sparql-workflow/0.1.0 (contact: https://github.com/dpriskorn/opencode-wikidata-sparql-workflow)',
        Accept: 'application/sparql-results+json',
      },
      signal: AbortSignal.timeout(30000),
    });
    if (response.status === 400) {
      const text = await response.text();
      const errorMessage = text.split('\tat ')[0];
      return { bindings: [], error: `SPARQL Error: ${errorMessage}` };
    }
    if (!response.ok) {
      return {
        bindings: [],
        error: `SPARQL Error: HTTP ${response.status}`,
      };
    }
    const data = (await response.json()) as {
      results?: { bindings?: Record<string, unknown>[] };
    };
    const bindings = data?.results?.bindings || [];
    return { bindings };
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return { bindings: [], error: `SPARQL Execution failed: ${error}` };
  }
}
