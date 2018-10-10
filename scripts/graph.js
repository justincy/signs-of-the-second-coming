/**
 * Helper for managing a graph
 */
class Graph {

  constructor() {
    this.nodes = {};
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

  addBefore(node, before) {
    this.setupNode(node);
    this.nodes[node].before.add(before);
  }

  addAfter(node, after) {
    this.setupNode(node);
    this.nodes[node].after.add(after);
  }

}

module.exports = Graph;