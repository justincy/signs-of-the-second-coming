/**
 * Helper for managing a graph
 */
class Graph {

  constructor() {
    this.nodes = {};
  }

  /**
   * Get a list of all nodes in this graph.
   * 
   * @returns {array} nodes
   */
  getNodes() {
    return Object.keys(this.nodes);
  }

  /**
   * Get a node's relationships
   * 
   * @param {string} node 
   */
  getNode(node) {
    return this.nodes[node];
  }

  /**
   * Get a list of [x,y] pairs for this node
   * 
   * @param {string} node 
   * @returns {array} pairs
   */
  getNodePairs(node) {
    const rels = this.getNode(node);
    const pairs = [];
    rels.before.forEach((val) => {
      pairs.push([val, node]);
    });
    rels.after.forEach((val) => {
      pairs.push([node, val]);
    });
    return pairs;
  }

  /**
   * Get a list of all unique [x,y] pairs for this graph
   * 
   * @returns {array} list of pairs
   */
  allPairs() {
    const pairs = new Set();
    this.getNodes().forEach((node) => {
      this.getNodePairs(node).forEach((pair) => {
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

  setupNode(node) {
    if (!this.nodes[node]) {
      this.nodes[node] = {
        before: new Set(),
        after: new Set()
      }
    }
  }

  /**
   * Register the pair of {before -> node}
   * @param {string} node 
   * @param {string} before 
   */
  addBefore(node, before) {
    this.setupNode(node);
    this.nodes[node].before.add(before);
  }

  /**
   * Register the pair of {node -> after}
   * 
   * @param {string} node 
   * @param {string} after 
   */
  addAfter(node, after) {
    this.setupNode(node);
    this.nodes[node].after.add(after);
  }

  /**
   * Create a new graph containing the given nodes
   * and their edges.
   * 
   * @param {array} nodes 
   */
  subgraph(nodes) {
    const subgraph = new Graph();
    nodes.forEach((node) => {
      if (this.nodes[node]) {
        subgraph.nodes[node] = {
          before: new Set(this.nodes[node].before.values()),
          after: new Set(this.nodes[node].after.values())
        }
      }
    });
    return subgraph;
  }

}

module.exports = Graph;