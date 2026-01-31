#!/usr/bin/env node
/**
 * Generate Graphviz DOT files, SVGs, and sign details JSON from data.
 * 
 * Usage: node scripts/generate-graph.js
 * Output: 
 *   - public/graph.svg (full graph)
 *   - public/graph-simple.svg (simplified graph with groups collapsed)
 *   - data/graph-data.json (full graph data)
 *   - data/graph-data-simple.json (simplified graph data)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load data
const dataDir = path.join(__dirname, '..', 'data');
const publicDir = path.join(__dirname, '..', 'public');

const signs = JSON.parse(fs.readFileSync(path.join(dataDir, 'signs.json'), 'utf8'));
const relationships = JSON.parse(fs.readFileSync(path.join(dataDir, 'relationships.json'), 'utf8'));
const synonyms = JSON.parse(fs.readFileSync(path.join(dataDir, 'synonyms.json'), 'utf8'));
const groups = JSON.parse(fs.readFileSync(path.join(dataDir, 'groups.json'), 'utf8'));

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Build synonym map: duplicate -> canonical name
const synonymMap = new Map();
for (const { duplicate, synonym } of synonyms) {
  synonymMap.set(duplicate, synonym);
}

// Build group map: member -> group name
const groupMap = new Map();
for (const group of groups) {
  for (const member of group.members) {
    groupMap.set(member, group.name);
  }
}

// Resolve a sign name to its canonical form (following synonym chains)
function resolveSynonym(name) {
  const visited = new Set();
  while (synonymMap.has(name) && !visited.has(name)) {
    visited.add(name);
    name = synonymMap.get(name);
  }
  return name;
}

// Resolve a sign name through synonyms AND groups
function resolveSimplified(name) {
  // First resolve synonyms
  name = resolveSynonym(name);
  // Then check if it's part of a group
  if (groupMap.has(name)) {
    return groupMap.get(name);
  }
  return name;
}

// Escape label for DOT format
function escapeLabel(str) {
  return str.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

// Generate graph data and DOT file
function generateGraph(resolveFn, isSimplified = false) {
  const signDetails = new Map();
  const edges = new Map();

  // Initialize with sign data
  for (const sign of signs) {
    const canonical = resolveFn(sign.name);
    if (!signDetails.has(canonical)) {
      signDetails.set(canonical, {
        name: canonical,
        references: [],
        aliases: [],
        members: [], // For groups
        comesBefore: [],
        comesAfter: [],
      });
    }
    const detail = signDetails.get(canonical);
    
    // Add references from sign
    for (const ref of sign.references) {
      if (!detail.references.includes(ref)) {
        detail.references.push(ref);
      }
    }
    
    // Track aliases/members
    if (sign.name !== canonical) {
      const resolvedName = resolveSynonym(sign.name);
      if (isSimplified && groupMap.has(resolvedName)) {
        // It's a group member
        if (!detail.members.includes(resolvedName)) {
          detail.members.push(resolvedName);
        }
      } else if (!detail.aliases.includes(sign.name)) {
        detail.aliases.push(sign.name);
      }
    }
  }

  // Add group members to signs that are also groups
  // For simplified: groups are collapsed nodes
  // For full: groups still show their members for context
  for (const group of groups) {
    if (!signDetails.has(group.name)) {
      signDetails.set(group.name, {
        name: group.name,
        references: [],
        aliases: [],
        members: [],
        comesBefore: [],
        comesAfter: [],
      });
    }
    const detail = signDetails.get(group.name);
    for (const member of group.members) {
      const resolved = resolveSynonym(member);
      if (!detail.members.includes(resolved)) {
        detail.members.push(resolved);
      }
    }
  }

  // Build edges with resolved names, deduplicating
  for (const rel of relationships) {
    const before = resolveFn(rel.before);
    const after = resolveFn(rel.after);
    
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
        members: [],
        comesBefore: [],
        comesAfter: [],
      });
    }
    if (!signDetails.has(after)) {
      signDetails.set(after, {
        name: after,
        references: [],
        aliases: [],
        members: [],
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

  // Generate DOT file
  let dot = `digraph signs_of_the_second_coming {
  rankdir=TB;
  node [shape=box, style="rounded,filled", fillcolor="${isSimplified ? '#e3f2fd' : '#f0f0f0'}", fontname="Arial"];
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

  return { signDetails, edges, dot };
}

// Generate full graph
console.log('Generating full graph...');
const full = generateGraph(resolveSynonym, false);

const fullDotPath = path.join(publicDir, 'graph.dot');
const fullSvgPath = path.join(publicDir, 'graph.svg');
const fullJsonPath = path.join(dataDir, 'graph-data.json');

fs.writeFileSync(fullDotPath, full.dot);
console.log(`Generated: ${fullDotPath}`);

try {
  execSync(`dot -Tsvg "${fullDotPath}" -o "${fullSvgPath}"`, { stdio: 'inherit' });
  console.log(`Generated: ${fullSvgPath}`);
} catch (error) {
  console.error('Failed to generate SVG. Is Graphviz installed?');
  process.exit(1);
}

const fullGraphData = {};
for (const [name, detail] of full.signDetails) {
  fullGraphData[name] = detail;
}
fs.writeFileSync(fullJsonPath, JSON.stringify(fullGraphData, null, 2));
console.log(`Generated: ${fullJsonPath}`);

console.log(`\nFull graph stats:`);
console.log(`  Signs: ${full.signDetails.size}`);
console.log(`  Relationships: ${full.edges.size}`);

// Generate simplified graph
console.log('\nGenerating simplified graph...');
const simple = generateGraph(resolveSimplified, true);

const simpleDotPath = path.join(publicDir, 'graph-simple.dot');
const simpleSvgPath = path.join(publicDir, 'graph-simple.svg');
const simpleJsonPath = path.join(dataDir, 'graph-data-simple.json');

fs.writeFileSync(simpleDotPath, simple.dot);
console.log(`Generated: ${simpleDotPath}`);

try {
  execSync(`dot -Tsvg "${simpleDotPath}" -o "${simpleSvgPath}"`, { stdio: 'inherit' });
  console.log(`Generated: ${simpleSvgPath}`);
} catch (error) {
  console.error('Failed to generate simplified SVG.');
  process.exit(1);
}

const simpleGraphData = {};
for (const [name, detail] of simple.signDetails) {
  simpleGraphData[name] = detail;
}
fs.writeFileSync(simpleJsonPath, JSON.stringify(simpleGraphData, null, 2));
console.log(`Generated: ${simpleJsonPath}`);

console.log(`\nSimplified graph stats:`);
console.log(`  Signs: ${simple.signDetails.size}`);
console.log(`  Relationships: ${simple.edges.size}`);
console.log(`  Groups applied: ${groups.length}`);
