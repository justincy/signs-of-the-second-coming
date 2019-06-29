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

});