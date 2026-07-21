import { tool } from '@opencode-ai/plugin';
import {
  GENERATE_SPARQL_PROMPT,
  INSPECT_HIERARCHY_PROMPT,
  INSPECT_ITEMS_PROMPT,
  INSPECT_STATEMENTS_PROMPT,
  VALIDATE_HIERARCHY_PROMPT,
  VALIDATE_ITEMS_PROMPT,
  VALIDATE_STATEMENTS_PROMPT,
} from '../prompts/index.js';
import type { WorkflowState } from '../state.js';
import { createDefaultState } from '../state.js';
import {
  buildCritiqueSummary,
  buildDiscoverySummary,
  formatStageSections,
  shouldRefine,
} from '../utils/index.js';

export function createWorkflowStepTool() {
  return tool({
    description:
      "Mark a workflow phase complete and save findings. Returns the next phase's system prompt. " +
      'Use this after completing each phase: discover, inspect, generate, validate.',
    args: {
      phase: tool.schema.enum(['discover', 'inspect', 'generate', 'validate']),
      findings: tool.schema.record(tool.schema.string(), tool.schema.string()),
    },
    async execute(args, ctx) {
      const state = getState(ctx);
      const { phase, findings } = args;

      if (phase === 'discover') {
        state.search_summary = findings.search_summary || '';
        state.phase = 'inspect';
        return {
          output: `## Step 1 Complete: Discovery Findings

${state.search_summary}

---

## Step 2-4: Inspect Structure

You will now inspect the structure of candidate entities in three parallel investigations:

### Step 2: Inspect Items
${INSPECT_ITEMS_PROMPT}

### Step 3: Inspect Statement Values
${INSPECT_STATEMENTS_PROMPT}

### Step 4: Inspect Class Hierarchy
${INSPECT_HIERARCHY_PROMPT}

---

After completing all three inspections, use wikidata_workflow_step with phase="inspect" to save your findings.`,
        };
      }

      if (phase === 'inspect') {
        state.item_inspection = findings.item_inspection || '';
        state.statement_inspection = findings.statement_inspection || '';
        state.hierarchy_inspection = findings.hierarchy_inspection || '';
        state.phase = 'generate';
        state.cycle = 1;
        return {
          output: `## Steps 2-4 Complete: Inspection Findings

### Item Inspection
${state.item_inspection}

### Statement Inspection
${state.statement_inspection}

### Hierarchy Inspection
${state.hierarchy_inspection}

---

## Discovery Summary (all steps bundled)

${buildDiscoverySummary(state)}

---

## Step 5: Generate SPARQL

${GENERATE_SPARQL_PROMPT}

---

**Discovery Findings for SPARQL generation:**

${formatStageSections(
  [
    ['Step 1 Search Findings', state.search_summary],
    ['Step 2 Item Statement Findings', state.item_inspection],
    ['Step 3 Statement Detail Findings', state.statement_inspection],
    ['Step 4 Class Hierarchy Findings', state.hierarchy_inspection],
  ],
  3500
)}

---

After generating SPARQL and executing it via wikidata_execute_sparql, use wikidata_workflow_step with phase="generate" to save your query and proceed to validation.`,
        };
      }

      if (phase === 'generate') {
        state.sparql = findings.sparql || '';
        state.sparql_results = findings.sparql_results || '';
        state.result = findings.result || state.sparql_results || '';
        state.sparql_history = [...state.sparql_history, state.sparql];
        state.result_history = [...state.result_history, state.sparql_results];
        state.phase = 'validate';
        return {
          output: `## Step 5 Complete: SPARQL Generated

**Query (cycle ${state.cycle}):**
\`\`\`sparql
${state.sparql}
\`\`\`

**Results:**
${state.sparql_results}

---

## Steps 6-8: Validate SPARQL

You will now critique the SPARQL and its results in three parallel investigations:

### Step 6: Inspect Result Items
${VALIDATE_ITEMS_PROMPT}

### Step 7: Inspect Result Statements
${VALIDATE_STATEMENTS_PROMPT}

### Step 8: Inspect Result Classes
${VALIDATE_HIERARCHY_PROMPT}

---

**Context for validation:**

Question: ${state.question}

Discovery Summary:
${buildDiscoverySummary(state)}

Generated SPARQL:
\`\`\`sparql
${state.sparql}
\`\`\`

Execution result:
${state.sparql_results.slice(0, 8000)}

---

After completing all three validations, use wikidata_workflow_step with phase="validate" to save your critique and receive the refinement decision.`,
        };
      }

      if (phase === 'validate') {
        state.validation_notes.items = findings.result_items || '';
        state.validation_notes.statements = findings.result_statements || '';
        state.validation_notes.hierarchy = findings.result_hierarchy || '';
        state.critique_summary = buildCritiqueSummary(state);

        const { refine, reason } = shouldRefine(state);
        state.should_refine = refine;
        state.validation_reason = reason;

        if (refine) {
          state.phase = 'generate';
          state.cycle++;
          return {
            output: `## Steps 6-8 Complete: Validation Findings

### Result Item Findings
${state.validation_notes.items}

### Result Statement Findings
${state.validation_notes.statements}

### Result Class Findings
${state.validation_notes.hierarchy}

---

## Critique Summary
${state.critique_summary}

---

## Refinement Decision: ${reason}

${
  state.cycle > 1
    ? `\n**Previous SPARQL attempts:**\n${state.sparql_history.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
    : ''
}

---

## Continuing to Step 5: Generate Refined SPARQL (cycle ${state.cycle})

${GENERATE_SPARQL_PROMPT}

**Previous SPARQL:**
\`\`\`sparql
${state.sparql}
\`\`\`

**Critique notes for refinement:**
${formatStageSections(
  [
    ['Step 6 Result Item Findings', state.validation_notes.items],
    ['Step 7 Result Statement Findings', state.validation_notes.statements],
    ['Step 8 Result Class Findings', state.validation_notes.hierarchy],
  ],
  3000
)}

---

Generate improved SPARQL incorporating the critique, then execute it via wikidata_execute_sparql.`,
          };
        }
        state.phase = 'done';
        state.result = state.sparql_results || '';
        return {
          output: `## Steps 6-8 Complete: Validation Findings

### Result Item Findings
${state.validation_notes.items}

### Result Statement Findings
${state.validation_notes.statements}

### Result Class Findings
${state.validation_notes.hierarchy}

---

## Critique Summary
${state.critique_summary}

---

## Final Decision: ${reason}

---

## Final SPARQL Query
\`\`\`sparql
${state.sparql}
\`\`\`

## Final Results
${state.sparql_results}

---

Workflow complete. Use wikidata_ask to start a new question.`,
        };
      }

      return { output: 'Unknown phase. Use: discover, inspect, generate, or validate.' };
    },
  });
}

// Shared state storage keyed by tool execution context
const stateStore = new Map<string, WorkflowState>();

function getState(ctx: { directory: string; worktree: string | null }): WorkflowState {
  const key = `${ctx.directory}:${ctx.worktree ?? 'null'}`;
  let state = stateStore.get(key);
  if (state === undefined) {
    state = createDefaultState();
    stateStore.set(key, state);
  }
  return state;
}
