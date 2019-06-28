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

  it('removeNode');

  it('hasNode');

  it('subgraph');

  it('replace');

});