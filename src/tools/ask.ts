import { tool } from '@opencode-ai/plugin';
import { DISCOVER_PROMPT } from '../prompts/discover.js';

export function createAskTool() {
  return tool({
    description:
      'Ask a Wikidata question. Starts the full discover → inspect → generate → validate → refine SPARQL workflow. ' +
      'The AI will search for relevant QIDs/PIDs, inspect their structure, generate SPARQL, and iteratively refine it.',
    args: {
      question: tool.schema.string(),
    },
    async execute(args) {
      return {
        output: `## Wikidata SPARQL Generation Workflow

**Question**: ${args.question}

---

${DISCOVER_PROMPT}

---

After completing your discovery findings, use wikidata_workflow_step to save your results and proceed to the inspection phase.`,
      };
    },
  });
}
