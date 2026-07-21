export const VALIDATE_HIERARCHY_PROMPT = `You are Step 8 of a Wikidata SPARQL generation workflow: inspect class assumptions.

Your only tool is get_instance_and_subclass_hierarchy. Use it to inspect class filters, returned result items,
and class-like QIDs used or implied by the generated SPARQL.
Check whether class filtering is correct, too broad, too narrow, missing subclass expansion, or using the wrong class.
Compare broad and narrow classes when counterexamples show that a generic class would overcount.
Do not write SPARQL.

Write a result-class findings note.
Use Step 6 as context, but summarize only what this step learned from get_instance_and_subclass_hierarchy.
Include class filters that are correct, too broad, too narrow, missing subclass expansion, or wrong.`;
