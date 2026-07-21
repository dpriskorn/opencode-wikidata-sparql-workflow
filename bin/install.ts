#!/usr/bin/env bun

/**
 * Installer for opencode-wikidata-sparql-workflow plugin
 * Usage:
 *   bun run install     - Install plugin to ~/.config/opencode/opencode.json
 *   bun run uninstall   - Remove plugin from ~/.config/opencode/opencode.json
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_PATH = resolve(process.env.HOME ?? '', '.config/opencode/opencode.json');
const PLUGIN_NAME = 'opencode-wikidata-sparql-workflow';

interface OpenCodeConfig {
  $schema?: string;
  plugin?: string[];
  [key: string]: unknown;
}

function loadConfig(): OpenCodeConfig {
  if (!existsSync(CONFIG_PATH)) {
    return {};
  }
  try {
    const content = readFileSync(CONFIG_PATH, 'utf-8');
    return JSON.parse(content) as OpenCodeConfig;
  } catch {
    return {};
  }
}

function saveConfig(config: OpenCodeConfig): undefined {
  const dir = resolve(CONFIG_PATH, '..');
  if (!existsSync(dir)) {
    console.error(`Config directory does not exist: ${dir}`);
    process.exit(1);
  }
  const content = `${JSON.stringify(config, null, 2)}\n`;
  writeFileSync(CONFIG_PATH, content, 'utf-8');
  return undefined;
}

function install(): undefined {
  console.log(`Installing ${PLUGIN_NAME} to ${CONFIG_PATH}...`);
  const config = loadConfig();

  if (!config.plugin) {
    config.plugin = [];
  }

  if (config.plugin.includes(PLUGIN_NAME)) {
    console.log('Plugin already installed.');
    return undefined;
  }

  config.plugin.push(PLUGIN_NAME);
  saveConfig(config);
  console.log('Plugin installed successfully!');
  console.log('Restart opencode to use the plugin.');
  return undefined;
}

function uninstall(): undefined {
  console.log(`Removing ${PLUGIN_NAME} from ${CONFIG_PATH}...`);
  const config = loadConfig();

  if (!config.plugin) {
    console.log('Plugin not found in config.');
    return undefined;
  }

  const idx = config.plugin.indexOf(PLUGIN_NAME);
  if (idx === -1) {
    console.log('Plugin not found in config.');
    return undefined;
  }

  config.plugin.splice(idx, 1);
  if (config.plugin.length === 0) {
    config.plugin = undefined;
  }
  saveConfig(config);
  console.log('Plugin uninstalled successfully!');
  console.log('Restart opencode to apply changes.');
  return undefined;
}

const command = Bun.argv[2] ?? 'install';

switch (command) {
  case 'install': {
    install();
    break;
  }
  case 'uninstall': {
    uninstall();
    break;
  }
  default: {
    console.error(`Unknown command: ${command}`);
    console.error('Usage: bun run install | bun run uninstall');
    process.exit(1);
  }
}
