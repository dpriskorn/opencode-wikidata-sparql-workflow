export function compactText(text: string, maxChars = 8000): string {
  if ((text || '').length <= maxChars) return text || '';
  const half = Math.floor(maxChars / 2);
  return `${text.slice(0, half)}\n\n[...truncated...]\n\n${text.slice(-half)}`;
}

export function formatSparqlBindings(bindings: Record<string, unknown>[], maxRows = 20): string {
  if (!bindings || bindings.length === 0) {
    return 'SPARQL query returned no data.';
  }
  const lines: string[] = [];
  for (let index = 0; index < Math.min(bindings.length, maxRows); index++) {
    const row = bindings[index];
    const cells: string[] = [];
    for (const [name, value] of Object.entries(row)) {
      const rawValue = (value as { value?: string })?.value || String(value);
      const simplified = rawValue.replace('http://www.wikidata.org/entity/', '');
      cells.push(`${name}=${simplified}`);
    }
    lines.push(`${index + 1}. ${cells.join('; ')}`);
  }
  if (bindings.length > maxRows) {
    lines.push(`... ${bindings.length - maxRows} more rows not shown`);
  }
  return lines.join('\n');
}
