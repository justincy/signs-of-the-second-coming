const Node = require('./node.js');

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
  getAllPairs() {
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
   * @param {string} ref Scripture reference
   */
  addPair(first, second, ref) {
    this.addAfter(first, second);
    this.addBefore(second, first);
    this.getNode(first).addRef(ref);
    this.getNode(second).addRef(ref);
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
      throw new Error(`The node "${search}" does not exist in the graph`);
    }
    if (!replaceNode) {
      throw new Error(`The node "${replace}" does not exist in the graph`);
    }

    // Merge search into replace and remove search from the graph
    replaceNode.merge(searchNode);
    this.removeNode(searchNode);
    
    // In all nodes, replace all references of search with replace
    this.nodes.forEach(node => {
      node.replace(search, replace);
    });
  }

  /**
   * Simplify the graph by removing edges between nodes when there is a
   * longer path available between them. 
   * 
   * Example: a->b and b->c and a->c. The edge a->c will be removed because
   * c is reachable from a via b.
   */
  simplifyDescendants() {
    // for each node
    this.nodes.forEach(node => {
      // calculate deep descendants; be sure to avoid cycles

      // if any immediate descendant is also a deep descendant, 
      // remove the edge pointing to the immediate descendant
    })
  }

}

module.exports = Graph;