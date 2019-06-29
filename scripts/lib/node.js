class Node {

  constructor(value) {
    this.value = value;
    this.parents = new Set();
    this.children = new Set();
    this.refs = new Set();
  }

  addParent(value) {
    this.parents.add(value);
  }

  addChild(value) {
    this.children.add(value);
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
      pairs.push([parent, this.value]);
    });
    this.children.forEach(child => {
      pairs.push([this.value, child])
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
    this.parents = new Set([...this.parents, ...node.parents]);
    this.children = new Set([...this.children, ...node.children]);
    this.refs = new Set([...this.refs, ...node.refs]);
  }

  /**
   * Replace parents and children refs to the search value
   * with the replace value.
   * 
   * @param {string} search
   * @param {sring} replace
   */
  replace(search, replace) {
    if (this.value !== replace) {
      if (this.parents.has(search)) {
        this.parents.delete(search);
        this.parents.add(replace);
      }
      if (this.children.has(search)) {
        this.children.delete(search);
        this.children.add(replace);
      }
    }
  }

}

module.exports = Node;