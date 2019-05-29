/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');

// Gather params: list of signs we want to extract; output?
const args = require('yargs')
  .option('s', {
    array: true,
    description: 'sign',
    demandOption: true
  })
  .option('g', {
    description: 'graph',
    default: 'graphs/signs.gv'
  })
  .argv;

const signs = args.s;

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Construct the graph
  const graph = await utils.loadGraph(args.g);

  // Reconstruct subgraph for only the signs we're interested in
  const subgraph = graph.subgraph(signs);

  // Output subgraph
  utils.writeGraph('graphs/subgraph.gv', subgraph);
}