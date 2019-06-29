const expect = require('chai').expect;
const Node = require('../node.js');

describe('Node', function () {
  
  it('create node with a value', () => {
    const node = new Node('a');
    expect(node.value).to.equal('a');
  });

  it('getPairs', () => {
    const node = new Node('b');
    node.addParent(new Node('a'));
    node.addChild(new Node('c'));
    expect(node.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'c']
    ]);
  });

  it('merge', () => {
    const sourceNode = new Node('b');
    sourceNode.addParent('a');
    sourceNode.addChild('c');
    expect(sourceNode.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'c']
    ]);
    const mergeNode = new Node('2');
    mergeNode.addParent('1');
    mergeNode.addChild('3');
    expect(mergeNode.getPairs()).to.deep.equal([
      ['1', '2'],
      ['2', '3']
    ]);
    sourceNode.merge(mergeNode);
    expect(sourceNode.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['1', 'b'],
      ['b', 'c'],
      ['b', '3']
    ]);
  });

  it('replace', () => {
    const a = new Node('a');
    const b = new Node('b');
    const c = new Node('c');
    b.addParent(a);
    b.addChild(c);
    b.replace(c, new Node('d'));
    expect(b.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'd']
    ]);
  });

  describe('getDescendants', () => {

    it('basic calculation', () => {
      const a = new Node('a');
      const b = new Node('b');
      const c = new Node('c');
      a.addChild(b);
      a.addChild(c);
      b.addChild('d');
      c.addChild('e');
      const descendants = a.getDescendants();
      expect(descendants.size).to.equal(4);
      expect(descendants.has('b')).to.be.true;
      expect(descendants.has('c')).to.be.true;
      expect(descendants.has('d')).to.be.true;
      expect(descendants.has('e')).to.be.true;
    });

    it('avoids cycles', () => {
      const a = new Node('a');
      const b = new Node('b');
      const c = new Node('c');
      const e = new Node('e');
      a.addChild(b);
      a.addChild(c);
      b.addChild('d');
      c.addChild(e);
      e.addChild(b)
      const descendants = a.getDescendants();
      expect(descendants.size).to.equal(4);
      expect(descendants.has('b')).to.be.true;
      expect(descendants.has('c')).to.be.true;
      expect(descendants.has('d')).to.be.true;
      expect(descendants.has('e')).to.be.true;
    });

  });

  describe('getDeepDescendants', () => {
    
    it('basic', () => {
      const a = new Node('a');
      const b = new Node('b');
      a.addChild(b);
      b.addChild('c');
      a.addChild('c');
      const descendants = a.getDeepDescendants();
      expect(descendants.size).to.equal(1);
      expect(descendants.has('c')).to.be.true;
    });

    it('handles cycles', () => {
      const a = new Node('a');
      const b = new Node('b');
      const c = new Node('c');
      const e = new Node('e');
      a.addChild(b);
      a.addChild(c);
      b.addChild('d');
      c.addChild(e);
      e.addChild(b);
      const descendants = a.getDeepDescendants();
      expect(descendants.size).to.equal(3);
      expect(descendants.has('d')).to.be.true;
      expect(descendants.has('e')).to.be.true;
      // b is included because e -> b
      expect(descendants.has('b')).to.be.true;
    });

  });

});