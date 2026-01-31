/**
 * Transform raw sign data into Cytoscape elements based on display options.
 */

interface Sign {
  name: string;
  references: string[];
}

interface Relationship {
  before: string;
  after: string;
  references: string[];
}

interface Group {
  name: string;
  members: string[];
}

interface Synonym {
  duplicate: string;
  synonym: string; // canonical name
}

interface GraphOptions {
  collapseGroups: boolean;
  collapseSynonyms: boolean;
}

interface CytoscapeNode {
  data: {
    id: string;
    label: string;
    isGroup?: boolean;
    isCollapsed?: boolean;
    members?: string[];
    aliases?: string[];
    references?: string[];
  };
}

interface CytoscapeEdge {
  data: {
    id: string;
    source: string;
    target: string;
    references: string[];
  };
}

export interface CytoscapeElements {
  nodes: CytoscapeNode[];
  edges: CytoscapeEdge[];
}

export function transformGraphData(
  signs: Sign[],
  relationships: Relationship[],
  groups: Group[],
  synonyms: Synonym[],
  options: GraphOptions
): CytoscapeElements {
  const { collapseGroups, collapseSynonyms } = options;

  // Build synonym map: duplicate -> canonical
  const synonymMap = new Map<string, string>();
  if (collapseSynonyms) {
    for (const { duplicate, synonym } of synonyms) {
      synonymMap.set(duplicate, synonym);
    }
  }

  // Build group map: member -> group name
  const groupMap = new Map<string, string>();
  const groupMembers = new Map<string, Set<string>>();
  if (collapseGroups) {
    for (const group of groups) {
      groupMembers.set(group.name, new Set());
      for (const member of group.members) {
        // Resolve synonym first if applicable
        const resolved = resolveSynonym(member, synonymMap);
        groupMap.set(resolved, group.name);
        groupMembers.get(group.name)!.add(resolved);
      }
    }
  }

  // Resolve a name through synonym chain
  function resolveSynonym(name: string, map: Map<string, string>): string {
    const visited = new Set<string>();
    while (map.has(name) && !visited.has(name)) {
      visited.add(name);
      name = map.get(name)!;
    }
    return name;
  }

  // Resolve a name through synonyms AND groups
  function resolveNode(name: string): string {
    // First resolve synonyms
    let resolved = resolveSynonym(name, synonymMap);
    // Then check if it's part of a group
    if (collapseGroups && groupMap.has(resolved)) {
      return groupMap.get(resolved)!;
    }
    return resolved;
  }

  // Build nodes
  const nodeMap = new Map<string, CytoscapeNode>();
  const nodeRefs = new Map<string, Set<string>>(); // Track references per node
  const nodeAliases = new Map<string, Set<string>>(); // Track aliases per node

  for (const sign of signs) {
    const resolved = resolveNode(sign.name);
    
    if (!nodeMap.has(resolved)) {
      const isGroup = collapseGroups && groupMembers.has(resolved);
      nodeMap.set(resolved, {
        data: {
          id: resolved,
          label: resolved,
          isGroup,
          members: isGroup ? Array.from(groupMembers.get(resolved) || []) : undefined,
          aliases: [],
          references: [],
        },
      });
      nodeRefs.set(resolved, new Set());
      nodeAliases.set(resolved, new Set());
    }

    // Collect references
    for (const ref of sign.references) {
      nodeRefs.get(resolved)!.add(ref);
    }

    // Track if this was collapsed (alias or group member)
    if (sign.name !== resolved) {
      nodeAliases.get(resolved)!.add(sign.name);
    }
  }

  // Also add group names as nodes if they don't exist yet
  if (collapseGroups) {
    for (const group of groups) {
      if (!nodeMap.has(group.name)) {
        nodeMap.set(group.name, {
          data: {
            id: group.name,
            label: group.name,
            isGroup: true,
            members: Array.from(groupMembers.get(group.name) || []),
            aliases: [],
            references: [],
          },
        });
        nodeRefs.set(group.name, new Set());
        nodeAliases.set(group.name, new Set());
      }
    }
  }

  // Finalize node data
  for (const [id, node] of nodeMap) {
    node.data.references = Array.from(nodeRefs.get(id) || []);
    node.data.aliases = Array.from(nodeAliases.get(id) || []);
  }

  // Build edges with deduplication
  const edgeMap = new Map<string, CytoscapeEdge>();

  for (const rel of relationships) {
    const source = resolveNode(rel.before);
    const target = resolveNode(rel.after);

    // Skip self-loops (can happen when group members relate to each other)
    if (source === target) continue;

    const edgeId = `${source}→${target}`;
    
    if (!edgeMap.has(edgeId)) {
      edgeMap.set(edgeId, {
        data: {
          id: edgeId,
          source,
          target,
          references: [],
        },
      });
    }

    // Merge references
    edgeMap.get(edgeId)!.data.references.push(...rel.references);
  }

  // Deduplicate edge references
  for (const edge of edgeMap.values()) {
    edge.data.references = [...new Set(edge.data.references)];
  }

  return {
    nodes: Array.from(nodeMap.values()),
    edges: Array.from(edgeMap.values()),
  };
}
