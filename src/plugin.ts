import type { Plugin } from '@opencode-ai/plugin';
import {
  DISCOVER_PROMPT,
  GENERATE_SPARQL_PROMPT,
  INSPECT_HIERARCHY_PROMPT,
  INSPECT_ITEMS_PROMPT,
  INSPECT_STATEMENTS_PROMPT,
  VALIDATE_HIERARCHY_PROMPT,
  VALIDATE_ITEMS_PROMPT,
  VALIDATE_STATEMENTS_PROMPT,
} from './prompts/index.js';
import {
  createAskTool,
  createExecuteSparqlTool,
  createResetTool,
  createStatusTool,
  createWorkflowStepTool,
} from './tools/definitions.js';
import { buildDiscoverySummary, formatState } from './utils/index.js';

const WD_MCP_URL = 'https://wd-mcp.wmcloud.org/mcp';

export const WikidataSparqlPlugin: Plugin = async ({ client }) => {
  await client.app.log({
    body: {
      service: 'wikidata-sparql',
      level: 'info',
      message: 'Wikidata SPARQL plugin initialized',
    },
  });

  return {
    mcp: {
      wikidata: {
        type: 'remote',
        url: WD_MCP_URL,
      },
    },

    tool: {
      wikidata_ask: createAskTool(),
      wikidata_workflow_step: createWorkflowStepTool(),
      wikidata_execute_sparql: createExecuteSparqlTool(),
      wikidata_status: createStatusTool(),
      wikidata_reset: createResetTool(),
    },

    'experimental.session.compacting': async (_input, output) => {
      // Note: per-session state isn't easily accessible in compaction hook
      // The workflow is designed to be completed in a single session
      output.context.push(
        `## Wikidata SPARQL Workflow

To continue a Wikidata SPARQL workflow, use wikidata_status to check current state.
If you need to restart, use wikidata_reset then wikidata_ask.`
      );
    },
  };
};
