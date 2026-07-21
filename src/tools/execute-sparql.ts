import { tool } from '@opencode-ai/plugin';
import { formatSparqlBindings } from '../utils/format.js';
import { executeSparql } from '../utils/sparql.js';

export function createExecuteSparqlTool() {
  return tool({
    description:
      'Execute a read-only SPARQL query against Wikidata. ' +
      'Validates the query is read-only (SELECT/ASK/CONSTRUCT/DESCRIBE only) before executing. ' +
      'Returns formatted results with simplified QID/PID references.',
    args: {
      sparql: tool.schema.string(),
    },
    async execute(args) {
      const { bindings, error } = await executeSparql(args.sparql);
      if (error) {
        return { output: error };
      }
      return { output: formatSparqlBindings(bindings) };
    },
  });
}
