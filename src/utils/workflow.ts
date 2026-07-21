import type { WorkflowState } from '../state.js';

export function buildDiscoverySummary(state: WorkflowState): string {
  const sections: [string, string][] = [
    ['Step 1 Search Findings', state.search_summary],
    ['Step 2 Item Statement Findings', state.item_inspection],
    ['Step 3 Statement Detail Findings', state.statement_inspection],
    ['Step 4 Class Hierarchy Findings', state.hierarchy_inspection],
  ];
  return sections
    .map(
      ([heading, summary]) =>
        `## ${heading}\n${(summary || '').trim() || 'No findings reported by this stage.'}`
    )
    .join('\n\n');
}

export function buildCritiqueSummary(state: WorkflowState): string {
  const sections: [string, string][] = [
    ['Step 6 Result Item Findings', state.validation_notes.items],
    ['Step 7 Result Statement Findings', state.validation_notes.statements],
    ['Step 8 Result Class Findings', state.validation_notes.hierarchy],
  ];
  return sections
    .map(
      ([heading, summary]) =>
        `## ${heading}\n${(summary || '').trim() || 'No findings reported by this stage.'}`
    )
    .join('\n\n');
}

export function formatStageSections(
  sections: [string, string][],
  maxCharsPerSection: number
): string {
  const { compactText } = require('./format.js');
  return sections
    .map(
      ([heading, summary]) =>
        `## ${heading}\n${compactText(summary || 'No findings reported by this stage.', maxCharsPerSection)}`
    )
    .join('\n\n');
}

export function shouldRefine(state: WorkflowState): { refine: boolean; reason: string } {
  const maxCycles = state.maxCycles;
  if (state.cycle >= maxCycles) {
    return {
      refine: false,
      reason: `Stopped after refinement cycle ${state.cycle}; max refinement cycles reached.`,
    };
  }
  const history = state.sparql_history;
  if (
    history.length >= 2 &&
    history[history.length - 1]?.trim() === history[history.length - 2]?.trim()
  ) {
    return {
      refine: false,
      reason: 'Stopped because the generator produced the same SPARQL as the previous cycle.',
    };
  }
  if (state.critique_summary) {
    return {
      refine: false,
      reason: 'Stopped because the critique summary indicates refinement is complete.',
    };
  }
  return {
    refine: true,
    reason: `Refining after cycle ${state.cycle}; running another SPARQL attempt with the latest critique.`,
  };
}

export function formatState(state: WorkflowState): string {
  let result = `## Wikidata SPARQL Workflow State
- **Question**: ${state.question || '(not started)'}
- **Phase**: ${state.phase}
- **Cycle**: ${state.cycle}/${state.maxCycles}
`;
  if (state.sparql) {
    result += `- **Current SPARQL**:\n\`\`\`\n${state.sparql}\n\`\`\`\n`;
  }
  if (state.sparql_results) {
    result += `- **Results**:\n${state.sparql_results.slice(0, 500)}${state.sparql_results.length > 500 ? '...' : ''}\n`;
  }
  if (state.validation_reason) {
    result += `- **Validation**: ${state.validation_reason}\n`;
  }
  if (state.phase === 'done') {
    result += `\n## Final Result\n${state.result}`;
  }
  return result;
}
