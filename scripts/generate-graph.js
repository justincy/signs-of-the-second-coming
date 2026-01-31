#!/usr/bin/env node
/**
 * Generate a Graphviz DOT file and SVG from signs and relationships data.
 * 
 * Usage: node scripts/generate-graph.js
 * Output: public/graph.svg
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load data
const dataDir = path.join(__dirname, '..', 'data');
const signs = JSON.parse(fs.readFileSync(path.join(dataDir, 'signs.json'), 'utf8'));
const relationships = JSON.parse(fs.readFileSync(path.join(dataDir, 'relationships.json'), 'utf8'));
const synonyms = JSON.parse(fs.readFileSync(path.join(dataDir, 'synonyms.json'), 'utf8'));

// Build synonym map: duplicate -> canonical name
const synonymMap = new Map();
for (const { duplicate, synonym } of synonyms) {
  synonymMap.set(duplicate, synonym);
}

// Resolve a sign name to its canonical form (following synonym chains)
function resolve(name) {
  const visited = new Set();
  while (synonymMap.has(name) && !visited.has(name)) {
    visited.add(name);
    name = synonymMap.get(name);
  }
  return name;
}

// Get all unique canonical sign names
const canonicalSigns = new Set();
for (const sign of signs) {
  canonicalSigns.add(resolve(sign.name));
}

// Build edges with resolved names, deduplicating
const edges = new Map();
for (const rel of relationships) {
  const before = resolve(rel.before);
  const after = resolve(rel.after);
  
  // Skip self-loops
  if (before === after) continue;
  
  const key = `${before}|||${after}`;
  if (!edges.has(key)) {
    edges.set(key, { before, after, references: [] });
  }
  edges.get(key).references.push(...rel.references);
}

// Escape label for DOT format
function escapeLabel(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Generate DOT file
let dot = `digraph signs_of_the_second_coming {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fillcolor="#f0f0f0", fontname="Arial"];
  edge [fontname="Arial", fontsize=10];
  
`;

// Add nodes
for (const name of canonicalSigns) {
  dot += `  "${escapeLabel(name)}";\n`;
}

dot += '\n';

// Add edges
for (const { before, after } of edges.values()) {
  dot += `  "${escapeLabel(before)}" -> "${escapeLabel(after)}";\n`;
}

dot += '}\n';

// Write DOT file
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const dotPath = path.join(publicDir, 'graph.dot');
const svgPath = path.join(publicDir, 'graph.svg');

fs.writeFileSync(dotPath, dot);
console.log(`Generated: ${dotPath}`);

// Generate SVG using Graphviz
try {
  execSync(`dot -Tsvg "${dotPath}" -o "${svgPath}"`, { stdio: 'inherit' });
  console.log(`Generated: ${svgPath}`);
} catch (error) {
  console.error('Failed to generate SVG. Is Graphviz installed?');
  console.error('Install with: sudo apt-get install graphviz');
  process.exit(1);
}

// Stats
console.log(`\nStats:`);
console.log(`  Signs: ${canonicalSigns.size}`);
console.log(`  Relationships: ${edges.size}`);
console.log(`  Synonyms applied: ${synonyms.length}`);
