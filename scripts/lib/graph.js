/**
 * Helper for managing a graph
 */

class Node {

  constructor(value) {
    this.value = value;

    // A set of node values that point to this node
    this.before = new Set();

    // A set of node values that this node points to
    this.after = new Set();
  }

  addBefore(value) {
    this.before.add(value);
  }

  addAfter(value) {
    this.after.add(value)
  }

  /**
   * Return a list of all node pairs for this node in the
   * form [[before, value], [value, after], ...].
   * 
   * @return {array}
   */
  getPairs() {
    const pairs = [];
    this.before.forEach(before => {
      pairs.push([before, this.value]);
    });
    this.after.forEach(after => {
      pairs.push([this.value, after])
    });
    return pairs;
  }

  /**
   * Merge the given node into this node by merging
   * the before and after sets.
   * 
   * @param {Node} node
   */
  merge(node) {
    this.before = new Set([...this.before, ...node.before]);
    this.after = new Set([...this.after, ...node.after]);
  }

  /**
   * Replace before and after refs to the search value
   * with the replace value.
   * 
   * @param {string} search
   * @param {sring} replace
   */
  replace(search, replace) {
    if (this.value !== replace) {
      if (this.before.has(search)) {
        this.before.delete(search);
        this.before.add(replace);
      }
      if (this.after.has(search)) {
        this.after.delete(search);
        this.after.add(replace);
      }
    }
  }

}
class Graph {

  constructor() {
    this.nodes = [];
    this.nodeIndex = {};
  }

  /**
   * Get a list of all nodes in this graph.
   * 
   * @returns {array} nodes
   */
  getNodes() {
    return this.nodes.slice(0);
  }

  /**
   * Get a node
   * 
   * @param {string} node 
   */
  getNode(node) {
    return this.nodeIndex[node];
  }

  /**
   * Get a list of all unique [x,y] pairs for this graph
   * 
   * @returns {array} list of pairs
   */
  allPairs() {
    const pairs = new Set();
    this.getNodes().forEach((node) => {
      node.getPairs().forEach((pair) => {
        pairs.add(`${pair[0]}::${pair[1]}`);
      });
    });
    return Array.from(pairs.values()).map((pair) => pair.split('::'));
  }

  /**
   * Adds a x -> x pair of nodes to the graph
   * 
   * @param {string} first 
   * @param {string} second 
   */
  addPair(first, second) {
    this.addAfter(first, second);
    this.addBefore(second, first);
  }

  /**
   * Get a node of the given value. Create and add it
   * if it doesn't exist.
   * 
   * @param {string} value 
   */
  getOrCreateNode(value) {
    let node = this.getNode(value);
    if (!node) {
      node = new Node(value);
      this.addNode(node);
    }
    return node;
  }

  /**
   * Register the pair of {before -> value}
   * @param {string} value 
   * @param {string} before 
   */
  addBefore(value, before) {
    this.getOrCreateNode(value).addBefore(before);
  }

  /**
   * Register the pair of {value -> after}
   * 
   * @param {string} value 
   * @param {string} after 
   */
  addAfter(value, after) {
    this.getOrCreateNode(value).addAfter(after);
  }

  /**
   * Add this node to the graph
   * 
   * @param {Node} node 
   */
  addNode(node) {
    if (!this.hasNode(node)) {
      this.nodes.push(node);
      this.nodeIndex[node.value] = node;
    }
  }

  /**
   * Remove the given node from the graph
   * 
   * @param {Node} node 
   */
  removeNode(node) {
    // Remove node from the node list
    this.nodes = this.nodes.filter((existingNode) => {
      return existingNode !== node;
    });
    // Remove node from the node index
    delete this.nodeIndex[node.value];
  }

  /**
   * Check whether the given node already exists in the graph 
   * 
   * @param {Node} node 
   * @returns {boolean}
   */
  hasNode(node) {
    return !!this.nodeIndex[node.value];
  }

  /**
   * Create a new graph containing the given node values
   * and their edges.
   * 
   * @param {array} values 
   */
  subgraph(values) {
    const subgraph = new Graph();
    values.forEach((value) => {
      const node = this.getNode(value)
      if (node) {
        subgraph.addNode(node)
      }
    });
    return subgraph;
  }

  /**
   * Modify the graph by replacing all occurrences of one node
   * with another node.
   * 
   * @param {string} search Node value to be replaced
   * @param {string} replace Node value to replace the search value
   */
  replace(search, replace) {
    const searchNode = this.getNode(search);
    const replaceNode = this.getNode(replace);
    if (!searchNode) {
      throw new Error(`The node "${search}" does not exist in the graph"`);
    }
    if (!replaceNode) {
      throw new Error(`The node "${replace}" does not exist in the graph"`);
    }

    // Merge search into replace
    replaceNode.merge(searchNode);
    this.removeNode(searchNode);
      
    // In all nodes, replace all references of search with replace
    this.nodes.forEach(node => {
      node.replace(search, replace);
    });
  }

}

module.exports = Graph;