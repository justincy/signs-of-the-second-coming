const debug = require('debug')('Node');

class Node {

  constructor(value) {
    this.value = value;
    this.parents = new Map();
    this.children = new Map();
    this.refs = new Set();
  }

  addParent(node) {
    if (node !== this) {
      this.parents.set(node.value, node);
    }
  }

  addChild(node) {
    if (node !== this) {
      this.children.set(node.value, node);
    }
  }

  addRef(ref) {
    if (ref) {
      this.refs.add(ref);
    }
  }

  removeParent(node) {
    this.parents.delete(node.value);
  }

  removeChild(node) {
    this.children.delete(node.value);
  }

  /**
   * Return a list of all node pairs for this node in the
   * form [[parent, value], [value, child], ...].
   * 
   * @return {array}
   */
  getPairs() {
    const pairs = [];
    this.parents.forEach(parent => {
      pairs.push([parent.value, this.value]);
    });
    this.children.forEach(child => {
      pairs.push([this.value, child.value])
    });
    return pairs;
  }

  /**
   * Merge the given node into this node by merging
   * the parents and children sets.
   * 
   * @param {Node} node
   */
  merge(node) {
    debug(`merging "${node.value}" into "${this.value}"`);
    node.parents.forEach(parent => {
      this.addParent(parent);
      parent.removeChild(node);
      parent.addChild(this);
    });
    node.children.forEach(child => {
      this.addChild(child);
      child.removeParent(node);
      child.addParent(this);
    });
    this.refs = new Set([...this.refs, ...node.refs]);
  }

  /**
   * Replace parents and children refs to the search value
   * with the replace value.
   * 
   * @param {node} search
   * @param {node} replace
   */
  replace(search, replace) {
    debug(`"${this.value}": replacing "${search}" with "${replace}"`)
    if (this.value !== replace.value) {
      if (this.parents.has(search.value)) {
        this.parents.delete(search.value);
        this.parents.set(replace.value, replace);
      }
      if (this.children.has(search.value)) {
        this.children.delete(search.value);
        this.children.set(replace.value, replace);
      }
    }
  }

  /**
   * Calculate this node's descendants, including children.
   * 
   * @param {Map} nodesSeen Map of nodes previously seen
   * @return {Map} Descendants of this node
   */
  getDescendants(nodesSeen = new Map()) {
    nodesSeen.set(this.value, this);
    let descendants = new Map();
    this.children.forEach((child) => {
      if (!nodesSeen.has(child.value)) {
        descendants.set(child.value, child);
        descendants = new Map([...descendants, ...child.getDescendants(nodesSeen)]);
      }
    });
    return descendants;
  }

  /**
   * Calculate deep descendants. This does not include children.
   * 
   * @return {Map} Deep descendants of this node
   */
  getDeepDescendants() {
    let descendants = new Map();
    this.children.forEach((child) => {
      descendants = new Map([
        ...descendants,
        // Send this node to children as seen so that we can stop cycles as they come back to this node
        ...child.getDescendants(new Map([[this.value, this]]))
      ]);
    });
    return descendants;
  }

}

module.exports = Node;