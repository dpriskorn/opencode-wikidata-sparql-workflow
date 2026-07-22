# opencode-wikidata-sparql-workflow

An OpenCode plugin that provides a guided workflow for generating grounded SPARQL queries against Wikidata.

## What is this?

This plugin implements the same 8-step LangGraph workflow from [wikidata-mcp](https://github.com/wikimedia-de/wikidata-mcp) as an OpenCode plugin. Instead of running a separate Python process, the workflow runs directly within OpenCode using custom tools and prompts.

The workflow ensures the AI **never invents QIDs or PIDs** - it must discover all identifiers through the Wikidata MCP tools before using them in SPARQL.

## Screenshot
### English example
<img width="800" height="1327" alt="bild" src="https://github.com/user-attachments/assets/15ebd61e-55d2-41c1-8247-0600fc199439" />
<img width="776" height="945" alt="bild" src="https://github.com/user-attachments/assets/da7b5e63-fb42-4d6c-a759-0034218ad1e6" />

All queries work and it correctly excluded the fictional ones. 🥳

### Swedish example with timing
> "list barbecue sites, campsites, lean-tos, and swimming areas in Sundsvall Municipality? Use wikidata_ask. Filter by QIDs and PIDs, not labels."
<img width="1354" height="716" alt="bild" src="https://github.com/user-attachments/assets/f47b818e-9f58-4d5c-b5e8-ad4713ef7e7b" />
<img width="1354" height="716" alt="bild" src="https://github.com/user-attachments/assets/1f1a0237-1ebc-4cbb-b783-76ccc77b3960" />
<img width="1354" height="716" alt="bild" src="https://github.com/user-attachments/assets/c7bff2b3-0d3a-484e-835b-f72bb91a2245" />

Total time to results for a complicated and specialized query like this: ~1.5 min

## Installation

This plugin is not published to npm. To install locally:

### Option 1: Using Just (Recommended)

```bash
just install-local
```

This creates a symlink in `~/.config/opencode/plugins/`.

### Option 2: Manual Symlink

```bash
mkdir -p ~/.config/opencode/plugins
ln -sfn /path/to/opencode-wikidata-sparql-workflow ~/.config/opencode/plugins/opencode-wikidata-sparql-workflow
```

### Option 3: Using npm link (for development)

```bash
npm link
```

Then add to your `~/.config/opencode/opencode.json`:
```json
{
  "$schema": "https://opencode.ai/config.json",
  "plugin": ["opencode-wikidata-sparql-workflow"]
}
```

## Usage

Start a Wikidata SPARQL workflow by asking a question:

```
Use the wikidata_ask tool to ask: Who are the presidents of France?
```

Or in natural language:
```
Ask Wikidata about the presidents of France using the wikidata_ask tool.
```

### Workflow Steps

The plugin guides you through 8 steps:

| Step | Phase | What happens |
|------|-------|--------------|
| 1 | Discover | Search for QIDs/PIDs using `search_items` and `search_properties` |
| 2 | Inspect Items | Examine statements with `get_statements` |
| 3 | Inspect Statements | Deep dive values with `get_statement_values` |
| 4 | Inspect Hierarchy | Check class relationships with `get_instance_and_subclass_hierarchy` |
| 5 | Generate SPARQL | Create query using only discovered identifiers, execute it |
| 6 | Validate Items | Check result items for correctness |
| 7 | Validate Statements | Check result statement values |
| 8 | Validate Classes | Check class filtering assumptions |

Steps 6-8 may loop back to Step 5 for refinement (up to 3 cycles by default).

### Available Tools

| Tool | Purpose |
|------|---------|
| `wikidata_ask` | Start a new Wikidata SPARQL workflow |
| `wikidata_workflow_step` | Mark phase complete, get next prompt |
| `wikidata_execute_sparql` | Execute SPARQL directly (bypasses MCP round-trip) |
| `wikidata_status` | Show current workflow state |
| `wikidata_reset` | Reset workflow to start fresh |

### MCP Tools Used

The plugin connects to the hosted Wikidata MCP server (`https://wd-mcp.wmcloud.org/mcp`) providing:

- `search_items(query, lang)` - Search Wikidata items
- `search_properties(query, lang)` - Search Wikidata properties
- `get_statements(entity_id, include_external_ids, lang)` - Get entity statements
- `get_statement_values(entity_id, property_id, lang)` - Get statement details with qualifiers
- `get_instance_and_subclass_hierarchy(entity_id, max_depth, lang)` - Get class hierarchy

## How It Works

The plugin embeds 8 system prompts (translated from the Python LangGraph workflow) that constrain the AI's behavior at each step:

1. **Discovery prompts** - Search only, no inference
2. **Inspection prompts** - Three parallel investigations using narrow tool sets
3. **Generation prompt** - SPARQL only, no tools, must use only discovered identifiers
4. **Validation prompts** - Three parallel critiques

The AI is guided through phases by calling `wikidata_workflow_step`, which returns the next phase's system prompt. SPARQL execution happens via `wikidata_execute_sparql` which validates queries are read-only before executing against Wikidata.

## Requirements

- OpenCode
- [Just](https://github.com/casey/just) (for installation commands)
- Access to `https://wd-mcp.wmcloud.org/mcp`

## Dependencies

- [@opencode-ai/plugin](https://www.npmjs.com/package/@opencode-ai/plugin) (peer dependency)
- [typescript](https://www.npmjs.com/package/typescript)
- [@biomejs/biome](https://www.npmjs.com/package/@biomejs/biome)

# See also
* https://github.com/jagan-shanmugam/open-streetmap-mcp (MIT)
* https://github.com/wiseman/osm-mcp (license missing)
* https://github.com/nervsystems/osmmcp (MIT)

## License

GPL-3.0-or-later

Copyright (c) 2026 Nizo Priskorn

This plugin is based on the [wikidata-mcp](https://github.com/wikimedia-de/wikidata-mcp) project.

## Credit

The SPARQL generation workflow is based on the [WikidataMCP SPARQLGeneration workflow commit b8fc2b8eff6ff25605efca7318f26f21736e7489](https://github.com/wmde/WikidataMCP/tree/sparql_workflow/workflows/SPARQLGeneration) by Philippe Saade (WMDE).
