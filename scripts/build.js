/**
 * Read the main file and extract all edges and nodes connected
 * to the given signs then construct and output a subgraph that
 * contains only the extracted nodes and edges.
 */
const utils = require('./lib/utils.js');

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Process the full graph
  const fullGraph = await utils.loadGraph('graphs/signs.gv');
  utils.writeRefs('public/fullRefs.json', fullGraph);

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
  utils.writeGraph('graphs/simplified.gv', fullGraph);
  utils.writeRefs('public/simplifiedRefs.json', fullGraph);
}
