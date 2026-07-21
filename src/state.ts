export interface ValidationNotes {
  items: string;
  statements: string;
  hierarchy: string;
}

export interface WorkflowState {
  question: string;
  phase: 'start' | 'discover' | 'inspect' | 'generate' | 'validate' | 'done';
  cycle: number;
  maxCycles: number;
  search_summary: string;
  item_inspection: string;
  statement_inspection: string;
  hierarchy_inspection: string;
  sparql_history: string[];
  result_history: string[];
  sparql: string;
  sparql_results: string;
  validation_notes: ValidationNotes;
  critique_summary: string;
  validation_reason: string;
  should_refine: boolean;
  result: string;
}

export function createDefaultState(): WorkflowState {
  return {
    question: '',
    phase: 'start',
    cycle: 0,
    maxCycles: 3,
    search_summary: '',
    item_inspection: '',
    statement_inspection: '',
    hierarchy_inspection: '',
    sparql_history: [],
    result_history: [],
    sparql: '',
    sparql_results: '',
    validation_notes: { items: '', statements: '', hierarchy: '' },
    critique_summary: '',
    validation_reason: '',
    should_refine: false,
    result: '',
  };
}
