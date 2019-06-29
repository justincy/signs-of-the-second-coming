class Node {

  constructor(value) {
    this.value = value;
    this.parents = new Map();
    this.children = new Map();
    this.refs = new Set();
  }

  addParent(node) {
    node = ensureNode(node);
    this.parents.set(node.value, node);
  }

  addChild(node) {
    node = ensureNode(node);
    this.children.set(node.value, node);
  }

  addRef(ref) {
    if (ref) {
      this.refs.add(ref);
    }
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
    this.parents = new Map([...this.parents, ...node.parents]);
    this.children = new Map([...this.children, ...node.children]);
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
    search = ensureNode(search);
    replace = ensureNode(replace);
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

}

/**
 * If the given value is a node, return it.
 * Otherwise create and return a new node with
 * the given value.
 */
function ensureNode(value) {
  if (value instanceof Node) {
    return value;
  }
  return new Node(value);
}

module.exports = Node;