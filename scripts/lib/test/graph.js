const expect = require('chai').expect;
const Graph = require('../graph.js');
const Node = require('../node.js');

describe('Graph', function () {

  let graph;

  beforeEach(() => {
    graph = new Graph();
  });

  describe('addNode', () => {

    it('adds node that does not exist', () => {
      const node = new Node('a');
      graph.addNode(node);
      expect(graph.getNodes().length).to.equal(1);
    });

    it('does not add node that already exists', () => {
      const node = new Node('a');
      graph.addNode(node);
      expect(graph.getNodes().length).to.equal(1);
      graph.addNode(node);
      expect(graph.getNodes().length).to.equal(1);
    });

  });

  describe('getNode', () => {

    it('returns nothing for a node that does not exist', () => {
      expect(graph.getNode('a')).to.not.exist;
    });

    it('returns a node when it exists', () => {
      graph.addNode(new Node('a'));
      const node = graph.getNode('a');
      expect(node).to.exist;
      expect(node.value).to.equal('a');
    });

  });

  describe('addPair and allPairs', () => {

    it('add a pair', () => {
      graph.addPair('a', 'b', 'ref');
      expect(graph.getAllPairs()).to.deep.equal([
        ['a', 'b']
      ]);
    });

    it('does not create nodes which already exist', () => {
      graph.addPair('a', 'b', 'ref');
      graph.addPair('a', 'c', 'ref');
      expect(graph.getNodes().length).to.equal(3);
      expect(graph.getAllPairs()).to.deep.equal([
        ['a', 'b'],
        ['a', 'c']
      ]);
    });

    it('does not return duplicate pairs', () => {
      graph.addPair('a', 'b', 'ref');
      graph.addPair('a', 'b', 'ref');
      expect(graph.getNodes().length).to.equal(2);
      expect(graph.getAllPairs()).to.deep.equal([
        ['a', 'b']
      ]);
    });

  });

  it('getOrCreateNode', () => {
    expect(graph.getNodes()).to.have.lengthOf(0)
    graph.getOrCreateNode('a')
    expect(graph.getNodes()).to.have.lengthOf(1)
    graph.getOrCreateNode('a')
    expect(graph.getNodes()).to.have.lengthOf(1)
  });

  it('removeNode', () => {
    const node = new Node('a');
    graph.addNode(node);
    graph.addNode(new Node('b'));
    expect(graph.getNodes()).to.have.lengthOf(2);
    expect(graph.getNode('a')).to.equal(node);
    graph.removeNode(node);
    expect(graph.getNodes()).to.have.lengthOf(1);
    expect(graph.getNode('a')).to.not.exist;
  });

  it('hasNode', () => {
    expect(graph.hasNode('a')).to.be.false;
    const node = new Node('a');
    graph.addNode(node);
    expect(graph.hasNode(node)).to.be.true;
  });

  describe('subgraph', () => {

    it('single value', () => {
      graph.addPair('0', 'a');
      graph.addPair('a', 'b');
      graph.addPair('b', 'c');
      graph.addPair('b', 'd');
      graph.addPair('d', 'e');
      const subgraph = graph.subgraph(['b']);
      // We don't create nodes for edges to keep it simple
      expect(subgraph.getNodes()).to.have.lengthOf(1);
      expect(subgraph.getAllPairs()).to.deep.equal([
        ['a', 'b'],
        ['b', 'c'],
        ['b', 'd']
      ]);
    });

    it('multiple values', () => {
      graph.addPair('0', 'a');
      graph.addPair('a', 'b');
      graph.addPair('b', 'c');
      graph.addPair('b', 'd');
      graph.addPair('d', 'e');
      const subgraph = graph.subgraph(['a', 'b']);
      // We don't create nodes for edges to keep it simple
      expect(subgraph.getNodes()).to.have.lengthOf(2);
      expect(subgraph.getAllPairs()).to.deep.equal([
        ['0', 'a'],
        ['a', 'b'],
        ['b', 'c'],
        ['b', 'd']
      ]);
    });

  });

  it('replace', () => {
    graph.addPair('a', 'c')
    graph.addPair('b', 'c')
    graph.addPair('c', 'd')
    graph.addPair('d', 'e')
    expect(graph.getNodes()).to.have.lengthOf(5)
    expect(graph.getAllPairs()).to.deep.equal([
      ['a', 'c'],
      ['b', 'c'],
      ['c', 'd'],
      ['d', 'e']
    ])
    graph.replace('b', 'a')
    expect(graph.getNodes()).to.have.lengthOf(4)
    expect(graph.getAllPairs()).to.deep.equal([
      ['a', 'c'],
      ['c', 'd'],
      ['d', 'e']
    ])
  });

  it('simplifyDescendants', () => {
    graph.addPair('a', 'b');
    graph.addPair('b', 'c');
    graph.addPair('a', 'c');
    const a = graph.getNode('a');
    const b = graph.getNode('b');
    expect(a.children.size).to.equal(2);
    expect(a.children.has('b')).to.be.true;
    expect(a.children.has('c')).to.be.true;
    expect(b.children.size).to.equal(1);
    expect(b.children.has('c')).to.be.true;
    expect(a.children.get('b')).to.equal(b);
    graph.simplifyDescendants();
    expect(a.children.size).to.equal(1);
    expect(a.children.has('b')).to.be.true;
    expect(a.children.has('c')).to.be.false;
  });

});