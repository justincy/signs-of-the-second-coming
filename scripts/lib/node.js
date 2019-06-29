class Node {

  constructor(value) {
    this.value = value;

    // A set of node values that point to this node
    this.before = new Set();

    // A set of node values that this node points to
    this.after = new Set();

    // A set of scripture references
    this.refs = new Set();
  }

  addBefore(value) {
    this.before.add(value);
  }

  addAfter(value) {
    this.after.add(value);
  }

  addRef(ref) {
    if (ref) {
      this.refs.add(ref);
    }
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
    this.refs = new Set([...this.refs, ...node.refs]);
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

module.exports = Node;