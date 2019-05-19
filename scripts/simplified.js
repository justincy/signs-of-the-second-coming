/**
 * Simplify the full graph by collapsing synonyms.
 */
const utils = require('./lib/utils.js');

run().catch(e => {
  console.error(e);
});

/**
 * Function wrapper since we can't use async in the main context.
 */
async function run() {
  // Construct the graph
  const fullGraph = await utils.loadGraph('signs.gv');

  // Load the list of synonyms
  const synonyms = await utils.loadGraph('synonyms.gv')

  // Simplify the graph by collapsing synonyms
  synonyms.allPairs().forEach(synonym => {
    fullGraph.replace(synonym[0], synonym[1])
  })

  // Output the modified graph
  utils.writeGraph('simplified.gv', fullGraph);
}
