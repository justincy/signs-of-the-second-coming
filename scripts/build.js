/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');
const fs = require('fs');
const refsDir = 'assets/graphs';

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {

  // Make sure the assets/graphs directory exists
  if (!fs.existsSync(refsDir)){
    fs.mkdirSync(refsDir);
  }

  // Process the full graph
  const fullGraph = await utils.loadGraph('signs/signs.gv');
  utils.writeRefs(`${refsDir}/fullRefs.json`, fullGraph);

  //
  // Simplified graph
  //

  // Load the list of synonyms
  const synonyms = await utils.loadGraph('synonyms/synonyms.gv')

  // Simplify the graph by collapsing synonyms
  synonyms.allPairs().forEach(synonym => {
    fullGraph.replace(synonym[0], synonym[1])
  })

  // Output the modified graph
  utils.writeGraph('signs/simplified.gv', fullGraph);
  utils.writeRefs(`${refsDir}/simplifiedRefs.json`, fullGraph);
}
