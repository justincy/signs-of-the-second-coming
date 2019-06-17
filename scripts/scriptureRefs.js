/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');
const fs = require('fs');

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Load the data
  const graph = await utils.loadGraph('graphs/signs.gv');

  utils.writeRefs('public/scriptureRefs.json', graph);
}