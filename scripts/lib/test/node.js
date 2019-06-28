const expect = require('chai').expect;
const Node = require('../node.js');

describe('Node', function () {
  
  it('create node with a value', () => {
    const node = new Node('a');
    expect(node.value).to.equal('a');
  });

  it('getPairs', () => {
    const node = new Node('b');
    node.addBefore('a');
    node.addAfter('c');
    expect(node.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'c']
    ]);
  });

  it('merge', () => {
    const sourceNode = new Node('b');
    sourceNode.addBefore('a');
    sourceNode.addAfter('c');
    expect(sourceNode.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'c']
    ]);
    const mergeNode = new Node('2');
    mergeNode.addBefore('1');
    mergeNode.addAfter('3');
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
    const node = new Node('b');
    node.addBefore('a');
    node.addAfter('c');
    node.replace('c', 'd')
    expect(node.getPairs()).to.deep.equal([
      ['a', 'b'],
      ['b', 'd']
    ]);
  });

});