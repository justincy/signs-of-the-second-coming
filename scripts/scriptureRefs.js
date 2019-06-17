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
  const data = await utils.loadRefs('graphs/signs.gv');

  // Output to a file
  fs.writeFile('public/scriptureRefs.json', JSON.stringify(data, null, 2), 'utf8', () => {
    //
  });
}