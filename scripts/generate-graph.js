#!/usr/bin/env node
/**
 * Generate a Graphviz DOT file, SVG, and sign details JSON from data.
 * 
 * Usage: node scripts/generate-graph.js
 * Output: public/graph.svg, public/graph-data.json
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

// Build sign details map
const signDetails = new Map();

// Initialize with sign data
for (const sign of signs) {
  const canonical = resolve(sign.name);
  if (!signDetails.has(canonical)) {
    signDetails.set(canonical, {
      name: canonical,
      references: [],
      aliases: [],
      comesBefore: [], // {sign, references}
      comesAfter: [],  // {sign, references}
    });
  }
  const detail = signDetails.get(canonical);
  // Add references from sign
  for (const ref of sign.references) {
    if (!detail.references.includes(ref)) {
      detail.references.push(ref);
    }
  }
  // Track aliases
  if (sign.name !== canonical && !detail.aliases.includes(sign.name)) {
    detail.aliases.push(sign.name);
  }
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

// Add relationship data to sign details
for (const { before, after, references } of edges.values()) {
  // Ensure both signs exist in details
  if (!signDetails.has(before)) {
    signDetails.set(before, {
      name: before,
      references: [],
      aliases: [],
      comesBefore: [],
      comesAfter: [],
    });
  }
  if (!signDetails.has(after)) {
    signDetails.set(after, {
      name: after,
      references: [],
      aliases: [],
      comesBefore: [],
      comesAfter: [],
    });
  }

  // "before" comes before "after"
  signDetails.get(before).comesBefore.push({
    sign: after,
    references: [...new Set(references)],
  });

  // "after" comes after "before"
  signDetails.get(after).comesAfter.push({
    sign: before,
    references: [...new Set(references)],
  });
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
for (const name of signDetails.keys()) {
  dot += `  "${escapeLabel(name)}";\n`;
}

dot += '\n';

// Add edges
for (const { before, after } of edges.values()) {
  dot += `  "${escapeLabel(before)}" -> "${escapeLabel(after)}";\n`;
}

dot += '}\n';

// Write files
const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

const dotPath = path.join(publicDir, 'graph.dot');
const svgPath = path.join(publicDir, 'graph.svg');
const jsonPath = path.join(dataDir, 'graph-data.json');

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

// Convert signDetails map to object for JSON
const graphData = {};
for (const [name, detail] of signDetails) {
  graphData[name] = detail;
}

fs.writeFileSync(jsonPath, JSON.stringify(graphData, null, 2));
console.log(`Generated: ${jsonPath}`);

// Stats
console.log(`\nStats:`);
console.log(`  Signs: ${signDetails.size}`);
console.log(`  Relationships: ${edges.size}`);
console.log(`  Synonyms applied: ${synonyms.length}`);
