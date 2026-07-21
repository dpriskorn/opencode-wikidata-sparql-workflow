import { tool } from '@opencode-ai/plugin';
import {
  DISCOVER_PROMPT,
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
import { buildDiscoverySummary } from '../utils/index.js';
import { formatState } from '../utils/workflow.js';

export function createStatusTool() {
  return tool({
    description:
      'Show the current state of the Wikidata SPARQL workflow, including phase, cycle, and history.',
    args: {},
    async execute(_args, ctx) {
      const state = getState(ctx);
      return { output: formatState(state) };
    },
  });
}

export function createResetTool() {
  return tool({
    description: 'Reset the Wikidata SPARQL workflow state to start fresh.',
    args: {},
    async execute(_args, ctx) {
      const state = getState(ctx);
      const fresh = createDefaultState();
      Object.assign(state, fresh);
      return { output: 'Workflow state reset. Use wikidata_ask to start a new question.' };
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
