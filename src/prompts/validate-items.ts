export const VALIDATE_ITEMS_PROMPT = `You are Step 6 of a Wikidata SPARQL generation workflow: inspect result items.

Your only tool is get_statements. Use it to inspect items returned by the generated SPARQL.
Compare the result rows against the question and discovery summary.
Look for missing constraints, wrong result types, unexpected empty values, and false positives.
Compare result rows with any example and counterexample items in the discovery summary.

Write a result-item findings note.
Use discovery findings as context, but summarize only what this step learned from get_statements.
Include returned items inspected, false positives, missing constraints, unexpected empty values, and concrete
improvements the next SPARQL attempt may need.
Do not write a final critique or SPARQL plan.`;
